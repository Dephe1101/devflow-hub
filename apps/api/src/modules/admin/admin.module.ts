import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'analytics',
    }),
  ],
  controllers: [AdminController],
  providers: [],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AdminModule {}
