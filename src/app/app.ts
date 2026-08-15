import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TuiRoot } from '@taiga-ui/core';

import { ThemeStore } from '@shared/lib/theme/theme.store';
import { AppShell } from '@widgets/app-shell';

@Component({
  selector: 'app-root',
  imports: [AppShell, TuiRoot],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <tui-root class="block! min-h-dvh" [attr.tuiTheme]="theme.theme()">
      <app-shell />
    </tui-root>
  `,
  host: { class: 'block min-h-dvh' },
})
export class App {
  protected readonly theme = inject(ThemeStore);
}
