import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TuiButton } from '@taiga-ui/core';

import { PageHeader } from '@shared/ui/page-header/page-header';
import { Reveal } from '@shared/lib/motion/reveal.directive';
import { GlassSegmented, GlassSegmentedItem } from '@shared/ui/glass-segmented/glass-segmented';
import { Panel } from '@shared/ui/panel/panel';
import { ServerConfigStore } from '@shared/config/server-config.store';
import { ThemeMode, ThemeStore } from '@shared/lib/theme/theme.store';

const THEME_MODES: readonly { readonly mode: ThemeMode; readonly label: string; readonly icon: string }[] = [
  { mode: 'system', label: 'System', icon: '@tui.monitor' },
  { mode: 'light', label: 'Light', icon: '@tui.sun' },
  { mode: 'dark', label: 'Dark', icon: '@tui.moon' },
];

const ABOUT: readonly { readonly label: string; readonly value: string }[] = [
  { label: 'Frontend', value: 'Angular 22 · Signal Forms' },
  { label: 'Interface', value: 'Taiga UI 5 · Tailwind CSS 4' },
  { label: 'Typography', value: 'System · JetBrains Mono' },
  { label: 'Navigation', value: 'Liquid Glass dock on touch devices' },
];

@Component({
  selector: 'app-settings-page',
  imports: [GlassSegmented, PageHeader, Panel, Reveal, RouterLink, TuiButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div appReveal class="mx-auto grid max-w-[44rem] grid-cols-1 gap-3.5 md:gap-4">
      <app-page-header title="Settings" />

      <app-panel heading="Appearance" [description]="themeHint()">
        <app-glass-segmented
          [items]="themeItems"
          [activeIndex]="themeIndex()"
          (activeIndexChange)="setThemeByIndex($event)"
        />
      </app-panel>

      <app-panel
        heading="Server"
        description="The Boreas API this device talks to. Changing it re-runs the connection check."
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <span class="min-w-0 break-all font-mono text-[0.9375rem] text-secondary">
            {{ serverUrl() }}
          </span>
          <a tuiButton routerLink="/welcome/connect" size="s" appearance="secondary">
            Change server
          </a>
        </div>
      </app-panel>

      <app-panel heading="About Boreas">
        <dl class="m-0 grid divide-y divide-border text-[0.9375rem]">
          @for (item of about; track item.label) {
            <div class="flex flex-wrap justify-between gap-x-4 py-2.5 first:pt-0 last:pb-0">
              <dt class="font-medium text-primary">{{ item.label }}</dt>
              <dd class="m-0 text-secondary">{{ item.value }}</dd>
            </div>
          }
        </dl>
      </app-panel>
    </div>
  `,
})
export class SettingsPage {
  private readonly theme = inject(ThemeStore);
  private readonly config = inject(ServerConfigStore);

  protected readonly serverUrl = computed(() => this.config.baseUrl());

  protected readonly about = ABOUT;

  protected readonly themeItems: readonly GlassSegmentedItem[] = THEME_MODES.map((option) => ({
    label: option.label,
    icon: option.icon,
  }));

  protected readonly themeIndex = computed(() =>
    Math.max(
      0,
      THEME_MODES.findIndex((option) => option.mode === this.theme.mode()),
    ),
  );

  protected readonly themeHint = computed(() => {
    const mode = this.theme.mode();
    return mode === 'system'
      ? `Following your device appearance, currently ${this.theme.theme()}.`
      : `Using the ${mode} appearance on this device.`;
  });

  protected setThemeByIndex(index: number): void {
    const option = THEME_MODES[index];
    if (option) this.theme.setMode(option.mode);
  }
}
