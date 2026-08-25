import { create } from 'zustand';

import { API_ROUTES, APP_ROUTES, EXTENSION_POST_MESSAGE_TYPE } from '@repo/constants';
import type { ApiResponse } from '@repo/types';
import type { LoginInput, RegisterInput } from '@repo/validation';

import { api } from '../lib/api';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  setAccessToken: (token: string | null) => void;
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  isSubmitting: false,

  setAccessToken: (token: string | null) => {
    set({ accessToken: token, isAuthenticated: !!token });

    // Sync token to extension via content script
    if (typeof window !== 'undefined') {
      const syncToken = (): void => {
        window.postMessage({ type: EXTENSION_POST_MESSAGE_TYPE, token }, window.location.origin);
      };

      // Send immediately
      syncToken();
      // Retry to ensure content script is loaded (useful on first mount)
      setTimeout(syncToken, 500);
      setTimeout(syncToken, 2000);
    }
  },

  login: async (data: LoginInput) => {
    try {
      set({ isSubmitting: true });
      const res = await api.post<unknown, ApiResponse<{ accessToken: string }>>(
        `/${API_ROUTES.AUTH.BASE}/${API_ROUTES.AUTH.LOGIN}`,
        data,
      );
      if (res.data?.accessToken) {
        get().setAccessToken(res.data.accessToken);
        await get().checkAuth();
      }
    } finally {
      set({ isSubmitting: false });
    }
  },

  register: async (data: RegisterInput) => {
    try {
      set({ isSubmitting: true });
      const res = await api.post<unknown, ApiResponse<{ accessToken: string }>>(
        `/${API_ROUTES.AUTH.BASE}/${API_ROUTES.AUTH.REGISTER}`,
        data,
      );
      if (res.data?.accessToken) {
        get().setAccessToken(res.data.accessToken);
        await get().checkAuth();
      }
    } finally {
      set({ isSubmitting: false });
    }
  },

  logout: async () => {
    try {
      await api.post(`/${API_ROUTES.AUTH.BASE}/${API_ROUTES.AUTH.LOGOUT}`);
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      set({ user: null, accessToken: null, isAuthenticated: false });

      // Sync logout to extension via content script
      if (typeof window !== 'undefined') {
        window.postMessage(
          { type: EXTENSION_POST_MESSAGE_TYPE, token: null },
          window.location.origin,
        );
      }

      window.location.href = APP_ROUTES.LOGIN;
    }
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      // If we don't have an access token, try to refresh first (which sets it via interceptor or manually)
      if (!get().accessToken) {
        const res = await api.post<unknown, ApiResponse<{ accessToken: string }>>(
          `/${API_ROUTES.AUTH.BASE}/${API_ROUTES.AUTH.REFRESH}`,
        );
        if (res.data?.accessToken) {
          get().setAccessToken(res.data.accessToken);
        }
      }

      // Fetch user profile
      const userRes = await api.get<unknown, ApiResponse<User>>(
        `/${API_ROUTES.AUTH.BASE}/${API_ROUTES.AUTH.ME}`,
      );
      if (userRes.data) {
        set({ user: userRes.data, isAuthenticated: true });
      }
    } catch {
      set({ user: null, accessToken: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },
}));
