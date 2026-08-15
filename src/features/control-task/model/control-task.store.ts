import { inject, Injectable, signal } from '@angular/core';
import { Observable, catchError, defer, finalize, map, of } from 'rxjs';

import { Task, TaskApi, TaskStateAction, describeCompletedAction } from '@entities/task';
import { mapApiError } from '@shared/api/api-error';

export interface TaskCommandResult {
  readonly success: boolean;
  readonly message: string;
}

@Injectable()
export class ControlTaskStore {
  private readonly api = inject(TaskApi);
  private readonly pendingTaskIdsState = signal<ReadonlySet<string>>(new Set());

  readonly pendingTaskIds = this.pendingTaskIdsState.asReadonly();

  isPending(taskId: string): boolean {
    return this.pendingTaskIdsState().has(taskId);
  }

  /* Stable identity avoids rebinding this function in OnPush row components. */
  readonly accessUrl = (taskId: string): string => this.api.accessUrl(taskId);

  changeState(task: Task, action: TaskStateAction): Observable<TaskCommandResult> {
    return this.execute(
      task.id,
      this.api.changeState(task.id, action),
      `Task ${task.id} ${describeCompletedAction(action)}.`,
    );
  }

  delete(task: Task): Observable<TaskCommandResult> {
    return this.execute(task.id, this.api.delete(task.id), `Task ${task.id} deleted.`);
  }

  /* Both outcomes become values so command subscribers only route toast results. */
  private execute(
    taskId: string,
    command: Observable<unknown>,
    successMessage: string,
  ): Observable<TaskCommandResult> {
    return defer(() => {
      if (this.isPending(taskId)) {
        return of({ success: false, message: `An action is already running for task ${taskId}.` });
      }

      this.setPending(taskId, true);

      return command.pipe(
        map(() => ({ success: true, message: successMessage })),
        catchError((error: unknown) => of({ success: false, message: mapApiError(error).message })),
        finalize(() => this.setPending(taskId, false)),
      );
    });
  }

  private setPending(taskId: string, pending: boolean): void {
    const next = new Set(this.pendingTaskIdsState());

    if (pending) {
      next.add(taskId);
    } else {
      next.delete(taskId);
    }

    this.pendingTaskIdsState.set(next);
  }
}
