'use client';

import { useRouter } from 'next/navigation';

import { Folder, LayoutGrid, Pin, Plus } from 'lucide-react';

import { Button, Card, CardContent, Skeleton } from '@repo/ui';

import { FadeIn } from '@/components/animations/fade-in';
import { StaggerContainer, StaggerItem } from '@/components/animations/stagger-container';
import { WorkspaceCard, useWorkspaces } from '@/features/workspace';
import { useUIStore } from '@/stores/ui.store';

export default function DashboardPage(): React.ReactNode {
  const { data: workspaces, isLoading, error } = useWorkspaces();
  const { openCreateWorkspace } = useUIStore();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[180px] w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <FadeIn>
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="pt-6 text-center text-destructive">
            <p>Error loading workspaces. Please try again later.</p>
          </CardContent>
        </Card>
      </FadeIn>
    );
  }

  const pinnedWorkspaces = workspaces?.filter((w) => w.isPinned) ?? [];
  const unpinnedWorkspaces = workspaces?.filter((w) => !w.isPinned) ?? [];

  return (
    <FadeIn className="space-y-8 pb-12">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Your Workspaces</h1>
          <p className="text-muted-foreground">Manage your project contexts and resources.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            onClick={openCreateWorkspace}
            className="shadow-lg hover:shadow-primary/25 transition-all"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Workspace
          </Button>
        </div>
      </div>

      {workspaces?.length === 0 ? (
        <FadeIn delay={0.2}>
          <Card className="border-dashed border-2 bg-transparent shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-24 text-center">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Folder className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold tracking-tight mb-2">No workspaces yet</h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                Get started by creating your first workspace to organize your resources.
              </p>
              <Button onClick={openCreateWorkspace} size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Create Workspace
              </Button>
            </CardContent>
          </Card>
        </FadeIn>
      ) : (
        <div className="space-y-10">
          {pinnedWorkspaces.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Pin className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">
                  Pinned
                </h2>
              </div>
              <StaggerContainer className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {pinnedWorkspaces.map((workspace) => (
                  <StaggerItem key={workspace.id}>
                    <WorkspaceCard
                      workspace={workspace}
                      onClick={() => {
                        router.push(`/dashboard/workspaces/${workspace.id}`);
                      }}
                    />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </section>
          )}

          {unpinnedWorkspaces.length > 0 && (
            <section>
              {pinnedWorkspaces.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    All Workspaces
                  </h2>
                </div>
              )}
              <StaggerContainer className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {unpinnedWorkspaces.map((workspace) => (
                  <StaggerItem key={workspace.id}>
                    <WorkspaceCard
                      workspace={workspace}
                      onClick={() => {
                        router.push(`/dashboard/workspaces/${workspace.id}`);
                      }}
                    />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </section>
          )}
        </div>
      )}
    </FadeIn>
  );
}
