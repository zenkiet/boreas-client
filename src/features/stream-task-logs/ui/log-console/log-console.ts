import { DatePipe } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  afterRenderEffect,
  computed,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { IonButton } from '@ionic/angular/ion-button';
import { IonInput } from '@ionic/angular/ion-input';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonSpinner } from '@ionic/angular/ion-spinner';

import type { Task } from '@entities/task';
import { LogEntry, LogTone } from '@entities/task-log';
import { dayLabel } from '@shared/lib/format/day';
import { wideScreen } from '@shared/ui/breakpoint/wide-screen';
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
            <!-- Lines exist, so the filter hid them, whatever the stream is doing. -->
            @if (entries().length > 0) {
              <p class="logs__empty">No line matches the filter.</p>
            } @else if (connecting()) {
              <!-- An indeterminate wait: the one place a spinner belongs. -->
              <p class="logs__empty logs__empty--connecting" role="status">
                <ion-spinner name="lines-small" />
                Connecting to the log stream…
              </p>
            } @else if (connected()) {
              <p class="logs__empty">Waiting for log output.</p>
            } @else {
              <div class="logs__empty logs__empty--down">
                <p class="m-0">{{ downReason() }}</p>
                @if (canStart() && status() !== 'running') {
                  <ion-button size="small" fill="outline" (click)="startRequested.emit()">
                    <span slot="start" class="icon-[solid--play]" aria-hidden="true"></span>
                    Start task
                  </ion-button>
                }
              </div>
            }
          } @else {
            <!-- By entry: past the line cap an index key would rewrite every row per line. -->
            @for (entry of visibleEntries(); track entry) {
              <!-- The time column has no date. -->
              @if (dayStarts().get(entry); as day) {
                <p class="logs__day">{{ day }}</p>
              }
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

    /* Pinned, so the newest lines still show their day. */
    .logs__day {
      position: sticky;
      inset-block-start: -0.5rem;
      inset-inline-start: 0;
      z-index: 1;
      margin: 0;
      background: var(--ion-item-background);
      padding: 0.75rem 1rem 0.25rem;
      font-family: var(--app-font-text);
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--app-text-secondary);
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

    .logs__empty--connecting,
    .logs__empty--down {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }
  `,
})
export class LogConsole {
  private readonly body = viewChild<ElementRef<HTMLElement>>('body');
  private readonly destroyRef = inject(DestroyRef);

  readonly entries = input.required<readonly LogEntry[]>();
  readonly connected = input.required<boolean>();
  readonly connecting = input(false);
  readonly downloading = input(false);
  /** The container's state, to say why the stream is down. */
  readonly status = input<Task['status'] | null>(null);
  /** Operator and up: the down state offers Start. */
  readonly canStart = input(false);
  readonly startRequested = output<void>();
  readonly downloadRequested = output<void>();

  protected readonly tones = TONES;
  protected readonly query = signal('');
  protected readonly errorsOnly = signal(false);
  private readonly wide = wideScreen();
  /* Unwrapped, a phone shows a few dozen characters of each line. */
  protected readonly wrap = linkedSignal(() => !this.wide());

  private readonly follow = signal(true);

  protected readonly downReason = computed(() => {
    switch (this.status()) {
      case 'running':
        return 'Reconnecting to the log stream…';
      case 'creating':
      case 'starting':
        return 'The container is starting; its logs follow once it runs.';
      case 'stopped':
        return 'The container is stopped. Start it to stream new lines.';
      default:
        return 'No container is running for this task, so there are no logs yet.';
    }
  });

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

  protected readonly dayStarts = computed(() => {
    const starts = new Map<LogEntry, string>();
    let last = '';
    for (const entry of this.visibleEntries()) {
      const at = new Date(entry.timestamp);
      const day = at.toDateString();
      if (day !== last) starts.set(entry, dayLabel(at));
      last = day;
    }
    return starts;
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
    /* A hidden tab has no height to follow: catch up once it shows. */
    afterNextRender(() => {
      const element = this.body()?.nativeElement;
      if (!element) return;
      const observer = new ResizeObserver(() => {
        if (this.follow()) element.scrollTop = element.scrollHeight;
      });
      observer.observe(element);
      this.destroyRef.onDestroy(() => observer.disconnect());
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
