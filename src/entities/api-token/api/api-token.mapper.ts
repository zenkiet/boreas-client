import { ApiToken, CreateApiTokenInput, CreatedApiToken } from '../model/api-token';
import {
  ApiTokenDto,
  CreateApiTokenRequestDto,
  CreateApiTokenResponseDto,
} from './api-token.dto';

export function toApiToken(dto: ApiTokenDto): ApiToken {
  return {
    id: dto.id,
    name: dto.name,
    validFrom: new Date(dto.valid_from),
    validTo: new Date(dto.valid_to),
    createdAt: new Date(dto.created_at),
    revokedAt: dto.revoked_at ? new Date(dto.revoked_at) : undefined,
    status: dto.status,
  };
}

export function toCreatedApiToken(dto: CreateApiTokenResponseDto): CreatedApiToken {
  return { token: dto.token, apiToken: toApiToken(dto.api_token) };
}

export function toCreateApiTokenRequestDto(
  input: CreateApiTokenInput,
): CreateApiTokenRequestDto {
  return {
    name: input.name,
    valid_from: input.validFrom.toISOString(),
    valid_to: input.validTo.toISOString(),
  };
}
