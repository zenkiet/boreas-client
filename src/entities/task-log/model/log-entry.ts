export interface LogEntry {
  readonly timestamp: string;
  readonly stream: LogStream;
  readonly message: string;
}

export type LogStream = 'stdout' | 'stderr';
