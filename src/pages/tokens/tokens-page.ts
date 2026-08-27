import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TuiButton, TuiIcon } from '@taiga-ui/core';
import { TuiAppBar } from '@taiga-ui/layout';
import { filter, switchMap } from 'rxjs';

import { ApiToken, isRevocable } from '@entities/api-token';
import { ManageTokensStore } from '@features/manage-tokens';
import { TokenList } from '@features/manage-tokens';
import { Reveal } from '@shared/lib/motion/reveal.directive';
import { registerPullRefresh } from '@shared/lib/pull-to-refresh/pull-to-refresh';
import { BackLink } from '@shared/ui/back-link/back-link';
import { Callout } from '@shared/ui/callout/callout';
import { ConfirmActionService } from '@shared/ui/confirm-action/confirm-action';
import { EmptyState } from '@shared/ui/empty-state/empty-state';
import { ErrorState } from '@shared/ui/error-state/error-state';
import { GlassIconButton } from '@shared/ui/glass-icon-button/glass-icon-button';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';
import { NotifyService } from '@shared/ui/notify/notify';
import { SkeletonRows } from '@shared/ui/skeleton-rows/skeleton-rows';

@Component({
  selector: 'app-tokens-page',
  imports: [
    BackLink,
    Callout,
    EmptyState,
    ErrorState,
    GlassIconButton,
    InsetGroup,
    Reveal,
    RouterLink,
    SkeletonRows,
    TokenList,
    TuiAppBar,
    TuiButton,
    TuiIcon,
  ],
  providers: [ManageTokensStore],
  template: `
    <div appReveal class="mx-auto grid w-full max-w-160 grid-cols-1 gap-3.5 md:gap-4">
      <!-- The scroll edge prevents content showing through Taiga's transparent app bar. -->
      <div
        class="scroll-edge sticky top-0 z-10 -mx-4 -mt-[max(1rem,env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] md:hidden"
      >
        <tui-app-bar tuiAppBarSize>
          <a tuiSlot="start" tuiAppBarBack routerLink="/settings" aria-label="Back to settings"></a>
          API tokens
          <a
            tuiSlot="end"
            appGlassIconButton
            icon="@tui.plus"
            routerLink="/settings/tokens/new"
            aria-label="New token"
          ></a>
        </tui-app-bar>
      </div>

      <div class="hidden md:block">
        <app-back-link link="/settings" label="Settings" />
        <div class="mt-1.5 flex items-center justify-between gap-3">
          <h1 class="page-title">API tokens</h1>
          <a tuiButton routerLink="/settings/tokens/new" size="s" appearance="primary">
            <tui-icon class="icon-sm" icon="@tui.plus" />
            New token
          </a>
        </div>
      </div>

      <h1 class="page-title md:hidden">API tokens</h1>

      @if (tokens.sessionRequired()) {
        <app-callout tone="info">
          Token management needs a signed-in session. Sign in with your username and password to list
          or revoke tokens.
        </app-callout>
      } @else if (tokens.error() && !tokens.hasLoaded()) {
        <app-error-state [message]="tokens.error()!" (retry)="tokens.load()" />
      } @else if (!tokens.hasLoaded()) {
        <app-inset-group label="Tokens">
          <app-skeleton-rows variant="task" label="Loading tokens" />
        </app-inset-group>
      } @else {
        <div>
          <app-inset-group label="Tokens" [trailing]="summary()">
            @if (tokens.tokens().length === 0) {
              <app-empty-state
                icon="@tui.key-round"
                title="No tokens yet"
                description="Create a token so a pipeline can deploy to Boreas without your password."
                [bordered]="false"
              />
            } @else {
              <app-token-list
                [tokens]="visible()"
                [busy]="tokens.busy()"
                (revokeRequested)="revoke($event)"
              />

              @if (live().length === 0 && !showHistory()) {
                <app-empty-state
                  icon="@tui.key-round"
                  title="No live tokens"
                  description="Every token you have made is revoked or expired."
                  [bordered]="false"
                />
              }

              @if (past().length > 0) {
                <button type="button" class="history" (click)="toggleHistory()">
                  {{ showHistory() ? 'Hide' : 'Show' }} {{ past().length }} revoked and expired
                </button>
              }
            }
          </app-inset-group>
          <p class="footnote">
            A token is shown in full only once, when it is created. Revoking is permanent, but the
            API keeps the record — Boreas cannot delete it outright.
          </p>
        </div>
      }
    </div>
  `,
  styles: `
    /* Tailwind has no preflight, so reset the button's user-agent styles here. */
    .history {
      display: block;
      inline-size: 100%;
      margin: 0;
      border: 0;
      border-block-start: 1px solid var(--tui-border-normal);
      padding: 0.8125rem 1rem;
      background: none;
      font: inherit;
      font-size: 0.9375rem;
      font-weight: 500;
      color: var(--tui-text-action);
      text-align: start;
      cursor: pointer;
    }

    .history:hover {
      background: var(--tui-background-neutral-1);
    }
  `,
})
export class TokensPage {
  protected readonly tokens = inject(ManageTokensStore);
  private readonly confirmations = inject(ConfirmActionService);
  private readonly notifications = inject(NotifyService);

  /* The API has no hard delete, so history is hidden rather than removed. */
  protected readonly showHistory = signal(false);

  protected readonly live = computed(() => this.tokens.tokens().filter(isRevocable));
  protected readonly past = computed(() => this.tokens.tokens().filter((t) => !isRevocable(t)));

  protected readonly visible = computed(() =>
    this.showHistory() ? this.tokens.tokens() : this.live(),
  );

  protected readonly summary = computed(() => {
    const total = this.live().length;
    return `${total} live`;
  });

  protected toggleHistory(): void {
    this.showHistory.update((shown) => !shown);
  }

  constructor() {
    registerPullRefresh({ busy: this.tokens.loading, trigger: () => this.tokens.load() });
  }

  protected revoke(token: ApiToken): void {
    this.confirmations
      .confirm({
        title: `Revoke ${token.name}?`,
        message: 'Anything using this token stops working immediately. This cannot be undone.',
        confirmLabel: 'Revoke token',
        destructive: true,
      })
      .pipe(
        filter(Boolean),
        switchMap(() => this.tokens.revoke(token)),
      )
      .subscribe((result) => {
        this.notifications.result(result);
        if (result.success) this.tokens.load();
      });
  }
}
