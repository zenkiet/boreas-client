import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { TuiDataList, TuiDropdown, TuiIcon } from '@taiga-ui/core';

export interface GlassSelectOption {
  readonly value: string;
  readonly label: string;
}

/**
 * iOS-style inline picker on Taiga's dropdown machinery: a quiet value-plus-chevrons
 * trigger opening a floating menu with a leading checkmark on the current option.
 */
@Component({
  selector: 'app-glass-select',
  imports: [TuiDataList, TuiDropdown, TuiIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="trigger"
      [class.trigger--start]="align() === 'start'"
      [disabled]="disabled()"
      [tuiDropdown]="menu"
      [(tuiDropdownOpen)]="open"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-expanded]="open()"
      aria-haspopup="listbox"
    >
      <span class="trigger__value" [class.trigger__value--placeholder]="!selected()">
        {{ selected()?.label ?? placeholder() }}
      </span>
      <tui-icon class="trigger__chevrons" icon="@tui.chevrons-up-down" aria-hidden="true" />
    </button>

    <ng-template #menu>
      <tui-data-list class="menu" [attr.aria-label]="ariaLabel() || null">
        @for (option of options(); track option.value) {
          <button
            tuiOption
            type="button"
            class="menu__option"
            [attr.aria-selected]="option.value === value()"
            (click)="pick(option)"
          >
            <tui-icon
              class="menu__check"
              icon="@tui.check"
              aria-hidden="true"
              [style.visibility]="option.value === value() ? 'visible' : 'hidden'"
            />
            {{ option.label }}
          </button>
        }
      </tui-data-list>
    </ng-template>
  `,
  styles: `
    :host {
      display: inline-flex;
      min-inline-size: 0;
    }

    /* Tailwind has no preflight, so reset the button's user-agent styles here. */
    .trigger {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      min-inline-size: 0;
      flex: 1;
      margin: 0;
      border: 0;
      /* Negative inline margin keeps the value aligned with plain row values. */
      margin-inline-end: -0.375rem;
      padding: 0.25rem 0.375rem;
      border-radius: 0.5rem;
      background: none;
      font: inherit;
      font-size: 1rem;
      color: var(--tui-text-secondary);
      text-align: end;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      transition: background-color var(--tui-duration);
    }

    .trigger:hover:not(:disabled),
    .trigger[aria-expanded='true'] {
      background: var(--tui-background-neutral-1);
    }

    .trigger:active:not(:disabled) {
      background: var(--tui-background-neutral-1-pressed);
    }

    .trigger:disabled {
      opacity: 0.5;
      cursor: default;
    }

    /* Field-like placements read start-aligned; inline row values stay end-aligned. */
    .trigger--start {
      margin-inline: -0.375rem 0;
      text-align: start;
    }

    .trigger__value {
      flex: 1;
      min-inline-size: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .trigger__value--placeholder {
      color: var(--tui-text-tertiary);
    }

    .trigger__chevrons {
      flex: none;
      font-size: 0.875rem;
      color: var(--tui-text-tertiary);
    }

    .menu {
      min-inline-size: 11rem;
      max-inline-size: 17rem;
    }

    /* Leading checkmark column, the iOS selection-menu shape; labels stay aligned. */
    .menu__option {
      justify-content: flex-start;
      gap: 0.5rem;
    }

    .menu__check {
      flex: none;
      font-size: 1rem;
      color: var(--tui-text-primary);
    }

    .menu__option[aria-selected='true'] {
      font-weight: 600;
    }
  `,
})
export class GlassSelect {
  readonly options = input.required<readonly GlassSelectOption[]>();
  readonly value = input('');
  readonly placeholder = input('Select…');
  readonly ariaLabel = input('');
  readonly align = input<'start' | 'end'>('end');
  readonly disabled = input(false);
  readonly valueChange = output<string>();

  protected readonly open = signal(false);

  protected readonly selected = computed(() =>
    this.options().find((option) => option.value === this.value()),
  );

  protected pick(option: GlassSelectOption): void {
    this.open.set(false);
    if (option.value !== this.value()) {
      this.valueChange.emit(option.value);
    }
  }
}
