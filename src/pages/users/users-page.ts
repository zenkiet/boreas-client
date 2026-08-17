import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormField, form, minLength, pattern, required, submit } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { TuiButton, TuiDataList, TuiDropdown, TuiError, TuiIcon, TuiLoader } from '@taiga-ui/core';
import { TuiToastService } from '@taiga-ui/kit';
import { TuiAppBar } from '@taiga-ui/layout';
import { filter, switchMap, take } from 'rxjs';

import { User, UserRole } from '@entities/user';
import { SessionStore } from '@features/auth';
import { ManageUsersStore, UserCommandResult } from '@features/manage-users';
import { Reveal } from '@shared/lib/motion/reveal.directive';
import { registerPullRefresh } from '@shared/lib/pull-to-refresh/pull-to-refresh';
import { BackLink } from '@shared/ui/back-link/back-link';
import { Callout } from '@shared/ui/callout/callout';
import { ConfirmActionService } from '@shared/ui/confirm-action/confirm-action';
import { ErrorState } from '@shared/ui/error-state/error-state';
import { GlassSelect, GlassSelectOption } from '@shared/ui/glass-select/glass-select';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';
import { SkeletonRows } from '@shared/ui/skeleton-rows/skeleton-rows';

/* Matches common backend username constraints; the server has the final say. */
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
    BackLink,
    Callout,
    DatePipe,
    ErrorState,
    FormField,
    GlassSelect,
    InsetGroup,
    Reveal,
    SkeletonRows,
    RouterLink,
    TuiAppBar,
    TuiButton,
    TuiDataList,
    TuiDropdown,
    TuiError,
    TuiIcon,
    TuiLoader,
  ],
  providers: [ManageUsersStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div appReveal class="mx-auto grid w-full max-w-[40rem] grid-cols-1 gap-3.5 md:gap-4">
      <!-- The scroll edge prevents content showing through Taiga's transparent app bar. -->
      <div
        class="scroll-edge sticky top-0 z-10 -mx-4 -mt-[max(1rem,env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] md:hidden"
      >
        <tui-app-bar tuiAppBarSize>
          <a tuiSlot="start" tuiAppBarBack routerLink="/settings" aria-label="Back to settings"></a>
          Users
        </tui-app-bar>
      </div>

      <div class="hidden md:block">
        <app-back-link link="/settings" label="Settings" />
        <h1 class="page-title mt-1.5">Users</h1>
      </div>

      <h1 class="page-title md:hidden">Users</h1>

      @if (users.error() && !users.hasLoaded()) {
        <app-error-state [message]="users.error()!" (retry)="users.load()" />
      } @else {
        @if (users.loading() && !users.hasLoaded()) {
          <!-- The form below is local and stays live; only the account rows wait. -->
          <app-inset-group label="Users">
            <app-skeleton-rows variant="member" label="Loading users" />
          </app-inset-group>
        } @else {
          <app-inset-group label="Users" [trailing]="summary()">
          @for (user of users.users(); track user.id) {
            <div class="row row-divider relative" [class.row--disabled]="user.disabled">
              <span class="row__avatar" aria-hidden="true">{{ user.username.slice(0, 2) }}</span>
              <span class="min-w-0 flex-1">
                <span class="row__name">
                  {{ user.username }}
                  @if (user.disabled) {
                    <span class="row__muted">· disabled</span>
                  }
                </span>
                <span class="row__sub">{{ user.email }} · joined {{ user.createdAt | date: 'MMM y' }}</span>
              </span>
              <span class="row__role" [attr.data-role]="user.role">{{ user.role }}</span>

              @if (user.id !== session.user()?.id) {
                <button
                  tuiIconButton
                  type="button"
                  size="s"
                  appearance="flat-grayscale"
                  [attr.aria-label]="'Actions for ' + user.username"
                  [tuiDropdown]="menu"
                >
                  <tui-icon class="icon-sm" icon="@tui.ellipsis" />
                </button>
                <ng-template #menu>
                  <tui-data-list class="menu">
                    <tui-opt-group>
                      <button tuiOption type="button" [disabled]="users.busy()" (click)="toggleRole(user)">
                        {{ user.role === 'admin' ? 'Make user' : 'Make admin' }}
                      </button>
                      <button tuiOption type="button" [disabled]="users.busy()" (click)="toggleDisabled(user)">
                        {{ user.disabled ? 'Enable account' : 'Disable account' }}
                      </button>
                    </tui-opt-group>
                    <tui-opt-group>
                      <button
                        tuiOption
                        type="button"
                        class="menu__destructive"
                        [disabled]="users.busy()"
                        (click)="deleteUser(user)"
                      >
                        Delete
                      </button>
                    </tui-opt-group>
                  </tui-data-list>
                </ng-template>
              } @else {
                <span class="row__muted">you</span>
              }
            </div>
          }
          </app-inset-group>
        }

        <div>
          <app-inset-group label="New user">
            <form class="grid grid-cols-1" novalidate (submit)="onSubmit($event)">
              @if (users.createError(); as message) {
                <div class="p-3">
                  <app-callout tone="negative" role="alert">{{ message }}</app-callout>
                </div>
              }

              <div class="frow row-divider relative">
                <label class="frow__label" for="user-username">Username</label>
                <input
                  id="user-username"
                  class="frow__input"
                  autocomplete="off"
                  autocapitalize="off"
                  spellcheck="false"
                  [formField]="draft.username"
                />
                @if (fieldError(draft.username()); as message) {
                  <tui-error [error]="message" />
                }
              </div>

              <div class="frow row-divider relative">
                <label class="frow__label" for="user-email">Email</label>
                <input
                  id="user-email"
                  class="frow__input"
                  type="email"
                  autocomplete="off"
                  autocapitalize="off"
                  spellcheck="false"
                  [formField]="draft.email"
                />
                @if (fieldError(draft.email()); as message) {
                  <tui-error [error]="message" />
                }
              </div>

              <div class="frow row-divider relative">
                <label class="frow__label" for="user-password">Password</label>
                <input
                  id="user-password"
                  class="frow__input"
                  type="password"
                  autocomplete="new-password"
                  [formField]="draft.password"
                />
                @if (fieldError(draft.password()); as message) {
                  <tui-error [error]="message" />
                }
              </div>

              <div class="frow frow--inline row-divider relative">
                <span class="frow__inline-label">Role</span>
                <app-glass-select
                  ariaLabel="Role"
                  [options]="roleOptions"
                  [value]="draftRole()"
                  [disabled]="users.busy()"
                  (valueChange)="pickRole($event)"
                />
              </div>

              <div class="row-divider relative flex justify-end p-3">
                <button tuiButton type="submit" size="s" appearance="primary" [disabled]="users.busy()">
                  @if (users.busy()) {
                    <tui-loader size="s" [inheritColor]="true" />
                  }
                  Create user
                </button>
              </div>
            </form>
          </app-inset-group>
          <p class="footnote">
            Changing a password or role, or disabling an account, signs that user out everywhere.
          </p>
        </div>
      }
    </div>
  `,
  styles: `
    .page-title {
      margin: 0;
      font-size: 2.125rem;
      font-weight: 700;
      line-height: 1.2;
      letter-spacing: -0.022em;
      color: var(--tui-text-primary);
    }

    .row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.6875rem 1rem;
      min-block-size: 3.5rem;
    }

    .row--disabled .row__name,
    .row--disabled .row__sub {
      color: var(--tui-text-tertiary);
    }

    .row__avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      inline-size: 1.875rem;
      block-size: 1.875rem;
      flex: none;
      border-radius: 999px;
      background: var(--app-accent-soft);
      color: var(--app-accent-text);
      font-size: 0.6875rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .row__name {
      display: block;
      overflow: hidden;
      font-size: 1rem;
      font-weight: 600;
      color: var(--tui-text-primary);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .row__sub {
      display: block;
      overflow: hidden;
      font-size: 0.8125rem;
      color: var(--tui-text-tertiary);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .row__muted {
      font-size: 0.8125rem;
      font-weight: 400;
      color: var(--tui-text-tertiary);
    }

    .row__role {
      flex: none;
      border-radius: 999px;
      padding: 0.125rem 0.5625rem;
      font-size: 0.6875rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--tui-text-tertiary);
      background: var(--tui-background-neutral-1);
    }

    .row__role[data-role='admin'] {
      color: var(--tui-status-warning);
      background: var(--tui-status-warning-pale);
    }

    .menu {
      inline-size: 12rem;
    }

    .menu__destructive {
      color: var(--tui-status-negative);
    }

    .frow {
      display: grid;
      gap: 0.125rem;
      padding: 0.625rem 1rem;
      transition: background-color var(--tui-duration);
    }

    .frow:focus-within {
      background: var(--tui-background-neutral-1);
    }

    .frow--inline {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      min-block-size: 3rem;
    }

    .frow__label {
      font-size: 0.8125rem;
      color: var(--tui-text-tertiary);
    }

    .frow__inline-label {
      flex: 1;
      font-size: 1.0625rem;
      color: var(--tui-text-primary);
    }

    .frow__input {
      inline-size: 100%;
      margin: 0;
      border: 0;
      padding: 0;
      background: none;
      font: inherit;
      font-size: 1.0625rem;
      color: var(--tui-text-primary);
    }

    .frow__input:focus {
      outline: none;
    }

    .footnote {
      margin: 0;
      padding: 0.5rem 1rem 0;
      font-size: 0.8125rem;
      line-height: 1.5;
      color: var(--tui-text-tertiary);
    }
  `,
})
export class UsersPage {
  protected readonly users = inject(ManageUsersStore);
  protected readonly session = inject(SessionStore);
  private readonly confirmations = inject(ConfirmActionService);
  private readonly toasts = inject(TuiToastService);

  private readonly model = signal<UserDraft>({ username: '', email: '', password: '' });
  protected readonly draftRole = signal<UserRole>('user');

  protected readonly roleOptions: readonly GlassSelectOption[] = [
    { value: 'user', label: 'user' },
    { value: 'admin', label: 'admin' },
  ];

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
    const total = this.users.users().length;
    return `${total} ${total === 1 ? 'account' : 'accounts'}`;
  });

  constructor() {
    registerPullRefresh({ busy: this.users.loading, trigger: () => this.users.load() });
  }

  protected pickRole(value: string): void {
    this.draftRole.set(value as UserRole);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();

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
          this.notify(`${user.username} created.`, true);
          this.model.set({ username: '', email: '', password: '' });
          this.draftRole.set('user');
          this.users.load();
        });
    });
  }

  protected toggleRole(user: User): void {
    const role: UserRole = user.role === 'admin' ? 'user' : 'admin';
    this.confirmSensitive(
      `Make ${user.username} ${role === 'admin' ? 'an administrator' : 'a regular user'}?`,
      'Changing the role signs them out everywhere.',
      `Change role`,
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
      .pipe(switchMap(() => this.users.update(user, { disabled: true }, `${user.username} disabled.`)))
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

  private confirmSensitive(title: string, message: string, confirmLabel: string, destructive = false) {
    return this.confirmations
      .confirm({ title, message, confirmLabel, destructive })
      .pipe(filter(Boolean));
  }

  private complete(result: UserCommandResult): void {
    this.notify(result.message, result.success);
    if (result.success) this.users.load();
  }

  /* tui-error renders a generic fallback for any non-null empty value. */
  protected fieldError(state: {
    touched: () => boolean;
    errors: () => readonly { readonly message?: string }[];
  }): string | null {
    if (!state.touched()) return null;
    return state.errors()[0]?.message ?? null;
  }

  private notify(message: string, success: boolean): void {
    this.toasts
      .open(message, { appearance: success ? 'positive' : 'negative' })
      .pipe(take(1))
      .subscribe();
  }
}
