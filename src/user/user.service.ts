import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { users } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { USERS_MESSAGES } from 'src/constants/messages';
import { UpdateMeDto } from './dto/update-me.dto';
import { compressImage } from 'src/utils/compress-img/compress-img';
import cloudinary from 'src/utils/uploads/cloudinary';
import * as fs from 'fs';
import * as bcrypt from 'bcrypt';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthService } from 'src/auth/auth.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  async getMe(user: users) {
    const { user_id } = user;
    const me = await this.prismaService.users.findUnique({
      where: {
        user_id,
      },
    });
    if (!me)
      throw new NotFoundException({ message: USERS_MESSAGES.USER_NOT_FOUND });
    return {
      message: USERS_MESSAGES.GET_ME_SUCCESS,
      data: me,
    };
  }

  async updateMe(user: users, updateMeDto: UpdateMeDto) {
    const { address, date_of_birth, full_name, phone_number, avatar } =
      updateMeDto;
    const me = await this.getMe(user);
    const newMe = await this.prismaService.users.update({
      where: { user_id: me.data.user_id },
      data: {
        full_name,
        address,
        date_of_birth: new Date(date_of_birth).toISOString(),
        phone_number,
        avatar,
      },
    });
    return {
      message: USERS_MESSAGES.UPDATE_ME_SUCCESS,
      data: newMe,
    };
  }

  async changePassword(user: users, changePasswordDto: ChangePasswordDto) {
    const { confirm_password, new_password, password } = changePasswordDto;
    const me = await this.getMe(user);
    const checkOldPassword = await bcrypt.compare(password, me.data.password);
    if (!checkOldPassword) {
      throw new UnprocessableEntityException({
        message: 'Mật khẩu cũ không đúng',
        data: {
          password: USERS_MESSAGES.PASSWORD_IS_INCORRECT,
        },
      });
    }
    if (new_password !== confirm_password)
      throw new UnprocessableEntityException({
        message: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD,
        data: {
          confirm_password:
            USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD,
        },
      });
    const newPasswordHash = await this.authService.hashPassword(new_password);
    const newMe = await this.prismaService.users.update({
      where: { user_id: user.user_id },
      data: {
        password: newPasswordHash,
      },
    });
    return {
      message: 'Thay đổi mật khẩu thành công',
      data: newMe,
    };
  }

  async uploadAvatar(file: Express.Multer.File) {
    if (!file) {
      throw new UnprocessableEntityException({
        message: USERS_MESSAGES.IMAGE_IS_REQUIRED,
        data: {
          image: USERS_MESSAGES.IMAGE_IS_REQUIRED,
        },
      });
    }
    let input = process.cwd() + '/public/img/' + file.filename;
    let output = process.cwd() + '/public/imgOptimize/';
    const result = await compressImage(input, output);
    if (!result) {
      throw new InternalServerErrorException({
        message: USERS_MESSAGES.ERROR_WHILE_COMPRESSING_IMAGES,
        data: {
          image: USERS_MESSAGES.ERROR_WHILE_COMPRESSING_IMAGES,
        },
      });
    }
    const cloudinaryResult = await cloudinary.uploader.upload(
      `${output}${file.filename}`,
    );
    fs.unlinkSync(`${output}${file.filename}`);
    fs.unlinkSync(input);
    return {
      message: USERS_MESSAGES.UPLOAD_SUCCESS,
      data: cloudinaryResult.url,
    };
  }

  async findRefreshToken(user: users, refresh_token: string) {
    const me = await this.getMe(user);
    const refreshToken = await this.prismaService.refresh_tokens.findFirst({
      where: {
        token: refresh_token,
        user_id: me.data.user_id,
      },
    });
    if (!refreshToken) {
      throw new UnprocessableEntityException({
        data: {
          refresh_token: USERS_MESSAGES.USED_REFRESH_TOKEN_OR_NOT_EXIST,
        },
      });
    }
    return refreshToken;
  }

  async logout(user: users, refreshTokenDto: RefreshTokenDto) {
    const { refresh_token } = refreshTokenDto;
    const refreshToken = await this.findRefreshToken(user, refresh_token);
    await this.prismaService.refresh_tokens.delete({
      where: { refresh_token_id: refreshToken.refresh_token_id },
    });
    return {
      message: USERS_MESSAGES.LOGOUT_SUCCESS,
    };
  }

  async refreshToken(req: any) {
    const findRefreshToken = await this.findRefreshToken(
      req.user,
      req.body.refresh_token,
    );
    const { exp, user_id } = (await this.jwtService.decode(
      findRefreshToken.token,
    )) as {
      exp: number;
      user_id: number;
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.authService.signAccessToken({
        user_id: user_id,
        email: req.user.email,
        username: req.user.username,
      }),
      this.authService.signRefreshToken({
        user_id: user_id,
        exp: exp,
      }),
    ]);
    await this.prismaService.refresh_tokens.delete({
      where: {
        refresh_token_id: findRefreshToken.refresh_token_id,
        user_id: user_id,
        token: req.body.refresh_token,
      },
    });
    await this.prismaService.refresh_tokens.create({
      data: {
        token: refreshToken,
        created_at: new Date(),
        user_id: user_id,
        expires_at: new Date(exp * 1000),
      },
    });
    return {
      message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESS,
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    };
  }
}
