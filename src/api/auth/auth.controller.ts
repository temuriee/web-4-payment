import { Body, Controller, Post, Req, Res } from '@nestjs/common';

import type { Request, Response } from 'express';

import {
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { AuthResponse, LoginRequest, RegisterRequest } from '../dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Register endpoint
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new user account and returns an access token in the response',
  })
  @ApiConflictResponse({
    description: 'User with the given email already exists',
  })
  @ApiOkResponse({
    type: AuthResponse,
  })
  @Post('register')
  public async register(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: RegisterRequest,
  ) {
    return await this.authService.register(res, dto);
  }

  // Login endpoint
  @ApiOperation({
    summary: 'Login an existing user',
    description:
      'Authenticates a user and returns an access token in the response',
  })
  @ApiOkResponse({
    type: AuthResponse,
  })
  @Post('login')
  public async login(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: LoginRequest,
  ) {
    return await this.authService.login(res, dto);
  }

  // Refresh token endpoint
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Generates a new access token based on the provided refresh token from cookies',
  })
  @ApiOkResponse({
    type: AuthResponse,
  })
  @Post('refresh')
  public async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authService.refresh(req, res);
  }

  // Logout endpoint

  @ApiOperation({
    summary: 'Logout user',
    description: 'Clears authentication cookies',
  })
  @Post('logout')
  public async logout(@Res({ passthrough: true }) res: Response) {
    return await this.authService.logout(res);
  }
}
