import { isDevMode } from '@angular/core';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogRecord {
  readonly timestamp: string;
  readonly level: LogLevel;
  readonly scope: string;
  readonly message: string;
  readonly context?: Readonly<Record<string, unknown>>;
}

export interface Logger {
  debug(message: string, context?: Readonly<Record<string, unknown>>): void;
  info(message: string, context?: Readonly<Record<string, unknown>>): void;
  warn(message: string, context?: Readonly<Record<string, unknown>>): void;
  error(message: string, context?: Readonly<Record<string, unknown>>): void;
}

const WEIGHT: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

const LEVEL_STORAGE_KEY = 'boreas-log-level';

function resolveLevel(): LogLevel {
  try {
    const stored = globalThis.localStorage.getItem(LEVEL_STORAGE_KEY);
    if (stored === 'debug' || stored === 'info' || stored === 'warn' || stored === 'error') {
      return stored;
    }
  } catch {
    /* Storage can be denied (private mode, webview policy). */
  }
  return isDevMode() ? 'debug' : 'warn';
}

/* Read once: a changed override takes effect on reload. */
const activeLevel = resolveLevel();

/* Console only: DevTools and the native WebView inspectors read it. */
function emit(entry: LogRecord): void {
  if (WEIGHT[entry.level] < WEIGHT[activeLevel]) {
    return;
  }

  const line = `${entry.timestamp} [${entry.scope}] ${entry.message}`;

  if (entry.context) {
    console[entry.level](line, entry.context);
  } else {
    console[entry.level](line);
  }
}

export function createLogger(scope: string): Logger {
  const log =
    (level: LogLevel) =>
    (message: string, context?: Readonly<Record<string, unknown>>): void => {
      emit({ timestamp: new Date().toISOString(), level, scope, message, context });
    };

  return { debug: log('debug'), info: log('info'), warn: log('warn'), error: log('error') };
}
