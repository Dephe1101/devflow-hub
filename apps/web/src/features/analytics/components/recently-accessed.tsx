import { useRouter } from 'next/navigation';

import { Clock } from 'lucide-react';

import { Skeleton } from '@repo/ui';

import { WorkspaceCard } from '@/features/workspace';

import { useRecentWorkspaces } from '../hooks/use-analytics';

export function RecentlyAccessed(): React.ReactNode {
  const router = useRouter();
  const { data: workspaces, isLoading, error } = useRecentWorkspaces();

  if (isLoading) {
    return (
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Truy cập gần đây
          </h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="min-w-[280px] sm:min-w-[320px] snap-start">
              <Skeleton className="h-[180px] w-full rounded-xl" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error || !workspaces || workspaces.length === 0) {
    return null; // Don't show the section if there's no data
  }

  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">
          Truy cập gần đây
        </h2>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x no-scrollbar">
        {workspaces.map((workspace) => (
          <div key={workspace.id} className="min-w-[280px] sm:min-w-[320px] snap-start">
            <WorkspaceCard
              workspace={workspace}
              onClick={() => {
                router.push(`/dashboard/workspaces/${workspace.id}`);
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
