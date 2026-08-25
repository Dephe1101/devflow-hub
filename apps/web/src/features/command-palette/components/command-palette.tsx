'use client';

import React, { useMemo } from 'react';

import { useTheme } from 'next-themes';

import { toast } from 'sonner';

import { RESOURCE_TYPE } from '@repo/constants';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
  Dialog,
  DialogContent,
} from '@repo/ui';

import { useAgentLaunch } from '@/features/agent/hooks/use-agent-launch';
import { useGlobalResources } from '@/features/workspace/hooks/use-global-resources';
import { useWorkspaceLaunch } from '@/features/workspace/hooks/use-workspace-launch';
import { useWorkspaces } from '@/features/workspace/hooks/use-workspaces';
import { useAuthStore } from '@/stores/auth.store';

import { useCommandPalette } from '../hooks/use-command-palette';
import type { SearchableItem } from '../hooks/use-command-search';
import { useCommandSearch } from '../hooks/use-command-search';
import { ActionCommandItem, ResourceCommandItem, WorkspaceCommandItem } from './command-items';

export function CommandPalette(): React.ReactElement | null {
  const { isOpen, setIsOpen } = useCommandPalette();

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
    if (resources) {
      resources.forEach((res) => {
        const isLocal =
          res.resource.type === RESOURCE_TYPE.LOCAL_PATH ||
          res.resource.type === RESOURCE_TYPE.APP_URI;
        const path = isLocal ? res.resource.value : undefined;
        const url = !isLocal ? res.resource.value : undefined;

        items.push({
          id: `res-${res.id}`,
          type: 'resource',
          resourceType: res.resource.type,
          name: res.resource.displayName ?? res.resource.value,
          description: res.resource.notes ?? '',
          isLocal,
          path,
          url,
          data: {
            id: res.resourceId,
            workspaceId: res.workspaceId,
            type: res.resource.type,
            value: res.resource.value,
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
      name: 'Switch to Dark Mode',
      description: 'Change theme to Dark',
      action: () => {
        setTheme('dark');
      },
    });
    items.push({
      id: 'action-light',
      type: 'action',
      name: 'Switch to Light Mode',
      description: 'Change theme to Light',
      action: () => {
        setTheme('light');
      },
    });
    items.push({
      id: 'action-logout',
      type: 'action',
      name: 'Logout',
      description: 'Sign out of your account',
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
      toast.loading(`Đang mở Workspace: ${item.name}...`);
      const wsResources = resources?.filter((r) => r.workspaceId === item.data.id) ?? [];
      void launchWorkspace(wsResources).then((res) => {
        toast.dismiss();
        if (res.success) {
          toast.success(`Mở Workspace thành công`);
        } else {
          toast.error(`Mở Workspace có lỗi hoặc bị Pop-up blocker chặn`);
        }
      });
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
                toast.error('Agent báo lỗi: ' + err.message);
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
                toast.error('Agent báo lỗi: ' + err.message);
              },
            },
          );
        }
      } else if (item.url) {
        window.open(item.url, '_blank', 'noopener,noreferrer');
      }
    }
  };

  return (
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
              <CommandGroup heading="Workspaces">
                {results
                  .filter((r) => r.type === 'workspace')
                  .map((item) => (
                    <WorkspaceCommandItem key={item.id} item={item} onSelect={handleSelect} />
                  ))}
              </CommandGroup>
            )}

            {/* Group: Resources */}
            {results.some((r) => r.type === 'resource') && (
              <CommandGroup heading="Resources">
                {results
                  .filter((r) => r.type === 'resource')
                  .map((item) => (
                    <ResourceCommandItem key={item.id} item={item} onSelect={handleSelect} />
                  ))}
              </CommandGroup>
            )}

            {/* Group: Actions */}
            {results.some((r) => r.type === 'action') && (
              <CommandGroup heading="Actions">
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
  );
}
