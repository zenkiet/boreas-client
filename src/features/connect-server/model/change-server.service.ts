import { Service, inject } from '@angular/core';
import { Observable, defaultIfEmpty, map } from 'rxjs';

import { ServerConfigStore } from '@shared/config/server-config.store';
import { SheetService } from '@shared/ui/sheet/sheet.service';
import { ChangeServerSheet } from '../ui/change-server-sheet/change-server-sheet';

@Service()
export class ChangeServerService {
  private readonly sheets = inject(SheetService);
  private readonly config = inject(ServerConfigStore);

  /** Emits true only when the address changed, which obliges the caller to clear the token. */
  open(): Observable<boolean> {
    const before = this.config.baseUrl();

    return this.sheets.open<string>(ChangeServerSheet, 'Change server', {}, 300).pipe(
      map((url) => url !== before),
      defaultIfEmpty(false),
    );
  }
}
