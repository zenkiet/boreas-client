import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, defer, finalize, of } from 'rxjs';

import { CreateTaskInput, Task, TaskApi } from '@entities/task';
import { mapApiError } from '@shared/api/api-error';

@Injectable()
export class CreateTaskStore {
  private readonly api = inject(TaskApi);
  private readonly creatingState = signal(false);
  private readonly errorState = signal<string | undefined>(undefined);

  readonly creating = this.creatingState.asReadonly();
  readonly error = this.errorState.asReadonly();

  create(project: string, input: CreateTaskInput): Observable<Task | undefined> {
    return defer(() => {
      if (this.creatingState()) {
        return of(undefined);
      }

      this.creatingState.set(true);
      this.errorState.set(undefined);

      return this.api.create(project, input).pipe(
        catchError((error: unknown) => {
          this.errorState.set(mapApiError(error).message);
          return of(undefined);
        }),
        finalize(() => this.creatingState.set(false)),
      );
    });
  }
}
