export const PROJECT_ROLES = ['owner', 'member'] as const;

export type ProjectRole = (typeof PROJECT_ROLES)[number];

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
