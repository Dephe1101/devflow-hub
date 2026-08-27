import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import type { CreateLaunchLogInput } from '@repo/validation';

@Injectable()
export class AnalyticsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findWorkspace(workspaceId: string, userId: string) {
    return this.prisma.workspace.findFirst({
      where: { id: workspaceId, userId },
    });
  }

  async createLaunchLogAndUpdateWorkspace(
    userId: string,
    data: CreateLaunchLogInput,
  ) {
    const [log] = await this.prisma.$transaction([
      this.prisma.launchLog.create({
        data: {
          workspaceId: data.workspaceId,
          userId,
          webUrlsOpened: data.webUrlsOpened,
          localPathsOpened: data.localPathsOpened,
          failedCount: data.failedCount,
          status: data.status,
        },
      }),
      this.prisma.workspace.update({
        where: { id: data.workspaceId },
        data: {
          launchCount: { increment: 1 },
          lastLaunchedAt: new Date(),
        },
      }),
    ]);
    return log;
  }

  async getRecentWorkspaces(userId: string) {
    return this.prisma.workspace.findMany({
      where: { userId, lastLaunchedAt: { not: null } },
      orderBy: { lastLaunchedAt: 'desc' },
      take: 10,
      include: {
        _count: { select: { resources: true } },
      },
    });
  }

  async getMostUsedWorkspaces(userId: string) {
    return this.prisma.workspace.findMany({
      where: { userId, launchCount: { gt: 0 } },
      orderBy: { launchCount: 'desc' },
      take: 10,
      include: {
        _count: { select: { resources: true } },
      },
    });
  }
}
