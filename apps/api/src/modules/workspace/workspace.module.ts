import { Module } from '@nestjs/common';

import { WorkspaceController } from './workspace.controller';
import { WorkspaceRepository } from './workspace.repository';
import { WorkspaceService } from './workspace.service';

@Module({
  providers: [WorkspaceService, WorkspaceRepository],
  controllers: [WorkspaceController],
  exports: [WorkspaceRepository],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class WorkspaceModule {}
