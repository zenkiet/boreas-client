import { ProjectRole } from '@shared/api/role';

export { atLeastRole, PROJECT_ROLES } from '@shared/api/role';
export type { ProjectRole } from '@shared/api/role';

export const ROLE_LABEL: Record<ProjectRole, string> = {
  viewer: 'Viewer',
  operator: 'Operator',
  member: 'Member',
  owner: 'Owner',
};

/** Owner is project-wide only; the API rejects it as a task grant. */
export const GRANTABLE_ROLES = ['viewer', 'operator', 'member'] as const;

export interface Member {
  readonly userId: string;
  readonly username: string;
  readonly role: ProjectRole;
  readonly createdAt: Date;
}

export interface AddMemberInput {
  readonly userId: string;
  readonly role: ProjectRole;
}
