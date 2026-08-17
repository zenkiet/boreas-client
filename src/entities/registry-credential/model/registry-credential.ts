export const REGISTRY_KINDS = ['ghcr', 'dockerhub'] as const;

export type RegistryKind = (typeof REGISTRY_KINDS)[number];

/** The token itself is write-only; the API never returns it. */
export interface RegistryCredential {
  readonly id: string;
  readonly name: string;
  readonly registry: RegistryKind;
  readonly username: string;
  readonly createdAt: Date;
}

export interface CreateRegistryCredentialInput {
  readonly name: string;
  readonly registry: RegistryKind;
  readonly username: string;
  readonly token: string;
}
