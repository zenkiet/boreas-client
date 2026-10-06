import { LogEntry, parseAnsi } from '../model/log-entry';
import { TaskLogEntryDto } from './task-log.dto';

export function toLogEntry(raw: string): LogEntry | null {
  try {
    const dto = JSON.parse(raw) as TaskLogEntryDto;
    if (!dto.message || (dto.stream !== 'stdout' && dto.stream !== 'stderr')) {
      return null;
    }

    return { timestamp: dto.timestamp, ...parseAnsi(dto.message) };
  } catch {
    return null;
  }
}
