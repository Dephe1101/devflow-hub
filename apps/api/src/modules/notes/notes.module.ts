import { Module } from '@nestjs/common';

import { WorkspaceModule } from '../workspace/workspace.module';
import { ResourceModule } from '../resource/resource.module';

import { NotesController } from './notes.controller';
import { NotesRepository } from './notes.repository';
import { NotesService } from './notes.service';

@Module({
  imports: [WorkspaceModule, ResourceModule],
  controllers: [NotesController],
  providers: [NotesService, NotesRepository],
  exports: [NotesService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class NotesModule {}
