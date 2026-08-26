'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';

import '@uiw/react-markdown-preview/markdown.css';
import '@uiw/react-md-editor/markdown-editor.css';
import { CheckCircle2, Loader2 } from 'lucide-react';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { toast } from 'sonner';

import { NOTE_TYPE } from '@repo/constants';
import type { Note } from '@repo/types';
import { Button } from '@repo/ui';

import { extractErrorMessage } from '@/lib/api-helpers';

import { useNoteAutosave } from '../hooks/use-note-autosave';
import { useCreateNote, useNotes } from '../hooks/use-notes';

const sanitizeOptions = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code ?? []), 'className'],
    span: [...(defaultSchema.attributes?.span ?? []), 'className'],
  },
};

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface WorkspaceNotesEditorProps {
  workspaceId: string;
}

export function WorkspaceNotesEditor({
  workspaceId,
}: WorkspaceNotesEditorProps): React.ReactElement | null {
  const { resolvedTheme } = useTheme();
  const { data: notesResponse, isSuccess } = useNotes(workspaceId, {
    page: 1,
    type: NOTE_TYPE.NOTE,
    resourceId: 'none',
    limit: 1,
  });
  const { mutate: createNote } = useCreateNote();
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState(false);
  const hasAttemptedCreate = useRef(false);

  const createMainNote = useCallback(() => {
    hasAttemptedCreate.current = true;
    createNote(
      {
        workspaceId,
        data: {
          title: 'Main Workspace Note',
          content: '',
          type: NOTE_TYPE.NOTE,
        },
      },
      {
        onSuccess: (res) => {
          setActiveNoteId(res.id);
          setIsInitializing(false);
        },
        onError: (err) => {
          toast.error(extractErrorMessage(err, 'Lỗi khi tạo ghi chú chính'));
          setInitError(true);
          setIsInitializing(false);
        },
      },
    );
  }, [workspaceId, createNote]);

  const mainNote = notesResponse?.data.find(
    (n: Note) => n.type === NOTE_TYPE.NOTE && !n.resourceId,
  );

  useEffect(() => {
    if (!isSuccess) {
      return;
    }
    if (mainNote) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveNoteId(mainNote.id);
      setIsInitializing(false);
    } else if (!hasAttemptedCreate.current && !activeNoteId) {
      createMainNote();
    }
  }, [isSuccess, mainNote, activeNoteId, createMainNote]);

  const { content, setContent, isSaving, isError } = useNoteAutosave({
    workspaceId,
    noteId: activeNoteId ?? '',
    initialContent: mainNote?.content ?? '',
    debounceMs: 2000,
  });

  if (isInitializing || (!activeNoteId && !initError)) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/20 border rounded-md">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (initError && !activeNoteId) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-muted/20 border rounded-md space-y-4">
        <p className="text-sm text-destructive font-medium">Không thể khởi tạo ghi chú</p>
        <Button
          variant="outline"
          onClick={() => {
            setInitError(false);
            setIsInitializing(true);
            createMainNote();
          }}
        >
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col w-full h-full border rounded-md overflow-hidden bg-background">
      <div className="absolute top-2 right-4 z-10 flex items-center space-x-2 text-xs font-medium bg-background/80 px-2 py-1 rounded backdrop-blur shadow-sm">
        {isError ? (
          <span className="text-destructive">Lỗi khi lưu</span>
        ) : isSaving ? (
          <>
            <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">Saving...</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-3 h-3 text-green-500" />
            <span className="text-muted-foreground">Saved</span>
          </>
        )}
      </div>

      <div
        data-color-mode={resolvedTheme === 'dark' ? 'dark' : 'light'}
        className="w-full h-full flex-1"
      >
        <MDEditor
          value={content}
          onChange={setContent}
          height="100%"
          minHeight={400}
          className="border-none"
          previewOptions={{
            rehypePlugins: [[rehypeSanitize, sanitizeOptions]],
          }}
        />
      </div>
    </div>
  );
}
