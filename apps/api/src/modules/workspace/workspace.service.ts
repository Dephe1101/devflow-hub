import { ERROR_MESSAGES } from '@repo/constants';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWorkspaceInput, UpdateWorkspaceInput } from '@repo/validation';

import { WorkspaceResponseDto } from './dto/workspace-response.dto';
import { WorkspaceRepository } from './workspace.repository';

@Injectable()
export class WorkspaceService {
  constructor(private readonly workspaceRepo: WorkspaceRepository) {}

  async findAll(userId: string): Promise<WorkspaceResponseDto[]> {
    const workspaces = await this.workspaceRepo.findByUserId(userId);
    return workspaces.map((workspace) =>
      WorkspaceResponseDto.fromEntity(workspace),
    );
  }

  async create(
    userId: string,
    data: CreateWorkspaceInput,
  ): Promise<WorkspaceResponseDto> {
    const workspace = await this.workspaceRepo.create({
      userId,
      name: data.name,
      description: data.description ?? null,
      color: data.color ?? null,
      icon: data.icon ?? null,
    });
    return WorkspaceResponseDto.fromEntity(workspace);
  }

  async update(
    userId: string,
    workspaceId: string,
    data: UpdateWorkspaceInput,
  ): Promise<WorkspaceResponseDto> {
    const workspace = await this.workspaceRepo.findByIdAndUserId(
      workspaceId,
      userId,
    );

    if (!workspace) {
      throw new NotFoundException(ERROR_MESSAGES.WORKSPACE.NOT_FOUND);
    }

    const updated = await this.workspaceRepo.update(workspaceId, {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.color !== undefined && { color: data.color }),
      ...(data.icon !== undefined && { icon: data.icon }),
      ...(data.isPinned !== undefined && { isPinned: data.isPinned }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
    });
    return WorkspaceResponseDto.fromEntity(updated);
  }

  async remove(userId: string, workspaceId: string): Promise<void> {
    const workspace = await this.workspaceRepo.findByIdAndUserId(
      workspaceId,
      userId,
    );

    if (!workspace) {
      throw new NotFoundException(ERROR_MESSAGES.WORKSPACE.NOT_FOUND);
    }

    await this.workspaceRepo.delete(workspaceId);
  }
}
