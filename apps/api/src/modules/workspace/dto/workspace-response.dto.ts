import type { Workspace } from '@prisma/client';

export class WorkspaceResponseDto {
  id!: string;
  name!: string;
  description!: string | null;
  color!: string | null;
  icon!: string | null;
  resourceCount!: number;
  sortOrder!: number;
  isPinned!: boolean;
  lastLaunchedAt!: string | null;
  createdAt!: string;

  static fromEntity(
    entity: Workspace & { _count?: { resources: number } },
  ): WorkspaceResponseDto {
    const dto = new WorkspaceResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.description = entity.description;
    dto.color = entity.color;
    dto.icon = entity.icon;
    dto.resourceCount = entity._count?.resources ?? 0;
    dto.sortOrder = entity.sortOrder;
    dto.isPinned = entity.isPinned;
    dto.lastLaunchedAt = entity.lastLaunchedAt?.toISOString() ?? null;
    dto.createdAt = entity.createdAt.toISOString();
    return dto;
  }
}
