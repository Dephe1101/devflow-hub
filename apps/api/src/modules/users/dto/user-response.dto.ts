import type { User } from '@prisma/client';

export class UserResponseDto {
  id!: string;
  email!: string;
  name!: string;
  avatarUrl!: string | null;
  authProvider!: string | null;
  createdAt!: string;

  static fromEntity(entity: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = entity.id;
    dto.email = entity.email;
    dto.name = entity.name;
    dto.avatarUrl = entity.avatarUrl;
    dto.authProvider = entity.authProvider;
    dto.createdAt = entity.createdAt.toISOString();
    return dto;
  }
}
