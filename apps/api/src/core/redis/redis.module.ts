import { Global, Module } from '@nestjs/common';

import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class RedisModule {}
