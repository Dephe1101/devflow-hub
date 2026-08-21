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
}
