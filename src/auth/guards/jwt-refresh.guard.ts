import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtRefreshAuthGuard extends AuthGuard('jwt-refresh') {
  handleRequest(err: any, user: any, info: any) {
    if (err || !user || info !== undefined) {
      if (info.name === 'TokenExpiredError')
        throw new UnauthorizedException({
          message: 'Lỗi',
          data: {
            refresh_token: info.message,
            name: 'EXPRIRED_REFRESH_TOKEN',
            message: 'Token hết hạn',
          },
        });
      if (info.name === 'JsonWebTokenError')
        throw new UnauthorizedException({
          message: 'Lỗi',
          data: {
            refresh_token: info.message,
            name: 'INVALID_REFRESH_TOKEN',
            message: 'Sai token',
          },
        });
    }
    return user;
  }
}
