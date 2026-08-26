import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class NotesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.NoteUncheckedCreateInput) {
    return this.prisma.note.create({ data });
  }

  async findByWorkspaceId(
    workspaceId: string,
    skip: number,
    take: number,
    filters?: {
      type?: string | undefined;
      resourceId?: string | null | undefined;
    },
  ) {
    const where: Prisma.NoteWhereInput = { workspaceId };
    if (filters?.type) {
      where.type = filters.type;
    }
    if (filters?.resourceId !== undefined) {
      where.resourceId = filters.resourceId;
    }

    return this.prisma.note.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      skip,
      take,
    });
  }

  async countByWorkspaceId(
    workspaceId: string,
    filters?: {
      type?: string | undefined;
      resourceId?: string | null | undefined;
    },
  ) {
    const where: Prisma.NoteWhereInput = { workspaceId };
    if (filters?.type) {
      where.type = filters.type;
    }
    if (filters?.resourceId !== undefined) {
      where.resourceId = filters.resourceId;
    }

    return this.prisma.note.count({
      where,
    });
  }

  async findById(id: string) {
    return this.prisma.note.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: Prisma.NoteUncheckedUpdateInput) {
    return this.prisma.note.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.note.delete({
      where: { id },
    });
  }
}
