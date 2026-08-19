import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormField, form, pattern, required, submit } from '@angular/forms/signals';
import { TuiDay, TuiDayRange } from '@taiga-ui/cdk';
import { TuiButton, TuiError, TuiIcon, TuiLoader } from '@taiga-ui/core';

import { CreateApiTokenInput, MAX_TOKEN_DAYS } from '@entities/api-token';
import { Callout } from '@shared/ui/callout/callout';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';
import {
  DateRangePickerService,
  toUtcStartOfDay,
} from '@shared/ui/date-range-picker/date-range-picker.service';

const NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,62}$/;

const PRESETS = [7, 30, MAX_TOKEN_DAYS] as const;

const DAY_MS = 86_400_000;

let instances = 0;

interface TokenDraft {
  name: string;
}

@Component({
  selector: 'app-token-form',
  imports: [Callout, FormField, InsetGroup, TuiButton, TuiError, TuiIcon, TuiLoader],
  template: `
    <form class="grid grid-cols-1 gap-3.5" novalidate [id]="formId()" (submit)="onSubmit($event)">
      @if (error(); as message) {
        <app-callout tone="negative" role="alert">{{ message }}</app-callout>
      }

      <div>
        <app-inset-group label="Token">
          <div class="frow row-divider relative">
            <label class="frow__label" [for]="ids.name">Name</label>
            <input
              class="frow__input"
              autocomplete="off"
              autocapitalize="off"
              spellcheck="false"
              placeholder="staging-deployer"
              [id]="ids.name"
              [formField]="draft.name"
            />
            @if (nameError(); as message) {
              <tui-error [error]="message" />
            }
          </div>
        </app-inset-group>
        <p class="footnote">A name you will recognise in the list later. It is not a secret.</p>
      </div>

      <div>
        <app-inset-group label="Validity">
          <div class="presets row-divider relative">
            @for (days of presets; track days) {
              <button
                type="button"
                class="preset"
                [class.preset--on]="days === presetDays()"
                (click)="applyPreset(days)"
              >
                {{ days }} days
              </button>
            }
          </div>

          <!-- Tapping the resolved dates is the way into the calendar for a future start. -->
          <button type="button" class="frow frow--inline row-divider relative" (click)="pickRange()">
            <span class="frow__ilabel">{{ rangeLabel() }}</span>
            <span class="frow__count tabular">{{ dayLabel() }}</span>
            <tui-icon class="frow__chevron" icon="@tui.chevron-right" aria-hidden="true" />
          </button>
        </app-inset-group>
        <p class="footnote">
          Tap the dates to pick a custom range or a future start. Maximum {{ maxDays }} days, and the
          window cannot start before today.
        </p>
      </div>

      <div class="hidden md:flex md:justify-end">
        <button tuiButton type="submit" size="m" appearance="primary" [disabled]="creating()">
          @if (creating()) {
            <tui-loader size="s" [inheritColor]="true" />
            Creating
          } @else {
            <tui-icon class="icon-sm" icon="@tui.plus" />
            Create token
          }
        </button>
      </div>
    </form>
  `,
  styles: `
    /* Tailwind has no preflight, so reset the button's user-agent styles here. */
    .frow--inline {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      inline-size: 100%;
      min-block-size: 3rem;
      margin: 0;
      border: 0;
      background: none;
      font: inherit;
      text-align: start;
      cursor: pointer;
    }

    .frow--inline:active {
      background: var(--tui-background-neutral-1);
    }

    .frow__ilabel {
      flex: 1;
      font-size: 1.0625rem;
      color: var(--tui-text-primary);
    }

    .frow__count {
      font-size: 0.9375rem;
      color: var(--tui-text-tertiary);
    }

    .frow__chevron {
      flex: none;
      font-size: 0.9375rem;
      color: var(--tui-text-tertiary);
    }

    .frow__input {
      inline-size: 100%;
      margin: 0;
      border: 0;
      padding: 0;
      background: none;
      font-family: var(--app-font-mono);
      font-size: 1.0625rem;
      color: var(--tui-text-primary);
    }

    .frow__input:focus {
      outline: none;
    }

    .frow__input::placeholder {
      color: var(--tui-text-tertiary);
      opacity: 0.6;
    }

    .presets {
      display: flex;
      gap: 0.375rem;
      padding: 0.5625rem 1rem;
    }

    .preset {
      flex: 1;
      margin: 0;
      border: 0;
      padding: 0.375rem 0;
      border-radius: 999px;
      background: var(--tui-background-neutral-1);
      font: inherit;
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--tui-text-secondary);
      cursor: pointer;
    }

    .preset--on {
      background: var(--tui-background-accent-1);
      color: var(--tui-text-primary-on-accent-1);
    }
  `,
})
export class TokenForm {
  private readonly uid = `token-form-${(instances += 1)}`;
  private readonly picker = inject(DateRangePickerService);

  readonly creating = input(false);
  readonly error = input<string | undefined>(undefined);
  readonly formId = input(this.uid);
  readonly submitted = output<CreateApiTokenInput>();

  protected readonly presets = PRESETS;
  protected readonly maxDays = MAX_TOKEN_DAYS;
  protected readonly ids = { name: `${this.uid}-name` };

  private readonly today = TuiDay.currentLocal();

  /* The window must fit MAX_TOKEN_DAYS counted inclusively, so the last day is +89. */
  private readonly latest = this.today.append({ day: MAX_TOKEN_DAYS - 1 });

  private readonly model = signal<TokenDraft>({ name: '' });

  protected readonly range = signal(
    new TuiDayRange(this.today, this.today.append({ day: MAX_TOKEN_DAYS - 1 })),
  );

  protected readonly draft = form(this.model, (path) => {
    required(path.name, { message: 'Name is required.' });
    pattern(path.name, NAME_PATTERN, {
      message: 'Use 1–63 letters, numbers, dots, underscores or hyphens.',
    });
  });

  protected readonly nameError = computed(() => {
    const state = this.draft.name();
    if (!state.touched()) return null;
    return state.errors()[0]?.message ?? null;
  });

  protected readonly dayCount = computed(() => {
    const { from, to } = this.range();
    return TuiDay.lengthBetween(from, to) + 1;
  });

  protected readonly dayLabel = computed(() => {
    const days = this.dayCount();
    return `${days} ${days === 1 ? 'day' : 'days'}`;
  });

  protected readonly rangeLabel = computed(() => {
    const { from, to } = this.range();
    return `${format(from)} → ${format(to)}`;
  });

  /* A preset is only "on" while the range still matches it exactly. */
  protected readonly presetDays = computed(() =>
    this.range().from.daySame(this.today) ? this.dayCount() : 0,
  );

  protected applyPreset(days: number): void {
    this.range.set(new TuiDayRange(this.today, this.today.append({ day: days - 1 })));
  }

  protected pickRange(): void {
    this.picker
      .pick({ min: this.today, max: this.latest, value: this.range() })
      .subscribe((range) => this.range.set(clamp(range, this.latest)));
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();

    if (this.creating()) {
      return;
    }

    /* Signal Forms requires a promise-returning submit action. */
    void submit(this.draft, async () => {
      const { from } = this.range();

      /* A local "today" is still yesterday in UTC east of Greenwich; sending midnight
         there would schedule the token hours into the future instead of activating it. */
      const validFrom = from.daySame(this.today) ? new Date() : toUtcStartOfDay(from);

      /* Deriving the end from validFrom keeps the window at exactly dayCount days,
         which the API caps at MAX_TOKEN_DAYS. */
      const validTo = new Date(validFrom.getTime() + this.dayCount() * DAY_MS);

      this.submitted.emit({ name: this.model().name.trim(), validFrom, validTo });
    });
  }
}

function format(day: TuiDay): string {
  return day.toLocalNativeDate().toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

/* The calendar caps the end date, but a future start can still stretch past the window. */
function clamp(range: TuiDayRange, latest: TuiDay): TuiDayRange {
  const maxEnd = range.from.append({ day: MAX_TOKEN_DAYS - 1 });
  const cap = maxEnd.dayBefore(latest) ? maxEnd : latest;

  return range.to.dayAfter(cap) ? new TuiDayRange(range.from, cap) : range;
}
