import { Injectable, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

import { ApiToken, ApiTokenApi, CreateApiTokenInput, CreatedApiToken } from '@entities/api-token';
import { mapApiError } from '@shared/api/api-error';
import { AuthTokenStore } from '@shared/api/auth-token.store';
import { CommandGate, CommandResult } from '@shared/api/command';
import { listView } from '@shared/api/resource-cache';

export type TokenCommandResult = CommandResult;

@Injectable()
export class ManageTokensStore {
  private readonly api = inject(ApiTokenApi);
  private readonly session = inject(AuthTokenStore);
  private readonly gate = new CommandGate('Another token action is already running.');

  private readonly listResource = rxResource({
    params: () => this.session.token() || undefined,
    stream: () => this.api.list(),
  });

  /* Keyed on the session: one account's tokens must never flash on another's screen. */
  private readonly list = listView<ApiToken>(this.listResource, () => this.session.token());

  readonly tokens = this.list.items;
  readonly loading = this.list.loading;
  readonly hasLoaded = this.list.hasLoaded;
  readonly error = this.list.error;
  readonly busy = this.gate.busy;
  readonly createError = this.gate.error;

  readonly activeCount = computed(
    () => this.tokens().filter((token) => token.status === 'active').length,
  );

  /** 403 here means the caller authenticated with an API token, not a login session. */
  readonly sessionRequired = computed(() => {
    const error = this.listResource.error();
    return error ? mapApiError(error).kind === 'forbidden' : false;
  });

  load(): void {
    this.listResource.reload();
  }

  create(input: CreateApiTokenInput): Observable<CreatedApiToken | undefined> {
    return this.gate.attempt(this.api.create(input));
  }

  revoke(token: ApiToken): Observable<TokenCommandResult> {
    return this.gate.run(this.api.revoke(token.id), `Token ${token.name} revoked.`);
  }
}
