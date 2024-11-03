import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { users } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { ProductService } from 'src/product/product.service';
import { Status, UserRole } from 'src/constants/enum';
import { GetCartQueryDto } from './dto/get-cart-query.dto';
import { BuyProductDto } from './dto/buy-product.dto';
import {
  ConfirmPurchaseDto,
  UpdatePurchaseDto,
} from './dto/update-purchase.dto';
import { DeletePurchaseDto } from './dto/delete-purchase.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class PurchaseService {
  constructor(
    private prismaService: PrismaService,
    private productService: ProductService,
    private userService: UserService,
  ) {}
  async addToCart(user: users, addToCartDto: AddToCartDto) {
    const { buy_count, stores_products_id } = addToCartDto;
    const me = await this.userService.getMe(user);
    if (me.data.role !== UserRole.USER) {
      throw new ForbiddenException({
        message: 'Bạn không có quyền thực hiện chức năng này',
      });
    }

    // Lấy và check xem stores_products_id khi người dùng click có tồn tại không
    const storesProducts = await this.productService.getProduct({
      stores_products_id,
    });

    // Lấy ra số lượng tồn kho còn lại của thức ăn của cửa hàng đó
    const stockQuantity = storesProducts.data.stock_quantity;
    if (buy_count > stockQuantity)
      throw new UnprocessableEntityException({
        data: {
          buy_count:
            'Số lượng còn lại của cửa hàng không đủ bằng số lượng bạn chọn',
        },
      });

    // Kiểm tra xem món ăn đã có trong giỏ hàng chưa
    const existingPurchases = await this.prismaService.purchases.findFirst({
      where: {
        user_id: user.user_id,
        stores_products_id,
        status: Status.InCart,
      },
    });
    if (!existingPurchases) {
      await this.prismaService.purchases.create({
        data: {
          user_id: user.user_id,
          stores_products_id,
          buy_count,
          total_price: buy_count * Number(storesProducts.data.price),
          status: Status.InCart,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
    } else {
      const newBuyCount = existingPurchases.buy_count + buy_count;
      const newTotalPrice = Number(storesProducts.data.price) * newBuyCount;
      await this.prismaService.purchases.update({
        where: { purchase_id: existingPurchases.purchase_id },
        data: {
          buy_count: newBuyCount,
          total_price: newTotalPrice,
          updated_at: new Date(),
        },
      });
    }
    return {
      message: 'Thêm sản phẩm vào giỏ hàng thành công',
      data: {
        stores_products_id,
        buy_count,
      },
    };
  }

  async getPurchases(user: users, getCartQueryDto: GetCartQueryDto) {
    if (!getCartQueryDto.status) {
      throw new BadRequestException({
        data: { status: 'Status không được trống' },
      });
    }
    const me = await this.userService.getMe(user);
    const limit = getCartQueryDto.limit ? Number(getCartQueryDto.limit) : 10;
    const page = getCartQueryDto.page ? Number(getCartQueryDto.page) : 1;
    const statusCondition =
      Number(getCartQueryDto.status) === Status.AllProducts
        ? {}
        : { status: Number(getCartQueryDto.status) };

    const roleCondition =
      me.data.role === UserRole.ADMIN || me.data.role === UserRole.SHIPPER
        ? {}
        : user.user_id;

    const [getPurchases, total] = await Promise.all([
      this.prismaService.purchases.findMany({
        where: {
          user_id: roleCondition,
          ...statusCondition,
        },
        include: {
          shippings: true,
          stores_products: {
            include: { products: true, stores: true },
          },
          users: true,
        },
        skip: limit * (page - 1),
        take: limit,
      }),
      this.prismaService.purchases.count({
        where: {
          user_id: roleCondition,
          ...statusCondition,
        },
      }),
    ]);
    return {
      message: 'Lấy giỏ hàng thành công',
      data: {
        purchases: getPurchases,
        pagination: {
          total,
          page,
          limit,
          page_size: Math.ceil(total / limit),
        },
      },
    };
  }

  // Mua hàng
  async buyProducts(user: users, buyProductDto: BuyProductDto) {
    const { purchase_id } = buyProductDto;
    const me = await this.userService.getMe(user);
    if (me.data.role !== UserRole.USER) {
      throw new ForbiddenException({
        message: 'Bạn không có quyền thực hiện chức năng này',
      });
    }

    await this.prismaService.$transaction(async (prisma) => {
      for (const id of purchase_id) {
        const purchase = await prisma.purchases.findUnique({
          where: { purchase_id: id },
          include: {
            stores_products: { include: { products: true, stores: true } },
          },
        });

        if (!purchase || purchase.user_id !== user.user_id) {
          throw new BadRequestException({
            data: {
              purchase: `Mã mua hàng ${id} không hợp lệ hoặc không thuộc về người dùng`,
            },
          });
        }

        if (purchase.status !== Status.InCart) {
          throw new UnprocessableEntityException({
            data: {
              purchase: `Mã mua hàng ${id} không nằm trong giỏ hàng`,
            },
          });
        }

        if (purchase.stores_products.stock_quantity < purchase.buy_count) {
          throw new UnprocessableEntityException({
            data: {
              product_name: `Số lượng tồn kho của sản phẩm ${purchase.stores_products.products.product_name} không đủ để hoàn thành đơn hàng`,
            },
          });
        }

        // Cập nhật stock quantity cho stores_products
        await prisma.stores_products.update({
          where: { stores_products_id: purchase.stores_products_id },
          data: {
            stock_quantity: {
              decrement: purchase.buy_count,
            },
          },
        });
      }

      // Sau khi kiểm tra và cập nhật tồn kho, cập nhật trạng thái purchases
      await prisma.purchases.updateMany({
        where: {
          purchase_id: { in: purchase_id },
          user_id: user.user_id,
          status: Status.InCart,
        },
        data: {
          status: Status.WaitingForConfirmation,
          updated_at: new Date(),
        },
      });
    });

    return {
      message: 'Mua hàng thành công',
      data: {
        purchase_id,
      },
    };
  }

  async updatePurchase(user: users, updatePurchaseDto: UpdatePurchaseDto) {
    const { buy_count, purchase_id } = updatePurchaseDto;
    const me = await this.userService.getMe(user);
    if (me.data.role !== UserRole.USER) {
      throw new ForbiddenException({
        message: 'Bạn không có quyền thực hiện chức năng này',
      });
    }
    // Chỉ update được những purchase Incart thôi
    // Tìm purchase của user với status là InCart
    const purchase = await this.prismaService.purchases.findUnique({
      where: { purchase_id },
      include: { stores_products: true },
    });

    // Kiểm tra purchase có hợp lệ và thuộc về user
    if (!purchase || purchase.user_id !== user.user_id) {
      throw new BadRequestException({
        data: {
          purchase: 'Mã mua hàng không hợp lệ hoặc không thuộc về người dùng',
        },
      });
    }

    // Kiểm tra status của purchase
    if (purchase.status !== Status.InCart) {
      throw new UnprocessableEntityException({
        data: { status: 'Chỉ có thể cập nhật các sản phẩm trong giỏ hàng' },
      });
    }

    // Kiểm tra stock_quantity còn lại
    const availableStock = purchase.stores_products.stock_quantity;
    const currentBuyCount = purchase.buy_count;
    const difference = buy_count - currentBuyCount;

    if (availableStock < difference) {
      throw new UnprocessableEntityException({
        data: {
          stock_quantity: 'Số lượng tồn kho không đủ để cập nhật đơn hàng',
        },
      });
    }

    // Cập nhật số lượng mới trong purchases
    await this.prismaService.purchases.update({
      where: { purchase_id },
      data: {
        buy_count: buy_count,
        total_price: buy_count * Number(purchase.stores_products.price),
        updated_at: new Date(),
      },
    });

    return {
      message: 'Cập nhật giỏ hàng thành công.',
      data: {
        purchase_id,
        buy_count,
      },
    };
  }

  async deletePurchases(user: users, deletePurchaseDto: DeletePurchaseDto) {
    const { purchase_id } = deletePurchaseDto;

    for (const id of purchase_id) {
      const purchase = await this.prismaService.purchases.findUnique({
        where: { purchase_id: id },
      });

      if (!purchase || purchase.user_id !== user.user_id) {
        throw new BadRequestException({
          data: {
            purchase: `Mã mua hàng ${id} không hợp lệ hoặc không thuộc về người dùng`,
          },
        });
      }

      if (purchase.status !== Status.InCart) {
        throw new UnprocessableEntityException({
          data: {
            status: `Chỉ có thể xóa các sản phẩm trong giỏ hàng. Mã mua hàng ${id} có trạng thái không hợp lệ.`,
          },
        });
      }
    }

    await this.prismaService.purchases.deleteMany({
      where: {
        purchase_id: { in: purchase_id },
        user_id: user.user_id,
        status: Status.InCart,
      },
    });

    return {
      message: 'Xóa sản phẩm khỏi giỏ hàng thành công.',
      data: {
        purchase_id,
      },
    };
  }

  async findPurchase(purchase_id: number) {
    const purchase = await this.prismaService.purchases.findUnique({
      where: { purchase_id },
    });
    if (!purchase)
      throw new NotFoundException({
        data: { purchase_id: 'Không tìm thấy mã đơn này' },
      });
    return purchase;
  }

  // ROLE ADMIN
  async confirmPurchase(confirmPurchaseDto: ConfirmPurchaseDto) {
    const { purchase_id } = confirmPurchaseDto;
    const purchase = await this.findPurchase(purchase_id);
    if (purchase.status !== Status.WaitingForConfirmation) {
      throw new BadRequestException({
        data: {
          purchase_id:
            'Đơn hàng này đã xác nhận hoặc vận chuyển hoặc chưa được mua',
        },
      });
    }
    const confirm = await this.prismaService.purchases.update({
      where: { purchase_id: purchase.purchase_id },
      data: {
        status: Status.Picking,
        updated_at: new Date(),
      },
    });
    await this.prismaService.shippings.create({
      data: {
        purchase_id: confirm.purchase_id,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    return {
      message: 'Xác nhận đơn hàng thành công, đơn hàng đang chờ lấy',
      data: confirm,
    };
  }
}
