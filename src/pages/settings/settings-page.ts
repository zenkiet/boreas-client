import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TuiIcon } from '@taiga-ui/core';

import { SessionStore } from '@features/auth';
import { ChangeServerService } from '@features/connect-server';
import { AuthTokenStore } from '@shared/api/auth-token.store';
import { ServerConfigStore } from '@shared/config/server-config.store';
import { Reveal } from '@shared/lib/motion/reveal.directive';
import { PushStore } from '@shared/lib/push';
import { ThemeMode, ThemeStore } from '@shared/lib/theme/theme.store';
import { GlassSegmented, GlassSegmentedItem } from '@shared/ui/glass-segmented/glass-segmented';
import { GlassSwitch } from '@shared/ui/glass-switch/glass-switch';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';
import { PageHeader } from '@shared/ui/page-header/page-header';

interface NavLink {
  readonly label: string;
  readonly icon: string;
  readonly route: string;
}

interface NavGroup {
  readonly label: string;
  readonly links: readonly NavLink[];
}

const THEME_MODES: readonly {
  readonly mode: ThemeMode;
  readonly label: string;
  readonly icon: string;
}[] = [
  { mode: 'system', label: 'System', icon: '@tui.monitor' },
  { mode: 'light', label: 'Light', icon: '@tui.sun' },
  { mode: 'dark', label: 'Dark', icon: '@tui.moon' },
];

/* Tokens belong to the person, not the admin role, so they sit above Administration. */
const PERSONAL: NavGroup = {
  label: 'API tokens',
  links: [{ label: 'Your API tokens', icon: '@tui.key-round', route: '/settings/tokens' }],
};

const ADMIN: NavGroup = {
  label: 'Administration',
  links: [
    { label: 'Users', icon: '@tui.users', route: '/settings/users' },
    { label: 'Registry credentials', icon: '@tui.key-round', route: '/settings/registries' },
  ],
};

const ABOUT: readonly { readonly label: string; readonly value: string }[] = [
  { label: 'Frontend', value: 'Angular 22 · Signal Forms' },
  { label: 'Interface', value: 'Taiga UI 5 · Tailwind CSS 4' },
  { label: 'Typography', value: 'System · JetBrains Mono' },
  { label: 'Navigation', value: 'Liquid Glass dock on touch devices' },
];

@Component({
  selector: 'app-settings-page',
  imports: [GlassSegmented, GlassSwitch, InsetGroup, PageHeader, Reveal, RouterLink, TuiIcon],
  template: `
    <div appReveal class="mx-auto grid max-w-176 grid-cols-1 gap-3.5 md:gap-4">
      <app-page-header title="Settings" />

      @if (session.user(); as user) {
        <app-inset-group label="Account">
          <div class="account row-divider relative">
            <span class="account__avatar" aria-hidden="true">{{ user.username.slice(0, 2) }}</span>
            <span class="min-w-0 flex-1">
              <span class="account__name">
                {{ user.username }}
                <span class="account__role" [attr.data-role]="user.role">{{ user.role }}</span>
              </span>
              <span class="account__email">{{ user.email }}</span>
            </span>
          </div>
          <button type="button" class="lrow action-row row-divider relative" (click)="signOut()">
            Sign out
          </button>
        </app-inset-group>
      }

      @for (group of navGroups(); track group.label) {
        <app-inset-group [label]="group.label">
          @for (link of group.links; track link.route) {
            <a class="lrow nav-row row-divider relative" [routerLink]="link.route">
              <tui-icon class="icon-sm nav-row__icon" [icon]="link.icon" aria-hidden="true" />
              <span class="flex-1">{{ link.label }}</span>
              <tui-icon
                class="icon-sm nav-row__chevron"
                icon="@tui.chevron-right"
                aria-hidden="true"
              />
            </a>
          }
        </app-inset-group>
      }

      <div>
        <app-inset-group label="Appearance">
          <div class="theme-row row-divider relative">
            <app-glass-segmented
              [items]="themeItems"
              [activeIndex]="themeIndex()"
              (activeIndexChange)="setThemeByIndex($event)"
            />
          </div>
        </app-inset-group>
      </div>

      @if (push.permission() !== 'unsupported') {
        <div>
          <app-inset-group label="Notifications">
            <div class="lrow row-divider relative">
              <span class="lrow__label">Push notifications</span>
              <button
                appGlassSwitch
                aria-label="Push notifications"
                [checked]="push.enabled()"
                [busy]="push.busy()"
                [disabled]="push.permission() === 'denied'"
                (checkedChange)="togglePush($event)"
              ></button>
            </div>
          </app-inset-group>
          @if (push.hint(); as hint) {
            <p class="footnote" role="status">{{ hint }}</p>
          }
        </div>
      } @else if (push.hint(); as hint) {
        <app-inset-group label="Notifications">
          <p class="notice" role="status">{{ hint }}</p>
        </app-inset-group>
      }

      <div>
        <app-inset-group label="Server">
          <div class="lrow row-divider relative">
            <span class="lrow__label">Address</span>
            <span class="lrow__value font-mono">{{ serverUrl() }}</span>
          </div>
          <button
            type="button"
            class="lrow nav-row action-like row-divider relative"
            (click)="changeServer()"
          >
            <span class="flex-1">Change server</span>
            <tui-icon
              class="icon-sm nav-row__chevron"
              icon="@tui.chevron-right"
              aria-hidden="true"
            />
          </button>
        </app-inset-group>
      </div>

      <app-inset-group label="About Boreas">
        @for (item of about; track item.label) {
          <div class="lrow row-divider relative">
            <span class="lrow__label">{{ item.label }}</span>
            <span class="lrow__value">{{ item.value }}</span>
          </div>
        }
      </app-inset-group>
    </div>
  `,
  styles: `
    .account {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
    }

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

    .nav-row {
      font-size: 1rem;
      color: var(--tui-text-primary);
      text-decoration: none;
      transition: background-color var(--tui-duration);
    }

    button.nav-row {
      inline-size: 100%;
      margin: 0;
      border: 0;
      background: none;
      font: inherit;
      font-size: 1rem;
      text-align: start;
      cursor: pointer;
    }

    .nav-row:hover {
      background: var(--tui-background-neutral-1);
    }

    .nav-row__icon,
    .nav-row__chevron {
      color: var(--tui-text-tertiary);
    }

    /* Tailwind has no preflight, so reset the native button explicitly. */
    .action-row {
      inline-size: 100%;
      margin: 0;
      border: 0;
      background: none;
      font: inherit;
      font-size: 1.0625rem;
      font-weight: 500;
      color: var(--tui-text-negative);
      text-align: start;
      cursor: pointer;
      transition: background-color var(--tui-duration);
    }

    .action-row:hover {
      background: var(--tui-background-neutral-1);
    }

    .theme-row {
      padding: 0.625rem 1rem;
    }

    .notice {
      margin: 0;
      padding: 0.75rem 1rem;
      font-size: 0.9375rem;
      line-height: 1.5;
      color: var(--tui-text-secondary);
    }

    .theme-row app-glass-segmented {
      inline-size: 100%;
    }
  `,
})
export class SettingsPage {
  private readonly theme = inject(ThemeStore);
  private readonly config = inject(ServerConfigStore);
  private readonly router = inject(Router);
  private readonly server = inject(ChangeServerService);
  private readonly tokens = inject(AuthTokenStore);
  protected readonly session = inject(SessionStore);
  protected readonly push = inject(PushStore);

  protected readonly serverUrl = computed(() => this.config.baseUrl());

  protected readonly about = ABOUT;

  protected readonly navGroups = computed<readonly NavGroup[]>(() =>
    this.session.isAdmin() ? [PERSONAL, ADMIN] : [PERSONAL],
  );

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

  protected setThemeByIndex(index: number): void {
    const option = THEME_MODES[index];
    if (option) this.theme.setMode(option.mode);
  }

  /* The knob renders from enabled() alone; a refused prompt leaves it off and hint() says why. */
  protected togglePush(next: boolean): void {
    (next ? this.push.enable() : this.push.disable()).subscribe();
  }

  protected changeServer(): void {
    this.server.open().subscribe((changed) => {
      /* A different server means a different session; the old token is meaningless there. */
      if (changed) {
        this.tokens.clear();
        void this.router.navigate(['/login']);
      }
    });
  }

  protected signOut(): void {
    this.session.signOut().subscribe(() => void this.router.navigate(['/login']));
  }
}
