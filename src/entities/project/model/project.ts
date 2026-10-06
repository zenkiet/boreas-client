import { ProjectRole } from '@shared/api/role';

export interface TaskDefaults {
  readonly image: string;
  readonly port: number;
  readonly env: Readonly<Record<string, string>>;
}

export interface TaskDefaultsInput {
  readonly image?: string;
  readonly port?: number;
  readonly env?: Readonly<Record<string, string>>;
}

export const DEFAULT_TASK_PORT = 80;

export interface Project {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly registryCredentialId?: string;
  readonly defaults: TaskDefaults;
  readonly repositories: readonly string[];
  readonly myRole: ProjectRole;
  readonly createdAt: Date;
}

export const RESERVED_PROJECT_SLUGS = ['api', 'health', 'metrics', 'static', 'admin'] as const;

export interface CreateProjectInput {
  readonly slug: string;
  readonly name?: string;
  readonly registryCredentialId?: string;
  readonly defaults?: TaskDefaultsInput;
}

export interface UpdateProjectInput {
  readonly name?: string;
  readonly registryCredentialId?: string | null;
  readonly defaults?: TaskDefaultsInput;
  /** Admin only; replaces the whole list. */
  readonly repositories?: readonly string[];
}
