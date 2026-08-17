import { SystemStats } from '../model/system-stats';
import { SystemStatsDto } from './system-stats.dto';

export function toSystemStats(dto: SystemStatsDto): SystemStats {
  return {
    totalTasks: dto.total_tasks,
    runningTasks: dto.running_tasks,
    stoppedTasks: dto.stopped_tasks,
    totalProjects: dto.total_projects,
    totalMemoryMb: dto.total_memory_mb,
  };
}
