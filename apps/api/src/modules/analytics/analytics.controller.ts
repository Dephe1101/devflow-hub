import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  UsePipes,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AnalyticsService } from './analytics.service';
import {
  CreateLaunchLogSchema,
  type CreateLaunchLogInput,
} from '@repo/validation';
import { API_ROUTES } from '@repo/constants';
import type { NestRequest } from '../../common/types/request.type';
import { WorkspaceResponseDto } from '../workspace/dto/workspace-response.dto';
import { LaunchLog } from '@prisma/client';

@Controller(API_ROUTES.ANALYTICS.BASE)
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get(API_ROUTES.ANALYTICS.RECENT)
  async getRecentWorkspaces(
    @Req() req: NestRequest,
  ): Promise<WorkspaceResponseDto[]> {
    const userId = req.user.id;
    return this.analyticsService.getRecentWorkspaces(userId);
  }

  @Get(API_ROUTES.ANALYTICS.MOST_USED)
  async getMostUsedWorkspaces(
    @Req() req: NestRequest,
  ): Promise<WorkspaceResponseDto[]> {
    const userId = req.user.id;
    return this.analyticsService.getMostUsedWorkspaces(userId);
  }

  @Post(API_ROUTES.ANALYTICS.LAUNCH_LOG)
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ThrottlerGuard)
  @UsePipes(new ZodValidationPipe(CreateLaunchLogSchema))
  async createLaunchLog(
    @Req() req: NestRequest,
    @Body() body: CreateLaunchLogInput,
  ): Promise<{ data: LaunchLog }> {
    const userId = req.user.id;
    const log = await this.analyticsService.createLaunchLog(userId, body);
    return { data: log };
  }
}
