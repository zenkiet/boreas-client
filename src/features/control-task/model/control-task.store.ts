import { Injectable, inject, signal } from '@angular/core';
import { Observable, defer, finalize, of } from 'rxjs';

import {
  DEV_STATUS_LABEL,
  DevStatus,
  Task,
  TaskApi,
  TaskStateAction,
  describeCompletedAction,
} from '@entities/task';
import { CommandResult, toCommandResult } from '@shared/api/command';

export type TaskCommandResult = CommandResult;

/** Commands for one project's tasks; pending state is keyed by task name. */
@Injectable()
export class ControlTaskStore {
  private readonly api = inject(TaskApi);
  private readonly pendingTaskIdsState = signal<ReadonlySet<string>>(new Set());

  readonly pendingTaskIds = this.pendingTaskIdsState.asReadonly();

  isPending(name: string): boolean {
    return this.pendingTaskIdsState().has(name);
  }

  accessUrl(project: string, name: string): string {
    return this.api.accessUrl(project, name);
  }

  changeState(project: string, task: Task, action: TaskStateAction): Observable<TaskCommandResult> {
    return this.execute(
      task.name,
      this.api.changeState(project, task.name, action),
      `Task ${task.name} ${describeCompletedAction(action)}.`,
    );
  }

  setDevStatus(project: string, task: Task, status: DevStatus): Observable<TaskCommandResult> {
    return this.execute(
      task.name,
      this.api.update(project, task.name, { devStatus: status }),
      `Task ${task.name} marked ${DEV_STATUS_LABEL[status]}.`,
    );
  }

  delete(project: string, task: Task): Observable<TaskCommandResult> {
    return this.execute(
      task.name,
      this.api.delete(project, task.name),
      `Task ${task.name} deleted.`,
    );
  }

  /* Both outcomes become values so command subscribers only route toast results. */
  private execute(
    name: string,
    command: Observable<unknown>,
    successMessage: string,
  ): Observable<TaskCommandResult> {
    return defer(() => {
      if (this.isPending(name)) {
        return of({ success: false, message: `An action is already running for task ${name}.` });
      }

      this.setPending(name, true);

      return toCommandResult(command, successMessage).pipe(
        finalize(() => this.setPending(name, false)),
      );
    });
  }

  private setPending(name: string, pending: boolean): void {
    const next = new Set(this.pendingTaskIdsState());

    if (pending) {
      next.add(name);
    } else {
      next.delete(name);
    }

    this.pendingTaskIdsState.set(next);
  }
}
