import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Order, SortBy } from 'src/constants/enum';
import { PaginationDto } from 'src/utils/dto/pagination.dto';

export class QueryProductDto extends PaginationDto {
  @IsOptional()
  @IsEnum(SortBy)
  sort_by?: SortBy;

  @IsOptional()
  @IsEnum(Order, { message: 'Order phải nằm là asc hoặc desc' })
  order?: Order;

  @Type(() => Number)
  @IsNumber({}, { message: 'Giá phải là số' })
  @IsOptional()
  price_min?: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'Giá phải là số' })
  @IsOptional()
  price_max?: number;

  @IsOptional()
  @IsString({
    message: 'Tên sản phẩm phải là chuỗi',
  })
  product_name?: string;

  @IsOptional()
  @Type(() => Number)
  category?: number; // categoryId

  @IsOptional()
  @Type(() => Number)
  rating_filter?: number;
}
