import { API_ROUTES, EXTENSION_FILTERED_SCHEMES, EXTENSION_MESSAGE_TYPES } from '@repo/constants';

import { apiFetch, getAuthToken, removeAuthToken, setAuthToken } from '../utils/api';

// --- Lifecycle ---

chrome.runtime.onInstalled.addListener(() => {
  // eslint-disable-next-line no-console
  console.log('[DevFlow Hub] Extension installed');
});

// --- Message Handlers ---

interface MessageResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

chrome.runtime.onMessage.addListener(
  (
    message: { type: string; payload?: unknown },
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: MessageResponse) => void,
  ) => {
    const handler = messageHandlers[message.type];
    if (handler) {
      // Handle async response
      handler(message.payload)
        .then((result) => {
          sendResponse({ success: true, data: result });
        })
        .catch((err: Error) => {
          sendResponse({ success: false, error: err.message });
        });
      return true; // Keep the message channel open for async response
    }
    return false;
  },
);

// --- Handler Registry ---

type MessageHandler = (payload: unknown) => Promise<unknown>;

const messageHandlers: Record<string, MessageHandler> = {
  [EXTENSION_MESSAGE_TYPES.SET_AUTH_TOKEN]: handleSetAuthToken,
  [EXTENSION_MESSAGE_TYPES.REMOVE_AUTH_TOKEN]: handleRemoveAuthToken,
  [EXTENSION_MESSAGE_TYPES.GET_AUTH_STATUS]: handleGetAuthStatus,
  [EXTENSION_MESSAGE_TYPES.GET_CURRENT_TAB]: handleGetCurrentTab,
  [EXTENSION_MESSAGE_TYPES.GET_WORKSPACES]: handleGetWorkspaces,
  [EXTENSION_MESSAGE_TYPES.ADD_RESOURCE]: handleAddResource,
  [EXTENSION_MESSAGE_TYPES.CAPTURE_SESSION]: handleCaptureSession,
  [EXTENSION_MESSAGE_TYPES.CREATE_WORKSPACE_WITH_RESOURCES]: handleCreateWorkspaceWithResources,
};

// --- Auth Handlers ---

async function handleSetAuthToken(payload: unknown): Promise<void> {
  const { token } = payload as { token: string };
  if (!token) {
    throw new Error('Token is required');
  }
  await setAuthToken(token);
}

async function handleRemoveAuthToken(): Promise<void> {
  await removeAuthToken();
}

async function handleGetAuthStatus(): Promise<{ isAuthenticated: boolean }> {
  const token = await getAuthToken();
  return { isAuthenticated: !!token };
}

// --- Tab Handlers ---

async function handleGetCurrentTab(): Promise<{ url: string; title: string } | null> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url || !tab.title) {
    return null;
  }
  return { url: tab.url, title: tab.title };
}

// --- API Handlers ---

async function handleGetWorkspaces(): Promise<unknown> {
  const result = await apiFetch(`${API_ROUTES.WORKSPACES.BASE}`);
  if (!result.ok) {
    throw new Error('Failed to fetch workspaces');
  }
  return result.data;
}

async function handleAddResource(payload: unknown): Promise<unknown> {
  const { workspaceId, resource } = payload as {
    workspaceId: string;
    resource: { type: string; value: string; displayName?: string; notes?: string };
  };

  if (!workspaceId || !resource) {
    throw new Error('workspaceId and resource are required');
  }

  const route = API_ROUTES.RESOURCES.BASE.replace(':workspaceId', workspaceId);
  const result = await apiFetch(route, {
    method: 'POST',
    body: JSON.stringify(resource),
  });

  if (!result.ok) {
    throw new Error('Failed to add resource');
  }
  return result.data;
}

// --- Session Capture Handlers ---

interface CapturedTab {
  url: string;
  title: string;
  favIconUrl?: string;
}

async function handleCaptureSession(): Promise<CapturedTab[]> {
  const tabs = await chrome.tabs.query({});

  const filtered = tabs.filter((tab) => {
    if (!tab.url) return false;
    // Filter out browser internal pages
    return !EXTENSION_FILTERED_SCHEMES.some((scheme: string) => tab.url?.startsWith(scheme));
  });

  // Deduplicate by URL
  const seen = new Set<string>();
  const unique: CapturedTab[] = [];

  for (const tab of filtered) {
    if (tab.url && !seen.has(tab.url)) {
      seen.add(tab.url);

      const uniqueTab: CapturedTab = {
        url: tab.url,
        title: tab.title ?? tab.url,
      };
      if (tab.favIconUrl) {
        uniqueTab.favIconUrl = tab.favIconUrl;
      }
      unique.push(uniqueTab);
    }
  }

  return unique;
}

async function handleCreateWorkspaceWithResources(payload: unknown): Promise<unknown> {
  const { workspaceName, resources } = payload as {
    workspaceName: string;
    resources: Array<{ url: string; title: string }>;
  };

  if (!workspaceName || !resources?.length) {
    throw new Error('workspaceName and resources are required');
  }

  // Step 1: Create workspace
  const wsResult = await apiFetch<{ data: { id: string } }>(API_ROUTES.WORKSPACES.BASE, {
    method: 'POST',
    body: JSON.stringify({ name: workspaceName }),
  });

  if (!wsResult.ok) {
    throw new Error('Failed to create workspace');
  }

  const workspaceId = wsResult.data?.data?.id;
  if (!workspaceId) {
    throw new Error('Workspace ID not returned from API');
  }

  // Step 2: Add resources one by one
  const route = API_ROUTES.RESOURCES.BASE.replace(':workspaceId', workspaceId);
  const results: Array<{ url: string; success: boolean }> = [];

  for (const res of resources) {
    try {
      await apiFetch(route, {
        method: 'POST',
        body: JSON.stringify({
          type: 'URL',
          value: res.url,
          displayName: res.title,
        }),
      });
      results.push({ url: res.url, success: true });
    } catch {
      results.push({ url: res.url, success: false });
    }
  }

  return { workspaceId, results };
}
