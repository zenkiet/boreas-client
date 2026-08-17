import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, defer, finalize, of } from 'rxjs';

import { Task, TaskApi, UpdateTaskInput } from '@entities/task';
import { mapApiError } from '@shared/api/api-error';

@Injectable()
export class EditTaskStore {
  private readonly api = inject(TaskApi);
  private readonly savingState = signal(false);
  private readonly errorState = signal<string | undefined>(undefined);

  readonly saving = this.savingState.asReadonly();
  readonly error = this.errorState.asReadonly();

  update(project: string, name: string, input: UpdateTaskInput): Observable<Task | undefined> {
    return defer(() => {
      if (this.savingState()) {
        return of(undefined);
      }

      this.savingState.set(true);
      this.errorState.set(undefined);

      return this.api.update(project, name, input).pipe(
        catchError((error: unknown) => {
          this.errorState.set(mapApiError(error).message);
          return of(undefined);
        }),
        finalize(() => this.savingState.set(false)),
      );
    });
  }
}
