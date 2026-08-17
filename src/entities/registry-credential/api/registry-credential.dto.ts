export type RegistryKindDto = 'ghcr' | 'dockerhub';

export interface CredentialDto {
  id: string;
  name: string;
  registry: RegistryKindDto;
  username: string;
  created_at: string;
}

export interface CredentialResponseDto {
  credential: CredentialDto;
}

export interface CredentialsResponseDto {
  credentials: CredentialDto[] | null;
  total: number;
}

export interface CreateCredentialRequestDto {
  name: string;
  registry: RegistryKindDto;
  username: string;
  token: string;
}
