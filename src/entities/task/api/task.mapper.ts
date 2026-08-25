import { CreateTaskInput, UpdateTaskInput } from '../model/create-task-input';
import { Task } from '../model/task';
import { CreateTaskRequestDto, TaskDto, UpdateTaskRequestDto } from './task.dto';

export function toTask(dto: TaskDto): Task {
  return {
    id: dto.id,
    projectId: dto.project_id,
    name: dto.name,
    description: dto.description || undefined,
    image: dto.image,
    status: dto.status,
    devStatus: dto.dev_status ?? 'in_progress',
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

/* Undefined fields are dropped by JSON serialization, preserving PATCH semantics. */
export function toUpdateTaskRequestDto(input: UpdateTaskInput): UpdateTaskRequestDto {
  return {
    description: input.description,
    dev_status: input.devStatus,
    image: input.image,
    port: input.port,
    labels: input.labels ? { ...input.labels } : undefined,
    env: input.environment ? { ...input.environment } : undefined,
    auto_restart: input.autoRestart,
  };
}
