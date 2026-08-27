import { Signal, signal } from '@angular/core';
import { Observable, catchError, defer, finalize, map, of } from 'rxjs';

import { mapApiError } from './api-error';

/** The outcome of a write command: never an error to the subscriber, always a value to route to a toast. */
export interface CommandResult {
  readonly success: boolean;
  readonly message: string;
}

/** Wraps a write so both outcomes arrive as values; callers add their own busy handling. */
export function toCommandResult(
  command: Observable<unknown>,
  successMessage: string,
): Observable<CommandResult> {
  return command.pipe(
    map(() => ({ success: true, message: successMessage })),
    catchError((error: unknown) => of({ success: false, message: mapApiError(error).message })),
  );
}

/**
 * Serialises one store's write commands behind a single busy flag.
 *
 * Instantiate as a store field, not through DI: the flag belongs to that store's lifetime.
 */
export class CommandGate {
  private readonly busyState = signal(false);
  private readonly errorState = signal<string | undefined>(undefined);

  readonly busy: Signal<boolean> = this.busyState.asReadonly();

  /** Message from the last `attempt` failure, cleared when the next one starts. */
  readonly error: Signal<string | undefined> = this.errorState.asReadonly();

  /** Reported when a command is rejected because another is still running. */
  constructor(private readonly rejection: string) {}

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

  /** For commands whose result is consumed directly; failures land in `error()` and yield undefined. */
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
