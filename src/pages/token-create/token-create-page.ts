import { DOCUMENT } from '@angular/common';
import {
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { IonButton } from '@ionic/angular/ion-button';
import { IonButtons } from '@ionic/angular/ion-buttons';
import { IonRouterOutlet } from '@ionic/angular/ion-router-outlet';
import { IonSpinner } from '@ionic/angular/ion-spinner';
import { NavController } from '@ionic/angular/nav-controller';
import { defer, from } from 'rxjs';

import { CreateApiTokenInput, CreatedApiToken } from '@entities/api-token';
import { ManageTokensStore, TokenForm } from '@features/manage-tokens';
import { wideScreen } from '@shared/ui/breakpoint/wide-screen';
import { NotifyService } from '@shared/ui/notify/notify';
import { PAGE_CHROME } from '@shared/ui/page-chrome/page-chrome';

const FORMAT: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };

@Component({
  selector: 'app-token-create-page',
  imports: [IonButton, IonButtons, IonSpinner, PAGE_CHROME, TokenForm],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        @if (!created()) {
          <ion-buttons slot="start">
            <ion-button [attr.aria-label]="wide() ? null : 'Cancel'" (click)="finish()">
              @if (wide()) {
                Cancel
              } @else {
                <span slot="icon-only" class="icon-[regular--xmark]" aria-hidden="true"></span>
              }
            </ion-button>
          </ion-buttons>
        }
        <ion-title>New token</ion-title>
        @if (!created()) {
          <ion-buttons slot="end">
            <!-- Never validity-disabled: submitting empty fields must reveal their errors. -->
            <ion-button
              type="submit"
              fill="solid"
              color="primary"
              form="create-token-form"
              [attr.aria-label]="wide() ? null : 'Create token'"
              [disabled]="tokens.busy()"
            >
              @if (wide()) {
                Create
              } @else {
                <span slot="icon-only" class="icon-[regular--check]" aria-hidden="true"></span>
              }
            </ion-button>
          </ion-buttons>
        }
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <div class="mx-auto max-w-(--app-column)">
        @if (created(); as result) {
          <!-- Nothing here is dismissible: the plaintext exists only in this response. -->
          <div class="hero" role="alert">
            <span class="hero__mark" aria-hidden="true"
              ><span class="icon-[regular--check]"></span
            ></span>
            <h2>Copy it now</h2>
            <p>
              This is the only time
              <span class="font-mono text-[14px]">{{ result.apiToken.name }}</span> is shown in
              full. Store it in your CI secrets.
            </p>
          </div>

          <div class="reveal">
            <!-- The whole string selects on one tap: the only copy path besides the button. -->
            <code class="token">{{ result.token }}</code>
            <p class="reveal__when tabular">{{ validity() }}</p>
          </div>

          <div class="mx-5 mt-[22px] grid gap-2.5">
            <ion-button #copyButton expand="block" class="cta" (click)="copy(result.token)">
              <span
                slot="start"
                [class]="copied() ? 'icon-[regular--check]' : 'icon-[regular--copy]'"
                aria-hidden="true"
              ></span>
              {{ copied() ? 'Copied' : 'Copy token' }}
            </ion-button>
            <ion-button expand="block" fill="clear" class="done" (click)="finish()">
              Done
            </ion-button>
          </div>
        } @else {
          <app-token-form
            formId="create-token-form"
            [creating]="tokens.busy()"
            [error]="tokens.createError()"
            (submitted)="createToken($event)"
          />
          <!-- Never validity-disabled: submitting empty fields must reveal their errors. -->
          <div class="mx-5 mt-6 mb-10">
            <ion-button
              type="submit"
              form="create-token-form"
              expand="block"
              class="cta"
              [disabled]="tokens.busy()"
            >
              @if (tokens.busy()) {
                <ion-spinner name="lines-small" />
              } @else {
                Create token
              }
            </ion-button>
          </div>
        }
      </div>
    </ion-content>
  `,
  styles: `
    ion-button.done {
      min-block-size: 3.25rem;
      font-size: 1.0625rem;
      font-weight: 500;
    }

    .hero {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 1.5rem 1.25rem 0;
      text-align: center;
    }

    .hero__mark {
      display: grid;
      place-items: center;
      inline-size: 3.75rem;
      block-size: 3.75rem;
      margin-block-end: 0.875rem;
      border-radius: 999px;
      background: var(--app-status-positive-pale);
      color: var(--app-status-positive);
      font-size: 1.875rem;
    }

    .hero h2 {
      margin: 0 0 0.375rem;
      font-size: 1.375rem;
      line-height: 1.75rem;
      font-weight: 700;
    }

    .hero p {
      margin: 0;
      font-size: 0.9375rem;
      line-height: 1.3125rem;
      color: var(--app-text-secondary);
    }

    .reveal {
      margin: 1.375rem 1.25rem 0;
      padding: 1rem;
      border-radius: 1.375rem;
      background: var(--ion-item-background);
    }

    .token {
      display: block;
      padding: 0.875rem;
      border-radius: 0.875rem;
      background: var(--app-code-bg);
      font-family: var(--app-font-mono);
      font-size: 0.875rem;
      line-height: 1.3125rem;
      word-break: break-all;
      user-select: all;
    }

    .reveal__when {
      margin: 0.625rem 0 0;
      font-size: 0.8125rem;
      color: var(--app-text-tertiary);
    }
  `,
})
export class TokenCreatePage {
  protected readonly wide = wideScreen();
  protected readonly tokens = inject(ManageTokensStore);
  private readonly document = inject(DOCUMENT);
  private readonly notifications = inject(NotifyService);
  private readonly navCtrl = inject(NavController);
  private readonly outlet = inject(IonRouterOutlet, { optional: true });
  private readonly copyButton = viewChild('copyButton', { read: ElementRef });

  protected readonly created = signal<CreatedApiToken | undefined>(undefined);
  protected readonly copied = signal(false);

  /* The same "expires" instant the list prints, so the two screens never disagree. */
  protected readonly validity = computed(() => {
    const token = this.created()?.apiToken;
    if (!token) return '';
    const expires = token.validTo.toLocaleDateString('en', FORMAT);
    return token.status === 'scheduled'
      ? `Starts ${token.validFrom.toLocaleDateString('en', FORMAT)} · expires ${expires}`
      : `Active today · expires ${expires}`;
  });

  constructor() {
    /* The store outlives this page: the last visit's "already exists" must not greet this one. */
    this.tokens.clearCreateError();

    /* Create left with the form: focus Copy's native button, which Stencil renders a frame late. */
    afterRenderEffect(() => {
      const host: HTMLElement | undefined = this.copyButton()?.nativeElement;
      if (!host) return;
      this.document.defaultView?.requestAnimationFrame(() =>
        host.shadowRoot?.querySelector<HTMLElement>('.button-native')?.focus(),
      );
    });
  }

  ionViewWillLeave(): void {
    if (this.outlet) this.outlet.swipeGesture = true;
  }

  protected createToken(input: CreateApiTokenInput): void {
    this.tokens.create(input).subscribe((result) => {
      if (!result) return;
      this.created.set(result);
      /* A swipe back would lose the plaintext for good. */
      if (this.outlet) this.outlet.swipeGesture = false;
      this.tokens.load();
    });
  }

  protected copy(token: string): void {
    defer(() => from(this.document.defaultView!.navigator.clipboard.writeText(token))).subscribe({
      next: () => this.copied.set(true),
      error: () =>
        this.notifications.failure('The token could not be copied. Select it and copy manually.'),
    });
  }

  protected finish(): void {
    void this.navCtrl.navigateBack(['/settings/tokens']);
  }
}
