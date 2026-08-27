import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ThrottlerGuard } from '@nestjs/throttler';
import {
  API_ROUTES,
  KEYS,
  TIME_IN_SEC,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from '@repo/constants';
import {
  RegisterInput,
  LoginInput,
  registerSchema,
  loginSchema,
} from '@repo/validation';
import { FastifyRequest, FastifyReply } from 'fastify';

import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { NestRequest } from '../../common/types/request.type';
import { UserResponseDto } from '../users/dto/user-response.dto';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller(API_ROUTES.AUTH.BASE)
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @Post(API_ROUTES.AUTH.REGISTER)
  @UsePipes(new ZodValidationPipe(registerSchema))
  async register(
    @Body() body: RegisterInput,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const { accessToken, refreshToken } = await this.authService.register(body);

    res.setCookie(KEYS.COOKIE.REFRESH_TOKEN, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: TIME_IN_SEC.ONE_WEEK,
    });

    return { accessToken };
  }

  @Post(API_ROUTES.AUTH.LOGIN)
  @UsePipes(new ZodValidationPipe(loginSchema))
  async login(
    @Body() body: LoginInput,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const { accessToken, refreshToken } = await this.authService.login(body);

    res.setCookie(KEYS.COOKIE.REFRESH_TOKEN, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: TIME_IN_SEC.ONE_WEEK,
    });

    return { accessToken };
  }

  @Post(API_ROUTES.AUTH.REFRESH)
  async refresh(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const refreshToken = req.cookies[KEYS.COOKIE.REFRESH_TOKEN];
    if (!refreshToken) {
      throw new UnauthorizedException(
        ERROR_MESSAGES.AUTH.REFRESH_TOKEN_NOT_FOUND,
      );
    }

    try {
      const decoded = this.jwtService.verify(refreshToken) as unknown as {
        jti: string;
        sub: string;
        email: string;
      };
      const { accessToken, refreshToken: newRefreshToken } =
        await this.authService.refresh(decoded.jti, decoded.sub, decoded.email);

      res.setCookie(KEYS.COOKIE.REFRESH_TOKEN, newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: TIME_IN_SEC.ONE_WEEK,
      });

      return { accessToken };
    } catch {
      throw new UnauthorizedException(
        ERROR_MESSAGES.AUTH.REFRESH_TOKEN_INVALID,
      );
    }
  }

  @Post(API_ROUTES.AUTH.LOGOUT)
  async logout(
    @Req() req: NestRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const refreshToken = req.cookies[KEYS.COOKIE.REFRESH_TOKEN];
    if (refreshToken) {
      try {
        const decoded = this.jwtService.verify(refreshToken, {
          ignoreExpiration: true,
        }) as unknown as { jti: string };
        await this.authService.logout(decoded.jti);
      } catch {
        // Ignore verify errors on logout
      }
    }

    res.clearCookie(KEYS.COOKIE.REFRESH_TOKEN, { path: '/' });
    return { message: SUCCESS_MESSAGES.AUTH.LOGOUT };
  }

  @Get(API_ROUTES.AUTH.ME)
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: NestRequest) {
    return UserResponseDto.fromEntity(req.user);
  }
}
