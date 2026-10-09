import { Injectable, inject, signal } from '@angular/core';
import { Observable, defer, finalize, of } from 'rxjs';

import type { TaskAction } from '@entities/task';
import { TaskApi } from '@entities/task/api';
import {
  DEV_STATUS_LABEL,
  DevStatus,
  Task,
  TaskStateAction,
  describeCompletedAction,
} from '@entities/task/model';
import { CommandResult, toCommandResult } from '@shared/api/command';

/** Commands for one project's tasks; pending state is keyed by task name. */
@Injectable()
export class ControlTaskStore {
  private readonly api = inject(TaskApi);
  private readonly pendingState = signal<ReadonlyMap<string, TaskAction>>(new Map());

  readonly pending = this.pendingState.asReadonly();

  isPending(name: string): boolean {
    return this.pendingState().has(name);
  }

  changeState(
    project: string,
    task: Pick<Task, 'name'>,
    action: TaskStateAction,
  ): Observable<CommandResult> {
    return this.execute(
      task.name,
      action,
      this.api.changeState(project, task.name, action),
      `Task ${task.name} ${describeCompletedAction(action)}.`,
    );
  }

  setDevStatus(project: string, task: Task, status: DevStatus): Observable<CommandResult> {
    return this.execute(
      task.name,
      'edit',
      this.api.update(project, task.name, { devStatus: status }),
      `Task ${task.name} marked ${DEV_STATUS_LABEL[status]}.`,
    );
  }

  setNote(project: string, task: Task, note: string): Observable<CommandResult> {
    return this.execute(
      task.name,
      'edit',
      this.api.update(project, task.name, { note }),
      note ? `Note saved for ${task.name}.` : `Note cleared for ${task.name}.`,
    );
  }

  delete(project: string, task: Task): Observable<CommandResult> {
    return this.execute(
      task.name,
      'delete',
      this.api.delete(project, task.name),
      `Task ${task.name} deleted.`,
    );
  }

  /* Both outcomes become values so command subscribers only route toast results. */
  private execute(
    name: string,
    action: TaskAction,
    command: Observable<unknown>,
    successMessage: string,
  ): Observable<CommandResult> {
    return defer(() => {
      if (this.isPending(name)) {
        return of({ success: false, message: `An action is already running for task ${name}.` });
      }

      this.setPending(name, action);

      return toCommandResult(command, successMessage).pipe(
        finalize(() => this.setPending(name, null)),
      );
    });
  }

  private setPending(name: string, action: TaskAction | null): void {
    const next = new Map(this.pendingState());

    if (action) {
      next.set(name, action);
    } else {
      next.delete(name);
    }

    this.pendingState.set(next);
  }
}
