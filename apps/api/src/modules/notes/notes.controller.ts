import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';

import {
  CreateNoteInput,
  UpdateNoteInput,
  CreateNoteSchema,
  UpdateNoteSchema,
  NoteQuerySchema,
  NoteQuery,
} from '@repo/validation';

import { NestRequest } from '../../common/types/request.type';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { NotesService } from './notes.service';

@Controller('workspaces/:workspaceId/notes')
@UseGuards(ThrottlerGuard, JwtAuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  async findAll(
    @Req() req: NestRequest,
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Query(new ZodValidationPipe(NoteQuerySchema)) query: NoteQuery,
  ) {
    const actualResourceId =
      query.resourceId === 'none' ? null : query.resourceId;

    return this.notesService.findAllByWorkspace(
      req.user.id,
      workspaceId,
      query.page,
      query.limit,
      {
        type: query.type,
        resourceId: actualResourceId,
      },
    );
  }

  @Post()
  @UsePipes(new ZodValidationPipe(CreateNoteSchema))
  async create(
    @Req() req: NestRequest,
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Body() body: CreateNoteInput,
  ) {
    return {
      data: await this.notesService.create(req.user.id, workspaceId, body),
    };
  }

  @Patch(':noteId')
  @UsePipes(new ZodValidationPipe(UpdateNoteSchema))
  async update(
    @Req() req: NestRequest,
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('noteId', ParseUUIDPipe) noteId: string,
    @Body() body: UpdateNoteInput,
  ) {
    return {
      data: await this.notesService.update(
        req.user.id,
        workspaceId,
        noteId,
        body,
      ),
    };
  }

  @Delete(':noteId')
  async remove(
    @Req() req: NestRequest,
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('noteId', ParseUUIDPipe) noteId: string,
  ) {
    await this.notesService.remove(req.user.id, workspaceId, noteId);
    return { success: true };
  }
}
