export const PROJECT_ROLES = ['viewer', 'operator', 'member', 'owner'] as const;

export type ProjectRole = (typeof PROJECT_ROLES)[number];

/* Roles are ranked, not flat: gate with atLeastRole, never with equality. */
const RANK: Record<ProjectRole, number> = { viewer: 1, operator: 2, member: 3, owner: 4 };

export function atLeastRole(role: ProjectRole, need: ProjectRole): boolean {
  return RANK[role] >= RANK[need];
}

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
