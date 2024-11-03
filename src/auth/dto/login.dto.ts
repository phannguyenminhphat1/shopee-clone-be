import { IsEmail, IsNotEmpty } from 'class-validator';
import { USERS_MESSAGES } from 'src/constants/messages';

export class LoginDto {
  @IsNotEmpty({ message: USERS_MESSAGES.USERNAME_IS_REQUIRED })
  username: string;

  @IsNotEmpty({ message: USERS_MESSAGES.PASSWORD_IS_REQUIRED })
  password: string;
}
