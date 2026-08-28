import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TuiIcon } from '@taiga-ui/core';

import { SessionStore } from '@features/auth';
import { ChangeServerService } from '@features/connect-server';
import { AuthTokenStore } from '@shared/api/auth-token.store';
import { APP_VERSION } from '@shared/config/app-info';
import { ServerConfigStore } from '@shared/config/server-config.store';
import { Reveal } from '@shared/lib/motion/reveal.directive';
import { PushStore } from '@shared/lib/push';
import { Theme, ThemeStore } from '@shared/lib/theme/theme.store';
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

/* Only the two real appearances: 'system' is the Automatic switch, not a third thumbnail. */
const THEME_CHOICES: readonly { readonly theme: Theme; readonly label: string }[] = [
  { theme: 'light', label: 'Light' },
  { theme: 'dark', label: 'Dark' },
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

@Component({
  selector: 'app-settings-page',
  imports: [GlassSwitch, InsetGroup, PageHeader, Reveal, RouterLink, TuiIcon],
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
          <div class="themes row-divider relative" role="radiogroup" aria-label="Appearance">
            @for (option of themeChoices; track option.theme) {
              <button
                type="button"
                role="radio"
                class="theme"
                [attr.aria-checked]="theme.theme() === option.theme"
                (click)="theme.setMode(option.theme)"
              >
                <span class="theme__preview" [attr.data-theme]="option.theme" aria-hidden="true">
                  <span class="theme__title"></span>
                  <span class="theme__card"></span>
                  <span class="theme__card"></span>
                  <span class="theme__card theme__card--short"></span>
                </span>
                <span class="theme__label">
                  @if (theme.theme() === option.theme) {
                    <tui-icon class="theme__check" icon="@tui.circle-check" aria-hidden="true" />
                  }
                  {{ option.label }}
                </span>
              </button>
            }
          </div>
          <div class="lrow row-divider relative">
            <span class="lrow__label">Automatic</span>
            <button
              appGlassSwitch
              aria-label="Match the system appearance"
              [checked]="theme.mode() === 'system'"
              (checkedChange)="setAutomatic($event)"
            ></button>
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

      <app-inset-group label="About">
        <a class="lrow nav-row row-divider relative" routerLink="/settings/about">
          <span class="flex-1">About Boreas</span>
          <span class="lrow__value tabular">{{ version }}</span>
          <tui-icon class="icon-sm nav-row__chevron" icon="@tui.chevron-right" aria-hidden="true" />
        </a>
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

    .themes {
      display: flex;
      justify-content: center;
      gap: 1.375rem;
      padding: 1rem;
    }

    .theme {
      display: grid;
      justify-items: center;
      gap: 0.5rem;
      margin: 0;
      border: 0;
      padding: 0;
      background: none;
      font: inherit;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    /* Literal colours, not tokens: a light preview has to stay light on a dark screen. */
    .theme__preview {
      display: grid;
      align-content: start;
      gap: 0.3125rem;
      inline-size: 5.75rem;
      block-size: 7.5rem;
      border-radius: 0.625rem;
      padding: 0.5rem;
      box-shadow: inset 0 0 0 1px var(--tui-border-normal);
      transition: box-shadow var(--tui-duration);
    }

    .theme__preview[data-theme='light'] {
      background: #f4f6fa;
    }

    .theme__preview[data-theme='dark'] {
      background: #000;
    }

    .theme[aria-checked='true'] .theme__preview {
      box-shadow: inset 0 0 0 2px var(--tui-background-accent-1);
    }

    .theme__title {
      block-size: 0.4375rem;
      inline-size: 60%;
      border-radius: 0.1875rem;
      margin-block-end: 0.1875rem;
    }

    .theme__card {
      block-size: 1.625rem;
      border-radius: 0.3125rem;
    }

    .theme__card--short {
      block-size: 1.125rem;
    }

    [data-theme='light'] .theme__title {
      background: #0f172a;
    }

    [data-theme='light'] .theme__card {
      background: #fff;
    }

    [data-theme='dark'] .theme__title {
      background: #fff;
    }

    [data-theme='dark'] .theme__card {
      background: #1c1c1e;
    }

    .theme__label {
      display: inline-flex;
      align-items: center;
      gap: 0.3125rem;
      font-size: 0.8125rem;
      color: var(--tui-text-tertiary);
    }

    .theme[aria-checked='true'] .theme__label {
      color: var(--tui-text-primary);
    }

    .theme__check {
      inline-size: 0.9375rem;
      block-size: 0.9375rem;
      font-size: 0.9375rem;
      color: var(--tui-background-accent-1);
    }

    .theme:focus-visible .theme__preview {
      outline: 2px solid var(--tui-border-focus);
      outline-offset: 2px;
    }

    .notice {
      margin: 0;
      padding: 0.75rem 1rem;
      font-size: 0.9375rem;
      line-height: 1.5;
      color: var(--tui-text-secondary);
    }

  `,
})
export class SettingsPage {
  protected readonly theme = inject(ThemeStore);
  private readonly config = inject(ServerConfigStore);
  private readonly router = inject(Router);
  private readonly server = inject(ChangeServerService);
  private readonly tokens = inject(AuthTokenStore);
  protected readonly session = inject(SessionStore);
  protected readonly push = inject(PushStore);

  protected readonly serverUrl = computed(() => this.config.baseUrl());

  protected readonly version = APP_VERSION;

  protected readonly navGroups = computed<readonly NavGroup[]>(() =>
    this.session.isAdmin() ? [PERSONAL, ADMIN] : [PERSONAL],
  );

  protected readonly themeChoices = THEME_CHOICES;

  /* Off pins whatever is on screen right now, so the appearance never jumps on toggle. */
  protected setAutomatic(automatic: boolean): void {
    this.theme.setMode(automatic ? 'system' : this.theme.theme());
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
