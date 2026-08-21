import { Injectable } from '@nestjs/common';
import { CreateResourceInput, ReorderResourceInput } from '@repo/validation';

import {
  ResourceResponseDto,
  WorkspaceResourceResponseDto,
} from './dto/resource-response.dto';
import { ResourceRepository } from './resource.repository';

@Injectable()
export class ResourceService {
  constructor(private readonly resourceRepo: ResourceRepository) {}

  async findAll(userId: string): Promise<ResourceResponseDto[]> {
    const resources = await this.resourceRepo.findByUserId(userId);
    return resources.map((resource) =>
      ResourceResponseDto.fromEntity(resource),
    );
  }

  async getWorkspaceResources(
    userId: string,
    workspaceId: string,
  ): Promise<WorkspaceResourceResponseDto[]> {
    // In a real app we might want to check if the workspace belongs to the user first
    const pivots = await this.resourceRepo.findWorkspaceResources(workspaceId);
    return pivots.map((pivot) =>
      WorkspaceResourceResponseDto.fromEntity(pivot),
    );
  }

  async createForWorkspace(
    userId: string,
    workspaceId: string,
    data: CreateResourceInput,
  ): Promise<WorkspaceResourceResponseDto> {
    const resource = await this.resourceRepo.create({
      createdByUserId: userId,
      type: data.type,
      value: data.value,
      displayName: data.displayName ?? null,
      notes: data.notes ?? null,
    });

    const pivots = await this.resourceRepo.findWorkspaceResources(workspaceId);
    const nextOrder =
      pivots.length > 0 ? Math.max(...pivots.map((p) => p.sortOrder)) + 1 : 0;

    const pivot = await this.resourceRepo.createWorkspaceResource({
      workspaceId,
      resourceId: resource.id,
      sortOrder: nextOrder,
    });

    // We manually construct the response object here since create doesn't return the include
    return WorkspaceResourceResponseDto.fromEntity({
      ...pivot,
      resource,
    });
  }

  async reorder(
    userId: string,
    workspaceId: string,
    data: ReorderResourceInput,
  ): Promise<void> {
    const updates = data.resourceIds.map((id, index) => ({
      id,
      sortOrder: index,
    }));
    await this.resourceRepo.reorderWorkspaceResources(workspaceId, updates);
  }
}
