import { Controller, Get, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import { ROLES, API_ROUTES, QUEUE_NAMES } from '@repo/constants';

export interface QueueJobDto {
  id?: string | undefined;
  name: string;
  timestamp: number;
  processedOn?: number | undefined;
  finishedOn?: number | undefined;
  failedReason?: string | undefined;
  progress: number | object | string | boolean;
}

@Controller(API_ROUTES.ADMIN.BASE)
@UseGuards(JwtAuthGuard, RolesGuard, ThrottlerGuard)
@Roles(ROLES.ADMIN)
export class AdminController {
  constructor(
    @InjectQueue(QUEUE_NAMES.ANALYTICS) private readonly analyticsQueue: Queue,
  ) {}

  @Get(API_ROUTES.ADMIN.QUEUES_STATS)
  async getQueueStats(): Promise<{
    counts: Record<string, number>;
    jobs: Record<'active' | 'waiting' | 'failed' | 'delayed', QueueJobDto[]>;
  }> {
    const jobCounts = await this.analyticsQueue.getJobCounts();

    const START_INDEX = 0;
    const END_INDEX = 9;

    // We only fetch a few jobs for the preview table
    const activeJobs = await this.analyticsQueue.getJobs(
      ['active'],
      START_INDEX,
      END_INDEX,
    );
    const waitingJobs = await this.analyticsQueue.getJobs(
      ['waiting'],
      START_INDEX,
      END_INDEX,
    );
    const failedJobs = await this.analyticsQueue.getJobs(
      ['failed'],
      START_INDEX,
      END_INDEX,
    );
    const delayedJobs = await this.analyticsQueue.getJobs(
      ['delayed'],
      START_INDEX,
      END_INDEX,
    );

    const mapJob = (j: Job) => ({
      id: j.id,
      name: j.name,
      timestamp: j.timestamp,
      processedOn: j.processedOn,
      finishedOn: j.finishedOn,
      failedReason: j.failedReason,
      progress: j.progress,
    });

    return {
      counts: jobCounts,
      jobs: {
        active: activeJobs.map(mapJob),
        waiting: waitingJobs.map(mapJob),
        failed: failedJobs.map(mapJob),
        delayed: delayedJobs.map(mapJob),
      },
    };
  }
}
