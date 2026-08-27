import { ERROR_MESSAGES } from '@repo/constants';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateNoteInput, UpdateNoteInput } from '@repo/validation';

import { WorkspaceRepository } from '../workspace/workspace.repository';
import { ResourceRepository } from '../resource/resource.repository';

import { NoteResponseDto } from './dto/note-response.dto';
import { NotesRepository } from './notes.repository';

@Injectable()
export class NotesService {
  constructor(
    private readonly notesRepo: NotesRepository,
    private readonly workspaceRepo: WorkspaceRepository,
    private readonly resourceRepo: ResourceRepository,
  ) {}

  private async checkWorkspaceOwnership(workspaceId: string, userId: string) {
    const workspace = await this.workspaceRepo.findByIdAndUserId(
      workspaceId,
      userId,
    );
    if (!workspace) {
      throw new ForbiddenException(ERROR_MESSAGES.WORKSPACE.NO_ACCESS);
    }
    return workspace;
  }

  private async validateResourceOwnership(
    resourceId: string,
    workspaceId: string,
  ) {
    const exists = await this.resourceRepo.checkWorkspaceResourceExists(
      workspaceId,
      resourceId,
    );
    if (!exists) {
      throw new ForbiddenException(
        ERROR_MESSAGES.RESOURCE.NOT_BELONG_OR_NOT_FOUND,
      );
    }
  }

  async findAllByWorkspace(
    userId: string,
    workspaceId: string,
    page = 1,
    limit = 20,
    filters?: {
      type?: string | undefined;
      resourceId?: string | null | undefined;
    },
  ) {
    await this.checkWorkspaceOwnership(workspaceId, userId);

    const skip = (page - 1) * limit;
    const notes = await this.notesRepo.findByWorkspaceId(
      workspaceId,
      skip,
      limit,
      filters,
    );
    const total = await this.notesRepo.countByWorkspaceId(workspaceId, filters);

    return {
      data: notes.map((note) => NoteResponseDto.fromEntity(note)),
      meta: {
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(
    userId: string,
    workspaceId: string,
    data: CreateNoteInput,
  ): Promise<NoteResponseDto> {
    await this.checkWorkspaceOwnership(workspaceId, userId);

    if (data.resourceId) {
      if (data.content && data.content.length > 500) {
        throw new BadRequestException(ERROR_MESSAGES.RESOURCE.NOTE_TOO_LONG);
      }
      await this.validateResourceOwnership(data.resourceId, workspaceId);
    }

    const note = await this.notesRepo.create({
      workspaceId,
      title: data.title,
      content: data.content ?? null,
      type: data.type,
      category: data.category ?? null,
      sortOrder: data.sortOrder ?? 0,
      resourceId: data.resourceId ?? null,
    });

    return NoteResponseDto.fromEntity(note);
  }

  async update(
    userId: string,
    workspaceId: string,
    noteId: string,
    data: UpdateNoteInput,
  ): Promise<NoteResponseDto> {
    await this.checkWorkspaceOwnership(workspaceId, userId);

    const note = await this.notesRepo.findById(noteId);
    if (note?.workspaceId !== workspaceId) {
      throw new NotFoundException(ERROR_MESSAGES.NOTE.NOT_FOUND);
    }

    const effectiveResourceId =
      data.resourceId !== undefined ? data.resourceId : note.resourceId;
    const effectiveContent = data.content ?? note.content;

    if (effectiveResourceId) {
      if (effectiveContent && effectiveContent.length > 500) {
        throw new BadRequestException(ERROR_MESSAGES.RESOURCE.NOTE_TOO_LONG);
      }
      if (
        typeof data.resourceId === 'string' &&
        data.resourceId !== note.resourceId
      ) {
        await this.validateResourceOwnership(data.resourceId, workspaceId);
      }
    }

    const updateData: Prisma.NoteUncheckedUpdateInput = {};
    if (data.title !== undefined) {
      updateData.title = data.title;
    }
    if (data.content !== undefined) {
      updateData.content = data.content ?? null;
    }
    if (data.type !== undefined) {
      updateData.type = data.type;
    }
    if (data.category !== undefined) {
      updateData.category = data.category ?? null;
    }
    if (data.sortOrder !== undefined) {
      updateData.sortOrder = data.sortOrder;
    }
    if (data.resourceId !== undefined) {
      updateData.resourceId = data.resourceId;
    }

    try {
      const updatedNote = await this.notesRepo.update(noteId, updateData);
      return NoteResponseDto.fromEntity(updatedNote);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(ERROR_MESSAGES.NOTE.NOT_FOUND);
      }
      throw error;
    }
  }

  async remove(
    userId: string,
    workspaceId: string,
    noteId: string,
  ): Promise<void> {
    await this.checkWorkspaceOwnership(workspaceId, userId);

    const note = await this.notesRepo.findById(noteId);
    if (note?.workspaceId !== workspaceId) {
      throw new NotFoundException(ERROR_MESSAGES.NOTE.NOT_FOUND);
    }

    try {
      await this.notesRepo.delete(noteId);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(ERROR_MESSAGES.NOTE.NOT_FOUND);
      }
      throw error;
    }
  }
}
