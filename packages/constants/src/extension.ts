/**
 * Extension-specific constants — shared message types and storage keys.
 * Used by both Extension and Web App for token sync protocol.
 */
export const EXTENSION_MESSAGE_TYPES = {
  // Content script → Background: Auth sync
  SET_AUTH_TOKEN: 'SET_AUTH_TOKEN',
  REMOVE_AUTH_TOKEN: 'REMOVE_AUTH_TOKEN',

  // Popup → Background: Data queries
  GET_AUTH_STATUS: 'GET_AUTH_STATUS',
  GET_CURRENT_TAB: 'GET_CURRENT_TAB',
  GET_WORKSPACES: 'GET_WORKSPACES',
  ADD_RESOURCE: 'ADD_RESOURCE',

  // Session Capture
  CAPTURE_SESSION: 'CAPTURE_SESSION',
  CREATE_WORKSPACE_WITH_RESOURCES: 'CREATE_WORKSPACE_WITH_RESOURCES',
} as const;

export const EXTENSION_STORAGE_KEYS = {
  ACCESS_TOKEN: 'devflow_access_token',
} as const;

/**
 * PostMessage type used by Web App → Extension content script for auth sync.
 * Web App dispatches this on login/logout.
 */
export const EXTENSION_POST_MESSAGE_TYPE = 'DEVFLOW_AUTH_TOKEN' as const;

/**
 * Filtered URL schemes that should NOT be captured in session capture.
 */
export const EXTENSION_FILTERED_SCHEMES = [
  'chrome://',
  'chrome-extension://',
  'about:',
  'edge://',
  'brave://',
  'devtools://',
] as const;
