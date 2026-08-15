export type TaskStatusDto =
  | 'creating'
  | 'starting'
  | 'running'
  | 'stopped'
  | 'error'
  | 'unknown';

export interface TaskDto {
  id: string;
  image: string;
  status: TaskStatusDto;
  port: number;
  container_id?: string;
  container_ip?: string;
  created_at: string;
  last_accessed?: string;
  updated_at: string;
  labels?: Record<string, string>;
  env?: Record<string, string>;
  cpu_nano?: number;
  memory_bytes?: number;
  error?: string;
  pending_recreate?: boolean;
}

export interface TaskListResponseDto {
  tasks: TaskDto[];
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

export interface TaskEnvironmentResponseDto {
  env: Record<string, string>;
  total: number;
}

export interface UpdateTaskEnvironmentRequestDto {
  env: Record<string, string>;
  auto_restart?: boolean;
}

export interface UpdateTaskEnvironmentResponseDto {
  message: string;
  variables: number;
  auto_restart: boolean;
  status: TaskStatusDto;
}

export interface CreateTaskRequestDto {
  id: string;
  image: string;
  port?: number;
  labels?: Record<string, string>;
  env?: Record<string, string>;
  cpu_nano?: number;
  memory_bytes?: number;
}
