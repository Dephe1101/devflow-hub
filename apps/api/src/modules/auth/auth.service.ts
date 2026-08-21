import { randomUUID } from 'crypto';

import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { KEYS, TIME_IN_SEC } from '@repo/constants';
import { LoginInput, RegisterInput } from '@repo/validation';
import * as bcrypt from 'bcrypt';

import { RedisService } from '../../core/redis/redis.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {}

  async register(data: RegisterInput) {
    const existingUser = await this.usersService.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await this.usersService.create({
      email: data.email,
      name: data.name,
      passwordHash: hashedPassword,
    });

    return this.generateTokens(user.id, user.email);
  }

  async login(data: LoginInput) {
    const user = await this.usersService.findByEmail(data.email);
    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      data.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user.id, user.email);
  }

  async refresh(refreshTokenId: string, userId: string, email: string) {
    // Check if refresh token is blacklisted in Redis
    const isBlacklisted = await this.redisService
      .getClient()
      .get(`${KEYS.REDIS.BLACKLIST_PREFIX}:${refreshTokenId}`);
    if (isBlacklisted) {
      throw new UnauthorizedException(
        'Refresh token is blacklisted or revoked',
      );
    }

    return this.generateTokens(userId, email);
  }

  async logout(refreshTokenId: string) {
    // Blacklist the refresh token in Redis for 7 days (604800 seconds)
    await this.redisService
      .getClient()
      .setex(
        `${KEYS.REDIS.BLACKLIST_PREFIX}:${refreshTokenId}`,
        TIME_IN_SEC.ONE_WEEK,
        'revoked',
      );
  }

  private generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    const accessToken = this.jwtService.sign(payload);

    // Generate a unique ID for the refresh token to track it in Redis
    const refreshTokenId = randomUUID();
    const refreshToken = this.jwtService.sign(
      { sub: userId, email, jti: refreshTokenId },
      { expiresIn: '7d' },
    );

    return {
      accessToken,
      refreshToken,
      refreshTokenId,
    };
  }
}
