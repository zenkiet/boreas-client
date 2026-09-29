import { InjectionToken, Signal, signal } from '@angular/core';

/* Here, not in an entity: projects, members and tasks all carry a role, and entities cannot import each other. */
export const PROJECT_ROLES = ['viewer', 'operator', 'member', 'owner'] as const;

export type ProjectRole = (typeof PROJECT_ROLES)[number];

/* Roles are ranked, not flat: gate with atLeastRole, never with equality. */
const RANK: Record<ProjectRole, number> = { viewer: 1, operator: 2, member: 3, owner: 4 };

export function atLeastRole(role: ProjectRole, need: ProjectRole): boolean {
  return RANK[role] >= RANK[need];
}

/** The signed-in user is an administrator; undefined until /auth/me answers. The app provides it. */
export const IS_ADMIN = new InjectionToken<Signal<boolean | undefined>>('IS_ADMIN', {
  factory: () => signal(undefined),
});
