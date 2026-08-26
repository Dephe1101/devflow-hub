import { useCallback, useEffect, useRef, useState } from 'react';

import { useUpdateNote } from './use-notes';

interface UseNoteAutosaveProps {
  workspaceId: string;
  noteId: string;
  initialContent?: string;
  debounceMs?: number;
}

export const useNoteAutosave = ({
  workspaceId,
  noteId,
  initialContent = '',
  debounceMs = 2000,
}: UseNoteAutosaveProps): {
  content: string;
  setContent: (newContent: string | undefined) => void;
  isSaving: boolean;
  isError: boolean;
} => {
  const [content, setContent] = useState(initialContent);
  const [isPending, setIsPending] = useState(false);
  const isPendingRef = useRef(false);
  const [isDirty, setIsDirty] = useState(false);

  const { mutate, isError } = useUpdateNote();
  const mutateRef = useRef(mutate);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContentRef = useRef(initialContent);
  const currentContentRef = useRef(content);

  useEffect(() => {
    mutateRef.current = mutate;
  }, [mutate]);

  useEffect(() => {
    currentContentRef.current = content;
  }, [content]);

  const pendingSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const flush = useCallback(
    function flushFn() {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      if (currentContentRef.current !== lastSavedContentRef.current) {
        // If a request is already flying, wait 500ms and try again
        if (isPendingRef.current) {
          pendingSaveTimeoutRef.current ??= setTimeout(() => {
            pendingSaveTimeoutRef.current = null;
            flushFn();
          }, 500);
          return;
        }

        // Execute synchronous API call or mutation
        setIsPending(true);
        isPendingRef.current = true;
        const valToSave = currentContentRef.current;
        mutateRef.current(
          {
            workspaceId,
            noteId,
            data: { content: valToSave },
          },
          {
            onSuccess: () => {
              lastSavedContentRef.current = valToSave;
              setIsDirty(false);
            },
            onSettled: () => {
              setIsPending(false);
              isPendingRef.current = false;
            },
          },
        );
      }
    },
    [workspaceId, noteId],
  );

  useEffect(() => {
    // Sync if initialContent changes from outside (e.g. newly loaded data)
    // Only if user hasn't typed anything (not dirty) and we are not currently saving
    if (
      initialContent !== lastSavedContentRef.current &&
      !isDirty &&
      !isPending &&
      !typingTimeoutRef.current
    ) {
      setContent(initialContent);
      lastSavedContentRef.current = initialContent;
    }
  }, [initialContent, isDirty, isPending]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent): void => {
      if (isDirty || typingTimeoutRef.current) {
        flush(); // Try to save. (Note: standard fetch might abort on unload unless keepalive is used, but mutations are the best effort here)
        e.preventDefault();
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        e.returnValue = ''; // Required for some browsers to show prompt
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [flush, isDirty]);

  const flushRef = useRef(flush);
  useEffect(() => {
    flushRef.current = flush;
  }, [flush]);

  useEffect(() => {
    return () => {
      flushRef.current(); // Flush on unmount (e.g. tab switch)
      if (pendingSaveTimeoutRef.current) {
        clearTimeout(pendingSaveTimeoutRef.current);
      }
    };
  }, []);

  const handleChange = (newContent: string | undefined): void => {
    const value = newContent ?? '';
    setContent(value);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (value !== lastSavedContentRef.current) {
      setIsDirty(true);
      typingTimeoutRef.current = setTimeout(() => {
        flush();
      }, debounceMs);
    } else {
      setIsDirty(false); // If user typed and deleted back to original
    }
  };

  return {
    content,
    setContent: handleChange,
    isSaving: isPending || isDirty, // Showing saving when typing or waiting for API
    isError: isError,
  };
};
