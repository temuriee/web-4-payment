import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
// import { hash, verify } from 'argon2';
import { Request, Response } from 'express';
// import { isDev, ms, StringValue } from 'src/common/utils';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';

import { LoginRequest, RegisterRequest } from './dto';
// import { JwtPayload } from './interfaces';

@Injectable()
export class AuthService {
  private readonly JWT_ACCESS_TOKEN_TTL: StringValue;
  private readonly JWT_REFRESH_TOKEN_TTL: StringValue;

  private readonly COOKIES_DOMAIN: string;

  public constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    // private readonly jwtService: JwtService,
  ) {
    this.JWT_ACCESS_TOKEN_TTL = configService.getOrThrow<StringValue>(
      'JWT_ACCESS_TOKEN_TTL',
    );
    this.JWT_REFRESH_TOKEN_TTL = configService.getOrThrow<StringValue>(
      'JWT_REFRESH_TOKEN_TTL',
    );

    this.COOKIES_DOMAIN =
      configService.getOrThrow<StringValue>('COOKIES_DOMAIN');
  }

  public async register(res: Response, dto: RegisterRequest) {
    const { name, email, password } = dto;

    const exists = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (exists)
      throw new ConflictException('User with this email already exists');

    const hashedPassword = await hash(password);

    const user = await this.prismaService.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return this.auth(res, user);
  }

  public async login(res: Response, dto: LoginRequest) {
    const { email, password } = dto;

    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) throw new NotFoundException('Invalid email or password');

    const isValidPasword = await verify(user.password, password);

    if (!isValidPasword)
      throw new NotFoundException('Invalid email or password');

    return this.auth(res, user);
  }

  public async refresh(req: Request, res: Response) {
    if (!req || !req.cookies)
      throw new UnauthorizedException('Failed to get authorization cookies');

    const refreshToken = req.cookies['refreshToken'];

    if (refreshToken) {
      const payload: JwtPayload =
        await this.jwtService.verifyAsync(refreshToken);

      if (payload) {
        console.log(payload);

        const user = await this.prismaService.user.findUnique({
          where: {
            id: payload.id,
          },
        });

        if (user) {
          return this.auth(res, user);
        }
      }
    }
  }

  public async logout(res: Response) {
    return this.setCookie(res, '', new Date(0));
  }

  private async auth(res: Response, user: User) {
    const { accessToken, refreshToken, refreshTokenExpires } =
      await this.generateTokens(user);

    this.setCookie(res, refreshToken, refreshTokenExpires);

    return { accessToken };
  }

  private async generateTokens(user: User) {
    const payload: JwtPayload = {
      id: user.id,
    };

    const refreshTokenExpires = new Date(
      Date.now() + ms(this.JWT_REFRESH_TOKEN_TTL),
    );

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.JWT_ACCESS_TOKEN_TTL,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.JWT_REFRESH_TOKEN_TTL,
    });

    return {
      accessToken,
      refreshToken,
      refreshTokenExpires,
    };
  }

  private setCookie(res: Response, value: string, expires: Date) {
    res.cookie('refreshToken', value, {
      httpOnly: true,
      domain: this.COOKIES_DOMAIN,
      expires,
      secure: !isDev(this.configService),
      sameSite: 'lax',
    });
  }
}
