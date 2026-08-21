import { Module } from '@nestjs/common';

import { WorkspaceModule } from '../workspace/workspace.module';
import { ResourceController } from './resource.controller';
import { ResourceRepository } from './resource.repository';
import { ResourceService } from './resource.service';

@Module({
  imports: [WorkspaceModule],
  providers: [ResourceService, ResourceRepository],
  controllers: [ResourceController],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ResourceModule {}
