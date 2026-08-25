import { useEffect, useState } from 'react';

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
import { Plus } from 'lucide-react';

import { API_ROUTES } from '@repo/constants';
import type { WorkspaceResource } from '@repo/types';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Skeleton,
  toast,
} from '@repo/ui';

import { useDeleteResource } from '@/features/workspace/hooks/use-workspace-resources';
import { api } from '@/lib/api';
import { extractErrorMessage } from '@/lib/api-helpers';
import { QUERY_KEYS } from '@/lib/query-keys';
import { useUIStore } from '@/stores/ui.store';

import { SortableResourceItem } from './sortable-resource-item';

interface WorkspaceResourceListProps {
  workspaceId: string;
  originalResources: WorkspaceResource[];
  isLoading: boolean;
}

export function WorkspaceResourceList({
  workspaceId,
  originalResources,
  isLoading,
}: WorkspaceResourceListProps): React.ReactElement {
  const [resources, setResources] = useState<WorkspaceResource[]>([]);
  const [resourceToDelete, setResourceToDelete] = useState<WorkspaceResource | null>(null);
  const queryClient = useQueryClient();
  const { openEditResource } = useUIStore();
  const deleteMutation = useDeleteResource(workspaceId);

  useEffect(() => {
    setResources([...originalResources].sort((a, b) => a.sortOrder - b.sortOrder));
  }, [originalResources]);

  const reorderMutation = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const data = {
        resourceIds: orderedIds, // Changed from resourceOrders to match API schema (ReorderResourceInput)
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

  const handleEditResource = (item: WorkspaceResource): void => {
    openEditResource(item);
  };

  const handleDeleteClick = (item: WorkspaceResource): void => {
    setResourceToDelete(item);
  };

  const confirmDelete = (): void => {
    if (resourceToDelete) {
      deleteMutation.mutate(resourceToDelete.resourceId, {
        onSuccess: () => {
          toast.success('Xóa tài nguyên thành công');
          setResourceToDelete(null);
        },
        onError: (err) => {
          const errorMessage = extractErrorMessage(err, 'Xóa tài nguyên thất bại');
          console.error('Delete error:', err);
          toast.error(errorMessage);
        },
      });
    }
  };

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-6 min-h-[400px] shadow-sm">
      <h2 className="text-lg font-semibold tracking-tight mb-6">Tài nguyên Workspace</h2>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      ) : resources.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Plus className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-medium mb-1">Chưa có tài nguyên nào</h3>
          <p className="text-sm text-muted-foreground">
            Thêm tài nguyên đầu tiên của bạn vào workspace này
          </p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={resources.map((r) => r.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3" role="list" aria-label="Danh sách tài nguyên">
              {resources.map((item) => (
                <SortableResourceItem
                  key={item.id}
                  item={item}
                  onEdit={() => {
                    handleEditResource(item);
                  }}
                  onDelete={() => {
                    handleDeleteClick(item);
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <Dialog
        open={!!resourceToDelete}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setResourceToDelete(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa tài nguyên</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa tài nguyên này khỏi workspace?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setResourceToDelete(null);
              }}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
