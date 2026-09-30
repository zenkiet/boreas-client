import { Component, computed, input, output, signal } from '@angular/core';
import { IonButton } from '@ionic/angular/ion-button';
import { IonInput } from '@ionic/angular/ion-input';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonNote } from '@ionic/angular/ion-note';
import { IonSelect } from '@ionic/angular/ion-select';
import { IonSelectOption } from '@ionic/angular/ion-select-option';

import { InsetGroup } from '@shared/ui/inset-group/inset-group';
import { mountPathError } from '../../model/volume';

type Volumes = Readonly<Record<string, string>>;

@Component({
  selector: 'app-task-volumes',
  imports: [
    InsetGroup,
    IonButton,
    IonInput,
    IonItem,
    IonLabel,
    IonNote,
    IonSelect,
    IonSelectOption,
  ],
  template: `
    <app-inset-group label="Volumes" [trailing]="count()">
      @for (mount of mounts(); track mount[0]) {
        <ion-item>
          <span slot="start" class="icon-[light--folder] text-label-2" aria-hidden="true"></span>
          <ion-label
            ><span class="font-mono text-[0.9375rem]">{{ mount[0] }}</span></ion-label
          >
          <ion-note>from {{ mount[1] }} · read-only</ion-note>
          @if (editable()) {
            <ion-button
              slot="end"
              fill="clear"
              color="medium"
              [attr.aria-label]="'Unmount ' + mount[0]"
              (click)="unmount(mount[0])"
            >
              <span slot="icon-only" class="icon-[light--circle-minus]" aria-hidden="true"></span>
            </ion-button>
          }
        </ion-item>
      }
      @if (editable()) {
        <ion-item>
          <button
            type="button"
            class="disclose"
            [attr.aria-expanded]="adding()"
            (click)="adding.set(!adding())"
          >
            Mount a folder…
          </button>
        </ion-item>
        @if (adding() && folders().length === 0) {
          <ion-item>
            <ion-label class="ion-text-wrap">
              No shared folders yet. An admin creates them in the project’s folder of the
              boreas-appdata volume.
            </ion-label>
          </ion-item>
        } @else if (adding()) {
          <ion-item>
            <ion-select
              label="Shared folder"
              interface="popover"
              placeholder="Choose"
              [value]="folder()"
              (ionChange)="folder.set($event.detail.value)"
            >
              @for (name of folders(); track name) {
                <ion-select-option [value]="name">{{ name }}</ion-select-option>
              }
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-input
              class="font-mono"
              label="Path in the container"
              labelPlacement="stacked"
              placeholder="/etc/certs"
              autocomplete="off"
              autocapitalize="off"
              [spellcheck]="false"
              [value]="path()"
              (ionInput)="path.set(($event.detail.value ?? '').trim())"
            />
          </ion-item>
          @if (pathError(); as reason) {
            <ion-item>
              <ion-label color="danger" class="ion-text-wrap">{{ reason }}</ion-label>
            </ion-item>
          }
          <ion-item button [detail]="false" [disabled]="!canMount()" (click)="mount()">
            <ion-label color="primary">Mount</ion-label>
          </ion-item>
        }
      }
      <ion-note>
        Read-only: for certs, config and seed scripts. Anything the app writes isn’t kept across
        deploys.
      </ion-note>
    </app-inset-group>
  `,
})
export class TaskVolumes {
  readonly volumes = input.required<Volumes>();
  readonly folders = input<readonly string[]>([]);
  readonly editable = input(false);
  readonly volumesChange = output<Volumes>();

  protected readonly adding = signal(false);
  protected readonly folder = signal('');
  protected readonly path = signal('');

  protected readonly mounts = computed(() => Object.entries(this.volumes()));
  protected readonly count = computed(() => {
    const count = this.mounts().length;
    return count === 0 ? '' : count === 1 ? '1 mount' : `${count} mounts`;
  });
  protected readonly pathError = computed(() =>
    this.path() ? mountPathError(this.path(), Object.keys(this.volumes())) : '',
  );
  protected readonly canMount = computed(
    () => !!this.folder() && !!this.path() && !this.pathError(),
  );

  protected mount(): void {
    this.volumesChange.emit({ ...this.volumes(), [this.path()]: this.folder() });
    this.folder.set('');
    this.path.set('');
    this.adding.set(false);
  }

  protected unmount(path: string): void {
    this.volumesChange.emit(
      Object.fromEntries(this.mounts().filter(([mounted]) => mounted !== path)),
    );
  }
}
