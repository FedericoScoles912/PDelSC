/**
 * logger.js
 * Logger centralizado con niveles y timestamp. Evita console.log disperso.
 */
const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const CURRENT = LEVELS[process.env.LOG_LEVEL] ?? LEVELS.info;

const fmt = (level, args) => {
  const ts = new Date().toISOString();
  return [`[${ts}] [${level.toUpperCase()}]`, ...args];
};

export const logger = {
  error: (...a) => CURRENT >= LEVELS.error && console.error(...fmt('error', a)),
  warn: (...a) => CURRENT >= LEVELS.warn && console.warn(...fmt('warn', a)),
  info: (...a) => CURRENT >= LEVELS.info && console.log(...fmt('info', a)),
  debug: (...a) => CURRENT >= LEVELS.debug && console.log(...fmt('debug', a)),
};

export default logger;
