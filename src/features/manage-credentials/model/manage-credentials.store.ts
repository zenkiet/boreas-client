import { Injectable, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

import {
  CreateRegistryCredentialInput,
  RegistryCredential,
  RegistryCredentialApi,
} from '@entities/registry-credential';
import { AuthTokenStore } from '@shared/api/auth-token.store';
import { CommandGate, CommandResult } from '@shared/api/command';
import { IS_ADMIN } from '@shared/api/role';
import { listView } from '@shared/api/resource-cache';

@Injectable()
export class ManageCredentialsStore {
  private readonly api = inject(RegistryCredentialApi);
  private readonly gate = new CommandGate('Another credential action is already running.');

  private readonly session = inject(AuthTokenStore);
  private readonly isAdmin = inject(IS_ADMIN);

  /* Outlives its page, so keyed on the token; idle for anyone known not to be an admin. */
  private readonly listResource = rxResource({
    params: () => (this.isAdmin() !== false && this.session.token()) || undefined,
    stream: () => this.api.list(),
  });

  private readonly list = listView<RegistryCredential>(this.listResource, () =>
    this.session.token(),
  );

  readonly credentials = this.list.items;
  readonly loading = this.list.loading;
  readonly hasLoaded = this.list.hasLoaded;
  readonly error = this.list.error;
  readonly busy = this.gate.busy;
  readonly createError = this.gate.error;

  load(): void {
    this.listResource.reload();
  }

  clearCreateError(): void {
    this.gate.clearError();
  }

  create(input: CreateRegistryCredentialInput): Observable<RegistryCredential | undefined> {
    return this.gate.attempt(this.api.create(input));
  }

  delete(credential: RegistryCredential): Observable<CommandResult> {
    return this.gate.run(this.api.delete(credential.id), `Credential ${credential.name} deleted.`);
  }
}
