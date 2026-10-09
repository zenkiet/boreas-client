import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonBackButton } from '@ionic/angular/ion-back-button';
import { IonButton } from '@ionic/angular/ion-button';
import { IonButtons } from '@ionic/angular/ion-buttons';
import { IonItem } from '@ionic/angular/ion-item';
import { IonNote } from '@ionic/angular/ion-note';
import { IonRouterLink } from '@ionic/angular/ion-router-link';
import { filter, switchMap } from 'rxjs';

import { ApiToken, isRevocable } from '@entities/api-token';
import { ManageTokensStore, TokenList } from '@features/manage-tokens';
import { ServerConfigStore } from '@shared/config/server-config.store';
import { PULL_REFRESH, PullRefreshSource } from '@shared/lib/pull-to-refresh/pull-to-refresh';
import { Callout } from '@shared/ui/callout/callout';
import { ConfirmActionService } from '@shared/ui/confirm-action/confirm-action';
import { EmptyState } from '@shared/ui/empty-state/empty-state';
import { ErrorState } from '@shared/ui/error-state/error-state';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';
import { clipboardCopy, SymbolGlyph } from '@shared/ui/motion/symbol';
import { NotifyService } from '@shared/ui/notify/notify';
import { PAGE_CHROME } from '@shared/ui/page-chrome/page-chrome';
import { SkeletonRows } from '@shared/ui/skeleton-rows/skeleton-rows';

@Component({
  selector: 'app-tokens-page',
  imports: [
    Callout,
    EmptyState,
    ErrorState,
    InsetGroup,
    IonBackButton,
    IonButton,
    IonButtons,
    IonItem,
    IonNote,
    IonRouterLink,
    PAGE_CHROME,
    PULL_REFRESH,
    RouterLink,
    SkeletonRows,
    SymbolGlyph,
    TokenList,
  ],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button defaultHref="/settings" /></ion-buttons>
        <ion-title>API tokens</ion-title>
        <ion-buttons slot="end" class="narrow-only">
          <ion-button routerLink="/settings/tokens/new" aria-label="New token">
            <span slot="icon-only" class="icon-[regular--plus]" aria-hidden="true"></span>
          </ion-button>
        </ion-buttons>
        <ion-buttons slot="end" class="wide-only">
          <ion-button class="act act--primary" fill="solid" routerLink="/settings/tokens/new">
            <span slot="start" class="icon-[regular--plus]" aria-hidden="true"></span>
            New token
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-refresher [appRefresh]="pull"><ion-refresher-content /></ion-refresher>

      <div class="mx-auto max-w-(--app-column)">
        @if (tokens.sessionRequired()) {
          <app-callout class="m-5" tone="info">
            Token management needs a signed-in session. Sign in with your username and password to
            list or revoke tokens.
          </app-callout>
        } @else if (tokens.error() && !tokens.hasLoaded()) {
          <app-error-state class="m-5 block" [message]="tokens.error()!" (retry)="tokens.load()" />
        } @else if (!tokens.hasLoaded()) {
          <app-inset-group label="Tokens">
            <app-skeleton-rows variant="task" label="Loading tokens" />
          </app-inset-group>
        } @else {
          <app-inset-group label="Tokens" [trailing]="summary()">
            @if (tokens.tokens().length === 0) {
              <app-empty-state
                icon="icon-[light--key]"
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
                  icon="icon-[light--key]"
                  title="No live tokens"
                  description="Every token you have made is revoked or expired."
                  [bordered]="false"
                />
              }

              @if (past().length > 0) {
                <ion-item>
                  <button
                    type="button"
                    class="disclose"
                    [attr.aria-expanded]="showHistory()"
                    (click)="showHistory.set(!showHistory())"
                  >
                    {{ showHistory() ? 'Hide' : 'Show' }} {{ past().length }} revoked and expired
                  </button>
                </ion-item>
              }
            }
            <ion-note>
              A token appears in full only once, when you create it. Revoking is permanent; the
              record stays so you can see what existed.
            </ion-note>
          </app-inset-group>
        }

        <app-inset-group label="Use it from a pipeline">
          <div class="px-4 pt-3.5 pb-2" role="listitem">
            <!-- Focusable: it scrolls sideways, and a keyboard has to reach it to scroll it. -->
            <pre class="example" tabindex="0">{{ example() }}</pre>
            <ion-button fill="clear" class="copy" (click)="exampleCopy.copy(example())">
              <app-symbol
                slot="start"
                [name]="exampleCopy.copied() ? 'icon-[light--check] text-ok' : 'icon-[light--copy]'"
              />
              Copy example
            </ion-button>
          </div>
          <ion-note
            >Deploys take an immutable digest only. Each result shows up in Activity.</ion-note
          >
        </app-inset-group>
      </div>
    </ion-content>
  `,
  styles: `
    .example {
      margin: 0;
      padding: 0.75rem 0.875rem;
      border-radius: 0.875rem;
      background: var(--app-code-bg);
      font-family: var(--app-font-mono);
      font-size: 0.75rem;
      line-height: 1.1875rem;
      color: var(--app-text-secondary);
      overflow-x: auto;
      white-space: pre;
    }

    ion-button.copy {
      min-block-size: 0;
      block-size: 2.75rem;
      margin: 0.375rem 0 0;
      --padding-start: 0.25rem;
      --padding-end: 0.25rem;
      --button-font-size: 0.9375rem;
      font-weight: 500;
    }

    ion-button.copy [class*='icon-['] {
      font-size: 1.125rem;
    }
  `,
})
export class TokensPage {
  protected readonly tokens = inject(ManageTokensStore);
  private readonly confirmations = inject(ConfirmActionService);
  private readonly notifications = inject(NotifyService);
  private readonly config = inject(ServerConfigStore);

  protected readonly exampleCopy = clipboardCopy(() =>
    this.notifications.failure('The example could not be copied to the clipboard.'),
  );

  /* Built here, not in the template: a template literal would eat the shell's backslashes. */
  protected readonly example = computed(() =>
    [
      'curl -X POST \\',
      `  ${this.config.baseUrl()}/api/v1/projects/<project>/tasks/<task>/deploy \\`,
      '  -H "Authorization: Bearer <token>" \\',
      `  -d '{"image":"ghcr.io/…@sha256:…"}'`,
    ].join('\n'),
  );

  /* The API has no hard delete, so history is hidden rather than removed. */
  protected readonly showHistory = signal(false);

  protected readonly pull: PullRefreshSource = {
    busy: this.tokens.loading,
    trigger: () => this.tokens.load(),
  };

  protected readonly live = computed(() => this.tokens.tokens().filter(isRevocable));
  protected readonly past = computed(() => this.tokens.tokens().filter((t) => !isRevocable(t)));

  protected readonly visible = computed(() =>
    this.showHistory() ? this.tokens.tokens() : this.live(),
  );

  protected readonly summary = computed(() => `${this.tokens.liveCount()} live`);

  constructor() {
    /* The route-provided store outlives this page: read fresh on every visit. */
    this.tokens.load();
  }

  protected revoke(token: ApiToken): void {
    this.confirmations
      .confirm({
        title: `Revoke ${token.name}?`,
        message: 'Anything using this token stops working immediately. This can’t be undone.',
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
