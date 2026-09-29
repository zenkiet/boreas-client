import { Component, input, output } from '@angular/core';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonNote } from '@ionic/angular/ion-note';

import { DEV_STATUS_DOT } from '@entities/task';
import { wideScreen } from '@shared/ui/breakpoint/wide-screen';
import { FleetTask } from '../../model/search-tasks.store';

@Component({
  selector: 'app-search-results',
  imports: [IonItem, IonLabel, IonNote],
  template: `
    @for (entry of entries(); track entry.project.slug + '/' + entry.task.name) {
      <ion-item button (click)="taskOpened.emit(entry)">
        <i slot="start" class="dot" [class]="dot[entry.task.devStatus]" aria-hidden="true"></i>
        <!-- A span, because the theme pins the label's own size. -->
        <ion-label>
          <span class="id"
            ><span class="text-label-3">{{ entry.project.slug }}/</span
            ><span class="font-semibold">{{ entry.task.name }}</span></span
          >
        </ion-label>
        <!-- @if, not CSS: the theme makes any row holding a note a 64px two-line row. -->
        @if (!wide()) {
          <ion-note>{{ entry.task.description || '—' }}</ion-note>
        }
        @if (entry.task.status !== 'running') {
          <span slot="end" class="state" [attr.data-state]="entry.task.status">
            {{ entry.task.status }}
          </span>
        }
      </ion-item>
    }
  `,
  styles: `
    .dot {
      inline-size: 0.5rem;
      block-size: 0.5rem;
      margin-inline-end: 0.875rem;
      border-radius: 999px;
    }

    .id {
      font-family: var(--app-font-mono);
      font-size: 0.9375rem;
      line-height: 1.25rem;
    }

    .state {
      font-size: 0.8125rem;
      color: var(--app-text-tertiary);
    }

    .state[data-state='stopped'] {
      color: var(--app-text-primary);
    }

    .state[data-state='error'] {
      font-weight: 600;
      color: var(--ion-color-danger);
    }

    @media (min-width: 64rem) and (min-height: 31.25rem) {
      ion-item::part(native) {
        min-height: 3.5rem;
      }
    }
  `,
})
export class SearchResults {
  readonly entries = input.required<readonly FleetTask[]>();
  readonly taskOpened = output<FleetTask>();

  protected readonly wide = wideScreen();
  protected readonly dot = DEV_STATUS_DOT;
}
