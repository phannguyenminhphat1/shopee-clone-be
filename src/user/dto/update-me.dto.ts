import { Transform } from 'class-transformer';
import {
  IsDate,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  Length,
  Matches,
} from 'class-validator';
import { USERS_MESSAGES } from 'src/constants/messages';
import { REGEX } from 'src/constants/regex';

export class UpdateMeDto {
  @IsOptional()
  @Length(2, 100, { message: USERS_MESSAGES.NAME_LENGTH_MUST_BE_FROM_2_TO_100 })
  @IsString({ message: USERS_MESSAGES.NAME_MUST_BE_A_STRING })
  @IsNotEmpty({ message: USERS_MESSAGES.NAME_IS_REQUIRED })
  full_name: string;

  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsPhoneNumber('VN', { message: USERS_MESSAGES.PHONE_IS_INVALID })
  @IsNotEmpty({ message: USERS_MESSAGES.PHONE_IS_REQUIRED })
  phone_number: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: USERS_MESSAGES.DATE_OF_BIRTH_MUST_BE_A_VALID_DATE },
  )
  @IsNotEmpty({ message: USERS_MESSAGES.DATE_OF_BIRTH_IS_REQUIRED })
  date_of_birth: string;

  @IsOptional()
  @Length(5, 255, {
    message: USERS_MESSAGES.ADDRESS_LENGTH_MUST_BE_FROM_5_TO_255,
  })
  @IsString({ message: USERS_MESSAGES.ADDRESS_MUST_BE_STRING })
  @IsNotEmpty({ message: USERS_MESSAGES.ADDRESS_IS_REQUIRED })
  address: string;

  @Transform(({ value }) => value?.trim())
  @IsOptional()
  @IsStrongPassword(
    { minLength: 4, minNumbers: 1, minUppercase: 1, minSymbols: 1 },
    { message: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG },
  )
  @Length(6, 50, {
    message: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50,
  })
  @IsString({ message: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING })
  @IsNotEmpty({ message: USERS_MESSAGES.PASSWORD_IS_REQUIRED })
  password: string;

  @IsOptional()
  @Length(5, 200, {
    message: USERS_MESSAGES.IMAGE_URL_LENGTH,
  })
  @IsString({ message: USERS_MESSAGES.IMAGE_URL_MUST_BE_STRING })
  @Matches(REGEX.IMAGE_URL, {
    message: USERS_MESSAGES.IMAGE_URL_MUST_BE_VALID,
  })
  avatar: string;
}
