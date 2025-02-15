const createLogger = () => {
  const logLevels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
  };

  const currentLevel = process.env.NODE_ENV === 'production' ? 'warn' : 'debug';

  const formatMessage = (level: string, message: string, meta?: any) => {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level,
      message,
      ...meta
    };
  };

  return {
    error: (message: string, meta?: any) => {
      if (logLevels[currentLevel] >= logLevels.error) {
        console.error(formatMessage('error', message, meta));
      }
    },
    warn: (message: string, meta?: any) => {
      if (logLevels[currentLevel] >= logLevels.warn) {
        console.warn(formatMessage('warn', message, meta));
      }
    },
    info: (message: string, meta?: any) => {
      if (logLevels[currentLevel] >= logLevels.info) {
        console.info(formatMessage('info', message, meta));
      }
    },
    debug: (message: string, meta?: any) => {
      if (logLevels[currentLevel] >= logLevels.debug) {
        console.debug(formatMessage('debug', message, meta));
      }
    }
  };
};

export const logger = createLogger();