/* eslint-disable no-console -- intentional sink for the logging helper */
/**
 * Centralized logging: debug/info are suppressed outside development to reduce noise and accidental data leaks in production builds.
 * warn/error still emit to the console so issues remain visible during rollout.
 */
const isDev = process.env.NODE_ENV === 'development';

const logger = {
  debug: (...args) => {
    if (isDev) {
      console.log(...args);
    }
  },
  info: (...args) => {
    if (isDev) {
      console.info(...args);
    }
  },
  warn: (...args) => {
    console.warn(...args);
  },
  error: (...args) => {
    console.error(...args);
  },
};

export default logger;
