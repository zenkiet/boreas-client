export interface ProjectDto {
  id: string;
  slug: string;
  name: string;
  registry_credential_id?: string;
  default_image: string;
  default_port: number;
  default_env: Record<string, string> | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectResponseDto {
  project: ProjectDto;
}

export interface ProjectsResponseDto {
  projects: ProjectDto[] | null;
  total: number;
}

export interface CreateProjectRequestDto {
  slug: string;
  name?: string;
  registry_credential_id?: string;
  default_image?: string;
  default_port?: number;
  default_env?: Record<string, string>;
}

export interface UpdateProjectRequestDto {
  name?: string;
  registry_credential_id?: string | null;
  default_image?: string;
  default_port?: number;
  default_env?: Record<string, string>;
}

export type ProjectRoleDto = 'owner' | 'member';

export interface MemberDto {
  user_id: string;
  username: string;
  role: ProjectRoleDto;
  created_at: string;
}

export interface MembersResponseDto {
  members: MemberDto[] | null;
  total: number;
}

export interface AddMemberRequestDto {
  user_id: string;
  role?: ProjectRoleDto;
}
