import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { Authorized, Protected } from 'src/common/decorators';
import { User } from '@prisma/client';

@Controller('users')
export class UsersController {
  public constructor(private readonly usersService: UsersService) {}

  // @UseGuards(AuthGuard('jwt'))
  @Protected()
  @Get('@me')
  public async getMe(@Authorized() user: User) {
    return user;
  }
}
