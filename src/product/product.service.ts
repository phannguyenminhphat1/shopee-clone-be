import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { QueryProductDto } from './dto/query-product.dto';
import { CategoryService } from 'src/category/category.service';
import { Order, SortBy } from 'src/constants/enum';
import { GetProductDto } from './dto/get-product.dto';

@Injectable()
export class ProductService {
  constructor(
    private prismaService: PrismaService,
    private categoryService: CategoryService,
  ) {}
  async getProducts(queryProductDto: QueryProductDto) {
    const {
      sort_by,
      order,
      rating_filter,
      product_name,
      price_min,
      price_max,
      category,
    } = queryProductDto;
    const limit = queryProductDto.limit ? Number(queryProductDto.limit) : 10;
    const page = queryProductDto.page ? Number(queryProductDto.page) : 1;
    const sortOrder = order === Order.ASC ? 'asc' : 'desc';

    const priceMin = price_min ? Number(price_min) : undefined;
    const priceMax = price_max ? Number(price_max) : undefined;

    if (priceMin !== undefined && priceMin <= 0) {
      throw new BadRequestException('Giá không được âm');
    }
    if (priceMax !== undefined && priceMax <= 0) {
      throw new BadRequestException('Giá không được âm');
    }

    // Kiểm tra giá trị giá
    if (priceMin && priceMax && priceMin > priceMax) {
      throw new UnprocessableEntityException({
        message: 'Giá min không thể lớn hơn giá max',
      });
    }

    // Kiểm tra danh mục
    if (category) {
      await this.categoryService.getCategory(Number(category));
    }

    const orderBy: any = {};
    if (sort_by === SortBy.PRICE) {
      orderBy.price = sortOrder;
    } else if (sort_by === SortBy.CREATED_AT || (!sort_by && order)) {
      orderBy.products = { created_at: sortOrder };
    } else if (sort_by === SortBy.VIEW) {
      orderBy.view = sortOrder;
    } else if (sort_by === SortBy.SOLD) {
      orderBy.sold = sortOrder;
    }

    // Truy vấn danh sách sản phẩm
    const [products, total] = await Promise.all([
      this.prismaService.stores_products.findMany({
        where: {
          ...(priceMin !== undefined || priceMax !== undefined
            ? {
                price: {
                  ...(priceMin !== undefined ? { gte: priceMin } : {}),
                  ...(priceMax !== undefined ? { lte: priceMax } : {}),
                },
              }
            : {}),
          ...(product_name || category || rating_filter
            ? {
                products: {
                  ...(product_name
                    ? {
                        product_name: {
                          contains: product_name,
                          mode: 'insensitive',
                        },
                      }
                    : {}),
                  ...(category ? { category_id: Number(category) } : {}),
                },
                ...(rating_filter ? { rating: { gte: rating_filter } } : {}),
              }
            : {}),
        },
        include: {
          products: true,
          stores: true,
        },
        skip: limit * (page - 1),
        take: limit,
        orderBy: Object.keys(orderBy).length ? orderBy : undefined,
      }),
      this.prismaService.stores_products.count({
        where: {
          ...(priceMin !== undefined || priceMax !== undefined
            ? {
                price: {
                  ...(priceMin !== undefined ? { gte: priceMin } : {}),
                  ...(priceMax !== undefined ? { lte: priceMax } : {}),
                },
              }
            : {}),
          ...(product_name || category || rating_filter
            ? {
                products: {
                  ...(product_name
                    ? {
                        product_name: {
                          contains: product_name,
                          mode: 'insensitive',
                        },
                      }
                    : {}),
                  ...(category ? { category_id: Number(category) } : {}),
                },
                ...(rating_filter ? { rating: { gte: rating_filter } } : {}),
              }
            : {}),
        },
      }),
    ]);

    return {
      message: 'Lấy danh sách sản phẩm thành công',
      data: {
        products,
        pagination: {
          total,
          page,
          limit,
          page_size: Math.ceil(total / limit),
        },
      },
    };
  }

  async getProduct(getProductDto: GetProductDto) {
    const product = await this.prismaService.stores_products.findUnique({
      where: { stores_products_id: Number(getProductDto.stores_products_id) },
      include: { stores: true, products: true },
    });
    if (!product) {
      throw new NotFoundException({ message: 'Không tìm thấy sản phẩm' });
    }
    return {
      message: 'Lấy sản phẩm thành công',
      data: product,
    };
  }

  async getProductsSuper() {
    return await this.prismaService.products.findMany();
  }
}
