import { EXTENSION_STORAGE_KEYS } from '@repo/constants';

import { API_BASE_URL } from './config';

/**
 * Get the stored auth token from chrome.storage.local.
 * Returns null if not authenticated.
 */
export async function getAuthToken(): Promise<string | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get(EXTENSION_STORAGE_KEYS.ACCESS_TOKEN, (result) => {
      const token = result[EXTENSION_STORAGE_KEYS.ACCESS_TOKEN];
      resolve(typeof token === 'string' ? token : null);
    });
  });
}

/**
 * Store auth token in chrome.storage.local (persists across browser restarts).
 * SEC-4 fix: Using local storage instead of sync for better security.
 */
export async function setAuthToken(token: string): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [EXTENSION_STORAGE_KEYS.ACCESS_TOKEN]: token }, () => {
      resolve();
    });
  });
}

/**
 * Remove auth token from chrome.storage.local.
 */
export async function removeAuthToken(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.remove(EXTENSION_STORAGE_KEYS.ACCESS_TOKEN, () => {
      resolve();
    });
  });
}

/**
 * Authenticated fetch wrapper for WorkFlow Hub API.
 * Automatically injects Bearer token from chrome.storage.local.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<{ data: T; ok: boolean; status: number }> {
  const token = await getAuthToken();

  if (!token) {
    throw new Error('Not authenticated');
  }

  const url = `${API_BASE_URL}/${path.replace(/^\//, '')}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    credentials: 'include',
  });

  // Bug 12 & ISSUE-2 Fix: Handle HTTP 204 No Content and HTML 5xx gracefully
  if (response.status === 204) {
    return { data: null as any, ok: response.ok, status: response.status };
  }

  let data = null as any;
  try {
    if (response.headers.get('content-type')?.includes('application/json')) {
      data = await response.json();
    }
  } catch (error) {
    console.error('Failed to parse JSON response:', error);
  }

  return { data: data as T, ok: response.ok, status: response.status };
}
