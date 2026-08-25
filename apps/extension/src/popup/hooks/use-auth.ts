import { useEffect, useState } from 'react';

import { EXTENSION_MESSAGE_TYPES } from '@repo/constants';

interface UseAuthResult {
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Hook to check extension auth status via background service worker.
 */
export function useAuth(): UseAuthResult {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    chrome.runtime.sendMessage(
      { type: EXTENSION_MESSAGE_TYPES.GET_AUTH_STATUS },
      (response: { success: boolean; data?: { isAuthenticated: boolean } }) => {
        if (response?.success && response.data) {
          setIsAuthenticated(response.data.isAuthenticated);
        }
        setIsLoading(false);
      },
    );
  }, []);

  return { isAuthenticated, isLoading };
}
