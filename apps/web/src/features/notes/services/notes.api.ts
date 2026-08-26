import { API_ROUTES } from '@repo/constants';
import type { ApiResponse, Note, PaginatedResponse } from '@repo/types';
import type { CreateNoteInput, NoteQuery, UpdateNoteInput } from '@repo/validation';

import { api } from '@/lib/api';

export const notesApi = {
  getNotes: async (workspaceId: string, params?: NoteQuery): Promise<PaginatedResponse<Note>> => {
    const route = API_ROUTES.NOTES.BASE.replace(':workspaceId', workspaceId);
    const res = await api.get<unknown, ApiResponse<PaginatedResponse<Note>>>(`/${route}`, {
      params,
    });
    return res.data ?? { data: [], meta: { total: 0, page: 1, pageSize: 20, totalPages: 0 } };
  },

  createNote: async (workspaceId: string, data: CreateNoteInput): Promise<Note> => {
    const route = API_ROUTES.NOTES.BASE.replace(':workspaceId', workspaceId);
    const res = await api.post<unknown, ApiResponse<Note>>(`/${route}`, data);
    if (!res.data) {
      throw new Error('No data returned');
    }
    return res.data;
  },

  updateNote: async (workspaceId: string, noteId: string, data: UpdateNoteInput): Promise<Note> => {
    const route = API_ROUTES.NOTES.DETAIL.replace(':workspaceId', workspaceId).replace(
      ':noteId',
      noteId,
    );
    const res = await api.patch<unknown, ApiResponse<Note>>(`/${route}`, data);
    if (!res.data) {
      throw new Error('No data returned');
    }
    return res.data;
  },

  deleteNote: async (workspaceId: string, noteId: string): Promise<boolean> => {
    const route = API_ROUTES.NOTES.DETAIL.replace(':workspaceId', workspaceId).replace(
      ':noteId',
      noteId,
    );
    const res = await api.delete<unknown, ApiResponse<{ success: boolean }>>(`/${route}`);
    return res.success ?? true;
  },
};
