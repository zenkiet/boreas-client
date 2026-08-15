export interface SystemStatsDto {
  total_tasks: number;
  running_tasks: number;
  stopped_tasks: number;
  max_containers: number;
  container_memory_mb: number;
  total_memory_mb: number;
}
