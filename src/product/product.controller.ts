import {
  Controller,
  Get,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { QueryProductDto } from './dto/query-product.dto';
import { GetProductDto } from './dto/get-product.dto';

@UsePipes(ValidationPipe)
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('get-products')
  async getProducts(@Query() queryProductDto: QueryProductDto) {
    return await this.productService.getProducts(queryProductDto);
  }

  @Get('get-product/:stores_products_id')
  async getProduct(@Param() getProductDto: GetProductDto) {
    return await this.productService.getProduct(getProductDto);
  }

  @Get('get-products-super')
  async getProductsSuper() {
    return await this.productService.getProductsSuper();
  }
}
