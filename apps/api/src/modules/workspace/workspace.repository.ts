import { Injectable } from '@nestjs/common';
import { Prisma, Workspace } from '@prisma/client';

import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class WorkspaceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.WorkspaceUncheckedCreateInput): Promise<Workspace> {
    return this.prisma.workspace.create({ data });
  }

  async findByUserId(userId: string) {
    return this.prisma.workspace.findMany({
      where: { userId },
      orderBy: [
        { isPinned: 'desc' },
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
      include: {
        _count: {
          select: { resources: true },
        },
      },
    });
  }

  async findByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<Workspace | null> {
    return this.prisma.workspace.findUnique({
      where: { id, userId },
    });
  }

  async update(
    id: string,
    data: Prisma.WorkspaceUncheckedUpdateInput,
  ): Promise<Workspace> {
    return this.prisma.workspace.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Workspace> {
    return this.prisma.workspace.delete({
      where: { id },
    });
  }
}
