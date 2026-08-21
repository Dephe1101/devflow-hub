export const WORKSPACE_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  ARCHIVED: 'ARCHIVED',
} as const;

export type WorkspaceStatus = (typeof WORKSPACE_STATUS)[keyof typeof WORKSPACE_STATUS];

export const RESOURCE_TYPE = {
  URL: 'URL',
  LOCAL_PATH: 'LOCAL_PATH',
  APP_URI: 'APP_URI',
  COMMAND: 'COMMAND',
} as const;

export type ResourceType = (typeof RESOURCE_TYPE)[keyof typeof RESOURCE_TYPE];

export const HEALTH_STATUS = {
  HEALTHY: 'HEALTHY',
  UNHEALTHY: 'UNHEALTHY',
  UNKNOWN: 'UNKNOWN',
} as const;

export type HealthStatus = (typeof HEALTH_STATUS)[keyof typeof HEALTH_STATUS];
