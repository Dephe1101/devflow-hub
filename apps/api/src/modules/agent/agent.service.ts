import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomInt } from 'crypto';
import { RedisService } from '../../core/redis/redis.service';
import { PrismaService } from '../../core/database/prisma.service';

const MAX_PAIRING_ATTEMPTS = 5;
const PAIRING_RATE_WINDOW = 60; // seconds

@Injectable()
export class AgentService {
  constructor(
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async generatePairingCode(userId: string): Promise<string> {
    const code = randomInt(100000, 999999).toString();
    const redisClient = this.redisService.getClient();
    // Save the pairing code to Redis with 5 minutes TTL
    await redisClient.set(`pairing:${code}`, userId, 'EX', 300);
    return code;
  }

  async validatePairingCode(
    code: string,
    clientIp = 'unknown',
  ): Promise<string> {
    const redisClient = this.redisService.getClient();

    // Rate limit: max 5 pairing attempts per IP per minute
    const rateKey = `pairing_rate:${clientIp}`;
    const attempts = await redisClient.incr(rateKey);
    if (attempts === 1) {
      await redisClient.expire(rateKey, PAIRING_RATE_WINDOW);
    }
    if (attempts > MAX_PAIRING_ATTEMPTS) {
      throw new UnauthorizedException(
        'Too many pairing attempts. Please try again later.',
      );
    }

    const userId = await redisClient.get(`pairing:${code}`);
    if (!userId) {
      throw new UnauthorizedException('Invalid or expired pairing code');
    }
    // Delete after successful validation (one-time use)
    await redisClient.del(`pairing:${code}`);
    // Bug 13 Fix: Xóa giới hạn rate limit khi nhập đúng code để không tính lần thành công
    await redisClient.del(rateKey);
    return userId;
  }

  generateAgentToken(userId: string, deviceId: string): string {
    // Generate a long-lived token for the agent
    return this.jwtService.sign(
      { sub: userId, deviceId, role: 'agent' },
      { expiresIn: '365d' },
    );
  }

  validateAgentToken(token: string): {
    sub: string;
    deviceId: string;
    role: string;
  } {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid agent token');
    }
  }

  async upsertDevice(userId: string, deviceId: string, deviceName: string) {
    await this.prisma.agentDevice.upsert({
      where: { deviceId },
      update: { userId, lastSeen: new Date(), name: deviceName },
      create: { userId, deviceId, name: deviceName },
    });
  }

  async getDevices(userId: string) {
    return this.prisma.agentDevice.findMany({
      where: { userId },
      orderBy: { lastSeen: 'desc' },
    });
  }

  async removeDevice(userId: string, deviceId: string) {
    const result = await this.prisma.agentDevice.deleteMany({
      where: { userId, deviceId },
    });
    if (result.count === 0) {
      throw new NotFoundException('Device not found or not owned by you');
    }
  }

  async verifyDeviceExists(deviceId: string, userId: string): Promise<boolean> {
    const device = await this.prisma.agentDevice.findFirst({
      where: { deviceId, userId },
    });
    return !!device;
  }
}
