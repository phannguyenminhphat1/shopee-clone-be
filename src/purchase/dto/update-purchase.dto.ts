import { OmitType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class UpdatePurchaseDto {
  @IsNotEmpty({ message: 'Mã đơn hàng không được rỗng' })
  @IsNumber({}, { message: 'Mã phải là số !' })
  purchase_id: number;

  @IsNotEmpty({ message: 'Số lượng không được rỗng' })
  @IsNumber({}, { message: 'Số lượng phải là số !' })
  @IsPositive({ message: 'Số lượng không được bé hơn 0' })
  buy_count: number;
}

export class ConfirmPurchaseDto extends OmitType(UpdatePurchaseDto, [
  'buy_count',
] as const) {}
