import {
  Controller,
  Get,
  Post,
  Patch,
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
  createResourceSchema,
  reorderResourceSchema,
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
    return { message: 'Resources reordered' };
  }
}
