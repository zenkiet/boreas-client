export const USER_ROLES = ['admin', 'user'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface User {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly role: UserRole;
  readonly disabled: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface Session {
  readonly token: string;
  readonly user: User;
}

export interface Credentials {
  readonly username: string;
  readonly password: string;
}

export interface CreateUserInput {
  readonly username: string;
  readonly email: string;
  readonly password: string;
  readonly role: UserRole;
}

/** Changing password or role, or disabling, revokes that user's tokens server-side. */
export interface UpdateUserInput {
  readonly email?: string;
  readonly password?: string;
  readonly role?: UserRole;
  readonly disabled?: boolean;
}
