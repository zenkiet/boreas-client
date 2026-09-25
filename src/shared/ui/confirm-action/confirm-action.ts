import { Service, inject } from '@angular/core';
import { AlertController } from '@ionic/angular/alert-controller';
import { Observable, defer, from, map, switchMap } from 'rxjs';

export interface ConfirmActionRequest {
  readonly title: string;
  readonly message: string;
  readonly confirmLabel: string;
  readonly cancelLabel?: string;
  readonly destructive?: boolean;
}

@Service()
export class ConfirmActionService {
  private readonly alerts = inject(AlertController);

  /** Emits once; a dismissal is false. */
  confirm(request: ConfirmActionRequest): Observable<boolean> {
    const role = request.destructive ? 'destructive' : 'preferred';

    return defer(() =>
      this.alerts.create({
        header: request.title,
        message: request.message,
        buttons: [
          { text: request.cancelLabel ?? 'Cancel', role: 'cancel' },
          { text: request.confirmLabel, role },
        ],
      }),
    ).pipe(
      switchMap((alert) => from(alert.present().then(() => alert.onWillDismiss()))),
      map((result) => result.role === role),
    );
  }
}
