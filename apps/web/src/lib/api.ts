import axios, { AxiosError } from 'axios';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { API_ROUTES } from '@repo/constants';

import { useAuthStore } from '../stores/auth.store';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  async (error: unknown) =>
    Promise.reject(error instanceof Error ? error : new Error(String(error))),
);

let isRefreshing = false;
let failedQueue: { resolve: (value?: unknown) => void; reject: (reason?: unknown) => void }[] = [];

const processQueue = (error: AxiosError | null, token: string | null = null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response: AxiosResponse) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (
      !originalRequest.url?.includes(`/${API_ROUTES.AUTH.REFRESH}`) &&
      !originalRequest.url?.includes(`/${API_ROUTES.AUTH.LOGIN}`)
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${String(token)}`;
            return api(originalRequest);
          })
          .catch((err: unknown) =>
            Promise.reject(err instanceof Error ? err : new Error(String(err))),
          );
      }

      const { logout, setAccessToken } = useAuthStore.getState();
      (originalRequest as unknown as { _retry: boolean })._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post<{ data?: { accessToken?: string } }>(
          `${api.defaults.baseURL ?? 'http://localhost:4000/api'}/${API_ROUTES.AUTH.BASE}/${API_ROUTES.AUTH.REFRESH}`,
          {},
          { withCredentials: true },
        );

        const newAccessToken = response.data.data?.accessToken ?? null;
        setAccessToken(newAccessToken);

        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        processQueue(null, newAccessToken);

        return await api(originalRequest);
      } catch (refreshError: unknown) {
        processQueue(
          refreshError instanceof AxiosError ? refreshError : new AxiosError(String(refreshError)),
          null,
        );
        await logout();
        return await Promise.reject(
          refreshError instanceof Error ? refreshError : new Error(String(refreshError)),
        );
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
