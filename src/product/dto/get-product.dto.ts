import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class GetProductDto {
  @IsNotEmpty({ message: 'Mã sản phẩm không được trống' })
  @IsNumber({}, { message: 'Mã phải là số !' })
  @Type(() => Number)
  stores_products_id: number;
}
