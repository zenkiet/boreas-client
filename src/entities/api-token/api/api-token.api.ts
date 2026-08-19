import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { map, Observable } from 'rxjs';

import { ServerConfigStore } from '@shared/config/server-config.store';
import { ApiToken, CreateApiTokenInput, CreatedApiToken } from '../model/api-token';
import { ApiTokensResponseDto, CreateApiTokenResponseDto } from './api-token.dto';
import { toApiToken, toCreateApiTokenRequestDto, toCreatedApiToken } from './api-token.mapper';

@Service()
export class ApiTokenApi {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ServerConfigStore);

  private get root(): string {
    return `${this.config.baseUrl()}/api/v1/auth/tokens`;
  }

  list(): Observable<readonly ApiToken[]> {
    return this.http
      .get<ApiTokensResponseDto>(this.root)
      .pipe(map((response) => (response.api_tokens ?? []).map(toApiToken)));
  }

  create(input: CreateApiTokenInput): Observable<CreatedApiToken> {
    return this.http
      .post<CreateApiTokenResponseDto>(this.root, toCreateApiTokenRequestDto(input))
      .pipe(map(toCreatedApiToken));
  }

  revoke(id: string): Observable<void> {
    return this.http.delete(`${this.root}/${encodeURIComponent(id)}`).pipe(map(() => undefined));
  }
}
