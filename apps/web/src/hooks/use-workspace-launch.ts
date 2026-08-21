import { useRef, useState } from 'react';

import { RESOURCE_TYPE } from '@repo/constants';
import type { WorkspaceResource } from '@repo/types';

interface LaunchResult {
  success: boolean;
  blockedUrls: string[];
}

interface UseWorkspaceLaunchReturn {
  launchWorkspace: (resources: WorkspaceResource[]) => Promise<LaunchResult>;
  isLaunching: boolean;
  isLocked: boolean;
  lockCountdown: number;
  blockedUrls: string[];
  clearBlockedUrls: () => void;
}

export function useWorkspaceLaunch(): UseWorkspaceLaunchReturn {
  const [isLaunching, setIsLaunching] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockCountdown, setLockCountdown] = useState(0);
  const [blockedUrls, setBlockedUrls] = useState<string[]>([]);

  const lockTimerRef = useRef<NodeJS.Timeout | null>(null);

  const launchWorkspace = async (resources: WorkspaceResource[]): Promise<LaunchResult> => {
    if (isLocked || isLaunching) {
      return { success: false, blockedUrls: [] };
    }

    setIsLaunching(true);
    setBlockedUrls([]);

    // Filter only URLs that are enabled
    const webResources = resources
      .filter((r) => r.isEnabled && r.resource.type === RESOURCE_TYPE.URL && r.resource.value)
      .map((r) => r.resource.value);

    const failedUrls: string[] = [];

    // F2.5: Throttling Mechanism
    // If > 15 tabs, batch them in groups of 5 with 1s delay
    const BATCH_SIZE = 5;
    const DELAY_MS = 1000;

    // We'll just always batch by 5 to be safe and consistent,
    // or strictly follow "> 15" rule. Let's do batching for all to avoid popup blockers.
    for (let i = 0; i < webResources.length; i += BATCH_SIZE) {
      const batch = webResources.slice(i, i + BATCH_SIZE);

      batch.forEach((url) => {
        // window.open returns null if blocked by popup blocker
        const newWindow = window.open(url, '_blank');
        if (!newWindow) {
          failedUrls.push(url);
        }
      });

      // Wait 1s before next batch if there are more
      if (i + BATCH_SIZE < webResources.length) {
        await new Promise<void>((resolve) => setTimeout(resolve, DELAY_MS));
      }
    }

    if (failedUrls.length > 0) {
      setBlockedUrls(failedUrls);
    }

    setIsLaunching(false);

    // F2.8: Anti-spam Lock (5s)
    setIsLocked(true);
    setLockCountdown(5);

    if (lockTimerRef.current) {
      clearInterval(lockTimerRef.current);
    }

    lockTimerRef.current = setInterval(() => {
      setLockCountdown((prev) => {
        if (prev <= 1) {
          if (lockTimerRef.current) {
            clearInterval(lockTimerRef.current);
          }
          setIsLocked(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return {
      success: failedUrls.length === 0,
      blockedUrls: failedUrls,
    };
  };

  return {
    launchWorkspace,
    isLaunching,
    isLocked,
    lockCountdown,
    blockedUrls,
    clearBlockedUrls: () => {
      setBlockedUrls([]);
    },
  };
}
