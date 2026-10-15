import { Component, inject } from '@angular/core';
import { IonApp } from '@ionic/angular/ion-app';

import { AppLockStore } from '@shared/lib/app-lock/app-lock.store';
import { AppShell } from '@widgets/app-shell';

/* Ionic mounts its overlays inside ion-app, so hiding it while locked hides them all. */
@Component({
  selector: 'app-root',
  imports: [AppShell, IonApp],
  host: { '(document:click)': 'retry()' },
  template: `
    <ion-app [inert]="lock.locked()" [style.opacity]="lock.locked() ? 0 : null">
      <app-shell />
    </ion-app>
  `,
})
export class App {
  protected readonly lock = inject(AppLockStore);

  /* Void on purpose: Angular cancels any click whose listener returns false. */
  protected retry(): void {
    if (this.lock.locked()) this.lock.unlock();
  }
}
