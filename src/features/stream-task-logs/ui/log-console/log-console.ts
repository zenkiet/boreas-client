import { DatePipe } from '@angular/common';
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
import { IonButton } from '@ionic/angular/ion-button';
import { IonInput } from '@ionic/angular/ion-input';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonSpinner } from '@ionic/angular/ion-spinner';

import { LogEntry, LogTone } from '@entities/task-log';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';

const FOLLOW_THRESHOLD = 24;
/* Keyword heuristic, not stderr: nginx and most servers log routine notices there. */
const ERROR_LINE = /(error|exception)\b|\b(err|fatal|panic|crit|critical|emerg|failed|failure)\b/i;
const TONES: Record<LogTone, string> = {
  danger: 'text-danger',
  ok: 'text-ok',
  warn: 'text-warn',
  accent: 'text-accent',
  muted: 'text-label-2',
};

@Component({
  selector: 'app-log-console',
  imports: [DatePipe, InsetGroup, IonButton, IonInput, IonItem, IonLabel, IonSpinner],
  template: `
    <app-inset-group label="Container logs" [trailing]="countLabel()">
      <i
        groupMark
        class="me-2 inline-block size-2 rounded-full align-middle"
        [class.bg-ok]="connected()"
        [class.bg-label-3]="!connected()"
        aria-hidden="true"
      ></i>
      <ion-item lines="full">
        <span
          slot="start"
          class="filter-icon icon-[light--magnifying-glass]"
          aria-hidden="true"
        ></span>
        <ion-input
          type="search"
          autocomplete="off"
          placeholder="Filter lines"
          aria-label="Filter log lines"
          [clearInput]="true"
          [value]="query()"
          (ionInput)="query.set($event.detail.value ?? '')"
        />
        <!-- Static labels: aria-pressed carries the state. -->
        <ion-button
          slot="end"
          fill="clear"
          size="small"
          class="toggle"
          [class.toggle--on]="errorsOnly()"
          [attr.aria-pressed]="errorsOnly()"
          (click)="errorsOnly.set(!errorsOnly())"
        >
          Errors only
        </ion-button>
        <ion-button
          slot="end"
          fill="clear"
          size="small"
          class="toggle"
          [class.toggle--on]="wrap()"
          [attr.aria-pressed]="wrap()"
          (click)="wrap.set(!wrap())"
        >
          Wrap
        </ion-button>
        <ion-button
          slot="end"
          fill="clear"
          size="small"
          class="wide-only"
          [disabled]="downloading()"
          (click)="downloadRequested.emit()"
        >
          <span slot="start" class="icon-[light--arrow-down-to-line]" aria-hidden="true"></span>
          Download
        </ion-button>
      </ion-item>

      <!-- The group is Ionic's role="list": the log region needs a listitem around it. -->
      <div role="listitem">
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
              <!-- An indeterminate wait: the one place a spinner belongs. -->
              <p class="logs__empty logs__empty--connecting" role="status">
                <ion-spinner name="lines-small" />
                Connecting to the log stream…
              </p>
            } @else {
              <p class="logs__empty">
                {{
                  connected()
                    ? query() || errorsOnly()
                      ? 'No line matches the filter.'
                      : 'Waiting for log output.'
                    : 'Logs are unavailable while the stream is disconnected.'
                }}
              </p>
            }
          } @else {
            <!-- By entry: past the line cap an index key would rewrite every row per line. -->
            @for (entry of visibleEntries(); track entry) {
              @let error = isError(entry);
              <p class="logs__line" [class.logs__line--error]="error">
                <span class="logs__time">{{ entry.timestamp | date: 'HH:mm:ss' }}</span>
                @if (error) {
                  <span class="sr-only">Error:</span>
                }
                <span class="logs__message">
                  @for (span of entry.spans; track $index) {
                    <span
                      [class]="span.tone ? tones[span.tone] : ''"
                      [class.font-semibold]="span.bold"
                      >{{ span.text }}</span
                    >
                  }
                </span>
              </p>
            }
          }
        </div>
      </div>

      <!-- Not a link: a plain href cannot carry the bearer token. -->
      <ion-item
        button
        class="narrow-only"
        [detail]="false"
        [disabled]="downloading()"
        (click)="downloadRequested.emit()"
      >
        <span
          slot="start"
          class="text-accent icon-[light--arrow-down-to-line]"
          aria-hidden="true"
        ></span>
        <ion-label color="primary">Download full log</ion-label>
      </ion-item>
    </app-inset-group>
  `,
  styles: `
    .filter-icon {
      font-size: 1.125rem;
      color: var(--app-text-tertiary);
    }

    .toggle {
      font-size: 0.875rem;
      font-weight: 500;
    }

    .toggle--on {
      --background: var(--app-accent-soft);
    }

    /* A cap, not a height: a short log keeps Download right under its last line. */
    .logs {
      max-block-size: var(--console-max, 32rem);
      overflow: auto;
      padding-block: 0.5rem;
      font-family: var(--app-font-mono);
      font-size: 0.75rem;
      line-height: 1.25rem;
      overscroll-behavior: contain;
    }

    .logs__line {
      display: flex;
      gap: 0.625rem;
      inline-size: max-content;
      min-inline-size: 100%;
      margin: 0;
      padding: 0.125rem 1rem;
      white-space: pre;
      color: var(--app-text-primary);
    }

    @media (min-width: 64rem) and (min-height: 31.25rem) {
      .logs {
        font-size: 0.78125rem;
        line-height: 1.3125rem;
      }

      .logs__line {
        gap: 0.75rem;
        padding: 0.0625rem 1.25rem;
      }
    }

    .logs__line:hover {
      background: var(--app-background-neutral-1);
    }

    /* The rule keeps colour from being the only cue. */
    .logs__line--error {
      background: var(--app-status-negative-pale);
      box-shadow: inset 2px 0 var(--app-status-negative);
    }

    .logs__line--error:hover {
      background: var(--app-status-negative-pale-hover);
    }

    .logs__time {
      flex: none;
      color: var(--app-text-tertiary);
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

    .logs__empty {
      margin: 0;
      padding: 4rem 1rem;
      font-family: var(--app-font-text);
      font-size: 0.9375rem;
      color: var(--app-text-tertiary);
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
  private readonly body = viewChild<ElementRef<HTMLElement>>('body');

  readonly entries = input.required<readonly LogEntry[]>();
  readonly connected = input.required<boolean>();
  readonly connecting = input(false);
  readonly downloading = input(false);
  readonly downloadRequested = output<void>();

  protected readonly tones = TONES;
  protected readonly query = signal('');
  protected readonly errorsOnly = signal(false);
  protected readonly wrap = signal(false);

  private readonly follow = signal(true);

  protected readonly visibleEntries = computed(() => {
    const query = this.query().trim().toLowerCase();
    const errorsOnly = this.errorsOnly();
    if (!query && !errorsOnly) {
      return this.entries();
    }

    return this.entries().filter(
      (entry) =>
        (!errorsOnly || this.isError(entry)) &&
        (!query || entry.message.toLowerCase().includes(query)),
    );
  });

  protected readonly countLabel = computed(() => {
    const visible = this.visibleEntries().length;
    const total = this.entries().length;
    const noun = total === 1 ? 'line' : 'lines';
    const count = (n: number) => n.toLocaleString('en');

    return visible === total
      ? `${count(total)} ${noun}`
      : `${count(visible)} of ${count(total)} ${noun}`;
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

  protected isError(entry: LogEntry): boolean {
    return ERROR_LINE.test(entry.message);
  }

  protected onScroll(event: Event): void {
    const element = event.target as HTMLElement;
    const distance = element.scrollHeight - element.scrollTop - element.clientHeight;

    this.follow.set(distance <= FOLLOW_THRESHOLD);
  }
}
