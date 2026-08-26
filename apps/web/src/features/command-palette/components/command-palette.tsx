'use client';

import React, { useMemo } from 'react';

import { useTheme } from 'next-themes';

import { toast } from 'sonner';

import { API_ROUTES, RESOURCE_TYPE } from '@repo/constants';
import type { ApiResponse, WorkspaceResource } from '@repo/types';
import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui';

import { useAgentLaunch } from '@/features/agent/hooks/use-agent-launch';
import { useGlobalResources } from '@/features/workspace/hooks/use-global-resources';
import { useWorkspaceLaunch } from '@/features/workspace/hooks/use-workspace-launch';
import { useWorkspaces } from '@/features/workspace/hooks/use-workspaces';
import { api } from '@/lib/api';
import { extractErrorMessage } from '@/lib/api-helpers';
import { useAuthStore } from '@/stores/auth.store';

import { useCommandPalette } from '../hooks/use-command-palette';
import type { SearchableItem } from '../hooks/use-command-search';
import { useCommandSearch } from '../hooks/use-command-search';
import { ActionCommandItem, ResourceCommandItem, WorkspaceCommandItem } from './command-items';

export function CommandPalette(): React.ReactElement | null {
  const { isOpen, setIsOpen } = useCommandPalette();
  const [workspaceToLaunch, setWorkspaceToLaunch] = React.useState<SearchableItem | null>(null);

  const { data: workspaces } = useWorkspaces();
  const { data: resources } = useGlobalResources();
  const { mutate: launchAgent } = useAgentLaunch();
  const { launchWorkspace } = useWorkspaceLaunch();
  const { logout } = useAuthStore();
  const { setTheme } = useTheme();

  const searchableItems = useMemo(() => {
    const items: SearchableItem[] = [];

    // 1. Workspaces
    if (workspaces) {
      workspaces.forEach((ws) => {
        items.push({
          id: `ws-${ws.id}`,
          type: 'workspace',
          name: ws.name,
          description: ws.description ?? '',
          data: { id: ws.id, name: ws.name, color: ws.color }, // SEC-8: Limit data exposure
        });
      });
    }

    // 2. Resources
    if (Array.isArray(resources) && resources.length > 0) {
      resources.forEach((res) => {
        const isLocal = res.type === RESOURCE_TYPE.LOCAL_PATH || res.type === RESOURCE_TYPE.APP_URI;
        const path = isLocal ? res.value : undefined;
        const url = !isLocal ? res.value : undefined;

        items.push({
          id: `res-${res.id}`,
          type: 'resource',
          resourceType: res.type,
          name: res.displayName ?? res.value,
          description: res.notes ?? '',
          isLocal,
          path,
          url,
          data: {
            id: res.id,
            type: res.type,
            value: res.value,
            url,
            path,
          }, // SEC-8: Limit data exposure
        });
      });
    }

    // 3. System Actions
    items.push({
      id: 'action-dark',
      type: 'action',
      name: 'Chuyển sang giao diện tối',
      description: 'Thay đổi giao diện sang chế độ Tối',
      action: () => {
        setTheme('dark');
      },
    });
    items.push({
      id: 'action-light',
      type: 'action',
      name: 'Chuyển sang giao diện sáng',
      description: 'Thay đổi giao diện sang chế độ Sáng',
      action: () => {
        setTheme('light');
      },
    });
    items.push({
      id: 'action-logout',
      type: 'action',
      name: 'Đăng xuất',
      description: 'Đăng xuất khỏi tài khoản của bạn',
      action: () => {
        void logout();
      },
    });

    return items;
  }, [workspaces, resources, setTheme, logout]);

  const { results, query, setQuery } = useCommandSearch(searchableItems);

  const handleSelect = (item: SearchableItem): void => {
    setIsOpen(false);
    setQuery('');

    if (item.type === 'action') {
      item.action();
      return;
    }

    if (item.type === 'workspace') {
      setWorkspaceToLaunch(item);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (item.type === 'resource') {
      if (item.isLocal && item.path) {
        if (item.resourceType === RESOURCE_TYPE.APP_URI) {
          toast.loading('Đang yêu cầu Agent mở Ứng dụng...');
          launchAgent(
            { action: 'launch_app', appName: item.path },
            {
              onSuccess: () => {
                toast.dismiss();
                toast.success('Đã gửi lệnh mở Ứng dụng thành công');
              },
              onError: (err) => {
                toast.dismiss();
                toast.error(extractErrorMessage(err, 'Lỗi kết nối Agent'));
              },
            },
          );
        } else {
          toast.loading('Đang yêu cầu Agent mở thư mục...');
          launchAgent(
            { action: 'open_folder', path: item.path },
            {
              onSuccess: () => {
                toast.dismiss();
                toast.success('Đã gửi lệnh mở thư mục thành công');
              },
              onError: (err) => {
                toast.dismiss();
                toast.error(extractErrorMessage(err, 'Lỗi kết nối Agent'));
              },
            },
          );
        }
      } else if (item.url) {
        window.open(item.url, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const handleConfirmLaunch = (): void => {
    if (workspaceToLaunch?.type !== 'workspace') {
      return;
    }

    setWorkspaceToLaunch(null);
    toast.loading(`Đang mở Workspace: ${workspaceToLaunch.name}...`);

    api
      .get<unknown, ApiResponse<WorkspaceResource[]>>(
        `/${API_ROUTES.RESOURCES.BASE.replace(':workspaceId', workspaceToLaunch.data.id)}`,
      )
      .then((response) => {
        const wsResources = response.data ?? [];
        return launchWorkspace(wsResources);
      })
      .then((res) => {
        toast.dismiss();
        if (res.success) {
          toast.success(`Mở Workspace thành công`);
        } else {
          toast.error(`Mở Workspace có lỗi hoặc bị Pop-up blocker chặn`);
        }
      })
      .catch(() => {
        toast.dismiss();
        toast.error('Lỗi khi tải tài nguyên của Workspace');
      });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="overflow-hidden p-0 sm:max-w-[600px] border bg-popover text-popover-foreground shadow-2xl">
          <Command
            shouldFilter={false}
            className="flex h-full w-full flex-col overflow-hidden bg-transparent"
          >
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder="Gõ để tìm kiếm Workspace, Thư mục, Lệnh (dark, logout)..."
              autoFocus
            />

            <CommandList className="max-h-[300px] p-2">
              <CommandEmpty>Không tìm thấy kết quả nào.</CommandEmpty>

              {/* Group: Workspaces */}
              {results.some((r) => r.type === 'workspace') && (
                <CommandGroup heading="Không gian làm việc">
                  {results
                    .filter((r) => r.type === 'workspace')
                    .map((item) => (
                      <WorkspaceCommandItem key={item.id} item={item} onSelect={handleSelect} />
                    ))}
                </CommandGroup>
              )}

              {/* Group: Resources */}
              {results.some((r) => r.type === 'resource') && (
                <CommandGroup heading="Tài nguyên">
                  {results
                    .filter((r) => r.type === 'resource')
                    .map((item) => (
                      <ResourceCommandItem key={item.id} item={item} onSelect={handleSelect} />
                    ))}
                </CommandGroup>
              )}

              {/* Group: Actions */}
              {results.some((r) => r.type === 'action') && (
                <CommandGroup heading="Hành động">
                  {results
                    .filter((r) => r.type === 'action')
                    .map((item) => (
                      <ActionCommandItem key={item.id} item={item} onSelect={handleSelect} />
                    ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!workspaceToLaunch}
        onOpenChange={(open) => {
          if (!open) {
            setWorkspaceToLaunch(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận khởi động</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn khởi động Workspace:{' '}
              <span className="font-semibold text-foreground">{workspaceToLaunch?.name}</span>? Tất
              cả tài nguyên sẽ được mở lên.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setWorkspaceToLaunch(null);
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleConfirmLaunch}>Mở tất cả</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
