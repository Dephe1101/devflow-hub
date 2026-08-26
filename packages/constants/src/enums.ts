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

export const NOTE_TYPE = {
  NOTE: 'NOTE',
  COMMAND: 'COMMAND',
  SNIPPET: 'SNIPPET',
} as const;

export type NoteType = (typeof NOTE_TYPE)[keyof typeof NOTE_TYPE];

export const AGENT_ACTION = {
  OPEN_FOLDER: 'open_folder',
  LAUNCH_APP: 'launch_app',
} as const;

export type AgentAction = (typeof AGENT_ACTION)[keyof typeof AGENT_ACTION];
