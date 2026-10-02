import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import {
  CreateRegistryCredentialInput,
  RegistryCredential,
  RegistryCredentialApi,
} from '@entities/registry-credential';
import { AdminListStore } from '@shared/api/admin-list.store';
import { CommandResult } from '@shared/api/command';

@Injectable()
export class ManageCredentialsStore extends AdminListStore<RegistryCredential> {
  private readonly api = inject(RegistryCredentialApi);

  constructor() {
    super('Another credential action is already running.');
  }

  protected fetch(): Observable<readonly RegistryCredential[]> {
    return this.api.list();
  }

  create(input: CreateRegistryCredentialInput): Observable<RegistryCredential | undefined> {
    return this.gate.attempt(this.api.create(input));
  }

  delete(credential: RegistryCredential): Observable<CommandResult> {
    return this.gate.run(this.api.delete(credential.id), `Credential ${credential.name} deleted.`);
  }
}
