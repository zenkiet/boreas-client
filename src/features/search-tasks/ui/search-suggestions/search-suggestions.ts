import { Component, computed, input, output } from '@angular/core';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonNote } from '@ionic/angular/ion-note';

import { InsetGroup } from '@shared/ui/inset-group/inset-group';
import { RecentTask } from '../../model/search-tasks.store';

export interface SuggestionCounts {
  readonly failed: number;
  readonly blocked: number;
  readonly stopped: number;
}

/* Severity order: what needs someone first. */
const FILTERS = [
  {
    key: 'failed',
    token: 'is:failed',
    label: 'Failed deploys today',
    short: 'Failed today',
    icon: 'icon-[regular--circle-xmark]',
    tone: 'bg-danger-soft text-danger',
  },
  {
    key: 'blocked',
    token: 'is:blocked',
    label: 'Blocked tasks',
    short: 'Blocked',
    icon: 'icon-[regular--triangle-exclamation]',
    tone: 'bg-warn-soft text-warn',
  },
  {
    key: 'stopped',
    token: 'is:stopped',
    label: 'Stopped containers',
    short: 'Stopped',
    icon: 'icon-[regular--pause]',
    tone: 'bg-fill text-label-2',
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
          <ion-label>{{ compact() ? filter.short : filter.label }}</ion-label>
          @if (filter.count !== null) {
            <ion-note slot="end" class="tabular">{{ filter.count }}</ion-note>
          }
        </ion-item>
      } @empty {
        <ion-item>
          <ion-label class="text-label-3!">Nothing failed, blocked or stopped.</ion-label>
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
