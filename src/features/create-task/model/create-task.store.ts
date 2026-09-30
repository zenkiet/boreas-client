import { Injectable, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable, catchError, forkJoin, of } from 'rxjs';

import { ProjectApi, TaskDefaults } from '@entities/project';
import { CreateTaskInput, Task, TaskApi } from '@entities/task';
import { CommandGate } from '@shared/api/command';

@Injectable()
export class CreateTaskStore {
  private readonly api = inject(TaskApi);
  private readonly projectApi = inject(ProjectApi);
  private readonly projectState = signal('');
  private readonly gate = new CommandGate();

  readonly creating = this.gate.busy;
  readonly error = this.gate.error;

  private readonly presets = rxResource({
    params: () => this.projectState() || undefined,
    stream: ({ params }) =>
      forkJoin({
        project: this.projectApi.get(params).pipe(catchError(() => of(undefined))),
        folders: this.projectApi.folders(params).pipe(catchError(() => of([]))),
      }),
  });

  readonly defaults = computed<TaskDefaults | null>(() =>
    this.presets.hasValue() ? (this.presets.value().project?.defaults ?? null) : null,
  );
  readonly folders = computed(() => (this.presets.hasValue() ? this.presets.value().folders : []));

  loadDefaults(project: string): void {
    this.projectState.set(project);
  }

  create(project: string, input: CreateTaskInput): Observable<Task | undefined> {
    return this.gate.attempt(this.api.create(project, input));
  }
}
