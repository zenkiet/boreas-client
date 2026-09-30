import { Injectable, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable, catchError, of } from 'rxjs';

import { ProjectApi } from '@entities/project';
import { Task, TaskApi, UpdateTaskInput } from '@entities/task';
import { CommandGate } from '@shared/api/command';

@Injectable()
export class EditTaskStore {
  private readonly api = inject(TaskApi);
  private readonly projectApi = inject(ProjectApi);
  private readonly gate = new CommandGate();
  private readonly project = signal('');

  readonly saving = this.gate.busy;
  readonly error = this.gate.error;

  private readonly folderList = rxResource({
    params: () => this.project() || undefined,
    stream: ({ params }) => this.projectApi.folders(params).pipe(catchError(() => of([]))),
  });

  readonly folders = computed(() => (this.folderList.hasValue() ? this.folderList.value() : []));

  loadFolders(project: string): void {
    this.project.set(project);
  }

  update(project: string, name: string, input: UpdateTaskInput): Observable<Task | undefined> {
    return this.gate.attempt(this.api.update(project, name, input));
  }
}
