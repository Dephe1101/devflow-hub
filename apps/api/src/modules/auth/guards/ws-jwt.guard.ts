import { ERROR_MESSAGES } from '@repo/constants';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Reflector } from '@nestjs/core';

interface AuthenticatedSocket {
  user?: { role: string; sub: string; deviceId?: string };
  token?: string;
}

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );
    if (isPublic) {
      return true;
    }

    try {
      const client = context.switchToWs().getClient<AuthenticatedSocket>();

      // If already authenticated on this socket, allow
      if (client.user) {
        return true;
      }

      const data = context.switchToWs().getData<unknown>();

      // Attempt to extract token from payload data
      const payload = (
        typeof data === 'string' ? JSON.parse(data) : data
      ) as Record<string, unknown>;
      const token = (payload.agentToken ?? payload.token) as string | undefined;

      if (!token) {
        this.logger.warn('WebSocket connection attempted without token');
        throw new WsException(ERROR_MESSAGES.AUTH.MISSING_TOKEN);
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const decoded = this.jwtService.verify(token);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (decoded.role !== 'agent') {
        throw new WsException(ERROR_MESSAGES.AGENT.WS_ONLY);
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      client.user = decoded;
      client.token = token; // Store raw token for per-command verification
      return true;
    } catch {
      throw new WsException(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
    }
  }
}
