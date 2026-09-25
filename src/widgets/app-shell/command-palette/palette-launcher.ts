import { DOCUMENT } from '@angular/common';
import { Injector, Service, inject } from '@angular/core';
import { EMPTY, catchError, finalize, from, switchMap } from 'rxjs';

/** Opens the ⌘K palette; keep the import lazy, as this launcher ships in the initial bundle. */
@Service()
export class CommandPaletteLauncher {
  private readonly injector = inject(Injector);
  private opened = false;

  readonly shortcut = /Mac|iPhone|iPad/.test(
    inject(DOCUMENT).defaultView?.navigator.userAgent ?? '',
  )
    ? '⌘K'
    : 'Ctrl K';

  open(): void {
    if (this.opened) return;
    this.opened = true;

    from(import('./command-palette'))
      .pipe(
        switchMap(({ presentCommandPalette }) => presentCommandPalette(this.injector)),
        /* An offline chunk load just leaves the key to be pressed again. */
        catchError(() => EMPTY),
        finalize(() => (this.opened = false)),
      )
      .subscribe();
  }
}
