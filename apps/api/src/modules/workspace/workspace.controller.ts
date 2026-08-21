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
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
  createWorkspaceSchema,
  updateWorkspaceSchema,
} from '@repo/validation';

import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { NestRequest } from '../../common/types/request.type';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { WorkspaceService } from './workspace.service';

@Controller(API_ROUTES.WORKSPACES.BASE)
@UseGuards(ThrottlerGuard, JwtAuthGuard)
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Get()
  async findAll(@Req() req: NestRequest) {
    return this.workspaceService.findAll(req.user.id);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(createWorkspaceSchema))
  async create(@Req() req: NestRequest, @Body() body: CreateWorkspaceInput) {
    return this.workspaceService.create(req.user.id, body);
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateWorkspaceSchema))
  async update(
    @Req() req: NestRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateWorkspaceInput,
  ) {
    return this.workspaceService.update(req.user.id, id, body);
  }

  @Delete(':id')
  async remove(
    @Req() req: NestRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.workspaceService.remove(req.user.id, id);
    return { message: 'Workspace deleted' };
  }
}
