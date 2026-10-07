import { Component, computed, inject, input, linkedSignal } from '@angular/core';
import { IonButton } from '@ionic/angular/ion-button';
import { IonButtons } from '@ionic/angular/ion-buttons';
import { IonContent } from '@ionic/angular/ion-content';
import { IonDatetime } from '@ionic/angular/ion-datetime';
import { IonDatetimeButton } from '@ionic/angular/ion-datetime-button';
import { IonFooter } from '@ionic/angular/ion-footer';
import { IonHeader } from '@ionic/angular/ion-header';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonModal } from '@ionic/angular/ion-modal';
import { IonSelect } from '@ionic/angular/ion-select';
import { IonSelectOption } from '@ionic/angular/ion-select-option';
import { IonTitle } from '@ionic/angular/ion-title';
import { IonToggle } from '@ionic/angular/ion-toggle';
import { IonToolbar } from '@ionic/angular/ion-toolbar';
import { ModalController } from '@ionic/angular/modal-controller';

import { InsetGroup } from '@shared/ui/inset-group/inset-group';
import { SHEET_DONE } from '@shared/ui/sheet/sheet.service';
import { AlertFilter, localDay, matchesFilter } from '../../model/alert-filter';
import { ProjectAlert } from '../../model/list-alerts.store';

const DAY_MS = 86_400_000;

/** Only Show commits the draft; a swipe discards it. */
@Component({
  selector: 'app-alert-filter-sheet',
  imports: [
    InsetGroup,
    IonButton,
    IonButtons,
    IonContent,
    IonDatetime,
    IonDatetimeButton,
    IonFooter,
    IonHeader,
    IonItem,
    IonLabel,
    IonModal,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToggle,
    IonToolbar,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button (click)="reset()">Reset</ion-button>
        </ion-buttons>
        <ion-title>Filters</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <app-inset-group>
        <ion-item>
          <ion-select
            label="Project"
            interface="popover"
            [value]="project()"
            (ionChange)="project.set($event.detail.value)"
          >
            <ion-select-option value="">All projects</ion-select-option>
            @for (option of projects(); track option.slug) {
              <ion-select-option [value]="option.slug">{{ option.name }}</ion-select-option>
            }
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-toggle [checked]="!!range()" (ionChange)="toggleRange($event.detail.checked)">
            Date range
          </ion-toggle>
        </ion-item>
        @if (range()) {
          <ion-item>
            <ion-label>From</ion-label>
            <ion-datetime-button slot="end" datetime="alert-filter-from" />
          </ion-item>
          <ion-item>
            <ion-label>To</ion-label>
            <ion-datetime-button slot="end" datetime="alert-filter-to" />
          </ion-item>
        }
      </app-inset-group>

      <ion-modal [keepContentsMounted]="true" aria-label="From date">
        <ng-template>
          <ion-datetime
            id="alert-filter-from"
            presentation="date"
            [min]="min"
            [max]="range()?.to ?? today"
            [value]="range()?.from"
            (ionChange)="setDay('from', $event.detail.value)"
          />
        </ng-template>
      </ion-modal>
      <ion-modal [keepContentsMounted]="true" aria-label="To date">
        <ng-template>
          <ion-datetime
            id="alert-filter-to"
            presentation="date"
            [min]="range()?.from ?? min"
            [max]="today"
            [value]="range()?.to"
            (ionChange)="setDay('to', $event.detail.value)"
          />
        </ng-template>
      </ion-modal>
    </ion-content>

    <ion-footer>
      <div class="px-5 pt-3 pb-6">
        <ion-button expand="block" class="cta" (click)="apply()">
          Show {{ count() }} {{ count() === 1 ? 'event' : 'events' }}
        </ion-button>
      </div>
    </ion-footer>
  `,
})
export class AlertFilterSheet {
  private readonly modals = inject(ModalController);

  readonly alerts = input.required<readonly ProjectAlert[]>();
  /** Values are slugs, the feed's key; labels are names. */
  readonly projects = input.required<readonly { readonly slug: string; readonly name: string }[]>();
  readonly value = input.required<AlertFilter>();

  protected readonly today = localDay(new Date());
  /* Alerts live in the past, so the window ends today and reaches a year back. */
  protected readonly min = localDay(new Date(Date.now() - 365 * DAY_MS));

  protected readonly project = linkedSignal(() => this.value().project);
  protected readonly range = linkedSignal(() => this.value().range);

  private readonly draft = computed<AlertFilter>(() => ({
    project: this.project(),
    range: this.range(),
  }));

  protected readonly count = computed(
    () => this.alerts().filter((alert) => matchesFilter(alert, this.draft())).length,
  );

  protected toggleRange(on: boolean): void {
    this.range.set(
      on ? { from: localDay(new Date(Date.now() - 6 * DAY_MS)), to: this.today } : null,
    );
  }

  protected setDay(edge: 'from' | 'to', value: string | string[] | null | undefined): void {
    const range = this.range();
    if (!range || typeof value !== 'string') return;
    this.range.set({ ...range, [edge]: value.slice(0, 10) });
  }

  protected reset(): void {
    this.project.set('');
    this.range.set(null);
  }

  protected apply(): void {
    void this.modals.dismiss(this.draft(), SHEET_DONE);
  }
}
