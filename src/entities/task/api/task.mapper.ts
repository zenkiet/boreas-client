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
    projectId: dto.project_id,
    name: dto.name,
    description: dto.description || undefined,
    image: dto.image,
    status: dto.status,
    port: dto.port,
    containerId: dto.container_id,
    containerIp: dto.container_ip,
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
    labels: { ...(dto.labels ?? {}) },
    env: { ...(dto.env ?? {}) },
    error: dto.error,
    pendingRecreate: dto.pending_recreate ?? false,
  };
}

/** Empty environments are omitted rather than sent as `{}`. */
export function toCreateTaskRequestDto(input: CreateTaskInput): CreateTaskRequestDto {
  const environment = input.environment ?? {};

  return {
    name: input.name,
    image: input.image,
    port: input.port,
    description: input.description || undefined,
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
