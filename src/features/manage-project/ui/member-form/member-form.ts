import { Component, computed, input, linkedSignal, output, signal } from '@angular/core';
import { IonInput } from '@ionic/angular/ion-input';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonSelect } from '@ionic/angular/ion-select';
import { IonSelectOption } from '@ionic/angular/ion-select-option';

import { AddMemberInput, Member, PROJECT_ROLES, ProjectRole, ROLE_LABEL } from '@entities/project';
import { User } from '@entities/user';

@Component({
  selector: 'app-member-form',
  imports: [IonInput, IonItem, IonLabel, IonSelect, IonSelectOption],
  template: `
    <div class="form">
      <!-- An empty picker would open onto nothing. -->
      @if (candidates()?.length === 0) {
        <ion-item>
          <ion-label class="ion-text-wrap none">
            Everyone with an active account is already listed. New accounts are made in
            Settings&nbsp;›&nbsp;Users.
          </ion-label>
        </ion-item>
      } @else {
        <!-- Non-admins cannot resolve usernames to ids, so they paste the user id. -->
        @if (candidates(); as list) {
          <ion-item>
            <ion-select
              label="User"
              interface="popover"
              placeholder="Select a user…"
              [value]="draftUserId()"
              [disabled]="busy()"
              (ionChange)="draftUserId.set($event.detail.value)"
            >
              @for (user of list; track user.id) {
                <ion-select-option [value]="user.id">{{ user.username }}</ion-select-option>
              }
            </ion-select>
          </ion-item>
        } @else {
          <ion-item>
            <ion-input
              label="User ID"
              placeholder="UUID"
              autocomplete="off"
              autocapitalize="off"
              [spellcheck]="false"
              [value]="draftUserId()"
              (ionInput)="draftUserId.set(($event.detail.value ?? '').trim())"
            />
          </ion-item>
        }

        <span class="vsep" aria-hidden="true"></span>

        <ion-item>
          <ion-select
            label="Role"
            interface="popover"
            [value]="draftRole()"
            [disabled]="busy()"
            (ionChange)="draftRole.set($event.detail.value)"
          >
            @for (role of roles(); track role) {
              <ion-select-option [value]="role">{{ roleLabel[role] }}</ion-select-option>
            }
          </ion-select>
        </ion-item>

        <ion-item
          button
          class="add"
          [detail]="false"
          [disabled]="busy() || !draftUserId()"
          (click)="add()"
        >
          <ion-label color="primary">{{ addLabel() }}</ion-label>
        </ion-item>
      }
    </div>
  `,
  styles: `
    /* Container query: the task page's Access list is half a pane on iPad. */
    :host {
      display: block;
      container-type: inline-size;
    }

    .vsep {
      display: none;
    }

    .none {
      font-size: 0.9375rem;
      color: var(--app-text-secondary);
    }

    @container (min-width: 36rem) {
      .form {
        display: flex;
        align-items: center;
        padding-inline-end: 0.75rem;
      }

      .vsep {
        display: block;
        flex: none;
        inline-size: 1px;
        block-size: 1.5rem;
        background: var(--app-border-normal);
      }

      ion-item {
        flex: 1;
        --inner-border-width: 0;
      }

      ion-item.add {
        flex: none;
        --background: var(--ion-color-primary);
        --border-radius: 1.25rem;
        --padding-start: 1.125rem;
        --inner-padding-end: 1.125rem;
      }

      /* The theme's 52px list-row minimum outranks --min-height; the part does not. */
      ion-item.add::part(native) {
        min-height: 2.5rem;
      }

      ion-item.add ion-label {
        margin-block: 0;
        font-size: 0.9375rem;
        font-weight: 600;
        color: var(--ion-color-primary-contrast) !important;
      }
    }
  `,
})
export class MemberForm {
  /** Who already holds access, so the picker only offers the rest. */
  readonly members = input.required<readonly Member[]>();
  /** null when the viewer may not list users; the form falls back to a raw id field. */
  readonly users = input.required<readonly User[] | null>();
  readonly busy = input(false);
  /** Grants reuse this form with the owner rung removed. */
  readonly roles = input<readonly ProjectRole[]>(PROJECT_ROLES);
  readonly defaultRole = input<ProjectRole>('member');
  readonly addLabel = input('Add');
  readonly addRequested = output<AddMemberInput>();

  protected readonly roleLabel = ROLE_LABEL;
  protected readonly draftUserId = signal('');
  protected readonly draftRole = linkedSignal(() => this.defaultRole());

  protected readonly candidates = computed(() => {
    const users = this.users();
    if (!users) return null;

    const taken = new Set(this.members().map((member) => member.userId));
    return users.filter((user) => !taken.has(user.id) && !user.disabled);
  });

  protected add(): void {
    const userId = this.draftUserId();
    if (!userId) return;

    this.addRequested.emit({ userId, role: this.draftRole() });
    this.draftUserId.set('');
    this.draftRole.set(this.defaultRole());
  }
}
