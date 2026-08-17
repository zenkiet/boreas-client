import { Injectable, computed, inject, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable, catchError, defer, finalize, map, of } from 'rxjs';

import { CreateUserInput, UpdateUserInput, User, UserApi } from '@entities/user';
import { mapApiError } from '@shared/api/api-error';

export interface UserCommandResult {
  readonly success: boolean;
  readonly message: string;
}

@Injectable()
export class ManageUsersStore {
  private readonly api = inject(UserApi);
  private readonly busyState = signal(false);
  private readonly createErrorState = signal<string | undefined>(undefined);

  private readonly listResource = rxResource({
    stream: () => this.api.list(),
  });

  /* Keep the last good list when a reload fails. */
  private readonly current = linkedSignal<readonly User[] | undefined, readonly User[] | undefined>({
    source: () => (this.listResource.hasValue() ? this.listResource.value() : undefined),
    computation: (value, previous) => value ?? previous?.value,
  });

  readonly users = computed(() => this.current() ?? []);
  readonly loading = this.listResource.isLoading;
  readonly hasLoaded = computed(() => this.current() !== undefined);
  readonly busy = this.busyState.asReadonly();
  readonly createError = this.createErrorState.asReadonly();

  readonly error = computed(() => {
    const error = this.listResource.error();
    return error ? mapApiError(error).message : undefined;
  });

  load(): void {
    this.listResource.reload();
  }

  create(input: CreateUserInput): Observable<User | undefined> {
    return defer(() => {
      if (this.busyState()) return of(undefined);

      this.busyState.set(true);
      this.createErrorState.set(undefined);

      return this.api.create(input).pipe(
        catchError((error: unknown) => {
          this.createErrorState.set(mapApiError(error).message);
          return of(undefined);
        }),
        finalize(() => this.busyState.set(false)),
      );
    });
  }

  update(user: User, input: UpdateUserInput, description: string): Observable<UserCommandResult> {
    return this.execute(this.api.update(user.id, input), description);
  }

  delete(user: User): Observable<UserCommandResult> {
    return this.execute(this.api.delete(user.id), `${user.username} deleted.`);
  }

  private execute(
    command: Observable<unknown>,
    successMessage: string,
  ): Observable<UserCommandResult> {
    return defer(() => {
      if (this.busyState()) {
        return of({ success: false, message: 'Another user action is already running.' });
      }

      this.busyState.set(true);

      return command.pipe(
        map(() => ({ success: true, message: successMessage })),
        catchError((error: unknown) => of({ success: false, message: mapApiError(error).message })),
        finalize(() => this.busyState.set(false)),
      );
    });
  }
}
