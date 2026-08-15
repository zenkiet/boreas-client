export interface TaskLogEntryDto {
  timestamp: string;
  stream: 'stdout' | 'stderr';
  message: string;
}
