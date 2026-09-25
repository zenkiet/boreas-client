import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { IonButton } from '@ionic/angular/ion-button';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonNote } from '@ionic/angular/ion-note';
import { IonSelect } from '@ionic/angular/ion-select';
import { IonSelectOption } from '@ionic/angular/ion-select-option';

import type { SelectCustomEvent } from '@ionic/angular';

import { GRANTABLE_ROLES, Member, ProjectRole, ROLE_LABEL } from '@entities/project';

/** The raw event rides along so the page can snap the select back when the change is refused. */
export interface MemberRoleChange {
  readonly member: Member;
  readonly event: SelectCustomEvent<ProjectRole>;
}

@Component({
  selector: 'app-member-list',
  imports: [DatePipe, IonButton, IonItem, IonLabel, IonNote, IonSelect, IonSelectOption],
  template: `
    @for (member of members(); track member.userId) {
      <ion-item>
        <span slot="start" class="avatar" aria-hidden="true">{{
          member.username.slice(0, 2)
        }}</span>
        <ion-label class="cols">
          <span>{{ member.username }}</span>
          <span class="joined pad"
            >{{ joined(member) }} {{ member.createdAt | date: 'MMM y' }}</span
          >
        </ion-label>
        <ion-note class="phone"
          >{{ joined(member) }} {{ member.createdAt | date: 'MMM y' }}</ion-note
        >
        <!-- The owner holds the project; there is no row action that could take that away. -->
        @if (member.role === 'owner') {
          <span slot="end" class="role phone">{{ roleLabel[member.role] }}</span>
          <span slot="end" class="role-text pad">{{ roleLabel[member.role] }}</span>
        } @else {
          <ion-select
            slot="end"
            interface="popover"
            class="role-select"
            [value]="member.role"
            [disabled]="busy()"
            [attr.aria-label]="'Role for ' + member.username"
            (ionChange)="roleChange.emit({ member, event: $event })"
          >
            @for (role of roles; track role) {
              <ion-select-option [value]="role">{{ roleLabel[role] }}</ion-select-option>
            }
          </ion-select>
          <ion-button
            slot="end"
            fill="clear"
            color="medium"
            [disabled]="busy()"
            [attr.aria-label]="'Remove ' + member.username"
            (click)="removeRequested.emit(member)"
          >
            <span slot="icon-only" class="icon-[light--trash]" aria-hidden="true"></span>
          </ion-button>
        }
      </ion-item>
    }
  `,
  styles: `
    /* Columns follow the list's own width: the task page's Access list is half a pane on iPad. */
    :host {
      display: block;
      container-type: inline-size;
    }

    .pad {
      display: none;
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

    @container (min-width: 36rem) {
      .phone {
        display: none;
      }

      .pad {
        display: revert;
      }

      .cols {
        display: grid;
        inline-size: 100% !important;
        grid-template-columns: minmax(0, 1fr) 10.5rem;
        align-items: center;
        gap: 1rem;
      }

      .cols > :first-child {
        font-weight: 600;
      }

      .joined {
        font-size: 0.875rem;
        font-weight: 400;
        color: var(--app-text-tertiary);
      }

      .role-text {
        inline-size: 6.875rem;
        font-size: 0.9375rem;
        color: var(--app-text-secondary);
        text-align: end;
      }
    }

    .role-select {
      font-size: 0.9375rem;
      color: var(--app-text-secondary);
    }

    .role {
      border-radius: 999px;
      padding: 0.1875rem 0.5625rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--app-text-secondary);
      background: var(--app-background-neutral-1);
    }
  `,
})
export class MemberList {
  readonly members = input.required<readonly Member[]>();
  readonly busy = input(false);
  readonly dateVerb = input('Joined');
  /** The signed-in user's id: their own row reads "You · joined Aug 2026". */
  readonly selfId = input('');
  readonly removeRequested = output<Member>();
  readonly roleChange = output<MemberRoleChange>();

  /* Owner is not offered: the grant API rejects it and a second owner is not a row edit. */
  protected readonly roles = GRANTABLE_ROLES;
  protected readonly roleLabel = ROLE_LABEL;

  protected joined(member: Member): string {
    return member.userId === this.selfId()
      ? `You · ${this.dateVerb().toLowerCase()}`
      : this.dateVerb();
  }
}
