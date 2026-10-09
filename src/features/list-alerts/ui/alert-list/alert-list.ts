import {
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';

import { taskKey } from '@entities/task/model';
import { dayLabel } from '@shared/lib/format/day';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';
import { gsap, measure, nextFrame, relayout } from '@shared/ui/motion/flip';
import { E, S, T, pageSettled, play, reduced, settled } from '@shared/ui/motion/motion';
import { rise } from '@shared/ui/motion/page-motion';
import { AlertDescription, describeAlert, matchesChip, timeLabel } from '../../model/activity';
import { ProjectAlert } from '../../model/list-alerts.store';
import { ActivityGlyph } from '../activity-glyph/activity-glyph';

interface AlertRow {
  readonly alert: ProjectAlert;
  readonly about: AlertDescription;
  readonly where: string;
  readonly time: string;
  readonly failed: boolean;
  readonly opens: boolean;
  readonly ci?: string;
}

const ROWS = 'ion-item.event, .pane__day, button.entry';
const SLIDE = 8;
const STAGGER = 40;
const MAX_STAGGER = 6;

export interface AlertOpen {
  readonly alert: ProjectAlert;
  readonly section?: 'logs';
}

@Component({
  selector: 'app-alert-list',
  imports: [ActivityGlyph, InsetGroup, IonItem, IonLabel],
  template: `
    @if (twoPane()) {
      <div class="pane">
        @for (group of groups(); track group.day) {
          <div class="pane__day" [animate.enter]="rise()">{{ group.label }}</div>
          @for (row of group.rows; track row.alert.id) {
            <button
              type="button"
              class="entry"
              [animate.enter]="rise()"
              aria-controls="activity-detail"
              [attr.aria-current]="row.alert.id === selectedId() ? 'true' : null"
              (click)="selected.emit(row.alert)"
            >
              <app-activity-glyph [kind]="row.alert.kind" />
              <span class="entry__body">
                <span class="entry__head">
                  <span class="entry__title" [class.unseen]="!row.alert.seen"
                    >{{ row.about.title }}
                    @if (!row.alert.seen) {
                      <span class="sr-only">, new</span>
                    }
                  </span>
                  <span class="entry__time tabular">{{ row.time }}</span>
                </span>
                <span class="entry__where">{{ row.where }}</span>
              </span>
            </button>
          }
        }
      </div>
    } @else {
      @for (group of groups(); track group.day) {
        <app-inset-group [label]="group.label" [trailing]="group.failed">
          @for (row of group.rows; track row.alert.id) {
            <!-- A row without buttons opens its task: whole rows are targets. -->
            <ion-item
              class="event"
              [animate.enter]="rise()"
              [class.failure]="row.failed"
              [button]="row.opens"
              [detail]="false"
              (click)="row.opens && opened.emit({ alert: row.alert })"
            >
              <app-activity-glyph slot="start" class="event__glyph" [kind]="row.alert.kind" />
              <ion-label class="event__body">
                <span class="event__head">
                  <span class="event__title" [class.unseen]="!row.alert.seen"
                    >{{ row.about.title }}
                    @if (!row.alert.seen) {
                      <span class="sr-only">, new</span>
                    }
                  </span>
                  <span class="event__time tabular">{{ row.time }}</span>
                </span>
                <span class="event__where">{{ row.where }}</span>
                @if (row.about.detail) {
                  <span class="event__detail">{{ row.about.detail }}</span>
                }
                @if (row.about.image) {
                  <span class="event__detail event__image font-mono"
                    ><bdi>{{ row.about.image }}</bdi></span
                  >
                }
                @if (row.failed) {
                  <span class="event__acts">
                    @if (row.alert.kind === 'deploy_failed') {
                      <button
                        type="button"
                        class="event__act event__act--accent"
                        (click)="opened.emit({ alert: row.alert, section: 'logs' })"
                      >
                        View logs
                      </button>
                    } @else if (row.ci) {
                      <a
                        class="event__act event__act--accent"
                        target="_blank"
                        rel="noopener"
                        [href]="row.ci"
                        >Open in CI</a
                      >
                    }
                    <button
                      type="button"
                      class="event__act"
                      (click)="opened.emit({ alert: row.alert })"
                    >
                      Open task
                    </button>
                  </span>
                }
              </ion-label>
            </ion-item>
          }
        </app-inset-group>
      }
    }
  `,
  styles: `
    /* Reinforcement only: the title says "failed" in words. */
    .failure {
      --background: var(--app-fail-row);
    }

    .event {
      --inner-padding-top: 0;
    }

    .event__glyph {
      align-self: flex-start;
      margin: 0.875rem 0.75rem 0 0;
    }

    /* Scoped under the row: Ionic's label rule has the same specificity. */
    .event .event__body {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
      margin: 0;
      padding: 0.8125rem 0 0.875rem;
      white-space: normal;
    }

    .event__head,
    .entry__head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .event__title {
      font-size: 1rem;
      line-height: 1.3125rem;
      font-weight: 400;
    }

    /* Unseen is weight, iOS Mail style, not another dot. */
    .event__title.unseen,
    .entry__title.unseen {
      font-weight: 700;
    }

    .event__time,
    .entry__time {
      flex: none;
      font-size: 0.8125rem;
      color: var(--app-text-tertiary);
    }

    .event__where,
    .entry__where {
      overflow: hidden;
      font-size: 0.8125rem;
      line-height: 1.125rem;
      color: var(--app-text-secondary);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .event__detail {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      overflow: hidden;
      font-size: 0.875rem;
      line-height: 1.1875rem;
      color: var(--app-text-tertiary);
      word-break: break-word;
    }

    /* A failure's cause often sits past the third line. */
    .failure .event__detail {
      -webkit-line-clamp: 12;
      color: var(--ion-color-danger);
    }

    /* Clipped at the head: the repository and tag are the part worth reading. */
    .event__image {
      display: block;
      direction: rtl;
      text-align: end;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .event__acts {
      display: flex;
      gap: 0.5rem;
      margin-block-start: 0.5rem;
    }

    .event__act {
      display: inline-flex;
      align-items: center;
      block-size: 2rem;
      padding: 0 0.75rem;
      border: 0;
      border-radius: 1rem;
      background: var(--app-fill);
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--app-text-primary);
      text-decoration: none;
      cursor: pointer;
    }

    .event__act--accent {
      background: var(--app-accent-soft);
      color: var(--app-accent-text);
    }

    .pane {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin-block-start: 0.875rem;
      padding: 0.375rem;
      border-radius: 1.625rem;
      background: var(--ion-item-background);
    }

    .pane__day {
      padding: 0.5rem 0.875rem 0.25rem;
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--app-text-tertiary);
    }

    /* Not ".item": Ionic puts that class on every ion-item host. */
    .entry {
      display: flex;
      gap: 0.75rem;
      inline-size: 100%;
      padding: 0.75rem 0.875rem;
      border: 0;
      border-radius: 1.125rem;
      background: none;
      color: var(--app-text-primary);
      text-align: start;
      cursor: pointer;
    }

    .entry[aria-current='true'] {
      background: rgba(120, 120, 128, 0.16);
    }

    .entry__body {
      display: flex;
      flex-direction: column;
      flex: 1;
      gap: 0.125rem;
      min-inline-size: 0;
    }

    .entry__title {
      font-size: 0.9375rem;
      font-weight: 400;
    }

    .entry__where {
      font-size: 0.75rem;
    }
  `,
})
export class AlertList {
  readonly alerts = input.required<readonly ProjectAlert[]>();
  readonly twoPane = input(false);
  readonly selectedId = input<string | null>(null);
  /** The run to open per task, only while that task's build is still failing. */
  readonly ciUrls = input<ReadonlyMap<string, string>>(new Map());
  /** Display names by slug; the feed carries slugs. */
  readonly projectNames = input<ReadonlyMap<string, string>>(new Map());
  /** Task keys still in the fleet: a deleted task's row stays plain. */
  readonly tasks = input<ReadonlySet<string>>(new Set());
  /** A new value marks the next rows as another view (filter, chip), never as arrivals. */
  readonly scope = input<unknown>();
  readonly selected = output<ProjectAlert>();
  readonly opened = output<AlertOpen>();
  /** Rows a refetch put on top. */
  readonly arrived = output<number>();

  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  private readonly ctx = gsap.context(() => undefined, this.host);
  private beat?: gsap.core.Animation;
  /* Bumped by every take(), and on destroy: a landing deferred to the next frame checks it is still the latest. */
  private takes = 0;
  protected readonly shown = signal<readonly ProjectAlert[]>([]);

  protected readonly rise = rise();
  protected readonly groups = computed(() => {
    const groups: { readonly day: string; readonly label: string; readonly rows: AlertRow[] }[] =
      [];

    /* Relies on newest-first input: each day's rows are contiguous. */
    for (const alert of this.shown()) {
      // Tracked by date: at midnight Today becomes Yesterday, and its rows must not be rebuilt.
      const day = alert.createdAt.toDateString();
      if (groups.at(-1)?.day !== day) {
        groups.push({ day, label: dayLabel(alert.createdAt), rows: [] });
      }
      const key = taskKey(alert.project, alert.taskName);
      const failed = matchesChip(alert, 'failures');
      groups.at(-1)!.rows.push({
        alert,
        about: describeAlert(alert),
        where: `${this.projectNames().get(alert.project) ?? alert.project} / ${alert.taskName}`,
        time: timeLabel(alert.createdAt),
        failed,
        opens: !failed && this.tasks().has(key),
        ci: this.ciUrls().get(key),
      });
    }

    return groups.map(({ day, label, rows }) => {
      const failed = rows.filter((row) => row.failed).length;
      return { day, label, rows, failed: failed ? `${failed} failed` : '' };
    });
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.takes++;
      this.ctx.revert();
    });
    let scope: unknown;
    effect(() => {
      const next = this.alerts();
      const same = scope === (scope = this.scope());
      untracked(() => this.take(next, same));
    });
  }

  private take(next: readonly ProjectAlert[], same: boolean): void {
    const ticket = ++this.takes;
    const count = same ? arrivals(this.shown(), next) : 0;
    // A new view lands the last beat first; a refetch of the same rows lets it play.
    if (!same) {
      this.beat?.eventCallback('onComplete', null);
      this.beat?.progress(1);
    }
    if (!count || !pageSettled(this.host)) {
      if (count) this.arrived.emit(count);
      this.shown.set(next);
      return;
    }
    // Measured and written next frame: now this tick's other writes would have the reads restyle the page in one long task.
    requestAnimationFrame(() => {
      if (ticket !== this.takes) return;
      // Arrivals during a beat wait for its end: cut short, the rows would jump to their places.
      if (this.beat && this.beat.progress() < 1) {
        this.beat.eventCallback('onComplete', () => this.take(this.alerts(), true));
        return;
      }
      this.ctx.clear();
      this.arrived.emit(count);
      if (!settled(this.host)) return this.shown.set(next);
      const known = new Set(this.host.querySelectorAll(ROWS));
      // Every list keeps a measured row, or one far off screen would look new and open from nothing.
      const before = measure(
        [...known].filter(
          (row, i, all) => near(row) || row.parentElement !== all[i - 1]?.parentElement,
        ),
      );
      this.shown.set(next);
      // New ion-items render their shadow DOM a microtask later, and they must be measured whole.
      afterNextRender(
        {
          read: () =>
            queueMicrotask(() =>
              queueMicrotask(() => ticket === this.takes && this.land(before, known)),
            ),
        },
        { injector: this.injector },
      );
    });
  }

  private land(before: ReadonlyMap<Element, number>, known: ReadonlySet<Element>): void {
    const all = [...this.host.querySelectorAll(ROWS)];
    // Arrivals land above the first known entry (in two panes, under its day label); an older page appended meanwhile follows.
    const top = all.findIndex((row) => known.has(row) && !row.matches('.pane__day'));
    const rows = all.filter((row, i) => before.has(row) || (i < top && !known.has(row)));
    // Unmeasured rows of a list that takes arrivals already stand where they land: in view, others would slide over them.
    const into = new Set(all.slice(0, top).map((row) => row.parentElement));
    const blind = all.some(
      (row) => into.has(row.parentElement) && known.has(row) && !before.has(row) && near(row, 0),
    );
    this.ctx.add(() => {
      const tl = gsap.timeline({
        defaults: { duration: S.layout.duration / 1000, ease: S.layout },
      });
      const fresh = relayout(tl, before, rows);
      if (!reduced() && !blind) {
        if (fresh.length) {
          tl.fromTo(
            fresh,
            { opacity: 0, y: -SLIDE },
            {
              opacity: 1,
              y: 0,
              duration: T.base / 1000,
              ease: E.out,
              // Past the sixth they land with it: left out, the old rows would slide over them.
              stagger: (i: number) => (Math.min(i, MAX_STAGGER - 1) * STAGGER) / 1000,
              clearProps: 'transform,opacity',
            },
            0,
          );
        }
        this.beat = nextFrame(tl);
        return;
      }
      // Rows snap and new ones fade through WAAPI, which Reduce Motion's 0.01 ms transitions cannot delay.
      tl.progress(1);
      for (const el of fresh) play(el, { opacity: [0, 1] }, T.quick);
    });
  }
}

/* Rows near the viewport, from `above` over it: the rest move out of sight. */
function near(row: Element, above = innerHeight): boolean {
  const { top, bottom } = row.getBoundingClientRect();
  return bottom > -above && top < 2 * innerHeight;
}

/* New rows on top of the old list, intact (older pages may follow): a refetch, not a filter. */
function arrivals(prev: readonly ProjectAlert[], next: readonly ProjectAlert[]): number {
  const count = prev.length ? next.findIndex((alert) => alert.id === prev[0].id) : -1;
  return count > 0 && prev.every((alert, i) => next[count + i]?.id === alert.id) ? count : 0;
}
