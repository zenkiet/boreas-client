export type TaskStatusDto =
  | 'creating'
  | 'starting'
  | 'running'
  | 'stopped'
  | 'error'
  | 'unknown';

export interface TaskDto {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  image: string;
  status: TaskStatusDto;
  port: number;
  container_id?: string;
  container_ip?: string;
  created_at: string;
  updated_at: string;
  labels?: Record<string, string>;
  env?: Record<string, string> | null;
  error?: string;
  pending_recreate?: boolean;
}

export interface TaskListResponseDto {
  tasks: TaskDto[] | null;
  total: number;
}

export interface TaskResponseDto {
  task: TaskDto;
}

export interface TaskStateResponseDto extends TaskResponseDto {
  success: true;
}

export interface DeleteTaskResponseDto {
  success: true;
  message: string;
}

export interface UpdateTaskRequestDto {
  description?: string;
  image?: string;
  port?: number;
  labels?: Record<string, string>;
  env?: Record<string, string>;
  auto_restart?: boolean;
}

export interface CreateTaskRequestDto {
  name: string;
  image: string;
  port?: number;
  description?: string;
  labels?: Record<string, string>;
  env?: Record<string, string>;
}
