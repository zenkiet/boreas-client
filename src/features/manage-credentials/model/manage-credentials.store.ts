import { Injectable, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

import {
  CreateRegistryCredentialInput,
  RegistryCredential,
  RegistryCredentialApi,
} from '@entities/registry-credential';
import { CommandGate, CommandResult } from '@shared/api/command';
import { keepLastValue, resourceError } from '@shared/api/resource-cache';

export type CredentialCommandResult = CommandResult;

@Injectable()
export class ManageCredentialsStore {
  private readonly api = inject(RegistryCredentialApi);
  private readonly gate = new CommandGate('Another credential action is already running.');

  private readonly listResource = rxResource({
    stream: () => this.api.list(),
  });

  /* Keep the last good list when a reload fails. */
  private readonly current = keepLastValue(this.listResource);

  readonly credentials = computed(() => this.current() ?? []);
  readonly loading = this.listResource.isLoading;
  readonly hasLoaded = computed(() => this.current() !== undefined);
  readonly busy = this.gate.busy;
  readonly createError = this.gate.error;
  readonly error = resourceError(this.listResource);

  load(): void {
    this.listResource.reload();
  }

  create(input: CreateRegistryCredentialInput): Observable<RegistryCredential | undefined> {
    return this.gate.attempt(this.api.create(input));
  }

  delete(credential: RegistryCredential): Observable<CredentialCommandResult> {
    return this.gate.run(
      this.api.delete(credential.id),
      `Credential ${credential.name} deleted.`,
    );
  }
}
