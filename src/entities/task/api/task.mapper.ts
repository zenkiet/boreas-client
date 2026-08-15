import { CreateTaskInput, EnvironmentUpdateResult, UpdateEnvironmentInput } from '../model/create-task-input';
import { Task } from '../model/task';
import {
  CreateTaskRequestDto,
  TaskDto,
  UpdateTaskEnvironmentRequestDto,
  UpdateTaskEnvironmentResponseDto,
} from './task.dto';

export function toTask(dto: TaskDto): Task {
  return {
    id: dto.id,
    image: dto.image,
    status: dto.status,
    port: dto.port,
    containerId: dto.container_id,
    containerIp: dto.container_ip,
    createdAt: new Date(dto.created_at),
    lastAccessed: toOptionalDate(dto.last_accessed),
    updatedAt: new Date(dto.updated_at),
    labels: { ...(dto.labels ?? {}) },
    env: { ...(dto.env ?? {}) },
    cpuNano: dto.cpu_nano,
    memoryBytes: dto.memory_bytes,
    error: dto.error,
    pendingRecreate: dto.pending_recreate ?? false,
  };
}

/** Empty environments are omitted rather than sent as `{}`. */
export function toCreateTaskRequestDto(input: CreateTaskInput): CreateTaskRequestDto {
  const environment = input.environment ?? {};

  return {
    id: input.id,
    image: input.image,
    port: input.port,
    env: Object.keys(environment).length ? { ...environment } : undefined,
  };
}

/* Environment updates always recreate; keep the wire field for API compatibility. */
const AUTO_RESTART = true;

export function toUpdateEnvironmentRequestDto(
  input: UpdateEnvironmentInput,
): UpdateTaskEnvironmentRequestDto {
  return { env: { ...input.environment }, auto_restart: AUTO_RESTART };
}

export function toEnvironmentUpdateResult(
  dto: UpdateTaskEnvironmentResponseDto,
): EnvironmentUpdateResult {
  return { message: dto.message, status: dto.status };
}

/* Go's zero time marshals as 0001-01-01; it means "never", not a real date. */
function toOptionalDate(value: string | undefined): Date | undefined {
  if (!value || value.startsWith('0001-01-01')) {
    return undefined;
  }

  return new Date(value);
}
