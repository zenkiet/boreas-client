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
import { listView } from '@shared/api/resource-cache';

export type CredentialCommandResult = CommandResult;

@Injectable()
export class ManageCredentialsStore {
  private readonly api = inject(RegistryCredentialApi);
  private readonly gate = new CommandGate('Another credential action is already running.');

  private readonly session = inject(AuthTokenStore);

  /* Outlives its page, so keyed on the token: a switched account never sees the old list. */
  private readonly listResource = rxResource({
    params: () => this.session.token() || undefined,
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

  delete(credential: RegistryCredential): Observable<CredentialCommandResult> {
    return this.gate.run(this.api.delete(credential.id), `Credential ${credential.name} deleted.`);
  }
}
