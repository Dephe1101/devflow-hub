import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';

import type { Note, PaginatedResponse } from '@repo/types';
import type { CreateNoteInput, NoteQuery, UpdateNoteInput } from '@repo/validation';

import { QUERY_KEYS } from '@/lib/query-keys';

import { notesApi } from '../services/notes.api';

export const useNotes = (
  workspaceId: string,
  params?: NoteQuery,
  options?: { enabled?: boolean },
): UseQueryResult<PaginatedResponse<Note>> => {
  return useQuery({
    queryKey: QUERY_KEYS.notes.list(workspaceId, params),
    queryFn: () => notesApi.getNotes(workspaceId, params),
    enabled: options?.enabled ?? true,
  });
};

export const useCreateNote = (): UseMutationResult<
  Note,
  Error,
  { workspaceId: string; data: CreateNoteInput }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, data }: { workspaceId: string; data: CreateNoteInput }) =>
      notesApi.createNote(workspaceId, data),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.notes.list(variables.workspaceId),
      });
    },
  });
};

export const useUpdateNote = (): UseMutationResult<
  Note,
  Error,
  { workspaceId: string; noteId: string; data: UpdateNoteInput }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workspaceId,
      noteId,
      data,
    }: {
      workspaceId: string;
      noteId: string;
      data: UpdateNoteInput;
    }) => notesApi.updateNote(workspaceId, noteId, data),
    onSuccess: (updatedNote, variables) => {
      // Optimistic update to avoid refetching and clobbering editor state
      queryClient.setQueriesData(
        { queryKey: QUERY_KEYS.notes.list(variables.workspaceId) },
        (old: PaginatedResponse<Note> | undefined) => {
          if (!old?.data) {
            return old;
          }
          return {
            ...old,
            data: old.data.map((note: Note) =>
              note.id === variables.noteId ? { ...note, ...updatedNote } : note,
            ),
          };
        },
      );
    },
  });
};

export const useDeleteNote = (): UseMutationResult<
  boolean,
  Error,
  { workspaceId: string; noteId: string }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, noteId }: { workspaceId: string; noteId: string }) =>
      notesApi.deleteNote(workspaceId, noteId),
    onSuccess: (_, variables) => {
      queryClient.setQueriesData(
        { queryKey: QUERY_KEYS.notes.list(variables.workspaceId) },
        (old: PaginatedResponse<Note> | undefined) => {
          if (!old?.data) {
            return old;
          }
          return {
            ...old,
            data: old.data.filter((note: Note) => note.id !== variables.noteId),
            meta: {
              ...old.meta,
              total: Math.max(0, old.meta.total - 1),
            },
          };
        },
      );
    },
  });
};
