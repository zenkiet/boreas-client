export interface Project {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly registryCredentialId?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/** api, health, metrics, static and admin are reserved by the proxy router. */
export const RESERVED_PROJECT_SLUGS = ['api', 'health', 'metrics', 'static', 'admin'] as const;

export interface CreateProjectInput {
  readonly slug: string;
  readonly name?: string;
  readonly registryCredentialId?: string;
}

/** registryCredentialId: null detaches the credential; undefined leaves it unchanged. */
export interface UpdateProjectInput {
  readonly name?: string;
  readonly registryCredentialId?: string | null;
}
