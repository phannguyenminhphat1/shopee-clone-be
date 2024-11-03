import { IsEnum } from 'class-validator';
import { ShippingDto } from './shipping.dto';
import { Type } from 'class-transformer';
import { Status } from 'src/constants/enum';

export class CanceledAndDeliveredDto extends ShippingDto {
  @Type(() => Number) // Chuyển đổi query thành số
  @IsEnum(Status, {
    message: 'Status phải là một trong các giá trị hợp lệ của Status enum',
  })
  status: Status;
}
