import { Component, inject, signal } from '@angular/core';
import { IonButton } from '@ionic/angular/ion-button';
import { IonButtons } from '@ionic/angular/ion-buttons';
import { IonContent } from '@ionic/angular/ion-content';
import { IonHeader } from '@ionic/angular/ion-header';
import { IonInput } from '@ionic/angular/ion-input';
import { IonItem } from '@ionic/angular/ion-item';
import { IonNote } from '@ionic/angular/ion-note';
import { IonSpinner } from '@ionic/angular/ion-spinner';
import { IonTitle } from '@ionic/angular/ion-title';
import { IonToolbar } from '@ionic/angular/ion-toolbar';
import { ModalController } from '@ionic/angular/modal-controller';

import { Callout } from '@shared/ui/callout/callout';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';
import { SHEET_DONE } from '@shared/ui/sheet/sheet.service';
import { ConnectServerStore } from '../../model/connect-server.store';

@Component({
  selector: 'app-change-server-sheet',
  imports: [
    Callout,
    InsetGroup,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonNote,
    IonSpinner,
    IonTitle,
    IonToolbar,
  ],
  providers: [ConnectServerStore],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button (click)="cancel()">Cancel</ion-button>
        </ion-buttons>
        <ion-title>Change server</ion-title>
        <ion-buttons slot="end">
          <ion-button
            type="submit"
            form="change-server-form"
            fill="solid"
            color="primary"
            [disabled]="connection.checking() || !url().trim()"
          >
            @if (connection.checking()) {
              <ion-spinner name="lines-small" aria-label="Checking" />
            } @else {
              Connect
            }
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <form id="change-server-form" (submit)="connect($event)">
        @if (failed()) {
          <app-callout class="m-5" tone="negative" role="alert">
            No Boreas API answered at this address. Check it and try again.
          </app-callout>
        }

        <app-inset-group>
          <ion-item>
            <ion-input
              label="Server address"
              labelPlacement="stacked"
              class="font-mono"
              type="url"
              autocomplete="off"
              autocapitalize="off"
              placeholder="https://boreas.example.com"
              [spellcheck]="false"
              [value]="url()"
              (ionInput)="typeUrl($event.detail.value)"
            />
          </ion-item>
          <ion-note>
            Boreas checks the address answers as a Boreas API before switching. A different server
            signs you out.
          </ion-note>
        </app-inset-group>
      </form>
    </ion-content>
  `,
})
export class ChangeServerSheet {
  private readonly modals = inject(ModalController);
  protected readonly connection = inject(ConnectServerStore);

  protected readonly url = signal(this.connection.suggestedUrl());
  protected readonly failed = signal(false);

  protected typeUrl(value: string | null | undefined): void {
    this.url.set(value ?? '');
    this.failed.set(false);
  }

  protected cancel(): void {
    void this.modals.dismiss();
  }

  protected connect(event: Event): void {
    event.preventDefault();
    const url = this.url().trim();
    if (!url || this.connection.checking()) return;

    /* connect() persists the address itself once the health check passes. */
    this.connection.connect(url).subscribe((healthy) => {
      if (healthy) {
        void this.modals.dismiss(url, SHEET_DONE);
      } else {
        this.failed.set(true);
      }
    });
  }
}
