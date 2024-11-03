import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { users } from '@prisma/client';
import { USERS_MESSAGES } from 'src/constants/messages';
import * as bcrypt from 'bcrypt';
import { UserRole } from 'src/constants/enum';
import { LoginDto } from './dto/login.dto';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<users> {
    const [checkUsernameExist, checkExistEmail] = await Promise.all([
      this.prismaService.users.findUnique({
        where: { username: registerDto.username },
      }),
      this.prismaService.users.findUnique({
        where: { email: registerDto.email },
      }),
    ]);
    if (checkUsernameExist) {
      throw new UnprocessableEntityException({
        message: USERS_MESSAGES.VALIDATION_ERROR,
        data: {
          username: USERS_MESSAGES.USERNAME_EXISTED,
        },
      });
    }
    if (checkExistEmail)
      throw new UnprocessableEntityException({
        message: USERS_MESSAGES.VALIDATION_ERROR,
        data: {
          email: USERS_MESSAGES.EMAIL_ALREADY_EXISTS,
        },
      });
    if (registerDto.password !== registerDto.confirm_password)
      throw new UnprocessableEntityException(
        USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD,
      );
    const passwordHash = await this.hashPassword(registerDto.password);
    const newUser = await this.prismaService.users.create({
      data: {
        email: registerDto.email,
        password: passwordHash,
        username: registerDto.username,
        avatar: process.env.CLOUNDINARY_DEFAULT_AVATAR,
        // address: registerDto.address,
        role: UserRole.USER,
        full_name: registerDto.full_name,
        phone_number: registerDto.phone_number,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    return newUser;
  }

  async login(loginDto: LoginDto) {
    const user = await this.prismaService.users.findUnique({
      where: { username: loginDto.username },
    });
    if (!user) {
      throw new UnprocessableEntityException({
        message: USERS_MESSAGES.VALIDATION_ERROR,
        data: {
          username: USERS_MESSAGES.USERNAME_NOT_FOUND,
        },
      });
    }
    const checkPassword = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!checkPassword) {
      throw new UnprocessableEntityException({
        message: USERS_MESSAGES.VALIDATION_ERROR,
        data: {
          password: USERS_MESSAGES.PASSWORD_IS_INCORRECT,
        },
      });
    }

    return user;
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);
    return passwordHash;
  }

  async signToken({
    payload,
    options,
  }: {
    payload: Buffer | object;
    options?: JwtSignOptions;
  }) {
    return this.jwtService.sign(payload, options);
  }

  async signAccessToken({
    user_id,
    email,
    username,
  }: {
    user_id: number;
    email: string;
    username: string;
  }) {
    return this.signToken({
      payload: {
        user_id,
        email,
        username,
      },
      options: {
        secret: process.env.JWT_SECRET,
        expiresIn: '1h',
      },
    });
  }

  async signRefreshToken({ user_id, exp }: { user_id: number; exp?: number }) {
    if (exp) {
      return this.signToken({
        payload: {
          user_id,
          exp,
        },
        options: {
          secret: process.env.JWT_REFRESH_SECRET,
        },
      });
    }
    return this.signToken({
      payload: {
        user_id,
      },
      options: {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '30d',
      },
    });
  }

  async signAccessTokenAndRefreshToken(user: Partial<users>) {
    return await Promise.all([
      this.signAccessToken({
        user_id: user.user_id,
        email: user.email,
        username: user.username,
      }),
      this.signRefreshToken({ user_id: user.user_id }),
    ]);
  }

  async loginService(user: Partial<users>) {
    const [accessToken, refreshToken] =
      await this.signAccessTokenAndRefreshToken(user);
    const { exp } = (await this.jwtService.decode(refreshToken)) as {
      exp: number;
    };

    const expiresAt = new Date(exp * 1000);

    await this.prismaService.refresh_tokens.create({
      data: {
        token: refreshToken,
        created_at: new Date(),
        user_id: user.user_id,
        expires_at: expiresAt,
      },
    });
    return { accessToken, refreshToken };
  }
}
