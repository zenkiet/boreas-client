import { Injectable, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

import { CreateUserInput, UpdateUserInput, User, UserApi } from '@entities/user';
import { AuthTokenStore } from '@shared/api/auth-token.store';
import { CommandGate, CommandResult } from '@shared/api/command';
import { IS_ADMIN } from '@shared/api/role';
import { listView } from '@shared/api/resource-cache';

@Injectable()
export class ManageUsersStore {
  private readonly api = inject(UserApi);
  private readonly gate = new CommandGate('Another user action is already running.');

  private readonly session = inject(AuthTokenStore);
  private readonly isAdmin = inject(IS_ADMIN);

  /* Outlives its page, so keyed on the token; idle for anyone known not to be an admin. */
  private readonly listResource = rxResource({
    params: () => (this.isAdmin() !== false && this.session.token()) || undefined,
    stream: () => this.api.list(),
  });

  private readonly list = listView<User>(this.listResource, () => this.session.token());

  readonly users = this.list.items;
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

  create(input: CreateUserInput): Observable<User | undefined> {
    return this.gate.attempt(this.api.create(input));
  }

  update(user: User, input: UpdateUserInput, description: string): Observable<CommandResult> {
    return this.gate.run(this.api.update(user.id, input), description);
  }

  delete(user: User): Observable<CommandResult> {
    return this.gate.run(this.api.delete(user.id), `${user.username} deleted.`);
  }
}
