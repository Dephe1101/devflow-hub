import { Injectable } from '@nestjs/common';
import { Prisma, Resource, WorkspaceResource } from '@prisma/client';

import { PrismaService } from '../../core/database/prisma.service';

export type ResourceWithPivot = WorkspaceResource & { resource: Resource };

@Injectable()
export class ResourceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ResourceUncheckedCreateInput): Promise<Resource> {
    return this.prisma.resource.create({ data });
  }

  async findByUserId(userId: string): Promise<Resource[]> {
    return this.prisma.resource.findMany({
      where: { createdByUserId: userId },
    });
  }

  async findWorkspaceResources(
    workspaceId: string,
  ): Promise<ResourceWithPivot[]> {
    return this.prisma.workspaceResource.findMany({
      where: { workspaceId },
      include: { resource: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createWorkspaceResource(
    data: Prisma.WorkspaceResourceUncheckedCreateInput,
  ): Promise<WorkspaceResource> {
    return this.prisma.workspaceResource.create({ data });
  }

  async reorderWorkspaceResources(
    workspaceId: string,
    updates: { id: string; sortOrder: number }[],
  ): Promise<void> {
    await this.prisma.$transaction(
      updates.map((update) =>
        this.prisma.workspaceResource.update({
          where: { id: update.id, workspaceId }, // ensure it belongs to the workspace
          data: { sortOrder: update.sortOrder },
        }),
      ),
    );
  }

  async findByUserAndValue(
    userId: string,
    type: string,
    value: string,
  ): Promise<Resource | null> {
    return this.prisma.resource.findFirst({
      where: { createdByUserId: userId, type, value },
    });
  }

  async updateResource(
    id: string,
    data: Prisma.ResourceUpdateInput,
  ): Promise<Resource> {
    return this.prisma.resource.update({
      where: { id },
      data,
    });
  }

  async deleteWorkspaceResource(
    workspaceId: string,
    resourceId: string,
  ): Promise<void> {
    await this.prisma.workspaceResource.delete({
      where: {
        workspaceId_resourceId: {
          workspaceId,
          resourceId,
        },
      },
    });
  }

  async countWorkspaceResources(resourceId: string): Promise<number> {
    return this.prisma.workspaceResource.count({
      where: { resourceId },
    });
  }

  async deleteResource(id: string): Promise<void> {
    await this.prisma.resource.delete({
      where: { id },
    });
  }
}
