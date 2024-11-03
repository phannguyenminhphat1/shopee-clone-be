import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { ShippingDto } from './dto/shipping.dto';
import { Status } from 'src/constants/enum';
import { CanceledAndDeliveredDto } from './dto/canceled-delivered.dto';

@Injectable()
export class ShippingService {
  constructor(private prismaService: PrismaService) {}

  async findShipping(shipping_id: number) {
    const shipping = await this.prismaService.shippings.findUnique({
      where: { shipping_id },
      include: {
        purchases: {
          include: {
            users: true,
            stores_products: true,
          },
        },
      },
    });
    if (!shipping)
      throw new NotFoundException({
        message: 'Không tìm thấy mã đơn này',
      });
    return shipping;
  }

  async pickingPurchase(shippingDto: ShippingDto) {
    const { shipping_id } = shippingDto;
    const shipping = await this.findShipping(shipping_id);
    if (shipping.purchases.status !== Status.Picking) {
      throw new UnprocessableEntityException({
        data: {
          shipping_id: 'Đơn hàng này chưa được shop xác nhận',
        },
      });
    }
    const picking = await this.prismaService.shippings.update({
      where: {
        shipping_id: shipping.shipping_id,
      },
      data: {
        updated_at: new Date(),
        purchases: {
          update: {
            status: Status.Shipping,
            updated_at: new Date(),
          },
        },
      },
    });
    return {
      message: 'Đã lấy đơn hàng thành công',
      data: picking,
    };
  }

  async canceledAndDeliveredPurchase(
    canceledAndDeliveredDto: CanceledAndDeliveredDto,
  ) {
    const { shipping_id, status } = canceledAndDeliveredDto;
    const shipping = await this.findShipping(shipping_id);
    if (shipping.purchases.status === Status.Canceled) {
      throw new BadRequestException({
        message: 'Đơn hàng này đã bị hủy',
      });
    }
    if (shipping.purchases.status === Status.Delivered) {
      throw new BadRequestException({
        message: 'Đơn hàng này đã được giao',
      });
    }
    if (status !== Status.Delivered && status !== Status.Canceled) {
      throw new BadRequestException({
        message: 'Status phải là 4 (Delivered) hoặc 5 (Canceled)',
      });
    }
    const getStoresProducts =
      await this.prismaService.stores_products.findUnique({
        where: { stores_products_id: shipping.purchases.stores_products_id },
      });
    if (!getStoresProducts) {
      throw new NotFoundException({
        message: 'Không tìm thấy sản phẩm',
      });
    }
    if (shipping.purchases.status === Status.Shipping) {
      if (status === Status.Canceled) {
        await this.prismaService.shippings.update({
          where: { shipping_id: shipping.shipping_id },
          data: {
            updated_at: new Date(),
            purchases: {
              update: {
                status: Status.Canceled,
                updated_at: new Date(),
                stores_products: {
                  update: {
                    stock_quantity:
                      shipping.purchases.buy_count +
                      getStoresProducts.stock_quantity,
                  },
                },
              },
            },
          },
        });
        return {
          message: 'Đơn hàng đã được hủy',
          data: shipping,
        };
      } else if (status === Status.Delivered) {
        await this.prismaService.shippings.update({
          where: {
            shipping_id: shipping.shipping_id,
          },
          data: {
            updated_at: new Date(),
            purchases: {
              update: {
                status: Status.Delivered,
                updated_at: new Date(),
                stores_products: {
                  update: {
                    sold: getStoresProducts.sold + shipping.purchases.buy_count,
                  },
                },
              },
            },
          },
        });
        return {
          message: 'Đơn hàng được giao thành công',
          data: shipping,
        };
      } else {
        return {
          message: 'Chỉ có thể hủy hoặc giao hàng thành công',
        };
      }
    } else {
      return {
        message: 'Đơn hàng này đang ở trạng thái khác hoặc không có',
      };
    }
  }
}
