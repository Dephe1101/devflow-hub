export const TIME_IN_SEC = {
  ONE_MINUTE: 60,
  ONE_HOUR: 3600,
  ONE_DAY: 86400,
  ONE_WEEK: 604800,
  THIRTY_DAYS: 2592000,
} as const;

export const TIME_IN_MS = {
  ONE_SECOND: 1000,
  ONE_MINUTE: 60000,
} as const;

export const APP_LIMITS = {
  RATE_LIMIT_TTL: TIME_IN_MS.ONE_MINUTE,
  RATE_LIMIT_MAX: 100,
} as const;
