import { DOCUMENT } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TuiButton, TuiIcon } from '@taiga-ui/core';
import { TuiAppBar } from '@taiga-ui/layout';
import { defer, from } from 'rxjs';

import { CreateApiTokenInput, CreatedApiToken } from '@entities/api-token';
import { ManageTokensStore, TokenForm } from '@features/manage-tokens';
import { Reveal } from '@shared/lib/motion/reveal.directive';
import { BackLink } from '@shared/ui/back-link/back-link';
import { Callout } from '@shared/ui/callout/callout';
import { GlassIconButton } from '@shared/ui/glass-icon-button/glass-icon-button';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';
import { NotifyService } from '@shared/ui/notify/notify';
import { PageHeader } from '@shared/ui/page-header/page-header';

@Component({
  selector: 'app-token-create-page',
  imports: [
    BackLink,
    Callout,
    GlassIconButton,
    InsetGroup,
    PageHeader,
    Reveal,
    RouterLink,
    TokenForm,
    TuiAppBar,
    TuiButton,
    TuiIcon,
  ],
  providers: [ManageTokensStore],
  template: `
    <div appReveal class="mx-auto grid max-w-160 grid-cols-1 gap-3.5 md:gap-4">
      @if (created(); as result) {
        <!-- data-no-reveal throughout: the only copy of the token, and the only exits from
             this screen, must never wait on a tween to become visible or hittable. -->
        <div
          data-no-reveal
          class="scroll-edge sticky top-0 z-10 -mx-4 -mt-[max(1rem,env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] md:hidden"
        >
          <tui-app-bar tuiAppBarSize>
            <a
              tuiSlot="start"
              tuiAppBarBack
              routerLink="/settings/tokens"
              aria-label="Back to tokens"
            ></a>
            Token created
          </tui-app-bar>
        </div>

        <div data-no-reveal class="hidden md:block">
          <app-back-link link="/settings/tokens" label="API tokens" />
          <div class="mt-1.5">
            <app-page-header title="Token created" />
          </div>
        </div>

        <app-callout data-no-reveal tone="warning" role="alert">
          <b>Copy it now — this is the only time it is shown.</b> Boreas stores a hash, not the token;
          if you lose it, create a new one.
        </app-callout>

        <app-inset-group
          data-no-reveal
          [label]="result.apiToken.name"
          [trailing]="validity()"
        >
          <p class="token">{{ result.token }}</p>
        </app-inset-group>

        <button
          data-no-reveal
          tuiButton
          type="button"
          size="m"
          appearance="primary"
          (click)="copy(result.token)"
        >
          <tui-icon class="icon-sm" [icon]="copied() ? '@tui.check' : '@tui.copy'" />
          {{ copied() ? 'Copied' : 'Copy token' }}
        </button>
        <button
          data-no-reveal
          tuiButton
          type="button"
          size="m"
          appearance="secondary"
          (click)="finish()"
        >
          Done
        </button>
      } @else {
        <div
          class="scroll-edge sticky top-0 z-10 -mx-4 -mt-[max(1rem,env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] md:hidden"
        >
          <tui-app-bar tuiAppBarSize>
            <a
              tuiSlot="start"
              tuiAppBarBack
              routerLink="/settings/tokens"
              aria-label="Back to tokens"
            ></a>
            New token
            <!-- Keep validation-enabled: submitting empty fields must reveal their errors. -->
            <button
              tuiSlot="end"
              appGlassIconButton
              icon="@tui.check"
              type="submit"
              form="create-token-form"
              aria-label="Create token"
              [disabled]="tokens.busy()"
            ></button>
          </tui-app-bar>
        </div>

        <div class="hidden md:block">
          <app-back-link link="/settings/tokens" label="API tokens" />
          <div class="mt-1.5">
            <app-page-header
              title="New API token"
              description="For a pipeline to deploy without your password. Valid for at most 90 days."
            />
          </div>
        </div>

        <app-token-form
          formId="create-token-form"
          [creating]="tokens.busy()"
          [error]="tokens.createError()"
          (submitted)="createToken($event)"
        />
      }
    </div>
  `,
  styles: `
    .token {
      margin: 0;
      padding: 0.875rem 1rem;
      background: var(--app-code-bg);
      font-family: var(--app-font-mono);
      font-size: 0.9375rem;
      line-height: 1.7;
      color: var(--tui-text-primary);
      overflow-wrap: anywhere;
    }
  `,
})
export class TokenCreatePage {
  protected readonly tokens = inject(ManageTokensStore);
  private readonly document = inject(DOCUMENT);
  private readonly notifications = inject(NotifyService);
  private readonly router = inject(Router);

  protected readonly created = signal<CreatedApiToken | undefined>(undefined);
  protected readonly copied = signal(false);

  protected validity(): string {
    const result = this.created();
    if (!result) return '';

    const format = (date: Date) =>
      date.toLocaleDateString('en', { month: 'short', day: 'numeric' });

    /* valid_to is the exclusive end instant, so the last usable day is the one before it. */
    const lastDay = new Date(result.apiToken.validTo.getTime() - 86_400_000);

    return `${format(result.apiToken.validFrom)} → ${format(lastDay)}`;
  }

  protected createToken(input: CreateApiTokenInput): void {
    this.tokens.create(input).subscribe((result) => {
      if (result) this.created.set(result);
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
    void this.router.navigate(['/settings/tokens']);
  }

}
