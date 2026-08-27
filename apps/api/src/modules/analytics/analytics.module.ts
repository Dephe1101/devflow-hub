import { Module, OnModuleInit } from '@nestjs/common';
import { BullModule, InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AnalyticsRepository } from './analytics.repository';
import { UsageAnalyticsProcessor } from '../../jobs/usage-analytics.processor';
import { QUEUE_NAMES, JOB_NAMES, TIME_IN_MS } from '@repo/constants';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QUEUE_NAMES.ANALYTICS,
    }),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsRepository, AnalyticsService, UsageAnalyticsProcessor],
})
export class AnalyticsModule implements OnModuleInit {
  constructor(
    @InjectQueue(QUEUE_NAMES.ANALYTICS) private analyticsQueue: Queue,
  ) {}

  async onModuleInit() {
    // Add repeatable job every 1 hour
    await this.analyticsQueue.upsertJobScheduler(
      `${JOB_NAMES.AGGREGATE_MOST_USED}-scheduler`,
      {
        every: TIME_IN_MS.ONE_HOUR,
      },
      {
        name: JOB_NAMES.AGGREGATE_MOST_USED,
        data: {},
        opts: {
          removeOnComplete: true,
          removeOnFail: false,
        },
      },
    );
  }
}
