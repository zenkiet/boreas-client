import { Injectable, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

import { CreateUserInput, UpdateUserInput, User, UserApi } from '@entities/user';
import { CommandGate, CommandResult } from '@shared/api/command';
import { listView } from '@shared/api/resource-cache';

export type UserCommandResult = CommandResult;

@Injectable()
export class ManageUsersStore {
  private readonly api = inject(UserApi);
  private readonly gate = new CommandGate('Another user action is already running.');

  private readonly listResource = rxResource({
    stream: () => this.api.list(),
  });

  private readonly list = listView<User>(this.listResource);

  readonly users = this.list.items;
  readonly loading = this.list.loading;
  readonly hasLoaded = this.list.hasLoaded;
  readonly error = this.list.error;
  readonly busy = this.gate.busy;
  readonly createError = this.gate.error;

  load(): void {
    this.listResource.reload();
  }

  create(input: CreateUserInput): Observable<User | undefined> {
    return this.gate.attempt(this.api.create(input));
  }

  update(user: User, input: UpdateUserInput, description: string): Observable<UserCommandResult> {
    return this.gate.run(this.api.update(user.id, input), description);
  }

  delete(user: User): Observable<UserCommandResult> {
    return this.gate.run(this.api.delete(user.id), `${user.username} deleted.`);
  }
}
