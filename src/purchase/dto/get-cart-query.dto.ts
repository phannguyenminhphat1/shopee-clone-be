import { Type } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { Status } from 'src/constants/enum';
import { PaginationDto } from 'src/utils/dto/pagination.dto';

export class GetCartQueryDto extends PaginationDto {
  @Type(() => Number) // Chuyển đổi query thành số
  @IsEnum(Status, {
    message: 'Status phải là một trong các giá trị hợp lệ của Status enum',
  })
  status: Status;
}
