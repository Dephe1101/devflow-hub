'use client';

import { useState } from 'react';

import { Copy, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import type { Note } from '@repo/types';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui';

import { extractErrorMessage } from '@/lib/api-helpers';

import { useDeleteNote } from '../hooks/use-notes';

interface CommandItemProps {
  workspaceId: string;
  cmd: Note;
}

export function CommandItem({ workspaceId, cmd }: CommandItemProps): React.ReactElement {
  const deleteMutation = useDeleteNote();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleCopy = async (content: string): Promise<void> => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!navigator.clipboard) {
      toast.error('Trình duyệt không hỗ trợ copy clipboard');
      return;
    }
    try {
      await navigator.clipboard.writeText(content);
      toast.success('Đã copy vào clipboard');
    } catch {
      toast.error('Không thể copy vào clipboard (Thiếu quyền)');
    }
  };

  const handleDelete = (): void => {
    deleteMutation.mutate(
      { workspaceId, noteId: cmd.id },
      {
        onSuccess: () => {
          toast.success('Đã xóa lệnh');
          setDeleteDialogOpen(false);
        },
        onError: (err) => {
          toast.error(extractErrorMessage(err, 'Lỗi khi xóa lệnh'));
          setDeleteDialogOpen(false);
        },
      },
    );
  };

  return (
    <div className="group flex flex-col p-3 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <span className="font-medium text-sm text-foreground">{cmd.title}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => {
              void handleCopy(cmd.content ?? '');
            }}
            title="Copy command"
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive"
            onClick={() => {
              setDeleteDialogOpen(true);
            }}
            disabled={deleteMutation.isPending}
            title="Xóa lệnh"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <code className="text-xs font-mono text-muted-foreground bg-background/50 px-2 py-1.5 rounded overflow-x-auto whitespace-pre-wrap">
        {cmd.content ?? 'N/A'}
      </code>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa lệnh</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa lệnh này không? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex sm:justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
              }}
              disabled={deleteMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa lệnh'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
