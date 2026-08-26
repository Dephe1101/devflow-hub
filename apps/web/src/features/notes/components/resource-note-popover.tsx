'use client';

import { useEffect, useState } from 'react';

import { Loader2, PencilLine } from 'lucide-react';
import { toast } from 'sonner';

import { NOTE_TYPE } from '@repo/constants';
import type { Note } from '@repo/types';
import { Button, Popover, PopoverContent, PopoverTrigger, Textarea } from '@repo/ui';

import { extractErrorMessage } from '@/lib/api-helpers';

import { useCreateNote, useDeleteNote, useNotes, useUpdateNote } from '../hooks/use-notes';

interface ResourceNotePopoverProps {
  workspaceId: string;
  resourceId: string;
  resourceName?: string;
  resourceType?: string;
}

export function ResourceNotePopover({
  workspaceId,
  resourceId,
}: ResourceNotePopoverProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');

  const { data: notesResponse } = useNotes(
    workspaceId,
    {
      page: 1,
      type: NOTE_TYPE.NOTE,
      resourceId,
      limit: 1,
    },
    { enabled: open },
  );

  const existingNote = notesResponse?.data.find(
    (n: Note) => n.resourceId === resourceId && n.type === NOTE_TYPE.NOTE,
  );

  const createMutation = useCreateNote();
  const updateMutation = useUpdateNote();
  const deleteMutation = useDeleteNote();

  useEffect(() => {
    if (existingNote && open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setContent(existingNote.content ?? '');
    }
  }, [existingNote, open]);

  const handleSave = (): void => {
    if (!content.trim()) {
      if (existingNote) {
        deleteMutation.mutate(
          { workspaceId, noteId: existingNote.id },
          {
            onSuccess: () => {
              toast.success('Đã xóa ghi chú');
              setOpen(false);
            },
            onError: () => toast.error('Lỗi khi xóa ghi chú'),
          },
        );
      } else {
        setOpen(false);
      }
      return;
    }
    if (content.length > 500) {
      toast.error('Ghi chú không được vượt quá 500 ký tự');
      return;
    }

    if (existingNote) {
      updateMutation.mutate(
        {
          workspaceId,
          noteId: existingNote.id,
          data: { content },
        },
        {
          onSuccess: () => {
            toast.success('Đã cập nhật ghi chú');
            setOpen(false);
          },
          onError: (err) => {
            toast.error(extractErrorMessage(err, 'Lỗi khi cập nhật ghi chú'));
          },
        },
      );
    } else {
      createMutation.mutate(
        {
          workspaceId,
          data: {
            title: `Note for resource ${resourceId}`,
            content,
            resourceId,
            type: NOTE_TYPE.NOTE,
          },
        },
        {
          onSuccess: () => {
            toast.success('Đã thêm ghi chú');
            setOpen(false);
          },
          onError: (err) => {
            toast.error(extractErrorMessage(err, 'Lỗi khi thêm ghi chú'));
          },
        },
      );
    }
  };

  const isPending =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;
  const charsLeft = 500 - content.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 transition-colors ${
            existingNote?.content ? 'text-blue-500 hover:text-blue-600' : 'text-muted-foreground'
          }`}
          title="Ghi chú nhanh"
        >
          <PencilLine className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Ghi chú (Tối đa 500 ký tự)</h4>
          <Textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
            }}
            placeholder="Nhập ghi chú nhanh cho tài nguyên này..."
            className="h-24 resize-none text-sm"
          />
          <div className="flex items-center justify-between">
            <span
              className={`text-xs ${charsLeft < 0 ? 'text-destructive' : 'text-muted-foreground'}`}
            >
              {charsLeft} ký tự còn lại
            </span>
            <Button size="sm" onClick={handleSave} disabled={isPending || charsLeft < 0}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
