import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Task, TaskApi, UpdateTaskInput } from '@entities/task';
import { CommandGate } from '@shared/api/command';

@Injectable()
export class EditTaskStore {
  private readonly api = inject(TaskApi);
  private readonly gate = new CommandGate();

  readonly saving = this.gate.busy;
  readonly error = this.gate.error;

  update(project: string, name: string, input: UpdateTaskInput): Observable<Task | undefined> {
    return this.gate.attempt(this.api.update(project, name, input));
  }
}
