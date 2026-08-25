import { useEffect, useRef, useState } from 'react';

import { toast } from 'sonner';

import { RESOURCE_TYPE } from '@repo/constants';
import type { WorkspaceResource } from '@repo/types';

import { useAgentLaunch } from '@/features/agent/hooks/use-agent-launch';

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
  const { mutateAsync: launchAgent } = useAgentLaunch();

  const lockTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (lockTimerRef.current) {
        clearInterval(lockTimerRef.current);
      }
    };
  }, []);

  const launchWorkspace = async (resources: WorkspaceResource[]): Promise<LaunchResult> => {
    if (isLocked || isLaunching) {
      return { success: false, blockedUrls: [] };
    }

    setIsLaunching(true);
    setBlockedUrls([]);

    const enabledResources = resources.filter((r) => r.isEnabled && r.resource.value);
    const webResources = enabledResources
      .filter((r) => r.resource.type === RESOURCE_TYPE.URL)
      .map((r) => r.resource.value);

    const localResources = enabledResources.filter(
      (r) =>
        r.resource.type === RESOURCE_TYPE.LOCAL_PATH || r.resource.type === RESOURCE_TYPE.APP_URI,
    );

    const failedUrls: string[] = [];

    // F2.5: Throttling Mechanism for Web
    const BATCH_SIZE = 5;
    const DELAY_MS = 1000;

    for (let i = 0; i < webResources.length; i += BATCH_SIZE) {
      const batch = webResources.slice(i, i + BATCH_SIZE);

      batch.forEach((url) => {
        const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
        if (!newWindow) {
          failedUrls.push(url);
        }
      });

      if (i + BATCH_SIZE < webResources.length) {
        await new Promise<void>((resolve) => setTimeout(resolve, DELAY_MS));
      }
    }

    // Launch Local Resources via WSS — BUG-8 fix: parallel instead of sequential
    if (localResources.length > 0) {
      const results = await Promise.allSettled(
        localResources.map((r) => {
          if (r.resource.type === RESOURCE_TYPE.APP_URI) {
            return launchAgent({ action: 'launch_app', appName: r.resource.value });
          }
          return launchAgent({ action: 'open_folder', path: r.resource.value });
        }),
      );

      const failedCount = results.filter((r) => r.status === 'rejected').length;
      const successCount = localResources.length - failedCount;

      if (successCount > 0) {
        toast.success(`Đã gửi lệnh mở ${successCount.toString()} tài nguyên local.`);
      }
      if (failedCount > 0) {
        toast.error(`Lỗi khi mở ${failedCount.toString()} tài nguyên local.`);
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
