import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { IonButton } from '@ionic/angular/ion-button';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonNote } from '@ionic/angular/ion-note';

import { ApiToken, isRevocable } from '@entities/api-token';

@Component({
  selector: 'app-token-list',
  imports: [DatePipe, IonButton, IonItem, IonLabel, IonNote],
  template: `
    @for (token of tokens(); track token.id) {
      <ion-item [class.dead]="!revocable(token)">
        <span slot="start" class="dot" [attr.data-status]="token.status" aria-hidden="true"></span>
        <ion-label
          ><span class="name">{{ token.name }}</span></ion-label
        >
        <ion-note>{{ describe(token) }}</ion-note>

        <!-- Not a swipe action: a lone destructive action must show on every pointer type. -->
        @if (revocable(token)) {
          <ion-button
            slot="end"
            fill="clear"
            color="danger"
            class="revoke"
            [disabled]="busy()"
            [attr.aria-label]="'Revoke ' + token.name"
            (click)="revokeRequested.emit(token)"
          >
            Revoke
          </ion-button>
        } @else {
          <ion-note slot="end" class="created tabular">{{
            token.createdAt | date: 'MMM d'
          }}</ion-note>
        }
      </ion-item>
    }
  `,
  styles: `
    .name {
      font-family: var(--app-font-mono);
      font-size: 0.9375rem;
      line-height: 1.25rem;
      font-weight: 600;
    }

    .dead .name {
      color: var(--app-text-tertiary);
    }

    .revoke {
      font-size: 0.9375rem;
      font-weight: 500;
    }

    /* The theme pins slotted end notes to the top of the row. */
    .created {
      align-self: center !important;
      font-size: 0.875rem;
    }

    .dot {
      inline-size: 0.5rem;
      block-size: 0.5rem;
      border-radius: 999px;
      background: var(--app-status-neutral);
    }

    .dead .dot {
      opacity: 0.6;
    }

    .dot[data-status='active'] {
      background: var(--app-status-positive);
    }

    .dot[data-status='scheduled'] {
      background: var(--app-status-info);
    }
  `,
})
export class TokenList {
  readonly tokens = input.required<readonly ApiToken[]>();
  readonly busy = input(false);
  readonly revokeRequested = output<ApiToken>();

  protected readonly revocable = isRevocable;

  /* Status alone reads as jargon; the date it turns on is what operators check. */
  protected describe(token: ApiToken): string {
    const format = (date: Date) =>
      date.toLocaleDateString('en', { month: 'short', day: 'numeric' });

    switch (token.status) {
      case 'active': {
        /* "Active · " would push the countdown past one line at 390; days left already says it. */
        const days = Math.ceil((token.validTo.getTime() - Date.now()) / 86_400_000);
        return `Expires ${format(token.validTo)} · ${days} ${days === 1 ? 'day' : 'days'} left`;
      }
      case 'scheduled':
        return `Scheduled · starts ${format(token.validFrom)} → ${format(token.validTo)}`;
      case 'expired':
        return `Expired ${format(token.validTo)}`;
      case 'revoked':
        return token.revokedAt ? `Revoked ${format(token.revokedAt)}` : 'Revoked';
    }
  }
}
