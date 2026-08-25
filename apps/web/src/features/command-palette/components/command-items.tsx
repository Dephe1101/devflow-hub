import React from 'react';

import { Folder, Link as LinkIcon, LogOut, MonitorSmartphone, Moon, Sun } from 'lucide-react';

import { CommandItem } from '@repo/ui';

import type { SearchableItem } from '../hooks/use-command-search';

interface CommandItemProps {
  item: SearchableItem;
  onSelect: (item: SearchableItem) => void;
}

export function WorkspaceCommandItem({
  item,
  onSelect,
}: CommandItemProps): React.ReactElement | null {
  if (item.type !== 'workspace') {
    return null;
  }
  return (
    <CommandItem
      onSelect={() => {
        onSelect(item);
      }}
      className="cursor-pointer"
    >
      <Folder className="mr-2 h-4 w-4 text-primary" />
      <div className="flex flex-col">
        <span className="font-medium">{item.name}</span>
        {item.description && (
          <span className="text-xs text-muted-foreground line-clamp-1">{item.description}</span>
        )}
      </div>
    </CommandItem>
  );
}

export function ResourceCommandItem({
  item,
  onSelect,
}: CommandItemProps): React.ReactElement | null {
  if (item.type !== 'resource') {
    return null;
  }
  return (
    <CommandItem
      onSelect={() => {
        onSelect(item);
      }}
      className="cursor-pointer"
    >
      {item.isLocal ? (
        <MonitorSmartphone className="mr-2 h-4 w-4 text-green-500" />
      ) : (
        <LinkIcon className="mr-2 h-4 w-4 text-blue-500" />
      )}
      <div className="flex flex-col">
        <span className="font-medium">{item.name}</span>
        {item.description && (
          <span className="text-xs text-muted-foreground line-clamp-1">{item.description}</span>
        )}
        {item.isLocal && item.path && (
          <span className="text-[10px] text-muted-foreground mt-0.5 font-mono opacity-60">
            {item.path}
          </span>
        )}
      </div>
    </CommandItem>
  );
}

export function ActionCommandItem({ item, onSelect }: CommandItemProps): React.ReactElement | null {
  if (item.type !== 'action') {
    return null;
  }
  return (
    <CommandItem
      onSelect={() => {
        onSelect(item);
      }}
      className="cursor-pointer"
    >
      {item.id === 'action-logout' ? (
        <LogOut className="mr-2 h-4 w-4 text-destructive" />
      ) : item.id === 'action-dark' ? (
        <Moon className="mr-2 h-4 w-4 text-primary" />
      ) : (
        <Sun className="mr-2 h-4 w-4 text-primary" />
      )}
      <div className="flex flex-col">
        <span className="font-medium">{item.name}</span>
        {item.description && (
          <span className="text-xs text-muted-foreground line-clamp-1">{item.description}</span>
        )}
      </div>
    </CommandItem>
  );
}
