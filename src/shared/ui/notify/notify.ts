import { Service, inject } from '@angular/core';
import { TuiToastService } from '@taiga-ui/kit';
import { take } from 'rxjs';

/** Anything a command hands back: the message is the toast, the flag is its appearance. */
export interface NotifiableResult {
  readonly success: boolean;
  readonly message: string;
}

@Service()
export class NotifyService {
  private readonly toasts = inject(TuiToastService);

  /** Routes a command outcome to a toast, green on success and red on failure. */
  result(result: NotifiableResult): void {
    this.show(result.message, result.success);
  }

  success(message: string): void {
    this.show(message, true);
  }

  failure(message: string): void {
    this.show(message, false);
  }

  private show(message: string, success: boolean): void {
    this.toasts
      .open(message, { appearance: success ? 'positive' : 'negative' })
      .pipe(take(1))
      .subscribe();
  }
}
