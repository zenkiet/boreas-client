import { Component, computed, inject, signal } from '@angular/core';
import { FormField, form, minLength, pattern, required, submit } from '@angular/forms/signals';
import { IonBackButton } from '@ionic/angular/ion-back-button';
import { IonButton } from '@ionic/angular/ion-button';
import { IonButtons } from '@ionic/angular/ion-buttons';
import { IonInput } from '@ionic/angular/ion-input';
import { IonInputPasswordToggle } from '@ionic/angular/ion-input-password-toggle';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonList } from '@ionic/angular/ion-list';
import { IonNote } from '@ionic/angular/ion-note';
import { IonPopover } from '@ionic/angular/ion-popover';
import { IonSelect } from '@ionic/angular/ion-select';
import { IonSelectOption } from '@ionic/angular/ion-select-option';
import { IonSpinner } from '@ionic/angular/ion-spinner';
import { filter, switchMap } from 'rxjs';

import { User, UserRole } from '@entities/user';
import { SessionStore } from '@features/auth';
import { ManageUsersStore } from '@features/manage-users';
import { CommandResult } from '@shared/api/command';
import { FieldStatus } from '@shared/lib/forms/field-status.directive';
import { PULL_REFRESH, PullRefreshSource } from '@shared/lib/pull-to-refresh/pull-to-refresh';
import { Callout } from '@shared/ui/callout/callout';
import { ConfirmActionService } from '@shared/ui/confirm-action/confirm-action';
import { ErrorState } from '@shared/ui/error-state/error-state';
import { EYE, EYE_SLASH } from '@shared/ui/glyph-urls';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';
import { NotifyService } from '@shared/ui/notify/notify';
import { PAGE_CHROME } from '@shared/ui/page-chrome/page-chrome';
import { SkeletonRows } from '@shared/ui/skeleton-rows/skeleton-rows';

/* A client-side hint; the server has the final say. */
const USERNAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,62}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface UserDraft {
  username: string;
  email: string;
  password: string;
}

@Component({
  selector: 'app-users-page',
  imports: [
    Callout,
    ErrorState,
    FieldStatus,
    FormField,
    InsetGroup,
    IonBackButton,
    IonButton,
    IonButtons,
    IonInput,
    IonInputPasswordToggle,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonPopover,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    PAGE_CHROME,
    PULL_REFRESH,
    SkeletonRows,
  ],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button defaultHref="/settings" /></ion-buttons>
        <ion-title>Users</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-refresher [appRefresh]="pull"><ion-refresher-content /></ion-refresher>

      <div class="mx-auto max-w-(--app-column)">
        @if (users.error() && !users.hasLoaded()) {
          <app-error-state class="m-5 block" [message]="users.error()!" (retry)="users.load()" />
        } @else {
          @if (users.loading() && !users.hasLoaded()) {
            <app-inset-group label="Accounts">
              <app-skeleton-rows variant="member" label="Loading users" />
            </app-inset-group>
          } @else {
            <app-inset-group label="Accounts" [trailing]="summary()">
              @for (user of users.items(); track user.id) {
                <ion-item [class.muted]="user.disabled">
                  <span slot="start" class="avatar" aria-hidden="true">{{
                    user.username.slice(0, 2)
                  }}</span>
                  <ion-label>
                    {{ user.username }}
                    @if (user.disabled) {
                      <span class="tag">· disabled</span>
                    }
                  </ion-label>
                  <ion-note>{{ user.email }}</ion-note>
                  <span slot="end" class="role" [attr.data-role]="user.role">{{
                    user.role === 'admin' ? 'Admin' : 'User'
                  }}</span>
                  @if (user.id !== session.user()?.id) {
                    <ion-button
                      slot="end"
                      fill="clear"
                      color="medium"
                      [disabled]="users.busy()"
                      [attr.aria-label]="'Actions for ' + user.username"
                      (click)="openActions($event, user)"
                    >
                      <span
                        slot="icon-only"
                        class="icon-[regular--ellipsis]"
                        aria-hidden="true"
                      ></span>
                    </ion-button>
                  } @else {
                    <span slot="end" class="tag you">you</span>
                  }
                </ion-item>
              }
              <ion-item>
                <button
                  type="button"
                  class="disclose"
                  [attr.aria-expanded]="adding()"
                  (click)="adding.set(!adding())"
                >
                  Add user…
                </button>
              </ion-item>
              <ion-note>
                Changing someone’s role, or disabling them, signs them out everywhere.
              </ion-note>
            </app-inset-group>
          }

          @if (adding()) {
            @if (users.createError(); as message) {
              <app-callout class="m-5" tone="negative" role="alert">{{ message }}</app-callout>
            }

            <app-inset-group label="New user">
              <ion-item>
                <ion-input
                  label="Username"
                  labelPlacement="stacked"
                  autocomplete="off"
                  autocapitalize="off"
                  [spellcheck]="false"
                  [formField]="draft.username"
                />
              </ion-item>
              <ion-item>
                <ion-input
                  label="Email"
                  labelPlacement="stacked"
                  type="email"
                  autocomplete="off"
                  autocapitalize="off"
                  [spellcheck]="false"
                  [formField]="draft.email"
                />
              </ion-item>
              <ion-item>
                <ion-input
                  label="Password"
                  labelPlacement="stacked"
                  type="password"
                  placeholder="At least 8 characters"
                  autocomplete="new-password"
                  [formField]="draft.password"
                >
                  <ion-input-password-toggle
                    slot="end"
                    color="medium"
                    [showIcon]="eye"
                    [hideIcon]="eyeSlash"
                  />
                </ion-input>
              </ion-item>
              <ion-item>
                <ion-select
                  label="Role"
                  interface="popover"
                  [value]="draftRole()"
                  [disabled]="users.busy()"
                  (ionChange)="draftRole.set($event.detail.value)"
                >
                  <ion-select-option value="user">user</ion-select-option>
                  <ion-select-option value="admin">admin</ion-select-option>
                </ion-select>
              </ion-item>
              <ion-item button [detail]="false" [disabled]="users.busy()" (click)="create()">
                <ion-label color="primary">Create user</ion-label>
                @if (users.busy()) {
                  <ion-spinner slot="end" name="lines-small" />
                }
              </ion-item>
            </app-inset-group>
          }
        }
      </div>

      <ion-popover
        [attr.aria-label]="menu() ? 'Actions for ' + menu()!.user.username : null"
        [isOpen]="menuOpen()"
        [event]="menu()?.event"
        [dismissOnSelect]="true"
        (didDismiss)="menuOpen.set(false)"
      >
        <ng-template>
          @if (menu(); as open) {
            <ion-list [attr.aria-label]="'Actions for ' + open.user.username">
              <p class="menu-title">{{ open.user.username }}</p>
              <ion-item button lines="full" [detail]="false" (click)="toggleRole(open.user)">
                <ion-label>{{ open.user.role === 'admin' ? 'Make user' : 'Make admin' }}</ion-label>
                <span slot="end" class="icon-[light--user]" aria-hidden="true"></span>
              </ion-item>
              <ion-item button lines="none" [detail]="false" (click)="toggleDisabled(open.user)">
                <ion-label>{{
                  open.user.disabled ? 'Enable account' : 'Disable account'
                }}</ion-label>
                <span slot="end" class="icon-[light--ban]" aria-hidden="true"></span>
              </ion-item>
              <ion-item
                button
                lines="none"
                class="menu-delete"
                [detail]="false"
                (click)="deleteUser(open.user)"
              >
                <ion-label color="danger">Delete</ion-label>
                <span slot="end" class="text-danger icon-[light--trash]" aria-hidden="true"></span>
              </ion-item>
            </ion-list>
          }
        </ng-template>
      </ion-popover>
    </ion-content>
  `,
  styles: `
    .menu-title {
      margin: 0;
      padding: 0.75rem 1.25rem 0.5rem;
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--app-text-tertiary);
    }

    ion-popover ion-item {
      --min-height: 3rem;
      --padding-start: 1.25rem;
      --inner-padding-end: 1.25rem;
      font-size: 1.0625rem;
    }

    .menu-delete {
      border-block-start: 0.375rem solid var(--app-fill);
    }

    /* Operator's call: a known AA contrast exception; do not copy it elsewhere. */
    .muted {
      opacity: 0.55;
    }

    .avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      inline-size: 2.25rem;
      block-size: 2.25rem;
      border-radius: 999px;
      background: var(--app-accent-soft);
      color: var(--app-accent-text);
      font-size: 0.8125rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .tag {
      font-size: 0.875rem;
      font-weight: 400;
      color: var(--app-text-tertiary);
    }

    /* Same width as the actions button, so role badges line up down the list. */
    .you {
      inline-size: 2.75rem;
      text-align: center;
    }

    .role {
      border-radius: 0.625rem;
      padding: 0.1875rem 0.5625rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--app-text-secondary);
      background: var(--app-background-neutral-1);
    }

    .role[data-role='admin'] {
      color: var(--app-accent-text);
      background: var(--app-accent-soft);
    }
  `,
})
export class UsersPage {
  protected readonly eye = EYE;
  protected readonly eyeSlash = EYE_SLASH;
  protected readonly users = inject(ManageUsersStore);
  protected readonly session = inject(SessionStore);
  private readonly confirmations = inject(ConfirmActionService);
  private readonly notifications = inject(NotifyService);

  private readonly model = signal<UserDraft>({ username: '', email: '', password: '' });
  protected readonly draftRole = signal<UserRole>('user');

  protected readonly pull: PullRefreshSource = {
    busy: this.users.loading,
    trigger: () => this.users.load(),
  };

  protected readonly draft = form(this.model, (path) => {
    required(path.username, { message: 'Username is required.' });
    pattern(path.username, USERNAME_PATTERN, {
      message: 'Use 1–63 letters, numbers, dots, underscores or hyphens.',
    });
    required(path.email, { message: 'Email is required.' });
    pattern(path.email, EMAIL_PATTERN, { message: 'Enter a valid email address.' });
    required(path.password, { message: 'Password is required.' });
    minLength(path.password, 8, { message: 'Passwords need at least 8 characters.' });
  });

  protected readonly summary = computed(() => {
    const users = this.users.items();
    const disabled = users.filter((user) => user.disabled).length;
    return disabled ? `${users.length} · ${disabled} disabled` : String(users.length);
  });

  protected readonly menu = signal<{ readonly user: User; readonly event: Event } | null>(null);
  /* Separate from menu() so the popover keeps its rows while it animates out. */
  protected readonly menuOpen = signal(false);
  protected readonly adding = signal(false);

  constructor() {
    /* The route-provided store outlives this page: read fresh, forget the last visit's error. */
    this.users.clearCreateError();
    this.users.load();
  }

  protected openActions(event: Event, user: User): void {
    this.menu.set({ user, event });
    this.menuOpen.set(true);
  }

  protected create(): void {
    /* Signal Forms requires a promise-returning submit action. */
    void submit(this.draft, async () => {
      const draft = this.model();
      this.users
        .create({
          username: draft.username.trim(),
          email: draft.email.trim(),
          password: draft.password,
          role: this.draftRole(),
        })
        .subscribe((user) => {
          if (!user) return;
          this.notifications.success(`${user.username} created.`);
          /* reset(), not a model write: submit left every field touched. */
          this.draft().reset({ username: '', email: '', password: '' });
          this.draftRole.set('user');
          this.adding.set(false);
          this.users.load();
        });
    });
  }

  protected toggleRole(user: User): void {
    const role: UserRole = user.role === 'admin' ? 'user' : 'admin';
    this.confirmSensitive(
      `Make ${user.username} ${role === 'admin' ? 'an administrator' : 'a regular user'}?`,
      'Changing the role signs them out everywhere.',
      role === 'admin' ? 'Make admin' : 'Make user',
    )
      .pipe(switchMap(() => this.users.update(user, { role }, `${user.username} is now ${role}.`)))
      .subscribe((result) => this.complete(result));
  }

  protected toggleDisabled(user: User): void {
    if (user.disabled) {
      this.users
        .update(user, { disabled: false }, `${user.username} enabled.`)
        .subscribe((result) => this.complete(result));
      return;
    }

    this.confirmSensitive(
      `Disable ${user.username}?`,
      'They are signed out everywhere and cannot sign in until re-enabled.',
      'Disable account',
    )
      .pipe(
        switchMap(() => this.users.update(user, { disabled: true }, `${user.username} disabled.`)),
      )
      .subscribe((result) => this.complete(result));
  }

  protected deleteUser(user: User): void {
    this.confirmSensitive(
      `Delete ${user.username}?`,
      'The account is removed permanently. Their projects and tasks stay.',
      'Delete user',
      true,
    )
      .pipe(switchMap(() => this.users.delete(user)))
      .subscribe((result) => this.complete(result));
  }

  private confirmSensitive(
    title: string,
    message: string,
    confirmLabel: string,
    destructive = false,
  ) {
    return this.confirmations
      .confirm({ title, message, confirmLabel, destructive })
      .pipe(filter(Boolean));
  }

  private complete(result: CommandResult): void {
    this.notifications.result(result);
    if (result.success) this.users.load();
  }
}
