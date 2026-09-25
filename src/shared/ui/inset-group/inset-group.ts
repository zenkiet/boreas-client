import { Component, input } from '@angular/core';
import { IonItemGroup } from '@ionic/angular/ion-item-group';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonList } from '@ionic/angular/ion-list';
import { IonListHeader } from '@ionic/angular/ion-list-header';
import { IonNote } from '@ionic/angular/ion-note';

/** A projected `ion-note` becomes the footer; a `[groupMark]` element leads the header label. */
@Component({
  selector: 'app-inset-group',
  imports: [IonItemGroup, IonLabel, IonList, IonListHeader, IonNote],
  template: `
    <ion-list [inset]="true">
      @if (label()) {
        <ion-list-header>
          <ion-label><ng-content select="[groupMark]" />{{ label() }}</ion-label>
          @if (trailing()) {
            <!-- No aria-live: a live region inside Ionic's role="list" fails AXE. -->
            <ion-note class="tabular">{{ trailing() }}</ion-note>
          }
        </ion-list-header>
      }
      <ion-item-group><ng-content /></ion-item-group>
      <ng-content select="ion-note" />
    </ion-list>
  `,
})
export class InsetGroup {
  readonly label = input('');
  readonly trailing = input('');
}
