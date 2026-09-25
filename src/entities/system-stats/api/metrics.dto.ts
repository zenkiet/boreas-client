/** One metrics-stream frame; it carries no project field and no timestamp. */
export interface TaskMetricsDto {
  task: string;
  cpu_percent: number;
  memory_bytes: number;
  network_rx_bytes: number;
  network_tx_bytes: number;
}
