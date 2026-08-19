export const API_TOKEN_STATUSES = ['scheduled', 'active', 'expired', 'revoked'] as const;

export type ApiTokenStatus = (typeof API_TOKEN_STATUSES)[number];

export interface ApiToken {
  readonly id: string;
  readonly name: string;
  readonly validFrom: Date;
  readonly validTo: Date;
  readonly createdAt: Date;
  readonly revokedAt?: Date;
  readonly status: ApiTokenStatus;
}

export interface CreateApiTokenInput {
  readonly name: string;
  readonly validFrom: Date;
  readonly validTo: Date;
}

/** The plaintext token exists only in this response; the API never returns it again. */
export interface CreatedApiToken {
  readonly token: string;
  readonly apiToken: ApiToken;
}

/* The API rejects a window wider than this. */
export const MAX_TOKEN_DAYS = 90;

/** Only live tokens can be revoked; expired and revoked rows are history. */
export function isRevocable(token: ApiToken): boolean {
  return token.status === 'active' || token.status === 'scheduled';
}
