import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateResourceInput,
  ReorderResourceInput,
  UpdateResourceInput,
} from '@repo/validation';

import { WorkspaceRepository } from '../workspace/workspace.repository';

import {
  ResourceResponseDto,
  WorkspaceResourceResponseDto,
} from './dto/resource-response.dto';
import { ResourceRepository } from './resource.repository';

@Injectable()
export class ResourceService {
  constructor(
    private readonly resourceRepo: ResourceRepository,
    private readonly workspaceRepo: WorkspaceRepository,
  ) {}

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
    const workspace = await this.workspaceRepo.findByIdAndUserId(
      workspaceId,
      userId,
    );
    if (!workspace) {
      throw new NotFoundException('Không tìm thấy workspace');
    }

    const pivots = await this.resourceRepo.findWorkspaceResources(workspaceId);
    return pivots.map((pivot) =>
      WorkspaceResourceResponseDto.fromEntity(pivot),
    );
  }

  private getFaviconUrl(type: string, value?: string): string | null {
    if (type === 'URL' && value) {
      try {
        const urlObj = new URL(value);
        const hostname = urlObj.hostname.toLowerCase();

        // SEC-7: Block local hostnames and raw IP addresses to prevent SSRF
        const isLocalHost =
          hostname === 'localhost' || hostname.endsWith('.local');
        const isIp = /^[\d.]+$|^\[?[\d:]+\]?$/.test(hostname);

        if (isLocalHost || isIp) {
          return null;
        }

        return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
      } catch {
        // ignore
      }
    }
    return null;
  }

  async createForWorkspace(
    userId: string,
    workspaceId: string,
    data: CreateResourceInput,
  ): Promise<WorkspaceResourceResponseDto> {
    const workspace = await this.workspaceRepo.findByIdAndUserId(
      workspaceId,
      userId,
    );
    if (!workspace) {
      throw new NotFoundException('Không tìm thấy workspace');
    }

    let resource = await this.resourceRepo.findByUserAndValue(
      userId,
      data.type,
      data.value,
    );

    resource ??= await this.resourceRepo.create({
      createdByUserId: userId,
      type: data.type,
      value: data.value,
      displayName: data.displayName ?? null,
      faviconUrl: this.getFaviconUrl(data.type, data.value),
    });

    const pivots = await this.resourceRepo.findWorkspaceResources(workspaceId);

    const existingPivot = pivots.find((p) => p.resourceId === resource.id);
    if (existingPivot) {
      return WorkspaceResourceResponseDto.fromEntity(existingPivot);
    }

    const nextOrder =
      pivots.length > 0 ? Math.max(...pivots.map((p) => p.sortOrder)) + 1 : 0;

    const pivot = await this.resourceRepo.createWorkspaceResource({
      workspaceId,
      resourceId: resource.id,
      sortOrder: nextOrder,
    });

    return WorkspaceResourceResponseDto.fromEntity({ ...pivot, resource });
  }

  async updateResource(
    userId: string,
    workspaceId: string,
    resourceId: string,
    data: UpdateResourceInput,
  ): Promise<ResourceResponseDto> {
    const workspace = await this.workspaceRepo.findByIdAndUserId(
      workspaceId,
      userId,
    );
    if (!workspace) {
      throw new NotFoundException('Không tìm thấy workspace');
    }

    // Bug 2 Fix: Check if resource actually belongs to the workspace
    const pivots = await this.resourceRepo.findWorkspaceResources(workspaceId);
    const existingPivot = pivots.find((p) => p.resourceId === resourceId);
    if (!existingPivot) {
      throw new NotFoundException('Resource không thuộc về workspace này');
    }

    const faviconUrl = this.getFaviconUrl(data.type ?? '', data.value);

    const updatedResource = await this.resourceRepo.updateResource(resourceId, {
      ...(data.type && { type: data.type }),
      ...(data.value && { value: data.value }),
      ...(data.displayName !== undefined && { displayName: data.displayName }),
      ...(faviconUrl && { faviconUrl }),
    });

    return ResourceResponseDto.fromEntity(updatedResource);
  }

  async deleteFromWorkspace(
    userId: string,
    workspaceId: string,
    resourceId: string,
  ): Promise<void> {
    const workspace = await this.workspaceRepo.findByIdAndUserId(
      workspaceId,
      userId,
    );
    if (!workspace) {
      throw new NotFoundException('Không tìm thấy workspace');
    }

    await this.resourceRepo.deleteWorkspaceResource(workspaceId, resourceId);

    const usageCount =
      await this.resourceRepo.countWorkspaceResources(resourceId);
    if (usageCount === 0) {
      await this.resourceRepo.deleteResource(resourceId);
    }
  }

  async reorder(
    userId: string,
    workspaceId: string,
    data: ReorderResourceInput,
  ): Promise<void> {
    const workspace = await this.workspaceRepo.findByIdAndUserId(
      workspaceId,
      userId,
    );
    if (!workspace) {
      throw new NotFoundException('Không tìm thấy workspace');
    }

    const updates = data.resourceIds.map((id, index) => ({
      id,
      sortOrder: index,
    }));
    await this.resourceRepo.reorderWorkspaceResources(workspaceId, updates);
  }

  /**
   * SEC-2 fix: Check if a user owns a resource by its value (path/appName)
   * Used by AgentController to validate launch requests
   */
  async userOwnsResource(userId: string, value: string): Promise<boolean> {
    const resource = await this.resourceRepo.findByUserAndValue(
      userId,
      'LOCAL_PATH',
      value,
    );
    if (resource) {
      return true;
    }
    const appResource = await this.resourceRepo.findByUserAndValue(
      userId,
      'APP_URI',
      value,
    );
    return !!appResource;
  }
}
