import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private prismaService: PrismaService) {}

  async getCategories() {
    const categories = await this.prismaService.categories.findMany();
    return {
      message: 'Lấy danh sách danh mục thành công',
      data: categories,
    };
  }
  async getCategory(category_id: number) {
    const category = await this.prismaService.categories.findUnique({
      where: { category_id },
    });
    if (!category) {
      throw new UnprocessableEntityException({
        message: 'Không tìm thấy danh mục ',
      });
    }
    return category;
  }
}
