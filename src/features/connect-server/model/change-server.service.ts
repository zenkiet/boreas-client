import { Service, inject } from '@angular/core';
import { TuiResponsiveDialogService } from '@taiga-ui/addon-mobile';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { Observable, defaultIfEmpty, filter, map } from 'rxjs';

import { ServerConfigStore } from '@shared/config/server-config.store';
import { ChangeServerSheet } from '../ui/change-server-sheet/change-server-sheet';

@Service()
export class ChangeServerService {
  private readonly dialogs = inject(TuiResponsiveDialogService);
  private readonly config = inject(ServerConfigStore);

  /**
   * Opens the address sheet (dialog on desktop) and emits once, true only when the
   * address actually changed.
   *
   * A different server is a different session, so a true here obliges the caller to
   * clear the token. A dismissal completes without emitting, hence the `false` default.
   */
  open(): Observable<boolean> {
    const before = this.config.baseUrl();

    return this.dialogs
      .open<string>(new PolymorpheusComponent(ChangeServerSheet), { label: 'Change server' })
      .pipe(
        filter((url): url is string => typeof url === 'string'),
        map((url) => url !== before),
        defaultIfEmpty(false),
      );
  }
}
