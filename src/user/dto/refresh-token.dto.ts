import { IsNotEmpty } from 'class-validator';
import { USERS_MESSAGES } from 'src/constants/messages';

export class RefreshTokenDto {
  @IsNotEmpty({ message: USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED })
  refresh_token: string;
}
