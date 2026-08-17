import { Component, computed, inject, signal } from '@angular/core';
import { FormField, form, required, submit } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { TuiButton, TuiError, TuiLoader, TuiTextfield } from '@taiga-ui/core';

import { LoginStore } from '@features/auth';
import { AuthTokenStore } from '@shared/api/auth-token.store';
import { ServerConfigStore } from '@shared/config/server-config.store';
import { Reveal } from '@shared/lib/motion/reveal.directive';
import { Callout } from '@shared/ui/callout/callout';

interface LoginDraft {
  username: string;
  password: string;
}

@Component({
  selector: 'app-login-page',
  imports: [Callout, FormField, Reveal, RouterLink, TuiButton, TuiError, TuiLoader, TuiTextfield],
  providers: [LoginStore],
  template: `
    <main appReveal class="login">
      <div class="login__card">
        <img
          class="login__mark"
          src="/brand-mark.png"
          width="72"
          height="72"
          alt=""
          aria-hidden="true"
        />

        <div class="login__head">
          <h1 class="login__title">Sign in to Boreas</h1>
          <p class="login__server">
            <span class="font-mono">{{ serverHost() }}</span>
            <a class="login__change" routerLink="/welcome">Change</a>
          </p>
        </div>

        <form class="login__form" novalidate (submit)="onSubmit($event)">
          @if (login.error(); as message) {
            <app-callout tone="negative" role="alert">{{ message }}</app-callout>
          }

          <tui-textfield [tuiTextfieldCleaner]="false">
            <label tuiLabel [for]="ids.username">Username</label>
            <input
              tuiInput
              autocomplete="username"
              autocapitalize="off"
              spellcheck="false"
              [id]="ids.username"
              [formField]="draft.username"
            />
          </tui-textfield>
          <tui-error [error]="usernameError()" />

          <tui-textfield [tuiTextfieldCleaner]="false">
            <label tuiLabel [for]="ids.password">Password</label>
            <input
              tuiInput
              type="password"
              autocomplete="current-password"
              [id]="ids.password"
              [formField]="draft.password"
            />
          </tui-textfield>
          <tui-error [error]="passwordError()" />

          <button
            tuiButton
            type="submit"
            size="m"
            appearance="primary"
            class="login__submit"
            [disabled]="login.signingIn()"
          >
            @if (login.signingIn()) {
              <tui-loader size="s" [inheritColor]="true" />
              Signing in
            } @else {
              Sign in
            }
          </button>
        </form>
      </div>
    </main>
  `,
  styles: `
    .login {
      display: grid;
      place-items: center;
      min-block-size: 100dvh;
      padding: max(1.5rem, env(safe-area-inset-top)) 1.25rem
        max(1.5rem, env(safe-area-inset-bottom));
    }

    .login__card {
      display: grid;
      justify-items: center;
      gap: 1.25rem;
      inline-size: min(21rem, 100%);
    }

    .login__mark {
      inline-size: 4.5rem;
      block-size: 4.5rem;
    }

    .login__head {
      display: grid;
      justify-items: center;
      gap: 0.25rem;
      text-align: center;
    }

    .login__title {
      margin: 0;
      font-size: 1.375rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--tui-text-primary);
    }

    .login__server {
      display: inline-flex;
      align-items: baseline;
      gap: 0.5rem;
      margin: 0;
      font-size: 0.8125rem;
      color: var(--tui-text-tertiary);
    }

    .login__change {
      color: var(--tui-text-action);
      text-decoration: none;
    }

    .login__form {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 0.625rem;
      inline-size: 100%;
    }

    .login__submit {
      margin-block-start: 0.375rem;
    }
  `,
})
export class LoginPage {
  protected readonly login = inject(LoginStore);
  private readonly config = inject(ServerConfigStore);
  private readonly tokens = inject(AuthTokenStore);
  private readonly router = inject(Router);

  protected readonly ids = { username: 'login-username', password: 'login-password' };

  private readonly model = signal<LoginDraft>({ username: '', password: '' });

  protected readonly draft = form(this.model, (path) => {
    required(path.username, { message: 'Username is required.' });
    required(path.password, { message: 'Password is required.' });
  });

  protected readonly serverHost = computed(() => this.config.baseUrl().replace(/^https?:\/\//, ''));

  constructor() {
    /* A live token means this visit is a back-navigation, not a sign-in. */
    if (this.tokens.authenticated()) {
      void this.router.navigate(['/projects']);
    }
  }

  protected readonly usernameError = computed(() => this.firstError(this.draft.username()));
  protected readonly passwordError = computed(() => this.firstError(this.draft.password()));

  protected onSubmit(event: Event): void {
    event.preventDefault();

    /* Signal Forms requires a promise-returning submit action. */
    void submit(this.draft, async () => {
      const draft = this.model();
      this.login
        .signIn({ username: draft.username.trim(), password: draft.password })
        .subscribe((success) => {
          if (success) void this.router.navigate(['/projects']);
        });
    });
  }

  /* tui-error renders a generic fallback for any non-null empty value. */
  private firstError(state: {
    touched: () => boolean;
    errors: () => readonly { readonly message?: string }[];
  }): string | null {
    if (!state.touched()) return null;
    return state.errors()[0]?.message ?? null;
  }
}
