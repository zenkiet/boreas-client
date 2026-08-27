import { Injectable, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

import { CreateUserInput, UpdateUserInput, User, UserApi } from '@entities/user';
import { CommandGate, CommandResult } from '@shared/api/command';
import { keepLastValue, resourceError } from '@shared/api/resource-cache';

export type UserCommandResult = CommandResult;

@Injectable()
export class ManageUsersStore {
  private readonly api = inject(UserApi);
  private readonly gate = new CommandGate('Another user action is already running.');

  private readonly listResource = rxResource({
    stream: () => this.api.list(),
  });

  /* Keep the last good list when a reload fails. */
  private readonly current = keepLastValue(this.listResource);

  readonly users = computed(() => this.current() ?? []);
  readonly loading = this.listResource.isLoading;
  readonly hasLoaded = computed(() => this.current() !== undefined);
  readonly busy = this.gate.busy;
  readonly createError = this.gate.error;
  readonly error = resourceError(this.listResource);

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
