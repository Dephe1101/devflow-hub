export const WS_EVENTS = {
  AUTH_TOKEN: 'auth:token',
  AUTH_PAIRING: 'auth:pairing',
  AUTH_SUCCESS: 'auth:success',
  AGENT_HEARTBEAT: 'agent:heartbeat',
  AGENT_COMMAND: 'agent:command',
  AGENT_RESULT: 'agent:result',
  ERROR: 'error',
} as const;

export type WsEvent = (typeof WS_EVENTS)[keyof typeof WS_EVENTS];
