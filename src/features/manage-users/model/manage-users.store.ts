import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { CreateUserInput, UpdateUserInput, User, UserApi } from '@entities/user';
import { AdminListStore } from '@shared/api/admin-list.store';
import { CommandResult } from '@shared/api/command';

@Injectable()
export class ManageUsersStore extends AdminListStore<User> {
  private readonly api = inject(UserApi);

  constructor() {
    super('Another user action is already running.');
  }

  protected fetch(): Observable<readonly User[]> {
    return this.api.list();
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
