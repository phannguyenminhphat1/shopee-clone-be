import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  Length,
  Matches,
} from 'class-validator';
import { USERS_MESSAGES } from 'src/constants/messages';
import { REGEX } from 'src/constants/regex';

export class RegisterDto {
  @IsNotEmpty({ message: USERS_MESSAGES.NAME_IS_REQUIRED })
  @Length(2, 100, {
    message: USERS_MESSAGES.NAME_LENGTH_MUST_BE_FROM_2_TO_100,
  })
  full_name: string;

  @IsNotEmpty({ message: USERS_MESSAGES.USERNAME_IS_REQUIRED })
  @Length(3, 50, {
    message: USERS_MESSAGES.USERNAME_LENGTH,
  })
  username: string;

  @IsNotEmpty({ message: USERS_MESSAGES.EMAIL_IS_REQUIRED })
  @IsEmail({}, { message: USERS_MESSAGES.EMAIL_IS_INVALID })
  email: string;

  @IsNotEmpty({ message: USERS_MESSAGES.PASSWORD_IS_REQUIRED })
  @Length(6, 50, {
    message: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50,
  })
  @Matches(REGEX.PASSWORD_RULE, {
    message: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG,
  })
  password: string;

  @IsNotEmpty({ message: USERS_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED })
  confirm_password: string;

  @IsNotEmpty({ message: USERS_MESSAGES.PHONE_IS_REQUIRED })
  @IsPhoneNumber('VN', { message: USERS_MESSAGES.PHONE_IS_INVALID })
  phone_number: string;

  // @IsNotEmpty({ message: USERS_MESSAGES.ADDRESS_IS_REQUIRED })
  // @Length(5, 255, {
  //   message: USERS_MESSAGES.ADDRESS_LENGTH_MUST_BE_FROM_5_TO_255,
  // })
  // address: string;
}
