import { TaskSample } from '../model/live-metrics';
import { TaskMetricsDto } from './metrics.dto';

/** A malformed frame is dropped, never thrown. */
export function toTaskSample(data: string, at: number): TaskSample | undefined {
  let dto: Partial<TaskMetricsDto> | null;
  try {
    dto = JSON.parse(data);
  } catch {
    return undefined;
  }
  if (typeof dto?.task !== 'string') return undefined;

  return {
    task: dto.task,
    at,
    cpu: Number(dto.cpu_percent) || 0,
    mem: Number(dto.memory_bytes) || 0,
    rx: Number(dto.network_rx_bytes) || 0,
    tx: Number(dto.network_tx_bytes) || 0,
  };
}
