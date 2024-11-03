import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/utils/decorators/user.decorator';
import { users } from '@prisma/client';
import { UpdateMeDto } from './dto/update-me.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { uploadOptions } from 'src/utils/uploads/upload';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ERROR } from 'src/constants/error';
import { JwtRefreshAuthGuard } from 'src/auth/guards/jwt-refresh.guard';

@UsePipes(ERROR.UNPROCESSABLE_ENTITY_EXCEPTION)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('get-me')
  async getMe(@User() user: users) {
    return await this.userService.getMe(user);
  }

  @UseGuards(JwtAuthGuard)
  @Put('update-me')
  async updateMe(@User() user: users, @Body() updateMeDto: UpdateMeDto) {
    return await this.userService.updateMe(user, updateMeDto);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', uploadOptions))
  @Post('upload-avatar')
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    return await this.userService.uploadAvatar(file);
  }

  @UseGuards(JwtAuthGuard)
  @Put('change-password')
  async changePassword(
    @User() user: users,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return await this.userService.changePassword(user, changePasswordDto);
  }

  @UseGuards(JwtRefreshAuthGuard)
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@User() user: users, @Body() refreshTokenDto: RefreshTokenDto) {
    return await this.userService.logout(user, refreshTokenDto);
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh-token')
  async refreshToken(@Req() req: any) {
    return await this.userService.refreshToken(req);
  }
}
