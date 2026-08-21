import { Module } from '@nestjs/common';

import { ResourceController } from './resource.controller';
import { ResourceRepository } from './resource.repository';
import { ResourceService } from './resource.service';

@Module({
  providers: [ResourceService, ResourceRepository],
  controllers: [ResourceController],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ResourceModule {}
