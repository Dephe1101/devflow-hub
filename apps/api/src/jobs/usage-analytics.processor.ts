import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { RedisService } from '../core/redis/redis.service';
import { WorkspaceResponseDto } from '../modules/workspace/dto/workspace-response.dto';
import { QUEUE_NAMES, JOB_NAMES, KEYS, TIME_IN_SEC } from '@repo/constants';

@Processor(QUEUE_NAMES.ANALYTICS)
export class UsageAnalyticsProcessor extends WorkerHost {
  private readonly logger = new Logger(UsageAnalyticsProcessor.name);
  private readonly BATCH_SIZE = 100;
  private readonly CONCURRENCY = 10;
  private readonly TOP_LIMIT = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {
    super();
  }

  async process(job: Job<unknown, unknown>): Promise<void> {
    if (job.name === JOB_NAMES.AGGREGATE_MOST_USED) {
      this.logger.log(`Starting ${JOB_NAMES.AGGREGATE_MOST_USED} job...`);
      await this.aggregateMostUsed();
      this.logger.log(`Finished ${JOB_NAMES.AGGREGATE_MOST_USED} job.`);
    }
  }

  private async aggregateMostUsed() {
    let cursor: string | undefined = undefined;
    let hasMore = true;

    while (hasMore) {
      const findArgs: {
        select: { id: boolean };
        take: number;
        skip?: number;
        cursor?: { id: string };
        orderBy: { id: 'asc' };
      } = {
        select: { id: true },
        take: this.BATCH_SIZE,
        orderBy: { id: 'asc' },
      };
      if (cursor) {
        findArgs.skip = 1;
        findArgs.cursor = { id: cursor };
      }

      const users = (await this.prisma.user.findMany(findArgs)) as {
        id: string;
      }[];

      if (users.length === 0) {
        hasMore = false;
      } else {
        if (users.length < this.BATCH_SIZE) {
          hasMore = false;
        }
        const lastUser = users[users.length - 1];
        if (!lastUser) {
          hasMore = false;
        } else {
          cursor = lastUser.id;

          // Run concurrently in batch with concurrency limit
          for (let i = 0; i < users.length; i += this.CONCURRENCY) {
            const batch = users.slice(i, i + this.CONCURRENCY);
            await Promise.all(
              batch.map(async (user) => {
                // 2. Fetch top N most used for each user
                const topWorkspaces = await this.prisma.workspace.findMany({
                  where: { userId: user.id, launchCount: { gt: 0 } },
                  orderBy: { launchCount: 'desc' },
                  take: this.TOP_LIMIT,
                  include: {
                    _count: { select: { resources: true } },
                  },
                });

                // 3. Update Redis cache with safe DTOs
                const cacheKey = `${KEYS.REDIS.ANALYTICS_MOST_USED}:${user.id}`;
                try {
                  if (topWorkspaces.length > 0) {
                    const dtos = topWorkspaces.map((w) =>
                      WorkspaceResponseDto.fromEntity(w),
                    );
                    // TTL matches cache policy
                    await this.redis
                      .getClient()
                      .setex(
                        cacheKey,
                        TIME_IN_SEC.TWO_HOURS,
                        JSON.stringify(dtos),
                      );
                  } else {
                    await this.redis.getClient().del(cacheKey);
                  }
                } catch (error) {
                  this.logger.warn(
                    `Failed to update Redis cache for user ${user.id}`,
                    error,
                  );
                }
              }),
            );
          }
        }
      }
    }
  }
}
