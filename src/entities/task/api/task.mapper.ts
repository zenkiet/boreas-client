import { CreateTaskInput, UpdateTaskInput } from '../model/create-task-input';
import { FleetProject, Task } from '../model/task';
import { CreateTaskRequestDto, FleetProjectDto, TaskDto, UpdateTaskRequestDto } from './task.dto';

export function toTask(dto: TaskDto): Task {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description || undefined,
    note: dto.note || undefined,
    image: dto.image,
    status: dto.status,
    devStatus: dto.dev_status ?? 'in_progress',
    port: dto.port,
    updatedAt: new Date(dto.updated_at),
    env: { ...(dto.env ?? {}) },
    volumes: { ...(dto.volumes ?? {}) },
    pendingRecreate: dto.pending_recreate ?? false,
    myRole: dto.my_role,
  };
}

export function toFleetProject(dto: FleetProjectDto): FleetProject {
  return {
    project: {
      id: dto.id,
      slug: dto.slug,
      name: dto.name || dto.slug,
      myRole: dto.my_role,
      registryCredentialId: dto.registry_credential_id,
    },
    tasks: (dto.tasks ?? []).map((task) => ({
      name: task.name,
      description: task.description || undefined,
      image: task.image,
      status: task.status,
      devStatus: task.dev_status,
      myRole: task.my_role,
      lastDeploy: task.last_deploy && {
        at: new Date(task.last_deploy.at),
        failed: task.last_deploy.status === 'failure',
      },
    })),
  };
}

export function toCreateTaskRequestDto(input: CreateTaskInput): CreateTaskRequestDto {
  const environment = input.environment ?? {};
  const volumes = input.volumes ?? {};

  return {
    name: input.name,
    image: input.image,
    port: input.port,
    description: input.description || undefined,
    env: Object.keys(environment).length ? { ...environment } : undefined,
    volumes: Object.keys(volumes).length ? { ...volumes } : undefined,
  };
}

export function toUpdateTaskRequestDto(input: UpdateTaskInput): UpdateTaskRequestDto {
  return {
    description: input.description,
    note: input.note,
    dev_status: input.devStatus,
    image: input.image,
    port: input.port,
    env: input.environment ? { ...input.environment } : undefined,
    volumes: input.volumes ? { ...input.volumes } : undefined,
    auto_restart: input.autoRestart,
  };
}
