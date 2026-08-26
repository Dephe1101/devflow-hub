import type { Note } from '@prisma/client';

export class NoteResponseDto {
  id!: string;
  workspaceId!: string;
  resourceId!: string | null;
  title!: string;
  content!: string | null;
  type!: string;
  category!: string | null;
  sortOrder!: number;
  createdAt!: string;
  updatedAt!: string;

  static fromEntity(entity: Note): NoteResponseDto {
    const dto = new NoteResponseDto();
    dto.id = entity.id;
    dto.workspaceId = entity.workspaceId;
    dto.resourceId = entity.resourceId;
    dto.title = entity.title;
    dto.content = entity.content;
    dto.type = entity.type;
    dto.category = entity.category;
    dto.sortOrder = entity.sortOrder;
    dto.createdAt = entity.createdAt.toISOString();
    dto.updatedAt = entity.updatedAt.toISOString();
    return dto;
  }
}
