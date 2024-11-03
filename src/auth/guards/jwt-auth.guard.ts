import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any) {
    if (err || !user || info !== undefined) {
      if (info.name === 'TokenExpiredError')
        throw new UnauthorizedException({
          message: 'Lỗi',
          data: {
            access_token: info.message,
            name: 'EXPRIRED_ACCESS_TOKEN',
          },
        });
      if (info.name === 'JsonWebTokenError')
        throw new UnauthorizedException({
          message: 'Lỗi',
          data: {
            access_token: info.message,
            name: 'INVALID_ACCESS_TOKEN',
          },
        });
      if (info.name === 'Error')
        throw new UnauthorizedException({
          message: 'Lỗi',
          data: {
            access_token: info.message,
            name: 'INVALID_ACCESS_TOKEN',
          },
        });
    }
    return user;
  }
}
