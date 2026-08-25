import { useCallback, useEffect, useState } from 'react';

import { EXTENSION_MESSAGE_TYPES } from '@repo/constants';

interface Workspace {
  id: string;
  name: string;
  description?: string;
  resourceCount?: number;
}

interface UseWorkspacesResult {
  workspaces: Workspace[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook to fetch user workspaces from API via background service worker.
 */
export function useWorkspaces(): UseWorkspacesResult {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkspaces = useCallback(() => {
    setIsLoading(true);
    setError(null);

    chrome.runtime.sendMessage(
      { type: EXTENSION_MESSAGE_TYPES.GET_WORKSPACES },
      (response: { success: boolean; data?: { data: Workspace[] }; error?: string }) => {
        if (response?.success && response.data) {
          // API returns { data: [...] } wrapper
          const list = Array.isArray(response.data)
            ? response.data
            : ((response.data as { data: Workspace[] }).data ?? []);
          setWorkspaces(list);
        } else {
          setError(response?.error ?? 'Failed to fetch workspaces');
        }
        setIsLoading(false);
      },
    );
  }, []);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  return { workspaces, isLoading, error, refetch: fetchWorkspaces };
}
