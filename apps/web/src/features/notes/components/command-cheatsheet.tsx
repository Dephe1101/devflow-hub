'use client';

import { Terminal } from 'lucide-react';

import { NOTE_TYPE } from '@repo/constants';
import type { Note } from '@repo/types';
import { ScrollArea, Skeleton } from '@repo/ui';

import { useNotes } from '../hooks/use-notes';
import { CommandItem } from './command-item';
import { CreateCommandDialog } from './create-command-dialog';

interface CommandCheatsheetProps {
  workspaceId: string;
}

export function CommandCheatsheet({ workspaceId }: CommandCheatsheetProps): React.ReactElement {
  const { data: notesResponse, isLoading } = useNotes(workspaceId, {
    page: 1,
    type: NOTE_TYPE.COMMAND,
    resourceId: 'none',
    limit: 100,
  });

  if (isLoading) {
    return (
      <div className="w-full h-full p-4 space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  const notes = notesResponse?.data ?? [];
  const commands = notes.filter((n: Note) => n.type === NOTE_TYPE.COMMAND);

  const grouped = commands.reduce<Record<string, Note[]>>((acc, curr: Note) => {
    const cat = curr.category ?? 'Uncategorized';
    acc[cat] ??= [];
    acc[cat].push(curr);
    return acc;
  }, {});

  if (commands.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50 p-8 text-center space-y-2">
        <Terminal className="w-8 h-8" />
        <p className="text-sm">Chưa có command nào trong workspace này.</p>
        <p className="text-xs">
          Bạn có thể thêm mới một ghi chú và chọn loại là COMMAND để nó xuất hiện ở đây.
        </p>
        <CreateCommandDialog workspaceId={workspaceId} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background border rounded-md">
      <div className="flex justify-between items-center p-3 border-b bg-muted/20">
        <h3 className="font-semibold text-sm">Bảng Lệnh</h3>
        <CreateCommandDialog workspaceId={workspaceId} />
      </div>
      <ScrollArea className="flex-1 w-full p-4">
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, cmds]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground/80 border-b pb-1 uppercase tracking-wider">
                {category}
              </h3>
              <div className="grid gap-2">
                {cmds.map((cmd) => (
                  <CommandItem key={cmd.id} workspaceId={workspaceId} cmd={cmd} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
