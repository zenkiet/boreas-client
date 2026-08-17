export interface SystemStats {
  readonly totalTasks: number;
  readonly runningTasks: number;
  readonly stoppedTasks: number;
  readonly totalProjects: number;
  readonly totalMemoryMb: number;
}
