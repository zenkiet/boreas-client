import { Component, inject } from '@angular/core';
import { TuiButton, TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';

/* TUI_CONFIRM forces two actions, but this dialog has only one valid exit. */
@Component({
  selector: 'app-connect-failed-dialog',
  imports: [TuiButton],
  template: `
    <p class="m-0 text-[0.9375rem] leading-relaxed text-secondary">
      No Boreas API answered at this address. Check it and try again.
    </p>
    <button
      tuiButton
      type="button"
      size="m"
      appearance="primary"
      class="mt-4 w-full"
      (click)="tryAgain()"
    >
      Try again
    </button>
  `,
})
export class ConnectFailedDialog {
  private readonly context = inject(POLYMORPHEUS_CONTEXT) as TuiDialogContext<void>;

  protected tryAgain(): void {
    this.context.completeWith(undefined);
  }
}
