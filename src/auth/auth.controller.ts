import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { USERS_MESSAGES } from 'src/constants/messages';
import { ERROR } from 'src/constants/error';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Request } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UsePipes(ERROR.UNPROCESSABLE_ENTITY_EXCEPTION)
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);
    return {
      message: USERS_MESSAGES.REGISTER_SUCCESS,
      data: {
        user,
      },
    };
  }

  @UseGuards(LocalAuthGuard)
  @UsePipes(ERROR.UNPROCESSABLE_ENTITY_EXCEPTION)
  @Post('login')
  async login(@Req() req: Request) {
    const { accessToken, refreshToken } = await this.authService.loginService(
      req.user,
    );
    return {
      message: USERS_MESSAGES.LOGIN_SUCCESSFULLY,
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: req.user,
      },
    };
  }
}
