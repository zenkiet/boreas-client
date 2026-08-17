import { SlicePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
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
import { Panel } from '@shared/ui/panel/panel';

let instances = 0;

const FOLLOW_THRESHOLD = 24;

@Component({
  selector: 'app-log-console',
  imports: [Panel, SlicePipe, TuiButton, TuiIcon, TuiLoader, TuiTextfield],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-panel heading="Live logs" [flush]="true">
      <!-- A plain download href cannot carry the bearer token, so the page fetches. -->
      <button
        panelActions
        tuiButton
        type="button"
        size="s"
        appearance="secondary"
        [disabled]="downloading()"
        (click)="downloadRequested.emit()"
      >
        <tui-icon class="icon-sm" icon="@tui.download" />
        Download
      </button>

      <div class="logs__toolbar">
        <tui-textfield tuiTextfieldSize="s" iconStart="@tui.search" class="min-w-0 flex-1 md:max-w-[20rem]">
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

        <p class="logs__count tabular">{{ countLabel() }}</p>
      </div>

      <div
        #body
        class="logs__body"
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
              <span class="logs__stream">{{ entry.stream }}</span>
              <span class="logs__message">{{ entry.message }}</span>
            </p>
          }
        }
      </div>
    </app-panel>
  `,
  styles: `
    .logs__toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 0.875rem;
      border-block-end: 1px solid var(--tui-border-normal);
    }

    .logs__count {
      margin: 0;
      margin-inline-start: auto;
      font-size: 0.8125rem;
      color: var(--tui-text-tertiary);
      white-space: nowrap;
    }

    .logs__body {
      min-block-size: var(--console-min, 18rem);
      max-block-size: var(--console-max, 32rem);
      overflow: auto;
      padding: 0.625rem 0;
      background: var(--app-code-bg);
      font-family: var(--app-font-mono);
      font-size: 0.8125rem;
      line-height: 1.6;
      overscroll-behavior: contain;
    }

    .logs__line {
      display: grid;
      grid-template-columns: auto auto minmax(0, 1fr);
      gap: 0.75rem;
      margin: 0;
      padding: 0.0625rem 0.875rem;
      border-inline-start: 2px solid transparent;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      color: var(--tui-text-primary);
    }

    .logs__line:hover {
      background: var(--tui-background-neutral-1);
    }

    /* Marker only: nginx et al. write everything to stderr — tinting every line marks nothing. */
    .logs__line[data-stream='stderr'] {
      border-inline-start-color: var(--tui-status-negative);
    }

    .logs__time,
    .logs__stream {
      color: var(--tui-text-tertiary);
      user-select: none;
    }

    .logs__line[data-stream='stderr'] .logs__time,
    .logs__line[data-stream='stderr'] .logs__stream {
      color: var(--tui-status-negative);
    }

    .logs__stream {
      inline-size: 3rem;
      font-size: 0.75rem;
      text-transform: uppercase;
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

    @media (max-width: 47.99rem) {
      .logs__line {
        grid-template-columns: auto minmax(0, 1fr);
      }

      .logs__stream {
        display: none;
      }
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
