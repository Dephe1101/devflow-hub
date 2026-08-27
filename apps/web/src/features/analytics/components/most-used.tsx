import { useRouter } from 'next/navigation';

import { Flame } from 'lucide-react';

import { Skeleton } from '@repo/ui';

import { WorkspaceCard } from '@/features/workspace';

import { useMostUsedWorkspaces } from '../hooks/use-analytics';

export function MostUsed(): React.ReactNode {
  const router = useRouter();
  const { data: workspaces, isLoading, error } = useMostUsedWorkspaces();

  if (isLoading) {
    return (
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="h-4 w-4 text-orange-500" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-orange-500">
            Sử dụng nhiều nhất
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
    return null;
  }

  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="h-4 w-4 text-orange-500" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-orange-500">
          Sử dụng nhiều nhất
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
