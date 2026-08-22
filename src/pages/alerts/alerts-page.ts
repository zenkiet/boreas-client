import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TuiResponsiveDialogService } from '@taiga-ui/addon-mobile';
import { TuiIcon } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';

import {
  AlertFilter,
  AlertFilterSheet,
  AlertFilterSheetData,
  AlertList,
  EMPTY_ALERT_FILTER,
  ListAlertsStore,
  matchesFilter,
} from '@features/list-alerts';
import { Reveal } from '@shared/lib/motion/reveal.directive';
import { registerPullRefresh } from '@shared/lib/pull-to-refresh/pull-to-refresh';
import { Callout } from '@shared/ui/callout/callout';
import { EmptyState } from '@shared/ui/empty-state/empty-state';
import { ErrorState } from '@shared/ui/error-state/error-state';
import { GlassIconButton } from '@shared/ui/glass-icon-button/glass-icon-button';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';
import { SkeletonRows } from '@shared/ui/skeleton-rows/skeleton-rows';

interface FilterChip {
  readonly key: 'project' | 'range' | 'failures';
  readonly label: string;
}

@Component({
  selector: 'app-alerts-page',
  imports: [
    AlertList,
    Callout,
    EmptyState,
    ErrorState,
    GlassIconButton,
    InsetGroup,
    Reveal,
    RouterLink,
    SkeletonRows,
    TuiIcon,
  ],
  template: `
    <div appReveal class="mx-auto grid w-full max-w-160 grid-cols-1 gap-4">
      <header class="flex items-center justify-between gap-3">
        <h1 class="page-title">Alerts</h1>
        <span class="relative inline-flex">
          <button
            appGlassIconButton
            icon="@tui.list-filter"
            type="button"
            aria-label="Filter alerts"
            (click)="openFilter()"
          ></button>
          @if (chips().length > 0) {
            <span class="filter-dot" aria-hidden="true"></span>
          }
        </span>
      </header>

      @if (alerts.loading() && !alerts.hasLoaded()) {
        <app-inset-group>
          <app-skeleton-rows variant="task" label="Loading alerts" />
        </app-inset-group>
      } @else if (alerts.error() && !alerts.hasLoaded()) {
        <app-error-state
          title="Unable to load alerts"
          [message]="alerts.error()!"
          (retry)="alerts.load()"
        />
      } @else {
        @if (alerts.error()) {
          <app-callout tone="negative" role="alert">
            {{ alerts.error() }} Existing data is still shown.
          </app-callout>
        }

        @if (chips().length > 0) {
          <div class="chips" role="group" aria-label="Active filters">
            @for (chip of chips(); track chip.key) {
              <button type="button" class="chip" (click)="removeChip(chip.key)">
                {{ chip.label }}
                <tui-icon class="chip__x" icon="@tui.x" aria-hidden="true" />
              </button>
            }
            <span class="chips__count tabular" aria-live="polite">
              {{ filtered().length }} of {{ alerts.alerts().length }}
            </span>
          </div>
        }

        @if (alerts.alerts().length === 0) {
          <app-empty-state
            title="No deploy activity yet"
            description="When a pipeline calls the deploy endpoint, every success and failure lands here."
          >
            <a routerLink="/settings/tokens" class="empty-link">Create an API token</a>
          </app-empty-state>
        } @else if (filtered().length === 0) {
          <app-empty-state
            title="No alerts match the filters"
            description="Widen the date range or clear a filter to see more."
          >
            <button type="button" class="empty-link" (click)="clearFilters()">Clear filters</button>
          </app-empty-state>
        } @else {
          <app-alert-list [alerts]="filtered()" [boundary]="boundary" />
        }
      }
    </div>
  `,
  styles: `
    .filter-dot {
      position: absolute;
      inset-block-start: 0.125rem;
      inset-inline-end: 0.125rem;
      inline-size: 0.625rem;
      block-size: 0.625rem;
      border-radius: 999px;
      background: var(--tui-background-accent-1);
      box-shadow: 0 0 0 2px var(--tui-background-base);
    }

    .chips {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
    }

    /* Tailwind has no preflight, so reset the chip button explicitly. */
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      margin: 0;
      border: 0;
      border-radius: 999px;
      padding: 0.375rem 0.75rem;
      background: var(--tui-background-accent-opposite-pale);
      font: inherit;
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--tui-text-action);
      cursor: pointer;
    }

    .chip__x {
      inline-size: 0.75rem;
      block-size: 0.75rem;
      font-size: 0.75rem;
    }

    .chips__count {
      margin-inline-start: auto;
      font-size: 0.8125rem;
      color: var(--tui-text-tertiary);
    }

    .empty-link {
      margin: 0;
      border: 0;
      padding: 0;
      background: none;
      font: inherit;
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--tui-text-action);
      text-decoration: none;
      cursor: pointer;
    }
  `,
})
export class AlertsPage {
  protected readonly alerts = inject(ListAlertsStore);
  private readonly dialogs = inject(TuiResponsiveDialogService);

  /* Captured before markSeen so this visit still shows which rows are new. */
  protected readonly boundary = this.alerts.lastSeen();

  protected readonly filter = signal<AlertFilter>(EMPTY_ALERT_FILTER);

  protected readonly filtered = computed(() =>
    this.alerts.alerts().filter((alert) => matchesFilter(alert, this.filter())),
  );

  protected readonly chips = computed<readonly FilterChip[]>(() => {
    const { project, range, failuresOnly } = this.filter();
    const chips: FilterChip[] = [];

    if (project) chips.push({ key: 'project', label: project });
    if (range) {
      chips.push({ key: 'range', label: `${formatDay(range.from)} – ${formatDay(range.to)}` });
    }
    if (failuresOnly) chips.push({ key: 'failures', label: 'Failures only' });

    return chips;
  });

  constructor() {
    this.alerts.ensureFresh();
    this.alerts.markSeen();

    registerPullRefresh({
      busy: this.alerts.loading,
      trigger: () => this.alerts.load(),
    });
  }

  /* Sheet on mobile, dialog on desktop; a dismissal completes without emitting. */
  protected openFilter(): void {
    const data: AlertFilterSheetData = {
      alerts: this.alerts.alerts(),
      projects: this.alerts.projects(),
      value: this.filter(),
    };

    this.dialogs
      .open<AlertFilter>(new PolymorpheusComponent(AlertFilterSheet), { data })
      .subscribe((filter) => this.filter.set(filter));
  }

  protected removeChip(key: FilterChip['key']): void {
    this.filter.update((filter) => {
      if (key === 'project') return { ...filter, project: '' };
      if (key === 'range') return { ...filter, range: null };
      return { ...filter, failuresOnly: false };
    });
  }

  protected clearFilters(): void {
    this.filter.set(EMPTY_ALERT_FILTER);
  }
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDay(day: { readonly month: number; readonly day: number }): string {
  return `${MONTHS[day.month]} ${day.day}`;
}
