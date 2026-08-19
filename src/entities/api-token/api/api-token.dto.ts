export type ApiTokenStatusDto = 'scheduled' | 'active' | 'expired' | 'revoked';

export interface ApiTokenDto {
  id: string;
  name: string;
  valid_from: string;
  valid_to: string;
  created_at: string;
  revoked_at: string | null;
  status: ApiTokenStatusDto;
}

export interface ApiTokensResponseDto {
  api_tokens: ApiTokenDto[] | null;
  total: number;
}

export interface CreateApiTokenRequestDto {
  name: string;
  valid_from: string;
  valid_to: string;
}

export interface CreateApiTokenResponseDto {
  token: string;
  api_token: ApiTokenDto;
}
