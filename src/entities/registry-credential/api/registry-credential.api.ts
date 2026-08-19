import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ServerConfigStore } from '@shared/config/server-config.store';
import { CreateRegistryCredentialInput, RegistryCredential } from '../model/registry-credential';
import { CredentialResponseDto, CredentialsResponseDto } from './registry-credential.dto';
import { toCreateCredentialRequestDto, toRegistryCredential } from './registry-credential.mapper';

@Service()
export class RegistryCredentialApi {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ServerConfigStore);

  private get root(): string {
    return `${this.config.baseUrl()}/api/v1/registry-credentials`;
  }

  list(): Observable<readonly RegistryCredential[]> {
    return this.http
      .get<CredentialsResponseDto>(this.root)
      .pipe(map((response) => (response.credentials ?? []).map(toRegistryCredential)));
  }

  create(input: CreateRegistryCredentialInput): Observable<RegistryCredential> {
    return this.http
      .post<CredentialResponseDto>(this.root, toCreateCredentialRequestDto(input))
      .pipe(map((response) => toRegistryCredential(response.credential)));
  }

  /** Rejected with 409 while a project still references the credential. */
  delete(id: string): Observable<void> {
    return this.http.delete(`${this.root}/${encodeURIComponent(id)}`).pipe(map(() => undefined));
  }
}
