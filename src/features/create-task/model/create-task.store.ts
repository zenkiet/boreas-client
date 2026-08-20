import { Injectable, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable, catchError, defer, finalize, of } from 'rxjs';

import { ProjectApi, TaskDefaults } from '@entities/project';
import { CreateTaskInput, Task, TaskApi } from '@entities/task';
import { mapApiError } from '@shared/api/api-error';

@Injectable()
export class CreateTaskStore {
  private readonly api = inject(TaskApi);
  private readonly projectApi = inject(ProjectApi);
  private readonly projectState = signal('');
  private readonly creatingState = signal(false);
  private readonly errorState = signal<string | undefined>(undefined);

  readonly creating = this.creatingState.asReadonly();
  readonly error = this.errorState.asReadonly();

  private readonly presets = rxResource({
    params: () => this.projectState() || undefined,
    stream: ({ params }) => this.projectApi.get(params).pipe(catchError(() => of(undefined))),
  });

  readonly defaults = computed<TaskDefaults | null>(() =>
    this.presets.hasValue() ? (this.presets.value()?.defaults ?? null) : null,
  );

  loadDefaults(project: string): void {
    this.projectState.set(project);
  }

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
