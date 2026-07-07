type LogFields = Record<string, unknown>;

export type AppLogger = {
  child(fields: LogFields): AppLogger;
  info(message: string, fields?: LogFields): void;
  error(message: string, fields?: LogFields): void;
};

export function createLogger(baseFields: LogFields = {}): AppLogger {
  const write = (level: 'info' | 'error', message: string, fields: LogFields = {}) => {
    const entry = {
      level,
      message,
      ...baseFields,
      ...fields,
    };

    console[level === 'error' ? 'error' : 'log'](JSON.stringify(entry));
  };

  return {
    child(fields: LogFields) {
      return createLogger({ ...baseFields, ...fields });
    },
    info(message: string, fields?: LogFields) {
      write('info', message, fields);
    },
    error(message: string, fields?: LogFields) {
      write('error', message, fields);
    },
  };
}

export const baseLogger = createLogger();
