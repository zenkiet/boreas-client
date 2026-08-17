import { inject, Service } from '@angular/core';
import { TuiResponsiveDialogService } from '@taiga-ui/addon-mobile';
import { TUI_CONFIRM, TuiConfirmData } from '@taiga-ui/kit';
import { defaultIfEmpty, Observable } from 'rxjs';

export interface ConfirmActionRequest {
  readonly title: string;
  readonly message: string;
  readonly confirmLabel: string;
  readonly destructive?: boolean;
}

@Service()
export class ConfirmActionService {
  private readonly dialogs = inject(TuiResponsiveDialogService);

  /** Emits exactly once — the choice, or false when the dialog is dismissed. */
  confirm(request: ConfirmActionRequest): Observable<boolean> {
    const data: TuiConfirmData = {
      content: request.message,
      yes: request.confirmLabel,
      no: 'Cancel',
      appearance: request.destructive ? ['negative', 'secondary'] : ['primary', 'secondary'],
    };

    return this.dialogs
      .open<boolean>(TUI_CONFIRM, { label: request.title, data, size: 's', bar: true })
      .pipe(defaultIfEmpty(false));
  }
}
