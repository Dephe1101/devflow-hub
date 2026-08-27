export const TIME_IN_SEC = {
  ONE_MINUTE: 60,
  ONE_HOUR: 3600,
  TWO_HOURS: 7200,
  ONE_DAY: 86400,
  ONE_WEEK: 604800,
  THIRTY_DAYS: 2592000,
} as const;

export const TIME_IN_MS = {
  ONE_SECOND: 1000,
  ONE_MINUTE: 60000,
  ONE_HOUR: 3600000,
} as const;

export const APP_LIMITS = {
  RATE_LIMIT_TTL: TIME_IN_MS.ONE_MINUTE,
  RATE_LIMIT_MAX: 100,
} as const;

export const WORKSPACE_CONFIG = {
  LAUNCH_DELAY_MS: 1000,
  LAUNCH_BATCH_SIZE: 5,
  LAUNCH_LOCK_SEC: 5,
} as const;

export const RESOURCE_CONFIG = {
  FAVICON_SIZE: 64,
} as const;
