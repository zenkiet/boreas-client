import { Signal, signal } from '@angular/core';
import { Observable, catchError, defer, finalize, map, of } from 'rxjs';

import { mapApiError } from './api-error';

/** A write's outcome as a value, never an error, for the page to route to a toast. */
export interface CommandResult {
  readonly success: boolean;
  readonly message: string;
}

export function toCommandResult(
  command: Observable<unknown>,
  successMessage: string,
): Observable<CommandResult> {
  return command.pipe(
    map(() => ({ success: true, message: successMessage })),
    catchError((error: unknown) => of({ success: false, message: mapApiError(error).message })),
  );
}

/** One store's writes behind one busy flag; create it as a store field, never through DI. */
export class CommandGate {
  private readonly busyState = signal(false);
  private readonly errorState = signal<string | undefined>(undefined);

  readonly busy: Signal<boolean> = this.busyState.asReadonly();

  /** The last `attempt` failure; `run` reports through its result instead. */
  readonly error: Signal<string | undefined> = this.errorState.asReadonly();

  /** The message for a command that arrives while another still runs. */
  constructor(private readonly rejection = 'Another action is already running.') {}

  /** For stores that outlive their page: the last failure must not greet the next visit. */
  clearError(): void {
    this.errorState.set(undefined);
  }

  /** For commands whose outcome is a toast. */
  run(command: Observable<unknown>, successMessage: string): Observable<CommandResult> {
    return defer(() => {
      if (this.busyState()) return of({ success: false, message: this.rejection });

      this.busyState.set(true);

      return toCommandResult(command, successMessage).pipe(
        finalize(() => this.busyState.set(false)),
      );
    });
  }

  /** For results consumed directly; a failure lands in `error()` and yields undefined. */
  attempt<T>(command: Observable<T>): Observable<T | undefined> {
    return defer(() => {
      if (this.busyState()) return of(undefined);

      this.busyState.set(true);
      this.errorState.set(undefined);

      return command.pipe(
        catchError((error: unknown) => {
          this.errorState.set(mapApiError(error).message);
          return of(undefined);
        }),
        finalize(() => this.busyState.set(false)),
      );
    });
  }
}
