export const STORAGE_KEYS = {
  THEME_MODE: '@sensores_hub:theme_mode',
  SCANNER_HISTORY: '@sensores_hub:scanner_history',
} as const;

export const SENSOR_UPDATE_INTERVALS = {
  FAST: 100,
  NORMAL: 500,
  SLOW: 1000,
} as const;

export const SHAKE_THRESHOLD = 1.8;

export const APP_INFO = {
  name: 'Sensores Hub',
  version: '1.0.0',
  description: 'Centro de sensores y diagnóstico de hardware para dispositivos móviles.',
} as const;
