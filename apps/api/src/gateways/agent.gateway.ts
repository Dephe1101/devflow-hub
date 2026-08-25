/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/restrict-template-expressions, @typescript-eslint/require-await, @typescript-eslint/prefer-nullish-coalescing, @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unused-vars */
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import WebSocket, { Server } from 'ws';
import {
  Logger,
  UseGuards,
  SetMetadata,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { AgentService } from '../modules/agent/agent.service';
import { WsJwtGuard } from '../modules/auth/guards/ws-jwt.guard';

// BUG-NEW-2: Heartbeat timeout constants
const HEARTBEAT_CHECK_INTERVAL_MS = 60_000; // Check every 60s
const HEARTBEAT_TIMEOUT_MS = 60_000; // Disconnect if no heartbeat for 60s

@WebSocketGateway({ path: '/agent' })
@UseGuards(WsJwtGuard)
export class AgentGateway
  implements
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnModuleInit,
    OnModuleDestroy
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(AgentGateway.name);

  // Mapping from userId to active sockets (Map for multi-device support: userId -> deviceId -> socket)
  private readonly agentSockets = new Map<string, Map<string, WebSocket>>();

  // BUG-NEW-2: Track last heartbeat timestamp per socket
  private readonly lastHeartbeat = new Map<WebSocket, number>();
  private heartbeatCheckInterval: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly agentService: AgentService) {}

  onModuleInit() {
    // BUG-NEW-2: Start periodic heartbeat check
    this.heartbeatCheckInterval = setInterval(() => {
      this.checkHeartbeatTimeouts();
    }, HEARTBEAT_CHECK_INTERVAL_MS);
  }

  onModuleDestroy() {
    if (this.heartbeatCheckInterval) {
      clearInterval(this.heartbeatCheckInterval);
      this.heartbeatCheckInterval = null;
    }
  }

  async handleConnection(client: WebSocket, req?: any) {
    // ISSUE-3 Fix: Validate Origin to prevent XSS/CSRF from malicious browsers
    const origin = req?.headers?.origin;
    const allowedOrigin =
      process.env.FRONTEND_URL ||
      process.env.WEB_URL ||
      'http://localhost:3000';
    if (origin && origin !== allowedOrigin) {
      this.logger.warn(
        `Rejected WS connection from unallowed origin: ${origin}`,
      );
      client.close(1008, 'Origin not allowed');
      return;
    }

    // Bug 13 Fix: Get real IP from X-Forwarded-For header if behind a proxy
    const forwardedFor = req?.headers?.['x-forwarded-for'];
    const realIp =
      typeof forwardedFor === 'string'
        ? forwardedFor.split(',')[0]?.trim()
        : undefined;
    const clientIp =
      realIp ||
      req?.connection?.remoteAddress ||
      (client as any)._socket?.remoteAddress ||
      'unknown';
    (client as any).clientIp = clientIp;

    this.logger.log(`Agent connected from ${clientIp}`);
    // BUG-NEW-2: Initialize heartbeat timestamp on connection
    this.lastHeartbeat.set(client, Date.now());
  }

  handleDisconnect(client: WebSocket) {
    this.logger.log(`Agent disconnected`);
    // BUG-NEW-2: Clean up heartbeat tracking
    this.lastHeartbeat.delete(client);

    for (const [userId, deviceMap] of this.agentSockets.entries()) {
      let found = false;
      for (const [deviceId, socket] of deviceMap.entries()) {
        if (socket === client) {
          deviceMap.delete(deviceId);
          found = true;
          break;
        }
      }
      if (found) {
        if (deviceMap.size === 0) {
          this.agentSockets.delete(userId);
        }
        break;
      }
    }
  }

  private addSocketForUser(
    userId: string,
    deviceId: string,
    client: WebSocket,
  ) {
    if (!this.agentSockets.has(userId)) {
      this.agentSockets.set(userId, new Map());
    }
    this.agentSockets.get(userId)!.set(deviceId, client);
  }

  // BUG-NEW-2: Check for stale agent connections
  private checkHeartbeatTimeouts(): void {
    const now = Date.now();
    for (const [socket, lastBeat] of this.lastHeartbeat.entries()) {
      if (now - lastBeat > HEARTBEAT_TIMEOUT_MS) {
        this.logger.warn(
          `Agent heartbeat timeout — disconnecting stale socket`,
        );
        socket.close();
        // handleDisconnect will be called by the close event, cleaning up maps
      }
    }
  }

  @SetMetadata('isPublic', true)
  @SubscribeMessage('auth:pairing')
  async handleAuthPairing(
    @MessageBody() data: any,
    @ConnectedSocket() client: WebSocket,
  ) {
    try {
      const payload = typeof data === 'string' ? JSON.parse(data) : data;
      const pairingCode = payload.pairingCode;
      const deviceId = payload.deviceId;
      // Lấy IP từ connection thay vì socket thuần
      const clientIp = (client as any).clientIp ?? 'unknown';

      if (!pairingCode || !deviceId) {
        client.send(
          JSON.stringify({ event: 'error', data: 'Missing credentials' }),
        );
        return;
      }

      const userId = await this.agentService.validatePairingCode(
        pairingCode,
        clientIp,
      );

      // Set user on socket BEFORE adding to map (SEC-6 fix)
      (client as any).user = { sub: userId, deviceId, role: 'agent' };
      const agentToken = this.agentService.generateAgentToken(userId, deviceId);
      (client as any).token = agentToken;

      // ISSUE-1 Fix: Save device to DB on pairing
      await this.agentService.upsertDevice(userId, deviceId, 'Desktop Agent');

      this.addSocketForUser(userId, deviceId, client);

      client.send(
        JSON.stringify({
          event: 'auth:success',
          data: { agentToken },
        }),
      );

      this.logger.log(`Agent authenticated via pairing for user ${userId}`);
    } catch (error) {
      client.send(
        JSON.stringify({ event: 'error', data: 'Authentication failed' }),
      );
    }
  }

  @SubscribeMessage('auth:token')
  async handleAuthToken(
    @MessageBody() data: any,
    @ConnectedSocket() client: WebSocket,
  ) {
    try {
      const payload = typeof data === 'string' ? JSON.parse(data) : data;
      const agentToken = payload.agentToken;

      if (!agentToken) {
        client.send(JSON.stringify({ event: 'error', data: 'Missing token' }));
        return;
      }

      const decoded = this.agentService.validateAgentToken(agentToken);
      const userId = decoded.sub;
      const deviceId = decoded.deviceId;

      // ISSUE-1 Fix: Check if device still exists (hasn't been revoked)
      // ISSUE-4 Fix: Scope by userId
      const deviceExists = await this.agentService.verifyDeviceExists(
        deviceId,
        userId,
      );
      if (!deviceExists) {
        client.send(
          JSON.stringify({ event: 'error', data: 'Device has been revoked' }),
        );
        client.close(1008, 'Revoked');
        return;
      }

      (client as any).user = { sub: userId, deviceId, role: 'agent' };
      (client as any).token = agentToken;

      this.addSocketForUser(userId, deviceId, client);

      client.send(
        JSON.stringify({
          event: 'auth:success',
          data: { status: 'reconnected' },
        }),
      );

      this.logger.log(`Agent reconnected via token for user ${userId}`);
    } catch (error) {
      client.send(JSON.stringify({ event: 'error', data: 'Invalid token' }));
    }
  }

  // BUG-NEW-1: Handle agent:result event — forward launch results for status dashboard (F2.6)
  @SubscribeMessage('agent:result')
  handleAgentResult(
    @MessageBody() data: any,
    @ConnectedSocket() client: WebSocket,
  ) {
    try {
      const payload = typeof data === 'string' ? JSON.parse(data) : data;
      const user = (client as any).user;

      if (!user?.sub) {
        this.logger.warn('Received agent:result from unauthenticated socket');
        return;
      }

      this.logger.log(
        `Agent result received from user ${user.sub}: ${JSON.stringify(payload.results ?? [])}`,
      );

      // TODO (F2.6): Forward results to web client via notification gateway or store in DB
    } catch (error) {
      this.logger.error('Failed to process agent:result', error);
    }
  }

  // BUG-NEW-2: Update heartbeat timestamp when agent sends heartbeat
  @SubscribeMessage('agent:heartbeat')
  handleHeartbeat(
    @MessageBody() _data: any,
    @ConnectedSocket() client: WebSocket,
  ) {
    this.lastHeartbeat.set(client, Date.now());
  }

  public sendCommandToAgent(
    userId: string,
    action: string,
    payload: Record<string, any>,
  ): boolean {
    const deviceMap = this.agentSockets.get(userId);
    if (!deviceMap || deviceMap.size === 0) {
      return false; // Agent not connected
    }

    const targetDeviceId = payload.deviceId;
    const socketsToSend: WebSocket[] = [];

    if (targetDeviceId && deviceMap.has(targetDeviceId)) {
      socketsToSend.push(deviceMap.get(targetDeviceId)!);
    } else {
      socketsToSend.push(...deviceMap.values());
    }

    let sent = false;
    for (const socket of socketsToSend) {
      if (socket.readyState === WebSocket.OPEN) {
        // ISSUE-4: Audit Log
        this.logger.log(
          `[AUDIT] User ${userId} sent command ${action} with payload: ${JSON.stringify(payload)}`,
        );

        const commandToken = (socket as any).token || '';
        const message = JSON.stringify({
          event: 'agent:command',
          data: {
            action,
            commandToken,
            ...payload,
          },
        });
        socket.send(message);
        sent = true;
      }
    }

    return sent;
  }

  // Mở API để controller gọi khi Revoke device
  disconnectDevice(userId: string, deviceId: string): void {
    const deviceMap = this.agentSockets.get(userId);
    if (!deviceMap) {
      return;
    }
    const socket = deviceMap.get(deviceId);
    if (socket) {
      socket.close(1008, 'Device revoked');
      deviceMap.delete(deviceId);
      this.logger.log(
        `Disconnected revoked device ${deviceId} for user ${userId}`,
      );
    }
  }
}
