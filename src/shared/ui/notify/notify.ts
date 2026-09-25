import { Service, inject } from '@angular/core';
import { ToastController } from '@ionic/angular/toast-controller';

import { CIRCLE_CHECK, CIRCLE_EXCLAMATION } from '../glyph-urls';

export interface NotifiableResult {
  readonly success: boolean;
  readonly message: string;
}

@Service()
export class NotifyService {
  private readonly toasts = inject(ToastController);

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
    void this.toasts
      .create({
        message,
        duration: 2500,
        position: 'top',
        icon: success ? CIRCLE_CHECK : CIRCLE_EXCLAMATION,
        cssClass: success ? 'toast-positive' : 'toast-negative',
      })
      .then((toast) => toast.present());
  }
}
