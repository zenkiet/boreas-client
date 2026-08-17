import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TuiButton, TuiIcon } from '@taiga-ui/core';

import { SessionStore } from '@features/auth';
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
  imports: [GlassSegmented, PageHeader, Panel, Reveal, RouterLink, TuiButton, TuiIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div appReveal class="mx-auto grid max-w-[44rem] grid-cols-1 gap-3.5 md:gap-4">
      <app-page-header title="Settings" />

      @if (session.user(); as user) {
        <app-panel heading="Account">
          <div class="flex items-center gap-3">
            <span class="account__avatar" aria-hidden="true">{{ user.username.slice(0, 2) }}</span>
            <span class="min-w-0 flex-1">
              <span class="account__name">
                {{ user.username }}
                <span class="account__role" [attr.data-role]="user.role">{{ user.role }}</span>
              </span>
              <span class="account__email">{{ user.email }}</span>
            </span>
            <button
              tuiButton
              type="button"
              size="s"
              appearance="flat-destructive"
              (click)="signOut()"
            >
              Sign out
            </button>
          </div>
        </app-panel>
      }

      @if (session.isAdmin()) {
        <app-panel heading="Administration" [flush]="true">
          <a class="admin-row row-divider relative" routerLink="/settings/users">
            <tui-icon class="icon-sm admin-row__icon" icon="@tui.users" aria-hidden="true" />
            <span class="flex-1">Users</span>
            <tui-icon class="icon-sm admin-row__chevron" icon="@tui.chevron-right" aria-hidden="true" />
          </a>
          <a class="admin-row row-divider relative" routerLink="/settings/registries">
            <tui-icon class="icon-sm admin-row__icon" icon="@tui.key-round" aria-hidden="true" />
            <span class="flex-1">Registry credentials</span>
            <tui-icon class="icon-sm admin-row__chevron" icon="@tui.chevron-right" aria-hidden="true" />
          </a>
        </app-panel>
      }

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
  styles: `
    .account__avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      inline-size: 2.25rem;
      block-size: 2.25rem;
      flex: none;
      border-radius: 999px;
      background: var(--app-accent-soft);
      color: var(--app-accent-text);
      font-size: 0.8125rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .account__name {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1rem;
      font-weight: 600;
      color: var(--tui-text-primary);
    }

    .account__role {
      border-radius: 999px;
      padding: 0.125rem 0.5625rem;
      font-size: 0.6875rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--tui-text-tertiary);
      background: var(--tui-background-neutral-1);
    }

    .account__role[data-role='admin'] {
      color: var(--tui-status-warning);
      background: var(--tui-status-warning-pale);
    }

    .account__email {
      display: block;
      overflow: hidden;
      font-size: 0.875rem;
      color: var(--tui-text-tertiary);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .admin-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.8125rem 1rem;
      font-size: 1rem;
      font-weight: 500;
      color: var(--tui-text-primary);
      text-decoration: none;
      transition: background-color var(--tui-duration);
    }

    .admin-row:hover {
      background: var(--tui-background-neutral-1);
    }

    .admin-row__icon {
      color: var(--tui-text-tertiary);
    }

    .admin-row__chevron {
      color: var(--tui-text-tertiary);
    }
  `,
})
export class SettingsPage {
  private readonly theme = inject(ThemeStore);
  private readonly config = inject(ServerConfigStore);
  private readonly router = inject(Router);
  protected readonly session = inject(SessionStore);

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

  protected signOut(): void {
    this.session.signOut().subscribe(() => void this.router.navigate(['/login']));
  }
}
