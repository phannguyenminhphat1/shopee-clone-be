import { IsNotEmpty, Length, Matches } from 'class-validator';
import { USERS_MESSAGES } from 'src/constants/messages';
import { REGEX } from 'src/constants/regex';

export class ChangePasswordDto {
  @IsNotEmpty({ message: USERS_MESSAGES.PASSWORD_IS_REQUIRED })
  password: string;

  @IsNotEmpty({ message: USERS_MESSAGES.PASSWORD_IS_REQUIRED })
  @Length(6, 50, {
    message: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50,
  })
  @Matches(REGEX.PASSWORD_RULE, {
    message: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG,
  })
  new_password: string;

  @IsNotEmpty({ message: USERS_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED })
  confirm_password: string;
}
