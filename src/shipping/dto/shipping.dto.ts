import { IsNotEmpty, IsNumber } from 'class-validator';

export class ShippingDto {
  @IsNotEmpty({ message: 'Mã giao hàng không được rỗng' })
  @IsNumber({}, { message: 'Mã phải là số !' })
  shipping_id: number;
}
