import type { ResourceWithPivot } from '../resource.repository';
import type { Resource } from '@prisma/client';

export class ResourceResponseDto {
  id!: string;
  type!: string;
  value!: string;
  displayName!: string | null;
  faviconUrl!: string | null;
  createdAt!: string;

  static fromEntity(entity: Resource): ResourceResponseDto {
    const dto = new ResourceResponseDto();
    dto.id = entity.id;
    dto.type = entity.type;
    dto.value = entity.value;
    dto.displayName = entity.displayName;
    dto.faviconUrl = entity.faviconUrl;
    dto.createdAt = entity.createdAt.toISOString();
    return dto;
  }
}

export class WorkspaceResourceResponseDto {
  id!: string;
  workspaceId!: string;
  resourceId!: string;
  sortOrder!: number;
  isEnabled!: boolean;
  resource!: ResourceResponseDto;

  static fromEntity(pivot: ResourceWithPivot): WorkspaceResourceResponseDto {
    const dto = new WorkspaceResourceResponseDto();
    dto.id = pivot.id;
    dto.workspaceId = pivot.workspaceId;
    dto.resourceId = pivot.resourceId;
    dto.sortOrder = pivot.sortOrder;
    dto.isEnabled = pivot.isEnabled;
    dto.resource = ResourceResponseDto.fromEntity(pivot.resource);
    return dto;
  }
}
