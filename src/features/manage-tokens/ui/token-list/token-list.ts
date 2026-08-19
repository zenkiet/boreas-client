import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { TuiButton, TuiIcon } from '@taiga-ui/core';

import { ApiToken, isRevocable } from '@entities/api-token';

@Component({
  selector: 'app-token-list',
  imports: [DatePipe, TuiButton, TuiIcon],
  template: `
    @for (token of tokens(); track token.id) {
      <div class="row row-divider relative" [class.row--dead]="!revocable(token)">
        <span class="dot" [attr.data-status]="token.status" aria-hidden="true"></span>
        <span class="min-w-0 flex-1">
          <span class="row__name">{{ token.name }}</span>
          <span class="row__sub">{{ describe(token) }}</span>
        </span>

        <!-- Resident, not revealed: one action with nothing to trade places with, and a
             swipe-only strip is invisible to a mouse and undiscoverable on a finger. -->
        @if (revocable(token)) {
          <button
            tuiButton
            type="button"
            size="s"
            appearance="flat-destructive"
            [disabled]="busy()"
            [attr.aria-label]="'Revoke ' + token.name"
            (click)="revokeRequested.emit(token)"
          >
            <tui-icon class="icon-sm" icon="@tui.ban" />
            Revoke
          </button>
        } @else {
          <span class="row__meta tabular">{{ token.createdAt | date: 'MMM d' }}</span>
        }
      </div>
    }
  `,
  styles: `
    .row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.6875rem 1rem;
      min-block-size: 3.5rem;
    }

    .row--dead .row__name {
      color: var(--tui-text-tertiary);
    }

    .dot {
      inline-size: 0.4375rem;
      block-size: 0.4375rem;
      flex: none;
      border-radius: 999px;
      background: var(--tui-status-neutral);
    }

    .dot[data-status='active'] {
      background: var(--tui-status-positive);
    }

    .dot[data-status='scheduled'] {
      background: var(--tui-status-info);
    }

    .dot[data-status='revoked'] {
      background: var(--tui-status-negative);
    }

    .row__name {
      display: block;
      overflow: hidden;
      font-family: var(--app-font-mono);
      font-size: 1rem;
      font-weight: 600;
      color: var(--tui-text-primary);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .row__sub {
      display: block;
      font-size: 0.8125rem;
      color: var(--tui-text-tertiary);
    }

    .row__meta {
      flex: none;
      font-size: 0.8125rem;
      color: var(--tui-text-tertiary);
    }
  `,
})
export class TokenList {
  readonly tokens = input.required<readonly ApiToken[]>();
  readonly busy = input(false);
  readonly revokeRequested = output<ApiToken>();

  protected revocable(token: ApiToken): boolean {
    return isRevocable(token);
  }

  /* Status alone reads as jargon; the date it turns on is what operators check. */
  protected describe(token: ApiToken): string {
    const format = (date: Date) =>
      date.toLocaleDateString('en', { month: 'short', day: 'numeric' });

    switch (token.status) {
      case 'active':
        return `Active · expires ${format(token.validTo)}`;
      case 'scheduled':
        return `Scheduled · starts ${format(token.validFrom)} → ${format(token.validTo)}`;
      case 'expired':
        return `Expired ${format(token.validTo)}`;
      case 'revoked':
        return token.revokedAt ? `Revoked ${format(token.revokedAt)}` : 'Revoked';
    }
  }
}
