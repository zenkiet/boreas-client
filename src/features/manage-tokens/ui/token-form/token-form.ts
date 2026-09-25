import { Component, computed, input, output, signal } from '@angular/core';
import { FormField, form, pattern, required, submit } from '@angular/forms/signals';
import { IonDatetime } from '@ionic/angular/ion-datetime';
import { IonDatetimeButton } from '@ionic/angular/ion-datetime-button';
import { IonInput } from '@ionic/angular/ion-input';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonModal } from '@ionic/angular/ion-modal';
import { IonNote } from '@ionic/angular/ion-note';
import { IonSegment } from '@ionic/angular/ion-segment';
import { IonSegmentButton } from '@ionic/angular/ion-segment-button';

import { CreateApiTokenInput, MAX_TOKEN_DAYS } from '@entities/api-token';
import { FieldStatus } from '@shared/lib/forms/field-status.directive';
import { Callout } from '@shared/ui/callout/callout';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';

const NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,62}$/;

const PRESETS: readonly number[] = [7, 30, MAX_TOKEN_DAYS];

const DAY_MS = 86_400_000;

let instances = 0;

interface TokenDraft {
  name: string;
}

@Component({
  selector: 'app-token-form',
  imports: [
    Callout,
    FieldStatus,
    FormField,
    InsetGroup,
    IonDatetime,
    IonDatetimeButton,
    IonInput,
    IonItem,
    IonLabel,
    IonModal,
    IonNote,
    IonSegment,
    IonSegmentButton,
  ],
  template: `
    <form novalidate [id]="formId()" (submit)="onSubmit($event)">
      @if (error(); as message) {
        <app-callout class="m-5" tone="negative" role="alert">{{ message }}</app-callout>
      }

      <app-inset-group label="Token">
        <ion-item>
          <ion-input
            label="Name"
            labelPlacement="stacked"
            class="font-mono"
            placeholder="staging-deployer"
            autocomplete="off"
            autocapitalize="off"
            [spellcheck]="false"
            [formField]="draft.name"
          />
        </ion-item>
        <ion-note>Something you will recognise in the list later. It is not a secret.</ion-note>
      </app-inset-group>

      <app-inset-group label="Valid for" [trailing]="dayLabel()">
        <ion-item class="presets">
          <ion-segment
            class="seg-fill seg-pill"
            [value]="presetDays()"
            (ionChange)="applyPreset($event.detail.value)"
          >
            @for (days of presets; track days) {
              <ion-segment-button [value]="days">
                <ion-label>{{ days }} days</ion-label>
              </ion-segment-button>
            }
          </ion-segment>
        </ion-item>
        <ion-item>
          <ion-label>Starts</ion-label>
          <ion-datetime-button slot="end" [datetime]="ids.from">
            <span slot="date-target">{{ fromLabel() }}</span>
          </ion-datetime-button>
        </ion-item>
        <ion-item>
          <ion-label>Ends</ion-label>
          <ion-datetime-button slot="end" [datetime]="ids.to">
            <span slot="date-target">{{ toLabel() }}</span>
          </ion-datetime-button>
        </ion-item>
        <ion-note>Up to {{ maxDays }} days. A window that starts today is active at once.</ion-note>
      </app-inset-group>

      <ion-modal [keepContentsMounted]="true" aria-label="Start date">
        <ng-template>
          <ion-datetime
            presentation="date"
            [id]="ids.from"
            [min]="today"
            [max]="latest"
            [value]="from()"
            (ionChange)="pickFrom($event.detail.value)"
          />
        </ng-template>
      </ion-modal>
      <ion-modal [keepContentsMounted]="true" aria-label="End date">
        <ng-template>
          <ion-datetime
            presentation="date"
            [id]="ids.to"
            [min]="from()"
            [max]="latest"
            [value]="to()"
            (ionChange)="pickTo($event.detail.value)"
          />
        </ng-template>
      </ion-modal>
    </form>
  `,
  styles: `
    .presets {
      --padding-start: 1rem;
      --inner-padding-end: 1rem;
      --padding-top: 0.75rem;
      --padding-bottom: 0.75rem;
    }
  `,
})
export class TokenForm {
  private readonly uid = `token-form-${(instances += 1)}`;

  readonly creating = input(false);
  readonly error = input<string | undefined>(undefined);
  readonly formId = input(this.uid);
  readonly submitted = output<CreateApiTokenInput>();

  protected readonly presets = PRESETS;
  protected readonly maxDays = MAX_TOKEN_DAYS;
  protected readonly ids = { from: `${this.uid}-from`, to: `${this.uid}-to` };

  protected readonly today = localToday();

  /* The window must fit MAX_TOKEN_DAYS counted inclusively, so the last day is +89. */
  protected readonly latest = addDays(this.today, MAX_TOKEN_DAYS - 1);

  private readonly model = signal<TokenDraft>({ name: '' });

  protected readonly from = signal(this.today);
  /* 30 days: long enough for a pipeline, short enough that a leaked token dies soon. */
  protected readonly to = signal(addDays(this.today, 29));

  protected readonly draft = form(this.model, (path) => {
    required(path.name, { message: 'Enter a name.' });
    pattern(path.name, NAME_PATTERN, {
      message: 'Use 1–63 letters, numbers, dots, underscores or hyphens.',
    });
  });

  protected readonly dayCount = computed(
    () => (dayTime(this.to()) - dayTime(this.from())) / DAY_MS + 1,
  );

  protected readonly fromLabel = computed(() =>
    this.from() === this.today ? 'Today' : shortDay(this.from()),
  );

  protected readonly toLabel = computed(() => shortDay(this.to()));

  protected readonly dayLabel = computed(() => {
    const days = this.dayCount();
    return `${days} ${days === 1 ? 'day' : 'days'}`;
  });

  protected readonly presetDays = computed(() =>
    this.from() === this.today ? this.dayCount() : 0,
  );

  protected applyPreset(value: unknown): void {
    const days = Number(value);
    if (!PRESETS.includes(days)) return;

    this.from.set(this.today);
    this.to.set(addDays(this.today, days - 1));
  }

  /* Both pickers stop at today + 89, so no start can stretch the window past the cap. */
  protected pickFrom(value: unknown): void {
    if (typeof value !== 'string') return;

    const day = value.slice(0, 10);
    this.from.set(day);
    if (this.to() < day) this.to.set(day);
  }

  protected pickTo(value: unknown): void {
    if (typeof value === 'string') this.to.set(value.slice(0, 10));
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();

    if (this.creating()) {
      return;
    }

    /* Signal Forms requires a promise-returning submit action. */
    void submit(this.draft, async () => {
      const from = this.from();

      /* Today is still yesterday in UTC east of Greenwich: midnight would leave it scheduled. */
      const validFrom = from === this.today ? new Date() : new Date(dayTime(from));

      /* End from validFrom: exactly dayCount days, never past the API's MAX_TOKEN_DAYS cap. */
      const validTo = new Date(validFrom.getTime() + this.dayCount() * DAY_MS);

      this.submitted.emit({ name: this.model().name.trim(), validFrom, validTo });
    });
  }
}

/* ISO calendar days as UTC midnights, so day arithmetic stays exact across DST shifts. */
function dayTime(day: string): number {
  return Date.parse(`${day}T00:00:00Z`);
}

/* timeZone UTC: a UTC midnight formatted locally shows the day before west of Greenwich. */
function shortDay(day: string): string {
  return new Date(dayTime(day)).toLocaleDateString('en', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function addDays(day: string, days: number): string {
  return new Date(dayTime(day) + days * DAY_MS).toISOString().slice(0, 10);
}

function localToday(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
    .toISOString()
    .slice(0, 10);
}
