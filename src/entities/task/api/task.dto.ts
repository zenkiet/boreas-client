export type TaskStatusDto = 'creating' | 'starting' | 'running' | 'stopped' | 'error' | 'unknown';

export type DevStatusDto = 'in_progress' | 'blocked' | 'ready';

export type TaskRoleDto = 'viewer' | 'operator' | 'member' | 'owner';

export interface TaskDto {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  note?: string;
  image: string;
  status: TaskStatusDto;
  dev_status?: DevStatusDto | null;
  port: number;
  container_id?: string;
  container_ip?: string;
  created_at: string;
  updated_at: string;
  labels?: Record<string, string>;
  env?: Record<string, string> | null;
  volumes?: Record<string, string> | null;
  error?: string;
  pending_recreate?: boolean;
  my_role: TaskRoleDto;
}

export interface FleetTaskDto {
  name: string;
  description?: string;
  image: string;
  status: TaskStatusDto;
  dev_status: DevStatusDto;
  my_role: TaskRoleDto;
  last_deploy?: { status: 'success' | 'failure' | 'info'; at: string };
}

export interface FleetProjectDto {
  id: string;
  slug: string;
  name: string;
  registry_credential_id?: string;
  my_role: TaskRoleDto;
  tasks: FleetTaskDto[] | null;
}

export interface FleetResponseDto {
  projects: FleetProjectDto[] | null;
  total: number;
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
  note?: string;
  dev_status?: DevStatusDto;
  image?: string;
  port?: number;
  labels?: Record<string, string>;
  env?: Record<string, string>;
  volumes?: Record<string, string>;
  auto_restart?: boolean;
}

export interface CreateTaskRequestDto {
  name: string;
  image: string;
  port?: number;
  description?: string;
  labels?: Record<string, string>;
  env?: Record<string, string>;
  volumes?: Record<string, string>;
}
