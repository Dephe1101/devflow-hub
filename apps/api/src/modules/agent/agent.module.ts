import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../../core/database/database.module';
import { RedisModule } from '../../core/redis/redis.module';
import { ResourceModule } from '../resource/resource.module';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { AgentGateway } from '../../gateways/agent.gateway';

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('FATAL: JWT_SECRET environment variable is missing');
}

@Module({
  imports: [
    DatabaseModule,
    RedisModule,
    ResourceModule,
    JwtModule.register({
      secret: jwtSecret,
    }),
  ],
  controllers: [AgentController],
  providers: [AgentService, AgentGateway],
  exports: [AgentService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AgentModule {}
