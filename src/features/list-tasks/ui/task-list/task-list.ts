import { NgTemplateOutlet } from '@angular/common';
import {
  AnimationCallbackEvent,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  untracked,
} from '@angular/core';
import { IonButton } from '@ionic/angular/ion-button';
import { IonItem } from '@ionic/angular/ion-item';
import { IonItemOption } from '@ionic/angular/ion-item-option';
import { IonItemOptions } from '@ionic/angular/ion-item-options';
import { IonItemSliding } from '@ionic/angular/ion-item-sliding';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonNote } from '@ionic/angular/ion-note';

import {
  Build,
  BuildStatus,
  DEV_STATUSES,
  DEV_STATUS_DOT,
  DEV_STATUS_LABEL,
  DevStatus,
  PENDING_LABEL,
  Task,
  TaskAction,
  TaskActionRequest,
  UNKNOWN_CONTAINER_HINT,
  isActiveBuild,
  isTransitioningTask,
  sortByDevStatus,
} from '@entities/task';
import { atLeastRole } from '@shared/api/role';
import { age } from '@shared/lib/format/age';
import { desktopScreen, wideScreen } from '@shared/ui/breakpoint/wide-screen';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';
import { gsap, measure, nextFrame, relayout, shut } from '@shared/ui/motion/flip';
import { E, S, T, reduced, settled } from '@shared/ui/motion/motion';
import { entrance, rise } from '@shared/ui/motion/page-motion';
import { SwapText, SymbolGlyph } from '@shared/ui/motion/symbol';

const FLIP_MAX = 8;
const OUT = 24;
const HOLD = 250;
const GLOW = 900;
const HELD = 2000;

let instances = 0;

@Component({
  selector: 'app-task-list',
  imports: [
    BuildStatus,
    InsetGroup,
    NgTemplateOutlet,
    IonButton,
    IonItem,
    IonItemOption,
    IonItemOptions,
    IonItemSliding,
    IonLabel,
    IonNote,
    SwapText,
    SymbolGlyph,
  ],
  template: `
    @if (desktop()) {
      <div class="mx-5 mt-2 mb-3 flex items-center gap-2">
        <div class="flex gap-2" role="group" aria-label="Filter by dev status">
          @for (chip of chips(); track chip.label) {
            <button
              type="button"
              class="chip"
              [attr.aria-pressed]="statusFilter() === chip.status"
              [disabled]="chip.count === 0"
              (click)="statusFilter.set(chip.status)"
            >
              @if (chip.status) {
                <i class="size-2 rounded-full" [class]="dot[chip.status]" aria-hidden="true"></i>
              }
              {{ chip.label }}
            </button>
          }
        </div>
        <label class="sr-only" [for]="filterId">Filter tasks</label>
        <input
          type="search"
          class="filter"
          placeholder="Filter by name or description"
          autocomplete="off"
          [id]="filterId"
          [value]="query()"
          (input)="query.set($any($event.target).value)"
        />
        <!-- Here, not by the tab switch, which must not move between tabs. -->
        @if (canCreate()) {
          <ion-button
            color="primary"
            fill="solid"
            class="act act--primary new"
            (click)="createRequested.emit()"
          >
            <span slot="start" class="icon-[regular--plus]" aria-hidden="true"></span>
            New task
          </ion-button>
        }
      </div>

      <app-inset-group>
        <ion-item class="head" aria-hidden="true">
          <div class="cols">
            <span></span>
            <span>Task</span>
            <span>Description</span>
            <span>Build</span>
            <span>Container</span>
            <span>Image</span>
            <span class="text-end">Updated</span>
          </div>
        </ion-item>
        @for (task of visible(); track task.id) {
          <ng-container *ngTemplateOutlet="wideRow; context: { $implicit: task }" />
        } @empty {
          <ion-item>
            <ion-label class="text-label-3!">No tasks match.</ion-label>
          </ion-item>
        }
      </app-inset-group>
    } @else {
      @for (group of groups(); track group.status; let first = $first; let last = $last) {
        <app-inset-group
          [label]="group.label"
          [trailing]="group.count"
          [attr.data-status]="group.status"
          (animate.leave)="onLeave($event)"
        >
          <i
            groupMark
            class="me-2 inline-block size-2 rounded-full align-middle"
            [class]="dot[group.status]"
            aria-hidden="true"
          ></i>
          @if (first && wide()) {
            <ion-item class="head" aria-hidden="true">
              <div class="cols">
                <span>Task</span>
                <span>Description</span>
                <span>Build</span>
                <span>Container</span>
                <span class="text-end">Updated</span>
              </div>
            </ion-item>
          }
          @for (task of group.tasks; track task.id) {
            @if (wide()) {
              <ng-container *ngTemplateOutlet="wideRow; context: { $implicit: task }" />
            } @else {
              <ion-item-sliding
                #sliding
                [disabled]="!operates(task)"
                [attr.data-flip-id]="task.id"
                [animate.enter]="rise()"
                (animate.leave)="onLeave($event)"
              >
                <ion-item button (click)="taskOpened.emit(task)">
                  <ion-label class="stack">
                    <!-- Any other state is read from the visible flag. -->
                    <span class="stack__name">
                      {{ task.name }}
                      @if (task.status === 'running') {
                        <span class="sr-only">, running</span>
                      }
                    </span>
                    @if (task.description) {
                      <span class="stack__sub">{{ task.description }}</span>
                    }
                    @if (buildOf(task); as build) {
                      <div class="stack__build">
                        <app-build-status mode="line" [build]="build" />
                      </div>
                    }
                  </ion-label>
                  <!-- No age: it never said what happened. -->
                  @if (task.status !== 'running' || busy(task)) {
                    <span
                      slot="end"
                      class="stack__meta"
                      [animate.enter]="busy(task) ? fadeIn() : ''"
                      [animate.leave]="fadeOut()"
                    >
                      <span class="flag" [attr.data-state]="busy(task) ? 'busy' : task.status"
                        ><app-swap-text [text]="busy(task) ?? task.status"
                      /></span>
                    </span>
                  }
                </ion-item>
                <ng-container
                  *ngTemplateOutlet="swipe; context: { $implicit: task, sliding: sliding }"
                />
              </ion-item-sliding>
            }
          }
          @if (last && !wide()) {
            <ion-note [animate.enter]="fadeIn()">
              Grouped by development status.
              @if (swipeable()) {
                Swipe a row to start, stop, restart or delete; the
              } @else {
                The
              }
              words on the right only appear when a container needs you.
            </ion-note>
          }
        </app-inset-group>
      }
    }

    <!-- Not an ion-item button: the minis would be nested interactive content (AXE). -->
    <ng-template #wideRow let-task>
      <ion-item-sliding
        #sliding
        [disabled]="!operates(task)"
        [attr.data-flip-id]="task.id"
        [animate.enter]="rise()"
        (animate.leave)="onLeave($event)"
      >
        <ion-item
          class="row"
          [class.acting]="operates(task)"
          (click)="taskOpened.emit(task)"
          (keydown.r)="restartKey($event, task)"
        >
          <div class="cols">
            <i class="dot size-2 rounded-full" [class]="dotOf(task)" aria-hidden="true"></i>
            <button type="button" class="name" (click)="open($event, task)">
              {{ task.name
              }}<span class="sr-only"
                >, {{ task.status === 'unknown' ? unknownHint : task.status }}</span
              >
            </button>
            <span class="desc">{{ task.description || '—' }}</span>
            <span class="build">
              @if (buildOf(task); as build) {
                <app-build-status [build]="build" />
                @if (build.url) {
                  <a
                    class="ci"
                    target="_blank"
                    rel="noopener"
                    [href]="build.url"
                    [attr.aria-label]="'Open the ' + task.name + ' run in CI'"
                    (click)="$event.stopPropagation()"
                    ><span class="icon-[regular--arrow-up-right]" aria-hidden="true"></span
                  ></a>
                }
              }
            </span>
            <span
              class="state"
              [attr.data-state]="busy(task) ? 'busy' : task.status"
              [attr.title]="task.status === 'unknown' ? unknownHint : null"
              ><app-swap-text [text]="busy(task) ?? task.status"
            /></span>
            <span class="image font-mono" [attr.title]="task.image">{{
              imageRef(task.image)
            }}</span>
            <span class="time tabular">{{ age(task.updatedAt) }}</span>
            <span class="acts">
              @if (operates(task)) {
                <button
                  type="button"
                  class="mini"
                  [attr.aria-description]="busy(task)"
                  (click)="act($event, task, on(task) ? 'stop' : 'start')"
                >
                  <app-symbol [name]="glyph(task)" />
                  {{ on(task) ? 'Stop' : 'Start' }}
                  <span class="sr-only">{{ task.name }}</span>
                </button>
                <button
                  type="button"
                  class="mini"
                  title="Restart (R)"
                  aria-keyshortcuts="R"
                  [attr.aria-description]="busy(task)"
                  (click)="act($event, task, 'restart')"
                >
                  <app-symbol
                    name="icon-[regular--arrow-rotate-right]"
                    [spin]="actionOf(task) === 'restart'"
                  />
                  Restart
                  <span class="sr-only">{{ task.name }}</span>
                </button>
              }
              <!-- No Delete mini: Delete lives in the task's menu. -->
              @if (!desktop() && edits(task)) {
                <button
                  type="button"
                  class="mini mini--danger"
                  [attr.aria-description]="busy(task)"
                  (click)="act($event, task, 'delete')"
                >
                  <span class="icon-[regular--trash]" aria-hidden="true"></span>
                  <span class="sr-only">Delete {{ task.name }}</span>
                </button>
              }
            </span>
          </div>
        </ion-item>
        <ng-container *ngTemplateOutlet="swipe; context: { $implicit: task, sliding: sliding }" />
      </ion-item-sliding>
    </ng-template>

    <ng-template #swipe let-task let-sliding="sliding">
      <ion-item-options side="end">
        <!-- Grey read as disabled; both colours take dark text (AA). -->
        <ion-item-option
          [color]="on(task) ? 'warning' : 'success'"
          [disabled]="acting().has(task.name)"
          (click)="requestLifecycle(task); sliding.close()"
        >
          <app-symbol slot="top" [name]="glyph(task)" />
          {{ on(task) ? 'Stop' : 'Start' }}
          <span class="sr-only"> {{ task.name }}</span>
        </ion-item-option>
        <ion-item-option
          color="primary"
          [disabled]="acting().has(task.name)"
          (click)="actionRequested.emit({ action: 'restart', task }); sliding.close()"
        >
          <app-symbol
            slot="top"
            name="icon-[solid--arrow-rotate-right]"
            [spin]="actionOf(task) === 'restart'"
          />
          Restart
          <span class="sr-only"> {{ task.name }}</span>
        </ion-item-option>
        @if (edits(task)) {
          <ion-item-option
            color="danger"
            [disabled]="acting().has(task.name)"
            (click)="actionRequested.emit({ action: 'delete', task }); sliding.close()"
          >
            <span slot="top" class="icon-[solid--trash]" aria-hidden="true"></span>
            Delete
            <span class="sr-only"> {{ task.name }}</span>
          </ion-item-option>
        }
      </ion-item-options>
    </ng-template>
  `,
  styles: `
    .stack__name {
      display: block;
      overflow: hidden;
      font-family: var(--app-font-mono);
      font-size: 1rem;
      line-height: 1.3125rem;
      font-weight: 600;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .stack__sub {
      display: block;
      overflow: hidden;
      font-size: 0.875rem;
      line-height: 1.1875rem;
      color: var(--app-text-tertiary);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .stack__build {
      display: flex;
      margin-block-start: 0.1875rem;
      font-size: 0.8125rem;
      line-height: 1.125rem;
      color: var(--app-text-secondary);
    }

    .stack__meta {
      display: flex;
      margin-inline-start: 0.75rem;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.125rem;
      font-size: 0.8125rem;
      color: var(--app-text-tertiary);
    }

    .flag {
      font-weight: 600;
      color: var(--app-text-primary);
    }

    .flag[data-state='error'],
    .state[data-state='error'] {
      color: var(--ion-color-danger);
    }

    .cols {
      display: grid;
      grid-template-columns: 9.375rem minmax(0, 1fr) 10rem 5.625rem 5rem;
      column-gap: 1rem;
      align-items: center;
      inline-size: 100%;
      font-size: 0.875rem;
      color: var(--app-text-tertiary);
    }

    .dot,
    .image {
      display: none;
    }

    .head {
      --row-min-height: 2.375rem;
    }

    .head .cols span {
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.02em;
    }

    .row {
      --row-min-height: 3.375rem;
      cursor: pointer;
    }

    .row:is(:hover, :focus-within) {
      --background: var(--app-background-neutral-1);
    }

    .name {
      overflow: hidden;
      margin: 0;
      padding: 0;
      border: 0;
      background: none;
      font-family: var(--app-font-mono);
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--app-text-primary);
      text-align: start;
      text-overflow: ellipsis;
      white-space: nowrap;
      cursor: pointer;
    }

    .desc,
    .image {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .state[data-state='stopped'] {
      color: var(--app-text-primary);
    }

    /* By the words on show, not the state: hidden mid-swap, they would flash or cut. */
    .state > [data-text='running'] {
      visibility: hidden;
    }

    /* Its tooltip explains it; the dotted line says there is one. */
    .state[data-state='unknown'] {
      text-decoration: underline dotted;
      text-underline-offset: 0.2em;
      cursor: help;
    }

    .time {
      text-align: end;
    }

    .build {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      min-inline-size: 0;
      color: var(--app-text-secondary);
    }

    .ci {
      display: flex;
      flex: none;
      align-items: center;
      justify-content: center;
      inline-size: 1.75rem;
      block-size: 1.75rem;
      border-radius: 0.875rem;
      color: var(--ion-color-primary);
    }

    .acts {
      display: none;
      gap: 0.375rem;
      grid-column: 4 / span 2;
      justify-self: end;
    }

    /* Only a row with minis trades its columns for them, or a viewer's hover would blank them. */
    .row.acting:is(:hover, :focus-within) :is(.state, .time) {
      display: none;
    }

    .row.acting:is(:hover, :focus-within) .acts {
      display: flex;
    }

    .mini {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      block-size: 2rem;
      margin: 0;
      padding: 0 0.75rem;
      border: 0;
      border-radius: 1rem;
      background: var(--ion-item-background);
      box-shadow: 0 0 0 0.5px var(--app-border-normal);
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--app-text-primary);
      white-space: nowrap;
      cursor: pointer;
    }

    .mini--danger {
      color: var(--ion-color-danger);
    }

    @media (min-width: 64rem) and (min-height: 31.25rem) {
      ion-item::part(detail-icon) {
        display: none;
      }
    }

    @media (min-width: 80rem) {
      .cols {
        grid-template-columns: 0.5rem 8.75rem minmax(0, 1fr) 10rem 6.875rem 7.5rem 5.625rem;
      }

      .dot,
      .image {
        display: block;
      }

      .image {
        font-size: 0.75rem;
      }

      .row {
        --row-min-height: 3.125rem;
      }

      .name {
        font-size: 0.875rem;
      }

      .acts {
        grid-column: 6 / span 2;
      }

      /* The state stays beside the minis: it is what they change. */
      .row.acting:is(:hover, :focus-within) .state {
        display: revert;
      }

      .row.acting:is(:hover, :focus-within) .image {
        display: none;
      }

      .mini {
        gap: 0.3125rem;
        block-size: 1.75rem;
        padding: 0 0.625rem;
        font-size: 0.75rem;
      }
    }

    .chip {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      block-size: 2rem;
      padding: 0 0.8125rem;
      border: 0;
      border-radius: 1rem;
      background: var(--ion-item-background);
      box-shadow: 0 0 0 0.5px var(--app-border-normal);
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--app-text-secondary);
      cursor: pointer;
    }

    .chip[aria-pressed='true'] {
      background: var(--ion-color-primary);
      color: var(--ion-color-primary-contrast);
    }

    .chip:disabled {
      opacity: 0.5;
      cursor: default;
    }

    .filter {
      inline-size: 17.5rem;
      block-size: 2.25rem;
      margin-inline-start: auto;
      padding: 0 0.875rem;
      border: 0;
      border-radius: 1.125rem;
      outline: none;
      background: var(--ion-item-background);
      box-shadow: 0 0 0 0.5px var(--app-border-normal);
      font: inherit;
      font-size: 0.875rem;
      color: var(--app-text-primary);
    }

    /* Ionic's 2px button margin would stop it short of the table's edge. */
    .new {
      margin: 0;
    }

    .filter:focus-visible {
      box-shadow: 0 0 0 2px var(--ion-color-primary);
    }
  `,
})
export class TaskList {
  readonly tasks = input.required<readonly Task[]>();
  /** The action in flight per task name (names are unique only within the project). */
  readonly pending = input.required<ReadonlyMap<string, TaskAction>>();
  /** The fleet's latest CI report per task name. */
  readonly builds = input<ReadonlyMap<string, Build>>(new Map());
  /** Desktop puts New task in the list's toolbar. */
  readonly canCreate = input(false);
  readonly actionRequested = output<TaskActionRequest>();
  readonly taskOpened = output<Task>();
  readonly createRequested = output<void>();
  /** "‹task› moved to ‹Group›" after a refetch moved rows. */
  readonly moved = output<string>();

  protected readonly rise = rise();
  protected readonly wide = wideScreen();
  protected readonly desktop = desktopScreen();
  protected readonly dot = DEV_STATUS_DOT;
  protected readonly unknownHint = UNKNOWN_CONTAINER_HINT;
  protected readonly age = age;
  protected readonly statusFilter = signal<DevStatus | null>(null);
  protected readonly query = signal('');
  protected readonly filterId = `task-filter-${(instances += 1)}`;

  protected readonly shown = signal<readonly Task[]>([]);
  private readonly sorted = computed(() => sortByDevStatus(this.shown()));

  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  private readonly ctx = gsap.context(() => undefined, this.host);
  protected readonly fadeIn = entrance('fx-in');
  protected readonly fadeOut = entrance('fx-out');
  /* ① fades or a write renders: newer tasks wait, and the rows it removes hand their focus on. */
  private leaving = false;
  private lost?: { id: string; next?: Element };
  /* The row a confirmed Delete removes: its alert took focus, so the leave cannot see it. */
  private dropping?: string;
  /* A re-sort moves a row's node, which drops focus from the control inside it: that control and its light host. */
  private kept?: [HTMLElement, Element];
  private flips?: gsap.core.Animation;

  /* A finished action keeps its words until its row shows a newer update: the refetch lands after the response. */
  protected readonly acting = linkedSignal<
    { pending: ReadonlyMap<string, TaskAction>; tasks: readonly Task[] },
    ReadonlyMap<string, { action: TaskAction; at: number }>
  >({
    source: () => ({ pending: this.pending(), tasks: this.tasks() }),
    computation: ({ pending, tasks }, prev) => {
      const at = new Map(tasks.map((task) => [task.name, task.updatedAt.getTime()]));
      const acting = new Map(prev?.value);
      for (const [name, action] of pending) {
        acting.set(name, { action, at: at.get(name) ?? 0 });
      }
      for (const [name, held] of acting) {
        if (!pending.has(name) && at.get(name) !== held.at) acting.delete(name);
      }
      return acting;
    },
  });

  /* The hint must not promise a swipe the caller's role does not have. */
  protected readonly swipeable = computed(() => this.tasks().some((task) => this.operates(task)));

  protected readonly groups = computed(() =>
    DEV_STATUSES.map((status) => {
      const tasks = this.sorted().filter((task) => task.devStatus === status);
      return { status, label: DEV_STATUS_LABEL[status], count: String(tasks.length), tasks };
    }).filter((group) => group.tasks.length > 0),
  );

  protected readonly chips = computed(() => [
    { status: null, count: this.tasks().length, label: `All · ${this.tasks().length}` },
    ...DEV_STATUSES.map((status) => {
      const count = this.tasks().filter((t) => t.devStatus === status).length;
      return { status, count, label: `${DEV_STATUS_LABEL[status]} · ${count}` };
    }),
  ]);

  protected readonly visible = computed(() => {
    const status = this.statusFilter();
    const query = this.query().trim().toLowerCase();
    return this.sorted().filter(
      (task) =>
        (!status || task.devStatus === status) &&
        (!query ||
          task.name.toLowerCase().includes(query) ||
          (task.description ?? '').toLowerCase().includes(query)),
    );
  });

  /* Methods, not fields: ng-template contexts are untyped. */
  protected operates(task: Task): boolean {
    return atLeastRole(task.myRole, 'operator');
  }

  protected edits(task: Task): boolean {
    return atLeastRole(task.myRole, 'member');
  }

  protected buildOf(task: Task): Build | undefined {
    const build = this.builds().get(task.name);
    return isActiveBuild(build) ? build : undefined;
  }

  protected dotOf(task: Task): string {
    return DEV_STATUS_DOT[task.devStatus];
  }

  protected imageRef(image: string): string {
    const digest = /@sha256:([0-9a-f]{6})/.exec(image);
    if (digest) return `sha256:${digest[1]}`;
    const tag = /:([^/:]+)$/.exec(image);
    return tag ? tag[1] : 'latest';
  }

  protected open(event: Event, task: Task): void {
    event.stopPropagation();
    this.taskOpened.emit(task);
  }

  protected act(event: Event, task: Task, action: TaskAction): void {
    event.stopPropagation();
    if (this.acting().has(task.name)) return;
    this.actionRequested.emit({ action, task });
  }

  /* Only while the row has focus, so a letter never acts page-wide (WCAG 2.1.4). */
  protected restartKey(event: Event, task: Task): void {
    if (!this.operates(task) || this.acting().has(task.name)) return;
    event.preventDefault();
    this.actionRequested.emit({ action: 'restart', task });
  }

  protected requestLifecycle(task: Task): void {
    this.actionRequested.emit({ action: this.on(task) ? 'stop' : 'start', task });
  }

  protected actionOf(task: Task): TaskAction | undefined {
    return this.acting().get(task.name)?.action;
  }

  protected busy(task: Task): string | null {
    const action = this.actionOf(task);
    return action === 'start' || action === 'stop' || action === 'restart'
      ? PENDING_LABEL[action]
      : null;
  }

  /* A pending action keeps the Start/Stop it began from, as on the task page. */
  protected on(task: Task): boolean {
    const action = this.actionOf(task);
    if (action === 'start' || action === 'stop') return action === 'stop';
    return task.status === 'running' || (action === 'restart' && isTransitioningTask(task));
  }

  protected glyph(task: Task): string | null {
    const action = this.actionOf(task);
    if (action === 'start' || action === 'stop') return null;
    return this.on(task) ? 'icon-[solid--stop]' : 'icon-[solid--play]';
  }

  constructor() {
    inject(DestroyRef).onDestroy(() => this.ctx.revert());
    effect(() => {
      const next = this.tasks();
      untracked(() => this.update(next));
    });
    effect(() => {
      const name = [...this.pending()].find(([, action]) => action === 'delete')?.[0];
      if (name) this.dropping = untracked(this.tasks).find((task) => task.name === name)?.id;
    });
    /* A refused action never refetches: its words go after a while. */
    const ended = computed(() =>
      [...this.acting().keys()].filter((name) => !this.pending().has(name)).join('\n'),
    );
    effect((onCleanup) => {
      const names = ended() ? ended().split('\n') : [];
      if (!names.length) return;
      const timer = setTimeout(
        () =>
          this.acting.update(
            (acting) => new Map([...acting].filter(([name]) => !names.includes(name))),
          ),
        HELD,
      );
      onCleanup(() => clearTimeout(timer));
    });
  }

  protected onLeave({ target, animationComplete }: AnimationCallbackEvent): void {
    const el = target as HTMLElement;
    const focused = document.activeElement?.closest('ion-item-sliding');
    const held = focused && el.contains(focused) ? flipId(focused) : undefined;
    const id = held ?? (this.dropping === flipId(el) ? this.dropping : undefined);
    if (this.leaving && id !== undefined) {
      // Its neighbour now, before other leaving rows go.
      this.lost = { id, next: this.neighbour(id) };
      this.dropping = undefined;
    }
    // Inert for lookups, and hidden first: a nested leave (its flag's fade) would keep the old copy up.
    el.inert = true;
    el.style.display = 'none';
    animationComplete();
  }

  private update(next: readonly Task[]): void {
    const prev = this.shown();
    if (this.leaving || next === prev) return;
    const same = prev.length > 0 && sameLayout(prev, next);
    // A write that moves rows waits for the running beat, whose rows would jump if cut short; one of the same rows lets it play.
    if (!same && this.flips && this.flips.progress() < 1) {
      this.flips.eventCallback('onComplete', () => this.update(this.tasks()));
      return;
    }
    const moved = prev.length ? movedTasks(prev, next) : [];
    // A Delete that failed keeps its row, so its mark must not pull focus later.
    const dropped = next.find((task) => task.id === this.dropping);
    if (dropped && this.pending().get(dropped.name) !== 'delete') this.dropping = undefined;
    if (!same) this.ctx.clear();
    if (same || !prev.length || !settled(this.host) || moved.length > FLIP_MAX) {
      if (!same && prev.length) this.hold();
      return this.write(next, moved);
    }
    const gone = this.goneFor(prev, next, moved);
    if (!gone.length) return this.write(next, moved, measure(this.rows()));
    // ① fades what goes where it stands, with no render; ② swaps it for gaps and writes once.
    this.leaving = true;
    const ids = new Set(next.map((task) => task.id));
    const deleted = gone.filter((el) => el.matches('ion-item-sliding') && !ids.has(flipId(el)));
    const out = { duration: T.quick / 1000, ease: reduced() ? 'none' : E.in };
    this.ctx.add(() => {
      const beatOut = gsap.timeline({ onComplete: () => this.close(gone, next, moved) });
      // An emptied group by its list, a block.
      const lists = gone.map((el) => el.querySelector(':scope > ion-list') ?? el);
      beatOut.to(lists, { ...out, opacity: 0 }, 0);
      // GSAP warns on an empty target list.
      if (deleted.length && !reduced()) beatOut.to(deleted, { ...out, x: -OUT }, 0);
      this.flips = nextFrame(beatOut);
    });
  }

  /* What ① fades: deleted rows, moved ones (desktop slides them in place, Reduce Motion jumps them), emptied groups, and a column head or footer whose group loses its place. */
  private goneFor(
    prev: readonly Task[],
    next: readonly Task[],
    moved: readonly Task[],
  ): HTMLElement[] {
    const ids = new Set(next.map((task) => task.id));
    const goes = new Set(
      [
        ...prev.filter((task) => !ids.has(task.id)),
        ...(this.desktop() || reduced() ? [] : moved),
      ].map((task) => task.id),
    );
    const ends = DEV_STATUSES.filter((status) => next.some((task) => task.devStatus === status));
    const marks = [
      ...this.host.querySelectorAll<HTMLElement>('app-inset-group[data-status]'),
    ].flatMap((group) => {
      const status = group.dataset['status'];
      if (!ends.some((end) => end === status)) return [group];
      return [...group.querySelectorAll<HTMLElement>('ion-item.head, ion-list > ion-note')].filter(
        (mark) => status !== (mark.localName === 'ion-note' ? ends.at(-1) : ends[0]),
      );
    });
    const rows = [...this.host.querySelectorAll<HTMLElement>('ion-item-sliding')].filter((row) =>
      goes.has(flipId(row)),
    );
    // A row inside an emptied group goes with it.
    return [...marks, ...rows].filter(
      (el, _, all) => !all.some((other) => other !== el && other.contains(el)),
    );
  }

  /* ② measures while what ① faded holds its space, swaps each for a gap that size, and writes once. */
  private close(gone: readonly HTMLElement[], next: readonly Task[], moved: readonly Task[]): void {
    const before = measure(this.rows());
    const gaps = gone.map(gapFor).map((place) => place());
    for (const el of gone) {
      el.inert = true;
      el.style.display = 'none';
    }
    this.write(next, moved, before, gaps);
  }

  private write(
    next: readonly Task[],
    moved: readonly Task[],
    before?: ReadonlyMap<Element, number>,
    gaps: readonly HTMLElement[] = [],
  ): void {
    // Under Reduce Motion nothing tweens, so this write lands at once too.
    if (before && reduced()) this.hold();
    this.remember();
    this.leaving = true;
    this.shown.set(next);
    this.after(() => {
      this.leaving = false;
      if (before) this.flip(before, gaps);
      this.glow(moved);
      this.refocus();
      const again = () => this.update(this.tasks());
      if (this.flips && this.flips.progress() < 1) this.flips.eventCallback('onComplete', again);
      else again();
    });
  }

  /* A write at once: Angular drops a moved row's old copy before Stencil gives the new one its height. */
  private hold(): void {
    const spacer = document.createElement('div');
    spacer.className = 'fx-gap';
    spacer.inert = true;
    // The list's height, till two frames after the write renders (a new group's parts take that long): a shorter page clamps its scroll for good.
    spacer.style.cssText = `display: flow-root; height: ${this.host.getBoundingClientRect().height}px`;
    this.host.append(spacer);
    this.after(() => requestAnimationFrame(() => requestAnimationFrame(() => spacer.remove())));
  }

  private flip(before: ReadonlyMap<Element, number>, gaps: readonly HTMLElement[]): void {
    const drop = () => gaps.forEach((gap) => gap.remove());
    // Not once the page has left: on its return the layout would be stale.
    if (reduced() || !settled(this.host)) return drop();
    this.ctx.add(() => {
      const tl = gsap.timeline({
        defaults: { duration: S.layout.duration / 1000, ease: S.layout },
      });
      const shuts = gaps.map((gap) => shut(gap));
      const fresh = relayout(tl, before, this.rows(), gaps);
      if (gaps.length) {
        tl.fromTo(
          gaps,
          { marginBottom: (i: number) => shuts[i][0], autoRound: false },
          {
            height: 0,
            marginBottom: (i: number) => shuts[i][1],
            // As relayout()'s boxes: whole pixels against the rows' offsets would wobble.
            autoRound: false,
            onComplete: drop,
          },
          0,
        );
      }
      if (fresh.length) {
        tl.fromTo(
          fresh,
          { opacity: 0 },
          { opacity: 1, duration: T.base / 1000, ease: E.out, clearProps: 'opacity' },
          0,
        );
      }
      // An empty beat still reports progress 0 as it completes, so whatever waited on it would wait forever.
      this.flips = tl.duration() ? nextFrame(tl) : undefined;
    });
  }

  private glow(moved: readonly Task[]): void {
    if (!moved.length) return;
    for (const { id } of moved) {
      const row = this.row(id);
      if (!row) continue;
      gsap.killTweensOf(row, '--glow');
      row.classList.add('fx-glow');
      this.ctx.add(() =>
        nextFrame(
          gsap.fromTo(
            row,
            { '--glow': 1 },
            {
              '--glow': 0,
              delay: HOLD / 1000,
              duration: GLOW / 1000,
              ease: 'power1.out',
              onComplete: () => row.classList.remove('fx-glow'),
            },
          ),
        ),
      );
    }
    this.moved.emit(
      moved.map((task) => `${task.name} moved to ${DEV_STATUS_LABEL[task.devStatus]}`).join('. '),
    );
  }

  private remember(): void {
    const light = document.activeElement;
    if (!light || !this.host.contains(light)) return;
    let el = light;
    while (el.shadowRoot?.activeElement) el = el.shadowRoot.activeElement;
    this.kept = [el as HTMLElement, light];
  }

  /* Once focus fell: the same control if its row only moved, else that row in its new group, else a neighbour. */
  private refocus(): void {
    const [kept, light] = this.kept ?? [];
    const lost = this.lost;
    this.kept = this.lost = undefined;
    if (!this.fallen()) return;
    // No scrolling: a group still opening would scroll its own clipped list.
    const calm = { preventScroll: true };
    if (kept?.isConnected && !light?.closest('[inert]')) {
      // Minis show only while their row holds focus, so the row's name takes it first.
      light?.closest('ion-item-sliding')?.querySelector<HTMLElement>('button.name')?.focus(calm);
      kept.focus(calm);
      if (!this.fallen()) return;
    }
    // A row Angular dropped during the render took its focus with no leave to record it; its id still leads.
    const id = lost?.id ?? (light && flipId(light.closest('ion-item-sliding') ?? light));
    const row = (id && this.row(id)) || lost?.next;
    if (!row) return;
    // A new row takes focus only once Ionic has rendered it, a frame or two later.
    const land = (tries: number) => {
      if (!this.fallen()) return;
      (
        row.querySelector<HTMLElement>('button.name') ??
        row.querySelector('ion-item')?.shadowRoot?.querySelector<HTMLElement>('.item-native')
      )?.focus(calm);
      if (this.fallen() && tries) requestAnimationFrame(() => land(tries - 1));
    };
    land(5);
  }

  /* Focus in a leaving copy has fallen too: Chrome takes it off an inert element only a task later. */
  private fallen(): boolean {
    const active = document.activeElement;
    return (
      active === document.body ||
      (!!active && this.host.contains(active) && !!active.closest('[inert]'))
    );
  }

  private neighbour(id: string): Element | undefined {
    const rows = [...this.host.querySelectorAll('ion-item-sliding')];
    const at = rows.findIndex((row) => flipId(row) === id);
    const stays = (row: Element) => !row.closest('[inert]');
    return rows.slice(at + 1).find(stays) ?? rows.slice(0, at).reverse().find(stays);
  }

  /* Leaving rows and groups are inert, so they never count. */
  private rows(): Element[] {
    return [...this.host.querySelectorAll('ion-item-group > :not(.fx-gap)')].filter(
      (el) => !el.closest('[inert]'),
    );
  }

  private row(id: string): HTMLElement | undefined {
    const rows = this.host.querySelectorAll<HTMLElement>(
      `ion-item-sliding[data-flip-id="${CSS.escape(id)}"]`,
    );
    return [...rows].find((row) => !row.closest('[inert]'));
  }

  /* New Ionic rows render their shadow DOM a microtask after Angular, and they must be measured whole. */
  private after(read: () => void): void {
    afterNextRender(
      {
        read: () => queueMicrotask(() => queueMicrotask(read)),
      },
      { injector: this.injector },
    );
  }
}

const flipId = (el: Element): string => (el as HTMLElement).dataset['flipId'] ?? '';

/* A plain block shaped like what goes, which Angular never takes away: measured now, placed when called, so the reads come first. */
function gapFor(el: Element): () => HTMLElement {
  const list = el.querySelector('ion-list');
  const box = list ?? el;
  const { height } = box.getBoundingClientRect();
  const { marginTop, marginBottom } = getComputedStyle(box);
  // A group's top margin collapses into the one above; a row's or the footer's counts, so it joins the height.
  const top = list ? 0 : parseFloat(marginTop);
  return () => {
    const gap = document.createElement('div');
    gap.className = 'fx-gap';
    gap.style.cssText = `display: flow-root; height: ${height + top}px; margin: ${list ? marginTop : 0} 0 ${marginBottom}`;
    el.before(gap);
    return gap;
  };
}

function movedTasks(prev: readonly Task[], next: readonly Task[]): Task[] {
  const before = new Map(prev.map((task) => [task.id, task.devStatus]));
  return next.filter((task) => before.has(task.id) && before.get(task.id) !== task.devStatus);
}

function sameLayout(prev: readonly Task[], next: readonly Task[]): boolean {
  const key = (tasks: readonly Task[]) =>
    sortByDevStatus(tasks)
      .map((task) => `${task.id}:${task.devStatus}:${!task.description}`)
      .join();
  return key(prev) === key(next);
}
