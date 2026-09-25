import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import type { ToggleCustomEvent } from '@ionic/angular';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonNote } from '@ionic/angular/ion-note';
import { IonToggle } from '@ionic/angular/ion-toggle';
import { NavController } from '@ionic/angular/nav-controller';

import { SessionStore } from '@features/auth';
import { ChangeServerService } from '@features/connect-server';
import { ManageCredentialsStore } from '@features/manage-credentials';
import { ManageTokensStore } from '@features/manage-tokens/model';
import { ManageUsersStore } from '@features/manage-users';
import { AuthTokenStore } from '@shared/api/auth-token.store';
import { APP_VERSION } from '@shared/config/app-info';
import { ServerConfigStore } from '@shared/config/server-config.store';
import { PushStore } from '@shared/lib/push';
import { Theme, ThemeStore } from '@shared/lib/theme/theme.store';
import { wideScreen } from '@shared/ui/breakpoint/wide-screen';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';
import { PAGE_CHROME } from '@shared/ui/page-chrome/page-chrome';

/* 'system' is the Automatic toggle, not a third thumbnail. */
const THEME_CHOICES: readonly { readonly theme: Theme; readonly label: string }[] = [
  { theme: 'light', label: 'Light' },
  { theme: 'dark', label: 'Dark' },
];

const ADMIN_LINKS = [
  { label: 'Users', icon: 'icon-[light--user-group]', pane: 'users' },
  { label: 'Registry credentials', icon: 'icon-[light--lock]', pane: 'registries' },
] as const;

@Component({
  selector: 'app-settings-page',
  imports: [InsetGroup, IonItem, IonLabel, IonNote, IonToggle, PAGE_CHROME],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar><ion-title>Settings</ion-title></ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <div class="mx-auto max-w-(--app-column)">
        <ion-header collapse="condense">
          <ion-toolbar><ion-title size="large">Settings</ion-title></ion-toolbar>
        </ion-header>

        <!-- iPad reaches Account from the sidebar's foot and the default pane. -->
        @if (session.user(); as user) {
          <app-inset-group class="narrow-only">
            <ion-item button class="account" (click)="open('account')">
              <span slot="start" class="avatar" aria-hidden="true">{{
                user.username.slice(0, 2)
              }}</span>
              <ion-label>
                <span class="name">{{ user.username }}</span>
                <span class="role" [attr.data-role]="user.role">{{
                  user.role === 'admin' ? 'Admin' : 'User'
                }}</span>
              </ion-label>
              <ion-note>{{ user.email }}</ion-note>
            </ion-item>
          </app-inset-group>
        }

        <app-inset-group label="General">
          <ion-item
            button
            [class.selected]="selected() === 'tokens'"
            [attr.aria-current]="selected() === 'tokens' ? 'page' : null"
            (click)="open('tokens')"
          >
            <span slot="start" class="icon-[light--key]" aria-hidden="true"></span>
            <ion-label>API tokens</ion-label>
            @if (apiTokens.hasLoaded() && !apiTokens.sessionRequired()) {
              <ion-note slot="end" class="tabular">{{ apiTokens.liveCount() }} live</ion-note>
            }
          </ion-item>
          <ion-item button (click)="changeServer()">
            <span slot="start" class="icon-[light--server]" aria-hidden="true"></span>
            <ion-label class="server">
              Server
              <ion-note class="font-mono">{{ serverHost() }}</ion-note>
            </ion-label>
          </ion-item>
          <ion-item
            button
            [class.selected]="selected() === 'about'"
            [attr.aria-current]="selected() === 'about' ? 'page' : null"
            (click)="open('about')"
          >
            <span slot="start" class="icon-[light--circle-info]" aria-hidden="true"></span>
            <ion-label>About Boreas</ion-label>
            <ion-note slot="end" class="tabular">{{ version }}</ion-note>
          </ion-item>
        </app-inset-group>

        @if (push.permission() !== 'unsupported') {
          <app-inset-group label="Notifications">
            <ion-item>
              <span slot="start" class="icon-[light--bell]" aria-hidden="true"></span>
              <ion-toggle
                [checked]="push.enabled()"
                [disabled]="push.busy() || push.permission() === 'denied'"
                (ionChange)="togglePush($event)"
              >
                Push notifications
              </ion-toggle>
            </ion-item>
            @if (push.hint(); as hint) {
              <ion-note>{{ hint }}</ion-note>
            } @else {
              <ion-note>
                Deploy results and status changes arrive on this device while you are signed in.
              </ion-note>
            }
          </app-inset-group>
        } @else if (push.hint(); as hint) {
          <app-inset-group label="Notifications">
            <ion-item>
              <ion-label class="ion-text-wrap" role="status">{{ hint }}</ion-label>
            </ion-item>
          </app-inset-group>
        }

        <app-inset-group label="Appearance">
          <ion-item lines="none">
            <div class="themes" role="radiogroup" aria-label="Appearance">
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
                  <span class="theme__label">{{ option.label }}</span>
                </button>
              }
            </div>
          </ion-item>
          <ion-item>
            <ion-toggle
              [checked]="theme.mode() === 'system'"
              (ionChange)="setAutomatic($event.detail.checked)"
            >
              Automatic
            </ion-toggle>
          </ion-item>
          <ion-note class="narrow-only">{{ themeNote() }}</ion-note>
        </app-inset-group>

        @if (session.isAdmin()) {
          <app-inset-group label="Administration">
            @for (link of adminLinks; track link.pane) {
              <ion-item
                button
                [class.selected]="selected() === link.pane"
                [attr.aria-current]="selected() === link.pane ? 'page' : null"
                (click)="open(link.pane)"
              >
                <span slot="start" [class]="link.icon" aria-hidden="true"></span>
                <ion-label>{{ link.label }}</ion-label>
                @if (adminCount(link.pane); as count) {
                  <ion-note slot="end" class="tabular">{{ count }}</ion-note>
                }
              </ion-item>
            }
            <ion-note class="narrow-only">Only administrators see this group.</ion-note>
          </app-inset-group>
        }

        <!-- iPad signs out from the Account pane. -->
        <app-inset-group class="narrow-only">
          <ion-item button [detail]="false" (click)="signOut()">
            <ion-label color="danger">Sign out</ion-label>
          </ion-item>
        </app-inset-group>
      </div>
    </ion-content>
  `,
  styles: `
    /* Not an end-slot note: it would squeeze the label to one letter. */
    ion-label.server {
      display: flex;
      align-items: baseline;
      gap: 1rem;
    }

    ion-label.server ion-note {
      flex: 1;
      font-size: 0.875rem;
      min-width: 0;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      text-align: end;
    }

    .account {
      --row-min-height: 4.75rem;
    }

    @media not all and (min-width: 64rem) and (min-height: 31.25rem) {
      ion-item > [slot='start'][class*='icon-['] {
        color: var(--app-text-secondary);
      }
    }

    .name {
      font-size: 1.0625rem;
      font-weight: 600;
    }

    .avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      inline-size: 3rem;
      block-size: 3rem;
      border-radius: 999px;
      background: var(--app-accent-soft);
      color: var(--ion-color-primary);
      font-size: 1rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    /* iPad split view: rows select a pane instead of pushing, so no chevrons. */
    @media (min-width: 64rem) and (min-height: 31.25rem) {
      ion-item {
        --inner-border-width: 0;
        --row-min-height: 3rem;
        margin-inline: 0.375rem;
      }

      ion-item:first-child {
        margin-block-start: 0.375rem;
      }

      ion-item:last-child {
        margin-block-end: 0.375rem;
      }

      ion-item::part(detail-icon) {
        display: none;
      }

      .selected::part(native) {
        border-radius: 0.875rem;
        background: rgba(120, 120, 128, 0.16);
        color: var(--ion-color-primary);
      }
    }

    .role {
      margin-inline-start: 0.375rem;
      border-radius: 0.625rem;
      padding: 0.125rem 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      vertical-align: 0.1em;
      color: var(--app-text-tertiary);
      background: var(--app-background-neutral-1);
    }

    .role[data-role='admin'] {
      color: var(--app-accent-text);
      background: var(--app-accent-soft);
    }

    .themes {
      display: flex;
      flex: 1;
      justify-content: center;
      gap: 1.5rem;
      padding-block: 1.5rem 0.375rem;
    }

    .theme {
      display: grid;
      justify-items: center;
      gap: 0.625rem;
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
      gap: 0.375rem;
      inline-size: 5.75rem;
      block-size: 7.5rem;
      border-radius: 1rem;
      padding: 0.5rem 0.5rem 1rem;
      box-shadow: 0 0 0 1px rgba(120, 120, 128, 0.45);
      transition: box-shadow 0.2s;
    }

    .theme__preview[data-theme='light'] {
      background: #f2f2f7;
    }

    .theme__preview[data-theme='dark'] {
      background: #000;
    }

    .theme[aria-checked='true'] .theme__preview {
      box-shadow: 0 0 0 2.5px var(--ion-color-primary);
    }

    .theme__title {
      block-size: 0.4375rem;
      inline-size: 60%;
      border-radius: 999px;
      margin-block-end: 0.125rem;
    }

    .theme__card {
      block-size: 1.5625rem;
      border-radius: 0.4375rem;
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
      font-size: 1.0625rem;
      line-height: 1.375rem;
      color: var(--app-text-tertiary);
    }

    @media (min-width: 64rem) and (min-height: 31.25rem) {
      .theme__label {
        font-size: 0.9375rem;
        line-height: 1.25rem;
      }
    }

    .theme[aria-checked='true'] .theme__label {
      font-weight: 600;
      color: var(--app-text-primary);
    }

    .theme:focus-visible .theme__preview {
      outline: 2px solid var(--ion-color-primary);
      outline-offset: 2px;
    }
  `,
})
export class SettingsPage {
  protected readonly theme = inject(ThemeStore);
  private readonly config = inject(ServerConfigStore);
  private readonly router = inject(Router);
  private readonly navCtrl = inject(NavController);
  private readonly wide = wideScreen();
  private readonly query = toSignal(inject(ActivatedRoute).queryParamMap);
  /* Phones push the page; iPad shows it beside this list (app/settings-split). */
  protected readonly selected = computed(() =>
    this.wide() ? (this.query()?.get('pane') ?? 'account') : null,
  );
  private readonly server = inject(ChangeServerService);
  private readonly authTokens = inject(AuthTokenStore);
  protected readonly session = inject(SessionStore);
  protected readonly push = inject(PushStore);
  /* Route-provided, shared with the panes, so the counts stay live. */
  protected readonly apiTokens = inject(ManageTokensStore);
  private readonly users = inject(ManageUsersStore);
  private readonly credentials = inject(ManageCredentialsStore);

  protected readonly serverHost = this.config.host;
  protected readonly version = APP_VERSION;
  protected readonly adminLinks = ADMIN_LINKS;
  protected readonly themeChoices = THEME_CHOICES;

  protected readonly themeNote = computed(() => {
    const scheme = this.theme.theme() === 'dark' ? 'Dark' : 'Light';
    return this.theme.mode() === 'system'
      ? `Following this device — ${scheme} right now.`
      : `Boreas stays ${scheme} whatever the device uses.`;
  });

  protected adminCount(pane: string): string {
    const store = pane === 'users' ? this.users : this.credentials;
    if (!store.hasLoaded()) return '';
    return String(
      pane === 'users' ? this.users.users().length : this.credentials.credentials().length,
    );
  }

  /* Off pins the current appearance, so nothing jumps on toggle. */
  protected setAutomatic(automatic: boolean): void {
    this.theme.setMode(automatic ? 'system' : this.theme.theme());
  }

  /* ion-toggle flips itself on tap; snap it back to enabled() once the attempt settles. */
  protected togglePush(event: ToggleCustomEvent): void {
    (event.detail.checked ? this.push.enable() : this.push.disable()).subscribe({
      complete: () => (event.target.checked = this.push.enabled()),
    });
  }

  protected open(pane: string): void {
    if (this.wide()) {
      void this.router.navigate([], { queryParams: { pane }, replaceUrl: true });
    } else {
      void this.navCtrl.navigateForward(['/settings', pane]);
    }
  }

  /* No confirm: signing out is undone by signing in. */
  protected signOut(): void {
    this.session.signOut().subscribe(() => void this.navCtrl.navigateRoot('/login'));
  }

  protected changeServer(): void {
    this.server.open().subscribe((changed) => {
      /* The old token means nothing on another server. */
      if (changed) {
        this.authTokens.clear();
        void this.navCtrl.navigateRoot('/login');
      }
    });
  }
}
