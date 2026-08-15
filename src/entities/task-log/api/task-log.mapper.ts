import { LogEntry } from '../model/log-entry';
import { TaskLogEntryDto } from './task-log.dto';

/** Null for malformed frames — a bad frame must not break a hot socket. */
export function toLogEntry(raw: string): LogEntry | null {
  try {
    const dto = JSON.parse(raw) as TaskLogEntryDto;
    if (!dto.message || (dto.stream !== 'stdout' && dto.stream !== 'stderr')) {
      return null;
    }

    return { timestamp: dto.timestamp, stream: dto.stream, message: dto.message };
  } catch {
    return null;
  }
}
