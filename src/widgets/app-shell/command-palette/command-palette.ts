import { DOCUMENT } from '@angular/common';
import {
  Component,
  ElementRef,
  Injector,
  afterRenderEffect,
  computed,
  inject,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular/modal-controller';
import { NavController } from '@ionic/angular/nav-controller';
import { Observable, defer, from, switchMap } from 'rxjs';

import {
  DEV_STATUS_DOT,
  isTransitioningTask,
  taskKey,
  type TaskStateAction,
  type TaskSummary,
} from '@entities/task/model';
import { ControlTaskStore } from '@features/control-task';
import { ListProjectsStore } from '@features/list-projects/model';
/* Root barrel on purpose: growing the eager model entry would cost every page load. */
import { matchProjects, parseQuery, rankTasks } from '@features/search-tasks';
import { SearchTasksStore, type FleetTask } from '@features/search-tasks/model';
import { atLeastRole } from '@shared/api/role';
import { NotifyService } from '@shared/ui/notify/notify';

import { NAV } from '../nav';

type Section = 'Actions' | 'Recent' | 'Tasks' | 'Go to';

interface PaletteOption {
  readonly key: string;
  readonly section: Section;
  /* Written out whole, or Tailwind never generates it. */
  readonly icon: string;
  readonly dot: string;
  readonly typed: string;
  readonly text: string;
  readonly scope: string;
  readonly ref: string;
  readonly sub: string;
  readonly run: () => void;
}

interface PaletteGroup {
  readonly section: Section;
  readonly items: readonly { readonly option: PaletteOption; readonly index: number }[];
}

/* Reversible verbs only: delete needs its confirm and deploys have no UI. */
const VERBS: readonly {
  readonly action: TaskStateAction;
  readonly label: string;
  readonly icon: string;
}[] = [
  { action: 'start', label: 'Start', icon: 'icon-[light--play]' },
  { action: 'stop', label: 'Stop', icon: 'icon-[light--stop]' },
  { action: 'restart', label: 'Restart', icon: 'icon-[light--arrow-rotate-right]' },
];

const ACTIONS_MAX = 5;
const TASKS_MAX = 5;
const PROJECTS_MAX = 3;
const GO_TO_MAX = 6;

/** Completes once the palette is dismissed. */
export function presentCommandPalette(injector: Injector): Observable<unknown> {
  const modals = injector.get(ModalController);
  return defer(() =>
    modals.create({
      component: CommandPalette,
      cssClass: 'app-palette',
      htmlAttributes: { 'aria-label': 'Command palette' },
      /* Not animated: keys typed right after ⌘K would land on the page during the slide-up. */
      animated: false,
    }),
  ).pipe(switchMap((modal) => from(modal.present().then(() => modal.onDidDismiss()))));
}

@Component({
  selector: 'app-command-palette',
  providers: [ControlTaskStore],
  template: `
    <div class="bar">
      <span class="glyph icon-[light--magnifying-glass]" aria-hidden="true"></span>
      <label class="sr-only" for="cmd-q">Search or run a command</label>
      <input
        #field
        id="cmd-q"
        type="text"
        role="combobox"
        placeholder="Search or run a command"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        aria-expanded="true"
        aria-controls="cmd-list"
        aria-autocomplete="list"
        [attr.aria-activedescendant]="current() >= 0 ? 'cmd-opt-' + current() : null"
        [value]="query()"
        (input)="onInput($event)"
        (keydown)="onKeydown($event)"
      />
      <kbd aria-hidden="true">esc</kbd>
    </div>

    <!-- Options are not focusable: the field keeps focus and points at the active one. -->
    <div id="cmd-list" class="list" role="listbox" aria-label="Results">
      @for (group of groups(); track group.section) {
        <div role="group" [attr.aria-labelledby]="'cmd-sec-' + $index">
          <div class="sec" role="presentation" [id]="'cmd-sec-' + $index">{{ group.section }}</div>
          @for (item of group.items; track item.option.key) {
            <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -- the field owns the keyboard: arrows move, Enter runs -->
            <div
              class="opt"
              role="option"
              [id]="'cmd-opt-' + item.index"
              [attr.aria-selected]="item.index === current()"
              (click)="run(item.option)"
              (mousemove)="active.set(item.index)"
            >
              @if (item.option.icon) {
                <span class="glyph" [class]="item.option.icon" aria-hidden="true"></span>
              } @else {
                <i class="dot" [class]="item.option.dot" aria-hidden="true"></i>
              }
              <!-- No control flow in here: a block's line breaks would split "Rest" from "art". -->
              <span class="label"
                ><b>{{ item.option.typed }}</b
                >{{ item.option.text
                }}<span class="ref"
                  ><span class="scope">{{ item.option.scope }}</span
                  >{{ item.option.ref }}</span
                ></span
              >
              @if (item.option.sub) {
                <span class="sub">{{ item.option.sub }}</span>
              }
              @if (item.index === current()) {
                <kbd aria-hidden="true">↵</kbd>
              }
            </div>
          }
        </div>
      }
    </div>
    @if (!options().length) {
      <p class="none">No matches. Try a task name, a project or “restart”.</p>
    }
    <p class="sr-only" aria-live="polite">{{ status() }}</p>

    <div class="foot" aria-hidden="true">
      <span><kbd>↑</kbd><kbd>↓</kbd>move</span>
      @if (current() >= 0) {
        <span><kbd>↵</kbd>{{ enterVerb() }}</span>
      }
      <span class="ms-auto">start · stop · restart + a task name</span>
    </div>
  `,
  styles: `
    .bar {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      block-size: 3.75rem;
      padding: 0 1.25rem;
      border-block-end: 1px solid var(--app-border-normal);
    }

    .bar .glyph {
      flex: none;
      font-size: 1.25rem;
      color: var(--app-text-tertiary);
    }

    .bar input {
      flex: 1;
      min-inline-size: 0;
      block-size: 2.75rem;
      padding: 0;
      border: 0;
      outline: none;
      background: none;
      font: inherit;
      font-size: 1.1875rem;
      color: var(--ion-text-color);
    }

    .bar input::placeholder {
      color: var(--app-text-tertiary);
    }

    .list {
      max-block-size: min(60dvh, 32rem);
      overflow-y: auto;
      padding: 0.375rem 0.5rem 0.625rem;
    }

    .sec {
      padding: 0.625rem 0.875rem 0.25rem;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      color: var(--app-text-tertiary);
    }

    .opt {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      min-block-size: 2.75rem;
      padding: 0 0.75rem;
      border-radius: 0.75rem;
      font-size: 0.9375rem;
      cursor: pointer;
    }

    .opt .glyph {
      flex: none;
      font-size: 1.125rem;
      color: var(--app-text-tertiary);
    }

    .dot {
      flex: none;
      inline-size: 0.5rem;
      block-size: 0.5rem;
      margin-inline: 0.3125rem;
      border-radius: 999px;
    }

    .label {
      flex: 1;
      min-inline-size: 0;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .label b {
      font-weight: 600;
    }

    .ref {
      font-family: var(--app-font-mono);
      font-size: 0.875rem;
    }

    .scope,
    .sub {
      color: var(--app-text-tertiary);
    }

    .sub {
      flex: none;
      max-inline-size: 45%;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      font-size: 0.8125rem;
    }

    .opt[aria-selected='true'] {
      background: var(--ion-color-primary);
      color: var(--ion-color-primary-contrast);
    }

    .opt[aria-selected='true'] :is(.glyph, .scope, .sub, kbd) {
      color: inherit;
    }

    .opt[aria-selected='true'] kbd {
      background: rgba(255, 255, 255, 0.22);
    }

    kbd {
      display: inline-flex;
      flex: none;
      align-items: center;
      justify-content: center;
      min-inline-size: 1.375rem;
      block-size: 1.375rem;
      padding: 0 0.375rem;
      border-radius: 0.375rem;
      background: var(--app-fill);
      font-family: var(--app-font-mono);
      font-size: 0.75rem;
      color: var(--app-text-secondary);
    }

    .none {
      margin: 0;
      padding: 0.25rem 1.375rem 1.25rem;
      font-size: 0.9375rem;
      color: var(--app-text-tertiary);
    }

    .foot {
      display: flex;
      align-items: center;
      gap: 1rem;
      min-block-size: 2.5rem;
      padding: 0 1.25rem;
      border-block-start: 1px solid var(--app-border-normal);
      font-size: 0.75rem;
      color: var(--app-text-tertiary);
    }

    .foot span {
      display: flex;
      align-items: center;
      gap: 0.375rem;
    }
  `,
})
export class CommandPalette {
  private readonly document = inject(DOCUMENT);
  private readonly modals = inject(ModalController);
  private readonly navCtrl = inject(NavController);
  private readonly router = inject(Router);
  private readonly fleet = inject(ListProjectsStore);
  private readonly search = inject(SearchTasksStore);
  private readonly control = inject(ControlTaskStore);
  private readonly notifications = inject(NotifyService);
  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');

  protected readonly query = signal('');

  private readonly entries = computed<readonly FleetTask[]>(() =>
    this.fleet
      .summaries()
      .flatMap(({ project, tasks }) => tasks.map((task) => ({ project, task }))),
  );

  protected readonly options = computed<readonly PaletteOption[]>(() => {
    const raw = this.query().trim();
    return raw
      ? [...this.actions(raw), ...this.tasks(raw), ...this.destinations(raw)]
      : [...this.recent(), ...this.here(), ...this.destinations('')];
  });

  protected readonly groups = computed(() =>
    this.options().reduce<PaletteGroup[]>((groups, option, index) => {
      const last = groups.at(-1);
      if (last?.section === option.section) {
        return [...groups.slice(0, -1), { ...last, items: [...last.items, { option, index }] }];
      }
      return [...groups, { section: option.section, items: [{ option, index }] }];
    }, []),
  );

  /* Typing starts the selection over; a refresh landing mid-arrowing does not. */
  /* A bare verb picks nothing: Enter must not guess a task. */
  protected readonly active = linkedSignal<string, number>({
    source: this.query,
    computation: (query) => (bareVerb(query) ? -1 : 0),
  });
  protected readonly current = computed(() =>
    this.active() < 0 ? -1 : Math.max(0, Math.min(this.active(), this.options().length - 1)),
  );
  protected readonly enterVerb = computed(() =>
    this.options()[this.current()]?.section === 'Actions' ? 'run' : 'open',
  );

  protected readonly status = computed(() => {
    const count = this.options().length;
    if (!this.entries().length && this.fleet.loading()) return 'Loading tasks…';
    return count ? `${count} ${count === 1 ? 'result' : 'results'}` : 'No matches';
  });

  constructor() {
    afterRenderEffect(() =>
      this.document
        .getElementById(`cmd-opt-${this.current()}`)
        ?.scrollIntoView({ block: 'nearest' }),
    );
  }

  ionViewDidEnter(): void {
    this.field().nativeElement.focus();
  }

  protected onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const count = this.options().length;

    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      /* The same key closes it; the shell must not see it and open another. */
      event.preventDefault();
      event.stopPropagation();
      void this.modals.dismiss();
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();
        if (!count) return;
        const step = event.key === 'ArrowDown' ? 1 : -1;
        const from = this.current() < 0 ? (step > 0 ? -1 : count) : this.current();
        this.active.set((from + step + count) % count);
        return;
      }
      case 'Enter': {
        event.preventDefault();
        const option = this.options()[this.current()];
        if (option) this.run(option);
        return;
      }
      case 'Tab':
        /* The field is the whole keyboard surface: Tab has nowhere to go. */
        event.preventDefault();
    }
  }

  protected run(option: PaletteOption): void {
    /* The palette leaves first, so navigation and toasts land on the page underneath. */
    void this.modals.dismiss();
    option.run();
  }

  private actions(raw: string): readonly PaletteOption[] {
    const [first, ...rest] = raw.split(/\s+/);
    const typed = first.toLowerCase();
    /* Whole verbs only: "sta" is likelier a task name, and Enter would run it. */
    const verbs = VERBS.filter(({ action }) => action === typed);
    if (!verbs.length) return [];
    const slug = this.openSlug();

    return (
      rankTasks(this.entries(), parseQuery(rest.join(' ')))
        .map((entry, order) => {
          const failed = entry.task.lastDeploy?.failed ?? false;
          const here = entry.project.slug === slug;
          return {
            entry,
            order,
            failed,
            here,
            weight: entry.task.status === 'error' ? 0 : failed ? 1 : 2,
          };
        })
        /* The open project's tasks first: the likeliest targets. */
        .sort((a, b) => Number(b.here) - Number(a.here) || a.weight - b.weight || a.order - b.order)
        .flatMap(({ entry, failed }) =>
          verbs
            .filter(({ action }) => available(entry.task, action))
            .map((verb) => ({ entry, failed, verb })),
        )
        .slice(0, ACTIONS_MAX)
        .map(({ entry, failed, verb }) => ({
          key: `${verb.action}:${taskKey(entry.project.slug, entry.task.name)}`,
          section: 'Actions' as const,
          icon: verb.icon,
          dot: '',
          typed: verb.label.slice(0, typed.length),
          text: `${verb.label.slice(typed.length)} `,
          scope: '',
          ref: taskKey(entry.project.slug, entry.task.name),
          sub:
            entry.task.status === 'error'
              ? 'container error'
              : failed
                ? 'last deploy failed'
                : entry.task.status,
          run: () => this.command(entry, verb.action),
        }))
    );
  }

  private tasks(raw: string): readonly PaletteOption[] {
    const query = parseQuery(raw);
    return rankTasks(this.entries(), query)
      .slice(0, TASKS_MAX)
      .map((entry) => this.taskOption('Tasks', entry, whyFound(entry, query.text)));
  }

  private recent(): readonly PaletteOption[] {
    const byKey = new Map(
      this.entries().map((entry) => [taskKey(entry.project.slug, entry.task.name), entry]),
    );
    return this.search.recent().flatMap(({ project, name }) => {
      const entry = byKey.get(taskKey(project, name));
      return entry ? [this.taskOption('Recent', entry, abnormal(entry.task))] : [];
    });
  }

  private destinations(raw: string): readonly PaletteOption[] {
    const needle = raw.toLowerCase();
    const searchFor = raw
      ? [
          this.goOption('search', 'icon-[light--magnifying-glass]', `Search “${raw}”`, '', () => {
            this.search.query.set(raw);
            this.go('/search');
          }),
        ]
      : [];
    const sections = NAV.filter(({ label }) => label.toLowerCase().includes(needle)).map((item) =>
      this.goOption(item.link, item.icon, item.label, '', () => this.go(item.link)),
    );
    const projects = raw
      ? matchProjects(this.fleet.summaries(), parseQuery(raw))
          .slice(0, PROJECTS_MAX)
          .map(({ project }) =>
            this.goOption(
              `project:${project.slug}`,
              'icon-[light--cube]',
              project.name,
              `/${project.slug}`,
              () => void this.navCtrl.navigateForward(['/projects', project.slug]),
            ),
          )
      : [];
    return [...searchFor, ...sections, ...projects].slice(0, GO_TO_MAX);
  }

  private openSlug(): string {
    return /^\/projects\/([^/?#]+)/.exec(this.router.url)?.[1] ?? '';
  }

  private here(): readonly PaletteOption[] {
    const slug = this.openSlug();
    const recent = new Set(this.search.recent().map(({ project, name }) => taskKey(project, name)));
    return this.entries()
      .filter(({ project, task }) => project.slug === slug && !recent.has(taskKey(slug, task.name)))
      .slice(0, TASKS_MAX)
      .map((entry) => this.taskOption('Tasks', entry, abnormal(entry.task)));
  }

  private taskOption(section: Section, entry: FleetTask, sub: string): PaletteOption {
    const { project, task } = entry;
    return {
      key: `${section}:${taskKey(project.slug, task.name)}`,
      section,
      icon: '',
      dot: DEV_STATUS_DOT[task.devStatus],
      typed: '',
      text: '',
      scope: `${project.slug}/`,
      ref: task.name,
      sub,
      run: () => {
        this.search.remember(project.slug, task.name);
        void this.navCtrl.navigateForward(['/projects', project.slug, 'tasks', task.name]);
      },
    };
  }

  private goOption(
    key: string,
    icon: string,
    text: string,
    sub: string,
    run: () => void,
  ): PaletteOption {
    return { key, section: 'Go to', icon, dot: '', typed: '', text, scope: '', ref: '', sub, run };
  }

  private go(link: string): void {
    void this.navCtrl.navigateRoot(link);
  }

  private command({ project, task }: FleetTask, action: TaskStateAction): void {
    this.control
      .changeState(project.slug, task, action)
      .subscribe((result) => this.notifications.result(result));
  }
}

/* Must match the verbs TaskMenu offers for this state and role. */
function available(task: TaskSummary, action: TaskStateAction): boolean {
  if (isTransitioningTask(task) || !atLeastRole(task.myRole, 'operator')) return false;
  return action === 'restart' || (task.status === 'running') === (action === 'stop');
}

/* Running is the normal state, so lists only speak about the others. */
function abnormal(task: TaskSummary): string {
  return task.status === 'running' ? '' : task.status;
}

function whyFound({ project, task }: FleetTask, text: string): string {
  const has = (value: string) => value.toLowerCase().includes(text);
  if (text && !has(task.name) && !has(project.slug) && !has(project.name)) {
    if (task.description && has(task.description)) return `“${task.description}”`;
    if (has(task.image)) return task.image;
  }
  return abnormal(task);
}

/* "restart" alone, with no task named yet. */
function bareVerb(query: string): boolean {
  const [first = '', ...rest] = query.trim().toLowerCase().split(/\s+/);
  return rest.length === 0 && VERBS.some(({ action }) => action === first);
}
