import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
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
  Task,
  TaskAction,
  TaskActionRequest,
  UNKNOWN_CONTAINER_HINT,
  isActiveBuild,
  sortByDevStatus,
} from '@entities/task';
import { atLeastRole } from '@shared/api/role';
import { age } from '@shared/lib/format/age';
import { desktopScreen, wideScreen } from '@shared/ui/breakpoint/wide-screen';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';

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
        <app-inset-group [label]="group.label" [trailing]="group.count">
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
              <ion-item-sliding #sliding [disabled]="!operates(task)">
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
                  @if (task.status !== 'running') {
                    <span slot="end" class="stack__meta">
                      <span class="flag" [attr.data-state]="task.status">{{ task.status }}</span>
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
            <ion-note>
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
      <ion-item-sliding #sliding [disabled]="!operates(task)">
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
              [attr.data-state]="task.status"
              [attr.title]="task.status === 'unknown' ? unknownHint : null"
              >{{ task.status }}</span
            >
            <span class="image font-mono" [attr.title]="task.image">{{
              imageRef(task.image)
            }}</span>
            <span class="time tabular">{{ age(task.updatedAt) }}</span>
            <span class="acts">
              @if (operates(task)) {
                <button
                  type="button"
                  class="mini"
                  [disabled]="pendingTaskIds().has(task.name)"
                  (click)="act($event, task, task.status === 'running' ? 'stop' : 'start')"
                >
                  <span
                    [class]="
                      task.status === 'running' ? 'icon-[solid--stop]' : 'icon-[solid--play]'
                    "
                    aria-hidden="true"
                  ></span>
                  {{ task.status === 'running' ? 'Stop' : 'Start' }}
                  <span class="sr-only">{{ task.name }}</span>
                </button>
                <button
                  type="button"
                  class="mini"
                  title="Restart (R)"
                  aria-keyshortcuts="R"
                  [disabled]="pendingTaskIds().has(task.name)"
                  (click)="act($event, task, 'restart')"
                >
                  <span class="icon-[regular--arrow-rotate-right]" aria-hidden="true"></span>
                  Restart
                  <span class="sr-only">{{ task.name }}</span>
                </button>
              }
              <!-- No Delete mini: Delete lives in the task's menu. -->
              @if (!desktop() && edits(task)) {
                <button
                  type="button"
                  class="mini mini--danger"
                  [disabled]="pendingTaskIds().has(task.name)"
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
          [color]="task.status === 'running' ? 'warning' : 'success'"
          [disabled]="pendingTaskIds().has(task.name)"
          (click)="requestLifecycle(task); sliding.close()"
        >
          <span
            slot="top"
            [class]="task.status === 'running' ? 'icon-[solid--stop]' : 'icon-[solid--play]'"
            aria-hidden="true"
          ></span>
          {{ task.status === 'running' ? 'Stop' : 'Start' }}
          <span class="sr-only"> {{ task.name }}</span>
        </ion-item-option>
        <ion-item-option
          color="primary"
          [disabled]="pendingTaskIds().has(task.name)"
          (click)="actionRequested.emit({ action: 'restart', task }); sliding.close()"
        >
          <span slot="top" class="icon-[solid--arrow-rotate-right]" aria-hidden="true"></span>
          Restart
          <span class="sr-only"> {{ task.name }}</span>
        </ion-item-option>
        @if (edits(task)) {
          <ion-item-option
            color="danger"
            [disabled]="pendingTaskIds().has(task.name)"
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

    .state[data-state='running'] {
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
  /** Task names, unique only within the page's project. */
  readonly pendingTaskIds = input.required<ReadonlySet<string>>();
  /** The fleet's latest CI report per task name. */
  readonly builds = input<ReadonlyMap<string, Build>>(new Map());
  /** Desktop puts New task in the list's toolbar. */
  readonly canCreate = input(false);
  readonly actionRequested = output<TaskActionRequest>();
  readonly taskOpened = output<Task>();
  readonly createRequested = output<void>();

  protected readonly wide = wideScreen();
  protected readonly desktop = desktopScreen();
  protected readonly dot = DEV_STATUS_DOT;
  protected readonly unknownHint = UNKNOWN_CONTAINER_HINT;
  protected readonly age = age;
  protected readonly statusFilter = signal<DevStatus | null>(null);
  protected readonly query = signal('');
  protected readonly filterId = `task-filter-${(instances += 1)}`;

  private readonly sorted = computed(() => sortByDevStatus(this.tasks()));

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
    this.actionRequested.emit({ action, task });
  }

  /* Only while the row has focus, so a letter never acts page-wide (WCAG 2.1.4). */
  protected restartKey(event: Event, task: Task): void {
    if (!this.operates(task) || this.pendingTaskIds().has(task.name)) return;
    event.preventDefault();
    this.actionRequested.emit({ action: 'restart', task });
  }

  protected requestLifecycle(task: Task): void {
    this.actionRequested.emit({ action: task.status === 'running' ? 'stop' : 'start', task });
  }
}
