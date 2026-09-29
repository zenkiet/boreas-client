import { SystemStats } from '../model/system-stats';
import { SystemStatsDto } from './system-stats.dto';

export function toSystemStats(dto: SystemStatsDto): SystemStats {
  return { totalMemoryMb: dto.total_memory_mb };
}
