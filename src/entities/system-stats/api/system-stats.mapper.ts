import { SystemStats } from '../model/system-stats';
import { SystemStatsDto } from './system-stats.dto';

export function toSystemStats(dto: SystemStatsDto): SystemStats {
  return {
    totalTasks: dto.total_tasks,
    runningTasks: dto.running_tasks,
    stoppedTasks: dto.stopped_tasks,
    maxContainers: dto.max_containers,
    containerMemoryMb: dto.container_memory_mb,
    totalMemoryMb: dto.total_memory_mb,
  };
}
