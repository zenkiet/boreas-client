import { Signal, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

import { AuthTokenStore } from './auth-token.store';
import { CommandGate } from './command';
import { listView } from './resource-cache';
import { IS_ADMIN } from './role';

/** An admin-only settings list behind one command gate; it outlives its page, so it keys on the token. */
export abstract class AdminListStore<T> {
  private readonly token = inject(AuthTokenStore).token;
  private readonly isAdmin = inject(IS_ADMIN);

  /* Idle for anyone known not to be an admin. */
  private readonly resource = rxResource({
    params: () => (this.isAdmin() !== false && this.token()) || undefined,
    stream: () => this.fetch(),
  });

  private readonly list = listView<T>(this.resource, this.token);
  protected readonly gate: CommandGate;

  readonly items = this.list.items;
  readonly loading = this.list.loading;
  readonly hasLoaded = this.list.hasLoaded;
  readonly error = this.list.error;
  readonly busy: Signal<boolean>;
  readonly createError: Signal<string | undefined>;

  /* Assigned here: field initializers run before the constructor has `rejection`. */
  constructor(rejection: string) {
    this.gate = new CommandGate(rejection);
    this.busy = this.gate.busy;
    this.createError = this.gate.error;
  }

  protected abstract fetch(): Observable<readonly T[]>;

  load(): void {
    this.resource.reload();
  }

  clearCreateError(): void {
    this.gate.clearError();
  }
}
