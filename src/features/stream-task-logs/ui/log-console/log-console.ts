import { SlicePipe } from '@angular/common';
import {
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { TuiButton, TuiIcon, TuiLoader, TuiTextfield } from '@taiga-ui/core';

import { LogEntry } from '@entities/task-log';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';

let instances = 0;

const FOLLOW_THRESHOLD = 24;

@Component({
  selector: 'app-log-console',
  imports: [InsetGroup, SlicePipe, TuiButton, TuiIcon, TuiLoader, TuiTextfield],
  template: `
    <app-inset-group label="Live logs" [trailing]="countLabel()">
      <div class="toolbar row-divider relative">
        <tui-textfield tuiTextfieldSize="s" iconStart="@tui.search" class="min-w-0 flex-1">
          <input
            tuiInput
            type="search"
            autocomplete="off"
            placeholder="Filter lines"
            aria-label="Filter log lines"
            [id]="filterId"
            [value]="query()"
            (input)="updateQuery($event)"
          />
        </tui-textfield>

        <button
          tuiButton
          type="button"
          size="s"
          appearance="secondary"
          [attr.aria-pressed]="wrap()"
          (click)="wrap.set(!wrap())"
        >
          <tui-icon class="icon-sm" icon="@tui.wrap-text" />
          {{ wrap() ? 'Wrap on' : 'Wrap off' }}
        </button>
      </div>

      <div
        #body
        class="logs"
        [class.logs--wrap]="wrap()"
        role="log"
        aria-live="polite"
        aria-label="Task logs"
        tabindex="0"
        (scroll)="onScroll($event)"
      >
        @if (visibleEntries().length === 0) {
          @if (connecting()) {
            <!-- A stream is an indeterminate wait, the one place a spinner belongs. -->
            <p class="logs__empty logs__empty--connecting" role="status">
              <tui-loader size="s" />
              Connecting to the log stream…
            </p>
          } @else {
            <p class="logs__empty">
              {{
                connected()
                  ? query()
                    ? 'No line matches the filter.'
                    : 'Waiting for log output.'
                  : 'Logs are unavailable while the stream is disconnected.'
              }}
            </p>
          }
        } @else {
          @for (entry of visibleEntries(); track $index) {
            <p class="logs__line" [attr.data-stream]="entry.stream">
              <span class="logs__time">{{ entry.timestamp | slice: 11 : 19 }}</span>
              <!-- Colour carries the stream visually, so the name is left for screen readers. -->
              <span class="sr-only">{{ entry.stream }}</span>
              <span class="logs__message">{{ entry.message }}</span>
            </p>
          }
        }
      </div>

      <!-- A plain download href cannot carry the bearer token, so the page fetches. -->
      <button
        type="button"
        class="logs__action row-divider relative"
        [disabled]="downloading()"
        (click)="downloadRequested.emit()"
      >
        <tui-icon class="icon-sm" icon="@tui.download" />
        Download logs
      </button>
    </app-inset-group>
  `,
  styles: `
    .toolbar {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
    }

    .logs {
      min-block-size: var(--console-min, 18rem);
      max-block-size: var(--console-max, 32rem);
      overflow: auto;
      padding-block: 0.5rem;
      background: var(--app-code-bg);
      font-family: var(--app-font-mono);
      font-size: 0.8125rem;
      line-height: 1.6;
      overscroll-behavior: contain;
    }

    /* One entry, one line: long lines scroll sideways instead of wrapping into a paragraph. */
    .logs__line {
      display: flex;
      gap: 0.75rem;
      inline-size: max-content;
      min-inline-size: 100%;
      margin: 0;
      padding: 0.0625rem 0.875rem;
      white-space: pre;
      color: var(--tui-text-primary);
    }

    .logs__line:hover {
      background: var(--tui-background-neutral-1);
    }

    .logs__line[data-stream='stderr'] {
      background: var(--tui-status-negative-pale);
    }

    .logs__line[data-stream='stderr']:hover {
      background: var(--tui-status-negative-pale-hover);
    }

    .logs__time {
      flex: none;
      color: var(--tui-text-tertiary);
      user-select: none;
    }

    .logs--wrap .logs__line {
      inline-size: auto;
      min-inline-size: 0;
      white-space: pre-wrap;
    }

    .logs--wrap .logs__message {
      min-inline-size: 0;
      overflow-wrap: anywhere;
    }

    /* Tailwind has no preflight, so reset the native button explicitly. */
    .logs__action {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      inline-size: 100%;
      margin: 0;
      border: 0;
      padding: 0.6875rem 1rem;
      background: none;
      font: inherit;
      font-size: 1.0625rem;
      font-weight: 500;
      color: var(--tui-text-action);
      cursor: pointer;
      transition: background-color var(--tui-duration);
    }

    .logs__action:hover {
      background: var(--tui-background-neutral-1);
    }

    .logs__action:disabled {
      opacity: 0.5;
      pointer-events: none;
    }

    .logs__empty {
      margin: 0;
      padding: 4rem 1rem;
      font-family: var(--tui-typography-family-text);
      font-size: 0.9375rem;
      color: var(--tui-text-tertiary);
      text-align: center;
    }

    .logs__empty--connecting {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }
  `,
})
export class LogConsole {
  private readonly uid = `log-console-${(instances += 1)}`;
  private readonly body = viewChild<ElementRef<HTMLElement>>('body');

  readonly entries = input.required<readonly LogEntry[]>();
  readonly connected = input.required<boolean>();
  readonly connecting = input(false);
  readonly downloading = input(false);
  readonly downloadRequested = output<void>();

  protected readonly filterId = `${this.uid}-filter`;
  protected readonly query = signal('');
  protected readonly wrap = signal(false);

  private readonly follow = signal(true);

  protected readonly visibleEntries = computed(() => {
    const query = this.query().trim().toLowerCase();
    if (!query) {
      return this.entries();
    }

    return this.entries().filter((entry) => entry.message.toLowerCase().includes(query));
  });

  protected readonly countLabel = computed(() => {
    const visible = this.visibleEntries().length;
    const total = this.entries().length;
    const noun = total === 1 ? 'line' : 'lines';

    return visible === total ? `${total} ${noun}` : `${visible} of ${total} ${noun}`;
  });

  constructor() {
    /* Wait for rendered lines before reading scrollHeight. */
    afterRenderEffect(() => {
      const hasEntries = this.visibleEntries().length > 0;
      const element = this.body()?.nativeElement;
      if (!element || !this.follow() || !hasEntries) return;
      element.scrollTop = element.scrollHeight;
    });
  }

  protected updateQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  protected onScroll(event: Event): void {
    const element = event.target as HTMLElement;
    const distance = element.scrollHeight - element.scrollTop - element.clientHeight;

    this.follow.set(distance <= FOLLOW_THRESHOLD);
  }
}
