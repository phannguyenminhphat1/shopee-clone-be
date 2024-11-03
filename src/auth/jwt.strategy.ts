import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, NotFoundException } from '@nestjs/common';
import { users } from '@prisma/client';
import { USERS_MESSAGES } from 'src/constants/messages';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prismaService: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: Partial<users>) {
    const user = await this.prismaService.users.findUnique({
      where: { user_id: payload.user_id },
    });
    if (!user) {
      throw new NotFoundException({
        message: USERS_MESSAGES.USER_NOT_FOUND,
      });
    }

    return payload;
  }
}
