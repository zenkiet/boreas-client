import { Component, computed, inject, signal } from '@angular/core';
import { TuiDay } from '@taiga-ui/cdk';
import { TuiButton, TuiDialogContext, TuiIcon } from '@taiga-ui/core';
import { injectContext } from '@taiga-ui/polymorpheus';

import { DateRangePickerService } from '@shared/ui/date-range-picker/date-range-picker.service';
import { GlassSelect, GlassSelectOption } from '@shared/ui/glass-select/glass-select';
import { GlassSwitch } from '@shared/ui/glass-switch/glass-switch';
import { AlertFilter, matchesFilter } from '../../model/alert-filter';
import { ProjectAlert } from '../../model/list-alerts.store';

export interface AlertFilterSheetData {
  readonly alerts: readonly ProjectAlert[];
  readonly projects: readonly string[];
  readonly value: AlertFilter;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Opened through TuiResponsiveDialogService: a sheet on mobile, a dialog on desktop. */
@Component({
  selector: 'app-alert-filter-sheet',
  imports: [GlassSelect, GlassSwitch, TuiButton, TuiIcon],
  template: `
    <div class="head">
      <h2 class="head__title">Filters</h2>
      <button
        tuiButton
        type="button"
        size="s"
        appearance="flat"
        [disabled]="pristine()"
        (click)="reset()"
      >
        Reset
      </button>
    </div>

    <div class="box">
      <div class="frow frow--inline row-divider relative">
        <span class="frow__inline-label">Project</span>
        <app-glass-select
          ariaLabel="Project"
          placeholder="All projects"
          [options]="projectOptions()"
          [value]="project()"
          (valueChange)="project.set($event)"
        />
      </div>

      <button
        type="button"
        class="frow frow--inline row-divider daterow relative"
        (click)="pickRange()"
      >
        <span class="frow__inline-label">Date range</span>
        <span class="daterow__value tabular">{{ rangeLabel() }}</span>
        @if (range()) {
          <!-- A real button cannot nest here, so the clear affordance is a keyless icon span. -->
          <span
            class="daterow__clear"
            role="button"
            tabindex="0"
            aria-label="Clear date range"
            (click)="clearRange($event)"
            (keydown.enter)="clearRange($event)"
          >
            <tui-icon class="icon-sm" icon="@tui.x" />
          </span>
        } @else {
          <tui-icon class="daterow__chevron icon-sm" icon="@tui.chevron-right" aria-hidden="true" />
        }
      </button>

      <div class="frow frow--inline row-divider relative">
        <span class="frow__inline-label">Failures only</span>
        <button
          appGlassSwitch
          aria-label="Failures only"
          [checked]="failuresOnly()"
          (checkedChange)="failuresOnly.set($event)"
        ></button>
      </div>
    </div>

    <button tuiButton type="button" size="m" appearance="primary" class="apply" (click)="apply()">
      Show {{ count() }} {{ count() === 1 ? 'alert' : 'alerts' }}
    </button>
  `,
  styles: `
    :host {
      display: block;
    }

    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-block-end: 0.5rem;
    }

    .head__title {
      margin: 0;
      font-size: 1.0625rem;
      font-weight: 700;
      color: var(--tui-text-primary);
    }

    .box {
      overflow: hidden;
      border-radius: var(--tui-radius-l);
      background: var(--tui-background-neutral-1);
    }

    .frow--inline {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      min-block-size: 3rem;
    }

    /* Tailwind has no preflight, so reset the row button explicitly. */
    .daterow {
      inline-size: 100%;
      margin: 0;
      border: 0;
      background: none;
      font: inherit;
      color: inherit;
      text-align: start;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    .daterow__value {
      font-size: 0.9375rem;
      color: var(--tui-text-secondary);
    }

    .daterow__chevron {
      color: var(--tui-text-tertiary);
    }

    .daterow__clear {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      inline-size: 1.75rem;
      block-size: 1.75rem;
      border-radius: 999px;
      background: var(--tui-background-neutral-2);
      color: var(--tui-text-secondary);
      cursor: pointer;
    }

    .apply {
      inline-size: 100%;
      margin-block-start: 0.875rem;
    }
  `,
})
export class AlertFilterSheet {
  private readonly picker = inject(DateRangePickerService);

  protected readonly context = injectContext<TuiDialogContext<AlertFilter, AlertFilterSheetData>>();

  protected readonly project = signal(this.context.data.value.project);
  protected readonly range = signal(this.context.data.value.range);
  protected readonly failuresOnly = signal(this.context.data.value.failuresOnly);

  protected readonly projectOptions = computed<readonly GlassSelectOption[]>(() => [
    { value: '', label: 'All projects' },
    ...this.context.data.projects.map((slug) => ({ value: slug, label: slug })),
  ]);

  protected readonly pristine = computed(
    () => !this.project() && !this.range() && !this.failuresOnly(),
  );

  protected readonly count = computed(() => {
    const draft: AlertFilter = {
      project: this.project(),
      range: this.range(),
      failuresOnly: this.failuresOnly(),
    };
    return this.context.data.alerts.filter((alert) => matchesFilter(alert, draft)).length;
  });

  protected readonly rangeLabel = computed(() => {
    const range = this.range();
    if (!range) return 'Any time';
    return `${format(range.from)} – ${format(range.to)}`;
  });

  protected pickRange(): void {
    const today = TuiDay.currentLocal();

    /* Alerts live in the past, so the window ends today instead of the tokens' +90d. */
    this.picker
      .pick({ min: today.append({ year: -1 }), max: today, value: this.range() })
      .subscribe((range) => this.range.set(range));
  }

  protected clearRange(event: Event): void {
    event.stopPropagation();
    this.range.set(null);
  }

  protected reset(): void {
    this.project.set('');
    this.range.set(null);
    this.failuresOnly.set(false);
  }

  protected apply(): void {
    this.context.completeWith({
      project: this.project(),
      range: this.range(),
      failuresOnly: this.failuresOnly(),
    });
  }
}

function format(day: TuiDay): string {
  return `${MONTHS[day.month]} ${day.day}`;
}
