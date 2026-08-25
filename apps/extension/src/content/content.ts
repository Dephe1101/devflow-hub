import { EXTENSION_MESSAGE_TYPES, EXTENSION_POST_MESSAGE_TYPE } from '@repo/constants';

/**
 * Content script injected into Web App pages.
 * Listens for postMessage from the Web App to sync auth tokens with the extension.
 *
 * Protocol:
 * - Web App dispatches: window.postMessage({ type: 'DEVFLOW_AUTH_TOKEN', token: '...' }, '*')
 * - Web App dispatches: window.postMessage({ type: 'DEVFLOW_AUTH_TOKEN', token: null }, '*')  (logout)
 */
window.addEventListener('message', (event: MessageEvent) => {
  // Bug 6 Fix: Only accept messages from the exact same origin to prevent XSS abuse
  if (event.origin !== window.location.origin) return;
  if (event.source !== window) return;

  const data = event.data as { type?: string; token?: string | null } | undefined;

  if (!data || data.type !== EXTENSION_POST_MESSAGE_TYPE) return;

  if (data.token) {
    // User logged in → sync token to extension
    chrome.runtime.sendMessage({
      type: EXTENSION_MESSAGE_TYPES.SET_AUTH_TOKEN,
      payload: { token: data.token },
    });
  } else {
    // User logged out → remove token from extension
    chrome.runtime.sendMessage({
      type: EXTENSION_MESSAGE_TYPES.REMOVE_AUTH_TOKEN,
    });
  }
});
