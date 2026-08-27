import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { RedisService } from '../../core/redis/redis.service';
import type { CreateLaunchLogInput } from '@repo/validation';
import { WorkspaceResponseDto } from '../workspace/dto/workspace-response.dto';
import { AnalyticsRepository } from './analytics.repository';
import { ERROR_MESSAGES, KEYS, TIME_IN_SEC } from '@repo/constants';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    private readonly analyticsRepository: AnalyticsRepository,
    private readonly redis: RedisService,
  ) {}

  async createLaunchLog(userId: string, data: CreateLaunchLogInput) {
    const workspace = await this.analyticsRepository.findWorkspace(
      data.workspaceId,
      userId,
    );

    if (!workspace) {
      throw new NotFoundException(
        ERROR_MESSAGES.WORKSPACE.NOT_FOUND_OR_NO_PERMISSION,
      );
    }

    // 1 & 2. Atomically create log and update workspace
    const log =
      await this.analyticsRepository.createLaunchLogAndUpdateWorkspace(
        userId,
        data,
      );

    // 3. Clear most-used cache
    await this.redis
      .getClient()
      .del(`${KEYS.REDIS.ANALYTICS_MOST_USED}:${userId}`);

    return log;
  }

  async getRecentWorkspaces(userId: string) {
    // Top 10 recently launched workspaces
    const workspaces =
      await this.analyticsRepository.getRecentWorkspaces(userId);
    return workspaces.map((w) => WorkspaceResponseDto.fromEntity(w));
  }

  async getMostUsedWorkspaces(userId: string) {
    // Try to get from Redis Cache first
    const cacheKey = `${KEYS.REDIS.ANALYTICS_MOST_USED}:${userId}`;
    let cached: string | null = null;

    try {
      cached = await this.redis.getClient().get(cacheKey);
    } catch (error) {
      this.logger.warn(
        `[Redis Fallback] Failed to get cache for most-used workspaces:`,
        error,
      );
    }

    if (cached) {
      try {
        return JSON.parse(cached) as WorkspaceResponseDto[];
      } catch (parseError) {
        this.logger.warn(
          `[Redis Parse Error] Failed to parse cached most-used workspaces:`,
          parseError,
        );
      }
    }

    // Fallback: Query from DB directly if cache miss
    const workspaces =
      await this.analyticsRepository.getMostUsedWorkspaces(userId);

    const dtos = workspaces.map((w) => WorkspaceResponseDto.fromEntity(w));

    // Cache the result
    try {
      await this.redis
        .getClient()
        .setex(cacheKey, TIME_IN_SEC.TWO_HOURS, JSON.stringify(dtos));
    } catch (error) {
      this.logger.warn(
        `[Redis Fallback] Failed to set cache for most-used workspaces:`,
        error,
      );
    }

    return dtos;
  }
}
