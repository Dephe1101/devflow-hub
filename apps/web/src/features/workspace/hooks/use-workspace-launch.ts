import { useEffect, useRef, useState } from 'react';

import { toast } from 'sonner';

import { LAUNCH_STATUS, RESOURCE_TYPE, WORKSPACE_CONFIG } from '@repo/constants';
import type { WorkspaceResource } from '@repo/types';

import { useAgentLaunch } from '@/features/agent/hooks/use-agent-launch';
import { useCreateLaunchLog } from '@/features/analytics/hooks/use-analytics';

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
  const { mutateAsync: createLaunchLog } = useCreateLaunchLog();

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
    const BATCH_SIZE = WORKSPACE_CONFIG.LAUNCH_BATCH_SIZE;
    const DELAY_MS = WORKSPACE_CONFIG.LAUNCH_DELAY_MS;

    for (let i = 0; i < webResources.length; i += BATCH_SIZE) {
      const batch = webResources.slice(i, i + BATCH_SIZE);

      batch.forEach((url) => {
        const newWindow = window.open(url, '_blank');
        if (!newWindow) {
          failedUrls.push(url);
        } else {
          newWindow.opener = null;
        }
      });

      if (i + BATCH_SIZE < webResources.length) {
        await new Promise<void>((resolve) => setTimeout(resolve, DELAY_MS));
      }
    }

    // Launch Local Resources via WSS — BUG-8 fix: parallel instead of sequential
    let localFailedCount = 0;
    let localSuccessCount = 0;

    if (localResources.length > 0) {
      const results = await Promise.allSettled(
        localResources.map((r) => {
          if (r.resource.type === RESOURCE_TYPE.APP_URI) {
            return launchAgent({ action: 'launch_app', appName: r.resource.value });
          }
          return launchAgent({ action: 'open_folder', path: r.resource.value });
        }),
      );

      localFailedCount = results.filter((r) => r.status === 'rejected').length;
      localSuccessCount = localResources.length - localFailedCount;

      if (localSuccessCount > 0) {
        toast.success(`Đã gửi lệnh mở ${localSuccessCount.toString()} tài nguyên local.`);
      }
      if (localFailedCount > 0) {
        toast.error(`Lỗi khi mở ${localFailedCount.toString()} tài nguyên local.`);
      }
    }

    if (failedUrls.length > 0) {
      setBlockedUrls(failedUrls);
    }

    setIsLaunching(false);

    // Fire-and-forget Analytics Log
    const workspaceId = resources.length > 0 ? (resources[0]?.workspaceId ?? null) : null;
    const totalFailed = failedUrls.length + localFailedCount;
    const isSuccess = failedUrls.length === 0 && localFailedCount === 0;

    if (workspaceId) {
      createLaunchLog({
        workspaceId,
        webUrlsOpened: webResources.length - failedUrls.length,
        localPathsOpened: localSuccessCount,
        failedCount: totalFailed,
        status: isSuccess
          ? LAUNCH_STATUS.SUCCESS
          : totalFailed < webResources.length + localResources.length
            ? LAUNCH_STATUS.PARTIAL
            : LAUNCH_STATUS.FAILED,
      }).catch((err: unknown) => {
        console.error('Failed to log analytics:', err);
      });
    }

    // F2.8: Anti-spam Lock
    setIsLocked(true);
    setLockCountdown(WORKSPACE_CONFIG.LAUNCH_LOCK_SEC);

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
      success: isSuccess,
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
