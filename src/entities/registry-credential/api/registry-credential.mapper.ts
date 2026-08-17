import { CreateRegistryCredentialInput, RegistryCredential } from '../model/registry-credential';
import { CreateCredentialRequestDto, CredentialDto } from './registry-credential.dto';

export function toRegistryCredential(dto: CredentialDto): RegistryCredential {
  return {
    id: dto.id,
    name: dto.name,
    registry: dto.registry,
    username: dto.username,
    createdAt: new Date(dto.created_at),
  };
}

export function toCreateCredentialRequestDto(
  input: CreateRegistryCredentialInput,
): CreateCredentialRequestDto {
  return {
    name: input.name,
    registry: input.registry,
    username: input.username,
    token: input.token,
  };
}
