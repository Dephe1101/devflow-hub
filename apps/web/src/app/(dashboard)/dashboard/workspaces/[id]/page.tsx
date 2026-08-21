'use client';

import { use } from 'react';

import Link from 'next/link';

import { ArrowLeft } from 'lucide-react';

import { FadeIn } from '@/components/animations/fade-in';
import { PopupBlockerWarning } from '@/features/workspace/components/popup-blocker-warning';
import { WorkspaceHeader } from '@/features/workspace/components/workspace-header';
import { WorkspaceResourceList } from '@/features/workspace/components/workspace-resource-list';
import { useWorkspaceLaunch } from '@/features/workspace/hooks/use-workspace-launch';
import { useWorkspaceResources } from '@/features/workspace/hooks/use-workspace-resources';
import { useWorkspaces } from '@/features/workspace/hooks/use-workspaces';
import { useUIStore } from '@/stores/ui.store';

export default function WorkspaceDetailPage(props: {
  params: Promise<{ id: string }>;
}): React.ReactNode {
  const params = use(props.params);
  const workspaceId = params.id;

  const { data: workspaces } = useWorkspaces();
  const workspace = workspaces?.find((w) => w.id === workspaceId);
  const { openAddResource } = useUIStore();
  const { data: originalResources, isLoading } = useWorkspaceResources(workspaceId);

  const { launchWorkspace, isLaunching, isLocked, lockCountdown, blockedUrls, clearBlockedUrls } =
    useWorkspaceLaunch();

  if (!workspace) {
    return null;
  }

  return (
    <FadeIn className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 px-3 py-1.5 -ml-3 rounded-md hover:bg-secondary/50"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại Dashboard
        </Link>
      </div>

      <WorkspaceHeader
        workspace={workspace}
        resources={originalResources ?? []}
        isLocked={isLocked}
        isLaunching={isLaunching}
        lockCountdown={lockCountdown}
        onAddResource={() => {
          openAddResource(workspaceId);
        }}
        onLaunch={() => {
          void launchWorkspace(originalResources ?? []);
        }}
      />

      <PopupBlockerWarning blockedUrls={blockedUrls} onClear={clearBlockedUrls} />

      <WorkspaceResourceList
        workspaceId={workspaceId}
        originalResources={originalResources ?? []}
        isLoading={isLoading}
      />
    </FadeIn>
  );
}
