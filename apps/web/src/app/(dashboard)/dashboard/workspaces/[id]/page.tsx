'use client';

import { use, useEffect, useState } from 'react';

import Link from 'next/link';

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  Folder,
  Plus,
  Rocket,
  Settings2,
  X,
} from 'lucide-react';

import { API_ROUTES } from '@repo/constants';
import type { WorkspaceResource } from '@repo/types';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@repo/ui';

import { FadeIn } from '@/components/animations/fade-in';
import { SlideUp } from '@/components/animations/slide-up';
import { SortableResourceItem } from '@/components/sortable-resource-item';
import { useWorkspaceResources } from '@/features/workspace/hooks/use-workspace-resources';
import { useWorkspaces } from '@/features/workspace/hooks/use-workspaces';
import { useWorkspaceLaunch } from '@/hooks/use-workspace-launch';
import { api } from '@/lib/api';
import { QUERY_KEYS } from '@/lib/query-keys';
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

  const [resources, setResources] = useState<WorkspaceResource[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (originalResources) {
      setResources([...originalResources].sort((a, b) => a.sortOrder - b.sortOrder));
    }
  }, [originalResources]);

  const reorderMutation = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const data = {
        resourceOrders: orderedIds.map((id, index) => ({
          workspaceResourceId: id,
          sortOrder: index,
        })),
      };
      const route = API_ROUTES.RESOURCES.REORDER.replace(':workspaceId', workspaceId);
      await api.patch(`/${route}`, data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.workspaceResources.list(workspaceId),
      });
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setResources((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        void reorderMutation.mutateAsync(newItems.map((item) => item.id));
        return newItems;
      });
    }
  };

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
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>

      <div className="sm:flex sm:items-start sm:justify-between border-b border-border/50 pb-6">
        <div className="flex items-start gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-border/50"
            style={{ backgroundColor: `${workspace.color ?? 'hsl(var(--primary))'}15` }}
          >
            {workspace.icon ? (
              <span className="text-3xl">{workspace.icon}</span>
            ) : (
              <Folder
                className="w-8 h-8"
                style={{ color: workspace.color ?? 'hsl(var(--primary))' }}
              />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-2">
              {workspace.name}
            </h1>
            {workspace.description && (
              <p className="text-muted-foreground max-w-2xl text-sm md:text-base">
                {workspace.description}
              </p>
            )}
            <div className="flex items-center gap-4 mt-3 text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1">
                <Settings2 className="w-3.5 h-3.5" /> {resources.length} resources
              </span>
            </div>
          </div>
        </div>
        <div className="mt-6 sm:mt-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              openAddResource(workspaceId);
            }}
            className="shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Resource
          </Button>
          <Button
            onClick={() => void launchWorkspace(resources)}
            disabled={isLocked || isLaunching || resources.length === 0}
            className="shadow-sm bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0"
          >
            <Rocket className={`mr-2 h-4 w-4 ${isLaunching ? 'animate-pulse' : ''}`} />
            {isLocked ? `Wait (${lockCountdown.toString()}s)` : 'Launch Workspace'}
          </Button>
        </div>
      </div>

      {blockedUrls.length > 0 && (
        <SlideUp duration={0.4}>
          <Card className="border-yellow-500/50 bg-yellow-500/10 shadow-sm">
            <CardHeader className="py-4">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
                  <div>
                    <CardTitle className="text-sm font-semibold text-yellow-800 dark:text-yellow-500">
                      Popup Blocker Detected
                    </CardTitle>
                    <CardDescription className="text-yellow-700 dark:text-yellow-400/80 mt-1">
                      Your browser prevented {blockedUrls.length} tabs from opening automatically.
                      Please allow popups for DevFlow Hub.
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearBlockedUrls}
                  className="text-yellow-600 hover:bg-yellow-500/20 -mr-2 -mt-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pb-4 pt-0 pl-[3.25rem]">
              <div className="flex flex-wrap gap-2">
                {blockedUrls.map((url, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-yellow-500/20 text-yellow-800 dark:text-yellow-300 rounded hover:bg-yellow-500/30 transition-colors"
                  >
                    {url} <ExternalLink className="ml-1.5 h-3 w-3 opacity-70" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </SlideUp>
      )}

      <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-6 min-h-[400px] shadow-sm">
        <h2 className="text-lg font-semibold tracking-tight mb-6">Workspace Resources</h2>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[72px] w-full rounded-lg" />
            ))}
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-sm font-medium">No resources added</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started by adding a new resource to this workspace.
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={resources.map((r) => r.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {resources.map((item) => (
                  <SortableResourceItem key={item.id} item={item} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </FadeIn>
  );
}
