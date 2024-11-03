import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prismaService: PrismaService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    const request = context.switchToHttp().getRequest();
    if (request.user) {
      const user = await this.prismaService.users.findUnique({
        where: { user_id: request.user.user_id },
      });
      const isForbidden = roles.includes(user.role);
      if (!isForbidden)
        throw new ForbiddenException({
          message: 'Không có quyền truy cập vào chức năng này',
        });
      return true;
    }
    return false;
  }
}
