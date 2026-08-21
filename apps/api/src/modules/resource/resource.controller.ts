import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  UsePipes,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { API_ROUTES } from '@repo/constants';
import {
  CreateResourceInput,
  ReorderResourceInput,
  UpdateResourceInput,
  createResourceSchema,
  reorderResourceSchema,
  updateResourceSchema,
} from '@repo/validation';

import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { NestRequest } from '../../common/types/request.type';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { ResourceService } from './resource.service';

@Controller()
@UseGuards(ThrottlerGuard, JwtAuthGuard)
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Get(API_ROUTES.RESOURCES.GLOBAL)
  async findAll(@Req() req: NestRequest) {
    return this.resourceService.findAll(req.user.id);
  }

  @Get(API_ROUTES.RESOURCES.BASE)
  async getWorkspaceResources(
    @Req() req: NestRequest,
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
  ) {
    return this.resourceService.getWorkspaceResources(req.user.id, workspaceId);
  }

  @Post(API_ROUTES.RESOURCES.BASE)
  @UsePipes(new ZodValidationPipe(createResourceSchema))
  async createForWorkspace(
    @Req() req: NestRequest,
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Body() body: CreateResourceInput,
  ) {
    return this.resourceService.createForWorkspace(
      req.user.id,
      workspaceId,
      body,
    );
  }

  @Patch(API_ROUTES.RESOURCES.REORDER)
  @UsePipes(new ZodValidationPipe(reorderResourceSchema))
  async reorder(
    @Req() req: NestRequest,
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Body() body: ReorderResourceInput,
  ) {
    await this.resourceService.reorder(req.user.id, workspaceId, body);
    return { message: 'Sắp xếp tài nguyên thành công' };
  }

  @Patch(API_ROUTES.RESOURCES.DETAIL)
  @UsePipes(new ZodValidationPipe(updateResourceSchema))
  async updateResource(
    @Req() req: NestRequest,
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('resourceId', ParseUUIDPipe) resourceId: string,
    @Body() body: UpdateResourceInput,
  ) {
    return this.resourceService.updateResource(
      req.user.id,
      workspaceId,
      resourceId,
      body,
    );
  }

  @Delete(API_ROUTES.RESOURCES.DETAIL)
  async deleteResource(
    @Req() req: NestRequest,
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('resourceId', ParseUUIDPipe) resourceId: string,
  ) {
    await this.resourceService.deleteFromWorkspace(
      req.user.id,
      workspaceId,
      resourceId,
    );
    return { message: 'Xóa tài nguyên thành công' };
  }
}
