import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  Req,
  Body,
  HttpException,
  HttpStatus,
  UsePipes,
  ForbiddenException,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AgentService } from './agent.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AgentGateway } from '../../gateways/agent.gateway';
import { ResourceService } from '../resource/resource.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { agentLaunchSchema, AgentLaunchInput } from '@repo/validation';

interface AuthRequest {
  user: {
    id: string;
  };
}

@Controller('agent')
@UseGuards(ThrottlerGuard, JwtAuthGuard)
export class AgentController {
  constructor(
    private readonly agentService: AgentService,
    private readonly agentGateway: AgentGateway,
    private readonly resourceService: ResourceService,
  ) {}

  @Post('pairing-code')
  async generatePairingCode(@Req() req: AuthRequest) {
    const userId = req.user.id;
    const code = await this.agentService.generatePairingCode(userId);
    return { code, expiresIn: 300 };
  }

  @Post('launch')
  @UsePipes(new ZodValidationPipe(agentLaunchSchema))
  async launchLocalResource(
    @Req() req: AuthRequest,
    @Body() body: AgentLaunchInput,
  ) {
    const userId = req.user.id;
    const { action, ...payload } = body;

    // SEC-2 fix: Validate path belongs to user's workspace resources
    const targetValue =
      action === 'open_folder' ? payload.path : payload.appName;
    if (targetValue) {
      const hasAccess = await this.resourceService.userOwnsResource(
        userId,
        targetValue,
      );
      if (!hasAccess) {
        throw new ForbiddenException('Resource not found in your workspaces');
      }
    }

    const success = this.agentGateway.sendCommandToAgent(
      userId,
      action,
      payload,
    );
    if (!success) {
      throw new HttpException(
        'Desktop Agent is not connected',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    return { success: true };
  }

  @Get('devices')
  async getDevices(@Req() req: AuthRequest) {
    return this.agentService.getDevices(req.user.id);
  }

  @Delete('devices/:deviceId')
  async removeDevice(
    @Req() req: AuthRequest,
    @Param('deviceId') deviceId: string,
  ) {
    await this.agentService.removeDevice(req.user.id, deviceId);
    this.agentGateway.disconnectDevice(req.user.id, deviceId);
    return { success: true };
  }
}
