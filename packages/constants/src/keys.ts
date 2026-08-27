export const KEYS = {
  COOKIE: {
    REFRESH_TOKEN: 'refreshToken',
  },
  REDIS: {
    BLACKLIST_PREFIX: 'blacklist',
    ANALYTICS_MOST_USED: 'analytics:most-used',
  },
  STORAGE: {
    AUTH: 'auth-storage',
  },
  EXTERNAL_APIS: {
    GOOGLE_FAVICON: 'https://www.google.com/s2/favicons',
  },
} as const;
