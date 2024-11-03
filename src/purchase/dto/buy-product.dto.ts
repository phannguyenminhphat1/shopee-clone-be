import { Type } from 'class-transformer';
import { IsArray, ArrayNotEmpty } from 'class-validator';

export class BuyProductDto {
  @IsArray({ message: 'Danh sách mã mua hàng phải là một mảng!' })
  @ArrayNotEmpty({ message: 'Danh sách mã mua hàng không được rỗng!' })
  @Type(() => Number)
  purchase_id: number[];
}
