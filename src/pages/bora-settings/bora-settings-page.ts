import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { IonBackButton } from '@ionic/angular/ion-back-button';
import { IonButtons } from '@ionic/angular/ion-buttons';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonNote } from '@ionic/angular/ion-note';
import { IonSelect } from '@ionic/angular/ion-select';
import { IonSelectOption } from '@ionic/angular/ion-select-option';
import { IonToggle } from '@ionic/angular/ion-toggle';

import { BoraFigure } from '@entities/bora';
import { BoraStore } from '@features/bora/model';
import { ListProjectsStore } from '@features/list-projects/model';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';
import { PAGE_CHROME } from '@shared/ui/page-chrome/page-chrome';
import { screenReader, voices } from '@shared/ui/speech/speech';

@Component({
  selector: 'app-bora-settings-page',
  imports: [
    BoraFigure,
    InsetGroup,
    IonBackButton,
    IonButtons,
    IonItem,
    IonLabel,
    IonNote,
    IonSelect,
    IonSelectOption,
    IonToggle,
    PAGE_CHROME,
  ],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button defaultHref="/settings" /></ion-buttons>
        <ion-title>Bora</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <div class="mx-auto max-w-(--app-column)">
        <app-inset-group>
          <ion-item class="hero" lines="none">
            <ion-label class="ion-text-wrap">
              <app-bora-figure
                class="figure"
                [size]="96"
                [state]="available() ? 'idle' : 'sleep'"
              />
              <span class="lead">
                Tap Bora to ask about what you’re looking at: what runs, what failed, and how the
                product works.
              </span>
            </ion-label>
          </ion-item>
          @if (!available()) {
            <ion-note>
              Bora isn’t available: this server has no assistant, or you aren’t a member of any
              project.
            </ion-note>
          }
        </app-inset-group>

        <app-inset-group>
          <ion-item>
            <ion-toggle
              [checked]="prefs().show"
              [disabled]="!available()"
              (ionChange)="bora.setPrefs({ show: $event.detail.checked })"
            >
              Show Bora
            </ion-toggle>
          </ion-item>
          <ion-note>
            Hidden, Bora still answers: failures and log lines keep their Ask Bora button.
          </ion-note>
        </app-inset-group>

        <app-inset-group label="Voice">
          <ion-item>
            <ion-select
              label="Language"
              interface="popover"
              [value]="prefs().language"
              [disabled]="!available()"
              (ionChange)="bora.setPrefs({ language: $event.detail.value })"
            >
              <ion-select-option value="en">English</ion-select-option>
              <ion-select-option value="vi">Vietnamese</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-select
              label="Voice"
              interface="popover"
              [value]="prefs().voices[prefs().language] ?? ''"
              [disabled]="!available() || reader()"
              (ionChange)="voice($event.detail.value)"
            >
              <ion-select-option value="">Default</ion-select-option>
              @for (voice of voices(); track voice.id) {
                <ion-select-option [value]="voice.id">{{ voice.name }}</ion-select-option>
              }
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-select
              label="Speed"
              interface="popover"
              [value]="prefs().rate"
              [disabled]="!available() || reader()"
              (ionChange)="bora.setPrefs({ rate: $event.detail.value })"
            >
              <ion-select-option value="slower">Slower</ion-select-option>
              <ion-select-option value="normal">Normal</ion-select-option>
              <ion-select-option value="faster">Faster</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-note>
            {{
              reader()
                ? 'VoiceOver reads Bora’s answers, so Voice and Speed are off.'
                : 'On a phone, tap Bora to talk: it answers aloud (its speaker button mutes it), and typed questions get silent answers.'
            }}
            Your device turns speech into text; Boreas only receives the text.
          </ion-note>
        </app-inset-group>

        <app-inset-group>
          <ion-item>
            <ion-toggle
              class="ion-text-wrap"
              [checked]="prefs().follow"
              [disabled]="!available()"
              (ionChange)="bora.setPrefs({ follow: $event.detail.checked })"
            >
              Keep listening after an answer
            </ion-toggle>
          </ion-item>
          <ion-note>Bora listens 5 seconds after it answers, so a follow-up needs no tap.</ion-note>
        </app-inset-group>
      </div>
    </ion-content>
  `,
  styles: `
    .hero ion-label {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding-block: 1.5rem 1rem;
      text-align: center;
    }

    .lead {
      max-inline-size: 18rem;
      color: var(--app-text-secondary);
    }
  `,
})
export class BoraSettingsPage {
  protected readonly bora = inject(BoraStore);
  private readonly fleet = inject(ListProjectsStore);

  protected readonly prefs = this.bora.prefs;
  protected readonly reader = screenReader();
  private readonly system = toSignal(voices(), { initialValue: [] });
  protected readonly voices = computed(() =>
    this.system().filter(({ language }) =>
      language.toLowerCase().startsWith(this.prefs().language),
    ),
  );
  protected readonly available = computed(() =>
    this.fleet.summaries().some(({ project }) => project.bora),
  );

  protected voice(id: string): void {
    const { voices, language } = this.prefs();
    this.bora.setPrefs({ voices: { ...voices, [language]: id || undefined } });
  }
}
