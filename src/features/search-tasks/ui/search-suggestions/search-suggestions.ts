import { Component, computed, input, output } from '@angular/core';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonNote } from '@ionic/angular/ion-note';

import { InsetGroup } from '@shared/ui/inset-group/inset-group';
import { RecentTask } from '../../model/search-tasks.store';

export interface SuggestionCounts {
  readonly failed: number;
  readonly blocked: number;
  readonly down: number;
  readonly ready: number;
}

/* Severity order, then what QA can pick up. */
const FILTERS = [
  {
    key: 'failed',
    token: 'is:failed',
    label: 'Failed builds and deploys',
    hint: 'Builds failing now, deploys that failed today',
    short: 'Failed',
    icon: 'icon-[regular--circle-xmark]',
    tone: 'bg-danger-soft text-danger',
  },
  {
    key: 'blocked',
    token: 'is:blocked',
    label: 'Blocked tasks',
    hint: '',
    short: 'Blocked',
    icon: 'icon-[regular--triangle-exclamation]',
    tone: 'bg-warn-soft text-warn',
  },
  /* Unknown containers too: "stopped" alone missed them. */
  {
    key: 'down',
    token: 'is:down',
    label: 'Containers not running',
    hint: 'Stopped, failed or not found',
    short: 'Not running',
    icon: 'icon-[regular--pause]',
    tone: 'bg-fill text-label-2',
  },
  /* Ready and running: a ready build with no container cannot be tested. */
  {
    key: 'ready',
    token: 'is:ready is:running',
    label: 'Ready to test',
    hint: 'Ready, with the container running',
    short: 'Ready to test',
    icon: 'icon-[regular--circle-check]',
    tone: 'bg-ok-soft text-ok',
  },
] as const;

@Component({
  selector: 'app-search-suggestions',
  imports: [InsetGroup, IonItem, IonLabel, IonNote],
  template: `
    <app-inset-group label="Quick filters" [trailing]="compact() ? '' : 'From live state'">
      @for (filter of filters(); track filter.key) {
        <ion-item button [detail]="!compact()" (click)="filterPicked.emit(filter.token)">
          <span slot="start" class="tile" [class]="filter.tone" aria-hidden="true">
            <span [class]="filter.icon"></span>
          </span>
          <ion-label>
            {{ compact() ? filter.short : filter.label }}
            @if (!compact() && filter.hint) {
              <p class="hint">{{ filter.hint }}</p>
            }
          </ion-label>
          @if (filter.count !== null) {
            <ion-note slot="end" class="tabular">{{ filter.count }}</ion-note>
          }
        </ion-item>
      } @empty {
        <ion-item>
          <ion-label class="text-label-3!">No task fits a quick filter right now.</ion-label>
        </ion-item>
      }
    </app-inset-group>

    @if (recent().length > 0) {
      <!-- Clear is a row: anything interactive in the list header sits in role="list" (AXE). -->
      <app-inset-group label="Recent">
        @for (entry of recent(); track entry.project + '/' + entry.name) {
          <ion-item button [detail]="false" (click)="recentOpened.emit(entry)">
            <span slot="start" class="recent-icon icon-[light--clock]" aria-hidden="true"></span>
            <!-- A span, because the theme pins the label's own size. -->
            <ion-label>
              <span class="recent-id"
                ><span class="text-label-3">{{ entry.project }}/</span
                ><span class="font-semibold">{{ entry.name }}</span></span
              >
            </ion-label>
          </ion-item>
        }
        <ion-item button [detail]="false" (click)="recentCleared.emit()">
          <ion-label color="primary">Clear recent</ion-label>
        </ion-item>
      </app-inset-group>
    }
  `,
  styles: `
    .tile {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      inline-size: 2rem;
      block-size: 2rem;
      margin-inline-end: 0.75rem;
      border-radius: 0.625rem;
      font-size: 1.125rem;
    }

    ion-item {
      --row-min-height: 3.5rem;
    }

    /* Ionic's grey for a second line fails AA on a dark cell. */
    .hint {
      color: var(--app-text-tertiary);
    }

    .recent-icon {
      margin-inline-end: 0.75rem;
      font-size: 1.125rem;
      color: var(--app-text-tertiary);
    }

    .recent-id {
      font-family: var(--app-font-mono);
      font-size: 0.9375rem;
    }
  `,
})
export class SearchSuggestions {
  /** Live counts; null until the fleet has loaded, so no row shows a made-up zero. */
  readonly counts = input<SuggestionCounts | null>(null);
  readonly recent = input.required<readonly RecentTask[]>();
  /** For the iPad aside beside the results. */
  readonly compact = input(false);
  readonly filterPicked = output<string>();
  readonly recentOpened = output<RecentTask>();
  readonly recentCleared = output<void>();

  /* A filter that finds nothing is not worth a row. */
  protected readonly filters = computed(() =>
    FILTERS.map((filter) => ({ ...filter, count: this.counts()?.[filter.key] ?? null })).filter(
      ({ count }) => count !== 0,
    ),
  );
}
