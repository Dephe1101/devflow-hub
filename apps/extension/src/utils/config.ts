/**
 * Extension runtime configuration — reads from Vite env variables.
 * All environment-dependent URLs are centralized here.
 * NEVER hardcode URLs anywhere else in the extension code.
 */

/** Backend API base URL (e.g. http://localhost:4000/api) */
export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

/** Web App URL (e.g. http://localhost:3000) */
export const WEB_APP_URL: string = import.meta.env.VITE_WEB_APP_URL ?? 'http://localhost:3000';

/** Content script match pattern — derived from WEB_APP_URL */
export const WEB_APP_MATCH_PATTERN = `${WEB_APP_URL}/*`;
