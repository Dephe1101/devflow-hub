import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import Redis from 'ioredis';

import { DatabaseModule } from './core/database/database.module';
import { RedisModule } from './core/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { ResourceModule } from './modules/resource/resource.module';
import { UsersModule } from './modules/users/users.module';
import { WorkspaceModule } from './modules/workspace/workspace.module';
import { AgentModule } from './modules/agent/agent.module';

@Module({
  imports: [
    HealthModule,
    UsersModule,
    AuthModule,
    DatabaseModule,
    RedisModule,
    ThrottlerModule.forRootAsync({
      useFactory: () => {
        const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
        return {
          throttlers: [{ ttl: 60000, limit: 100 }],
          storage: new ThrottlerStorageRedisService(new Redis(redisUrl)),
        };
      },
    }),
    WorkspaceModule,
    ResourceModule,
    AgentModule,
  ],
  controllers: [],
  providers: [],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AppModule {}
