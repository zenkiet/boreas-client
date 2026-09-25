import { Component, inject, signal } from '@angular/core';
import { FormField, form, required, submit } from '@angular/forms/signals';
import { IonButton } from '@ionic/angular/ion-button';
import { IonContent } from '@ionic/angular/ion-content';
import { IonInput } from '@ionic/angular/ion-input';
import { IonInputPasswordToggle } from '@ionic/angular/ion-input-password-toggle';
import { IonItem } from '@ionic/angular/ion-item';
import { IonSpinner } from '@ionic/angular/ion-spinner';
import { NavController } from '@ionic/angular/nav-controller';

import { LoginStore } from '@features/auth';
import { ChangeServerService } from '@features/connect-server';
import { AuthTokenStore } from '@shared/api/auth-token.store';
import { ServerConfigStore } from '@shared/config/server-config.store';
import { FieldStatus } from '@shared/lib/forms/field-status.directive';
import { Callout } from '@shared/ui/callout/callout';
import { EYE, EYE_SLASH } from '@shared/ui/glyph-urls';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';

interface LoginDraft {
  username: string;
  password: string;
}

@Component({
  selector: 'app-login-page',
  imports: [
    Callout,
    FieldStatus,
    FormField,
    InsetGroup,
    IonButton,
    IonContent,
    IonInput,
    IonInputPasswordToggle,
    IonItem,
    IonSpinner,
  ],
  providers: [LoginStore],
  template: `
    <!-- The theme pads fullscreen content for a tab bar this chromeless page does not have. -->
    <ion-content [fullscreen]="true" style="--padding-bottom: 0">
      <div class="login">
        <div class="login__brand">
          <img
            class="login__mark"
            src="/brand-mark.png"
            width="76"
            height="76"
            alt=""
            aria-hidden="true"
          />
          <div class="login__head">
            <h1 class="login__title">Sign in to Boreas</h1>
            <p class="login__server">
              <span class="login__host">{{ serverHost() }}</span>
              <button type="button" class="login__change" (click)="changeServer()">Change</button>
            </p>
          </div>
        </div>

        <form class="w-full" novalidate (submit)="onSubmit($event)">
          @if (login.error(); as message) {
            <app-callout class="mx-5 block" tone="negative" role="alert">{{ message }}</app-callout>
          }

          <app-inset-group>
            <ion-item>
              <ion-input
                label="Username"
                labelPlacement="stacked"
                autocomplete="username"
                autocapitalize="off"
                [spellcheck]="false"
                [formField]="draft.username"
              />
            </ion-item>
            <ion-item>
              <ion-input
                label="Password"
                labelPlacement="stacked"
                type="password"
                autocomplete="current-password"
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
          </app-inset-group>

          <div class="mx-5">
            <ion-button type="submit" expand="block" class="cta" [disabled]="login.signingIn()">
              @if (login.signingIn()) {
                <ion-spinner slot="start" name="lines-small" />
                Signing in
              } @else {
                Sign in
              }
            </ion-button>
            <p class="login__foot">
              Accounts live on your server. Forgot your password? Your administrator can reset it.
            </p>
          </div>
        </form>
      </div>
    </ion-content>
  `,
  styles: `
    .login {
      display: grid;
      align-content: center;
      justify-items: center;
      gap: 1.375rem;
      min-block-size: 100%;
      max-inline-size: 24rem;
      margin-inline: auto;
      padding-block: max(1.5rem, env(safe-area-inset-top)) max(1.5rem, env(safe-area-inset-bottom));
    }

    .login__brand {
      display: grid;
      justify-items: center;
      gap: 1.25rem;
    }

    .login__mark {
      inline-size: 4.75rem;
      block-size: 4.75rem;
    }

    .login__head {
      display: grid;
      justify-items: center;
      gap: 0.75rem;
      text-align: center;
    }

    .login__title {
      margin: 0;
      font-size: 1.875rem;
      line-height: 2.25rem;
      font-weight: 700;
    }

    .login__server {
      display: inline-flex;
      align-items: center;
      gap: 0.625rem;
      margin: 0;
      font-size: 0.9375rem;
      color: var(--app-text-tertiary);
    }

    .login__foot {
      margin: 0.875rem 1rem 0;
      font-size: 0.8125rem;
      line-height: 1.125rem;
      color: var(--app-text-tertiary);
      text-align: center;
    }

    .login__host {
      font-family: var(--app-font-mono);
      font-size: 0.875rem;
    }

    /* Tailwind has no preflight, so reset the button-shaped link explicitly. */
    .login__change {
      min-block-size: 2.75rem;
      margin: 0;
      border: 0;
      padding: 0 0.375rem;
      background: none;
      font: inherit;
      font-weight: 500;
      color: var(--ion-color-primary);
      cursor: pointer;
    }
  `,
})
export class LoginPage {
  protected readonly eye = EYE;
  protected readonly eyeSlash = EYE_SLASH;
  private readonly server = inject(ChangeServerService);
  protected readonly login = inject(LoginStore);
  private readonly config = inject(ServerConfigStore);
  private readonly tokens = inject(AuthTokenStore);
  private readonly nav = inject(NavController);

  private readonly model = signal<LoginDraft>({ username: '', password: '' });

  protected readonly draft = form(this.model, (path) => {
    required(path.username, { message: 'Username is required.' });
    required(path.password, { message: 'Password is required.' });
  });

  protected readonly serverHost = this.config.host;

  constructor() {
    /* A live token means this visit is a back-navigation, not a sign-in. */
    if (this.tokens.authenticated()) {
      void this.nav.navigateRoot('/projects');
    }
  }

  /* No result needed: the host line reads the updated config itself. */
  protected changeServer(): void {
    this.server.open().subscribe();
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();

    /* Signal Forms requires a promise-returning submit action. */
    void submit(this.draft, async () => {
      const draft = this.model();
      this.login
        .signIn({ username: draft.username.trim(), password: draft.password })
        .subscribe((success) => {
          /* Root, so the signed-in stack never keeps this page underneath. */
          if (success) void this.nav.navigateRoot('/projects');
        });
    });
  }
}
