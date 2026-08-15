export interface SystemStats {
  readonly totalTasks: number;
  readonly runningTasks: number;
  readonly stoppedTasks: number;
  readonly maxContainers: number;
  readonly containerMemoryMb: number;
  readonly totalMemoryMb: number;
}
