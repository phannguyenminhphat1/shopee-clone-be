import { IsNumber, IsArray, ArrayNotEmpty } from 'class-validator';

export class DeletePurchaseDto {
  @IsArray()
  @ArrayNotEmpty({ message: 'Danh sách mã đơn hàng không được rỗng' })
  @IsNumber({}, { each: true, message: 'Mỗi mã phải là số' })
  purchase_id: number[];
}
