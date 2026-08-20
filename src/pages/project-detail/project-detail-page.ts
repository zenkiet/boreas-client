import { DOCUMENT, DatePipe } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TuiButton, TuiIcon } from '@taiga-ui/core';
import { TuiToastService } from '@taiga-ui/kit';
import { TuiAppBar } from '@taiga-ui/layout';
import { filter, switchMap, take } from 'rxjs';

import { Member, Project, TaskDefaultsInput } from '@entities/project';
import { Task, TaskActionRequest } from '@entities/task';
import { ControlTaskStore, TaskCommandResult } from '@features/control-task';
import { ListProjectsStore } from '@features/list-projects';
import { TaskList } from '@features/list-tasks';
import {
  ManageProjectStore,
  MemberList,
  ProjectCommandResult,
  ProjectDefaultsForm,
} from '@features/manage-project';
import { ViewProjectStore } from '@features/view-project';
import { ServerConfigStore } from '@shared/config/server-config.store';
import { Reveal } from '@shared/lib/motion/reveal.directive';
import { registerPullRefresh } from '@shared/lib/pull-to-refresh/pull-to-refresh';
import { BackLink } from '@shared/ui/back-link/back-link';
import { Callout } from '@shared/ui/callout/callout';
import { ConfirmActionService } from '@shared/ui/confirm-action/confirm-action';
import { EmptyState } from '@shared/ui/empty-state/empty-state';
import { ErrorState } from '@shared/ui/error-state/error-state';
import { GlassIconButton } from '@shared/ui/glass-icon-button/glass-icon-button';
import { GlassSegmented, GlassSegmentedItem } from '@shared/ui/glass-segmented/glass-segmented';
import { GlassSelect, GlassSelectOption } from '@shared/ui/glass-select/glass-select';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';
import { SkeletonRows } from '@shared/ui/skeleton-rows/skeleton-rows';
import { TUI_BREAKPOINT } from '@taiga-ui/core';

const VIEWS = ['tasks', 'members', 'about'] as const;

type View = (typeof VIEWS)[number];

@Component({
  selector: 'app-project-detail-page',
  imports: [
    BackLink,
    Callout,
    DatePipe,
    EmptyState,
    ErrorState,
    GlassIconButton,
    GlassSegmented,
    GlassSelect,
    InsetGroup,
    MemberList,
    ProjectDefaultsForm,
    Reveal,
    RouterLink,
    SkeletonRows,
    TaskList,
    TuiAppBar,
    TuiButton,
    TuiIcon,
  ],
  providers: [ViewProjectStore, ControlTaskStore, ManageProjectStore],
  template: `
    <!-- iOS push: chrome and the seeded title render before any data lands. -->
    <div appReveal class="mx-auto grid w-full max-w-160 grid-cols-1 gap-3.5 pb-16 md:gap-4 md:pb-0">
      <!-- The scroll edge prevents content showing through Taiga's transparent app bar. -->
      <div
        class="scroll-edge sticky top-0 z-10 -mx-4 -mt-[max(1rem,env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] md:hidden"
      >
        <tui-app-bar tuiAppBarSize>
          <a tuiSlot="start" tuiAppBarBack routerLink="/projects" aria-label="Back to projects"></a>
          <span class="detail__bar-title font-mono">{{ slug() }}</span>
          <a
            tuiSlot="end"
            appGlassIconButton
            icon="@tui.plus"
            [routerLink]="['/projects', slug(), 'tasks', 'new']"
            aria-label="New task"
          ></a>
        </tui-app-bar>
      </div>

      <header class="hidden md:block">
        <app-back-link link="/projects" label="Projects" />
        <div class="mt-1.5 flex items-center justify-between gap-3">
          <h1 class="detail__title">{{ displayName() }}</h1>
          <a
            tuiButton
            size="s"
            appearance="primary"
            [routerLink]="['/projects', slug(), 'tasks', 'new']"
          >
            <tui-icon class="icon-sm" icon="@tui.plus" />
            New task
          </a>
        </div>
        <p class="detail__subtitle font-mono">/{{ slug() }}</p>
      </header>

      <h1 class="detail__title md:hidden">{{ displayName() }}</h1>

      @if (detail.error() && detail.hasLoaded()) {
        <app-callout tone="negative" role="alert">
          {{ detail.error() }} Existing data is still shown.
        </app-callout>
      }

      <app-glass-segmented
        [items]="viewItems()"
        [activeIndex]="viewIndex()"
        (activeIndexChange)="setView($event)"
      />

      @if (detail.error() && !detail.hasLoaded()) {
        <app-error-state
          title="Unable to load project"
          [message]="detail.error()!"
          (retry)="reload()"
        />
      } @else if (!detail.hasLoaded()) {
        <!-- The redacted group follows the selected segment so switching stays honest. -->
        <app-inset-group [label]="skeletonLabel()">
          <app-skeleton-rows
            [variant]="view() === 'members' ? 'member' : 'task'"
            label="Loading project"
          />
        </app-inset-group>
      } @else {
        <!-- Sections hide, never unmount: the member form and scroll state survive switching. -->
        <div [class.hidden]="view() !== 'tasks'">
          <app-inset-group label="Tasks" [trailing]="taskSummary()">
            @if (detail.tasks().length === 0) {
              <app-empty-state
                title="No tasks yet"
                description="Create a task to start an isolated Docker environment behind the Boreas proxy."
                [bordered]="false"
              />
            } @else {
              <app-task-list
                [tasks]="detail.tasks()"
                [pendingTaskIds]="commands.pendingTaskIds()"
                [mobile]="mobile()"
                [accessUrlFor]="accessUrlFor()"
                [routeFor]="routeFor()"
                (actionRequested)="handleTaskAction($event)"
                (taskOpened)="openTask($event)"
              />
            }

            <a
              class="add-row row-divider relative"
              [routerLink]="['/projects', slug(), 'tasks', 'new']"
            >
              <tui-icon class="icon-sm" icon="@tui.plus" />
              New task
            </a>
          </app-inset-group>
        </div>

        <div [class.hidden]="view() !== 'members'">
          @if (detail.members(); as members) {
            <app-inset-group label="Members" [trailing]="memberSummary()">
              <app-member-list
                [members]="members"
                [users]="manage.users()"
                [busy]="manage.busy()"
                (addRequested)="addMember($event)"
                (removeRequested)="removeMember($event)"
              />
            </app-inset-group>
          } @else {
            <app-callout tone="info">
              Members are only visible to project members and administrators.
            </app-callout>
          }
        </div>

        @if (detail.project(); as project) {
          <div class="grid grid-cols-1 gap-3.5" [class.hidden]="view() !== 'about'">
            <app-inset-group label="About">
              <div class="about__row row-divider relative">
                <label class="about__label" for="project-name">Display name</label>
                <div class="flex items-center gap-2">
                  <input
                    id="project-name"
                    class="about__input"
                    autocomplete="off"
                    [value]="draftName()"
                    (input)="typeName($event)"
                  />
                  @if (draftName() !== project.name) {
                    <button
                      tuiButton
                      type="button"
                      size="s"
                      appearance="secondary"
                      [disabled]="manage.busy()"
                      (click)="saveName(project)"
                    >
                      Save
                    </button>
                  }
                </div>
              </div>

              @if (credentialOptions(); as options) {
                <div class="about__row about__row--inline row-divider relative">
                  <span class="about__label about__label--inline">Registry credential</span>
                  <app-glass-select
                    ariaLabel="Registry credential"
                    placeholder="None"
                    [options]="options"
                    [value]="project.registryCredentialId ?? ''"
                    [disabled]="manage.busy()"
                    (valueChange)="changeCredential(project, $event)"
                  />
                </div>
              }

              <div class="about__row about__row--inline row-divider relative">
                <span class="about__label about__label--inline">Proxy prefix</span>
                <span class="about__value font-mono">{{ proxyPrefix() }}</span>
              </div>

              <div class="about__row about__row--inline row-divider relative">
                <span class="about__label about__label--inline">Created</span>
                <span class="about__value tabular">{{ project.createdAt | date: 'MMM d, y' }}</span>
              </div>
            </app-inset-group>

            <div>
              <app-inset-group label="Task defaults">
                <app-project-defaults-form
                  [defaults]="project.defaults"
                  [busy]="manage.busy()"
                  (submitted)="saveDefaults(project, $event)"
                />
              </app-inset-group>
              <p class="footnote">
                Prefill for the new-task form in this project. Existing tasks and their containers
                are never touched, and only the project owner can change these.
              </p>
            </div>

            <app-inset-group label="Danger zone">
              <button
                tuiButton
                type="button"
                size="m"
                appearance="flat-destructive"
                class="about__delete"
                [disabled]="manage.busy()"
                (click)="deleteProject(project)"
              >
                <tui-icon class="icon-sm" icon="@tui.trash-2" />
                Delete project
              </button>
              <p class="about__hint">A project that still owns tasks cannot be deleted.</p>
            </app-inset-group>
          </div>
        }
      }
    </div>
  `,
  styles: `
    .detail__bar-title {
      min-inline-size: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .detail__title {
      margin: 0;
      font-size: clamp(1.5rem, 4vw, 2.125rem);
      font-weight: 700;
      letter-spacing: -0.022em;
      color: var(--tui-text-primary);
      overflow-wrap: anywhere;
    }

    .detail__subtitle {
      margin: 0.375rem 0 0;
      font-size: 0.9375rem;
      color: var(--tui-text-tertiary);
    }

    .add-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6875rem 1rem;
      font-size: 1.0625rem;
      font-weight: 500;
      color: var(--tui-text-action);
      text-decoration: none;
      transition: background-color var(--tui-duration);
    }

    .add-row:hover {
      background: var(--tui-background-neutral-1);
    }

    .about__row {
      display: grid;
      gap: 0.125rem;
      padding: 0.625rem 1rem;
    }

    .about__row--inline {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      min-block-size: 3rem;
    }

    .about__label {
      font-size: 0.8125rem;
      color: var(--tui-text-tertiary);
    }

    .about__label--inline {
      font-size: 1rem;
      color: var(--tui-text-primary);
    }

    .about__input {
      flex: 1;
      min-inline-size: 0;
      margin: 0;
      border: 0;
      padding: 0;
      background: none;
      font: inherit;
      font-size: 1.0625rem;
      color: var(--tui-text-primary);
    }

    .about__input:focus {
      outline: none;
    }

    .about__value {
      font-size: 0.9375rem;
      color: var(--tui-text-secondary);
      overflow-wrap: anywhere;
      text-align: end;
    }

    .about__delete {
      margin: 0.375rem 1rem;
    }

    .about__hint {
      margin: 0;
      padding: 0 1rem 0.75rem;
      font-size: 0.8125rem;
      color: var(--tui-text-tertiary);
    }
  `,
})
export class ProjectDetailPage {
  protected readonly detail = inject(ViewProjectStore);
  protected readonly commands = inject(ControlTaskStore);
  protected readonly manage = inject(ManageProjectStore);
  private readonly config = inject(ServerConfigStore);
  private readonly confirmations = inject(ConfirmActionService);
  private readonly toasts = inject(TuiToastService);
  private readonly router = inject(Router);
  private readonly breakpoint = inject(TUI_BREAKPOINT);
  private readonly fleet = inject(ListProjectsStore);

  readonly slug = input('');

  /* Seeded by the row that pushed here, so the title never waits for the fetch. */
  private readonly seededName = readSeededName(inject(DOCUMENT));

  protected readonly mobile = computed(() => this.breakpoint() === 'mobile');
  protected readonly view = signal<View>('tasks');
  protected readonly viewIndex = computed(() => VIEWS.indexOf(this.view()));
  protected readonly draftName = signal('');

  protected readonly displayName = computed(
    () => this.detail.project()?.name ?? (this.seededName || this.slug()),
  );

  protected readonly skeletonLabel = computed(() => {
    const view = this.view();
    return view === 'members' ? 'Members' : view === 'about' ? 'About' : 'Tasks';
  });

  protected readonly viewItems = computed<readonly GlassSegmentedItem[]>(() => [
    { label: 'Tasks' },
    { label: 'Members' },
    { label: 'About' },
  ]);

  protected readonly taskSummary = computed(() => {
    const total = this.detail.tasks().length;
    return `${total} ${total === 1 ? 'task' : 'tasks'}`;
  });

  protected readonly memberSummary = computed(() => {
    const members = this.detail.members();
    return members ? `${members.length}` : '';
  });

  protected readonly proxyPrefix = computed(
    () => `${this.config.baseUrl()}/${this.detail.slug()}/`,
  );

  /* null while the viewer may not list credentials, or nothing exists to attach. */
  protected readonly credentialOptions = computed<readonly GlassSelectOption[] | null>(() => {
    const credentials = this.manage.credentials();
    if (!credentials || credentials.length === 0) return null;

    return [
      { value: '', label: 'None' },
      ...credentials.map((credential) => ({
        value: credential.id,
        label: `${credential.name} (${credential.registry})`,
      })),
    ];
  });

  /* Stable identities avoid rebinding row inputs in the OnPush list. */
  protected readonly accessUrlFor = computed(() => {
    const slug = this.detail.slug();
    return (name: string) => this.commands.accessUrl(slug, name);
  });

  protected readonly routeFor = computed(() => {
    const slug = this.detail.slug();
    return (task: Task) => ['/projects', slug, 'tasks', task.name] as const;
  });

  constructor() {
    registerPullRefresh({
      busy: this.detail.loading,
      trigger: () => {
        const slug = this.slug();
        if (slug) this.detail.refresh(slug);
      },
    });

    effect(() => {
      const slug = this.slug();
      if (slug) this.detail.refresh(slug);
    });

    effect(() => {
      const project = this.detail.project();
      if (project) this.draftName.set(project.name);
    });
  }

  protected setView(index: number): void {
    const view = VIEWS[index];
    if (view) this.view.set(view);
  }

  protected reload(): void {
    if (this.slug()) this.detail.refresh(this.slug());
  }

  protected openTask(task: Task): void {
    void this.router.navigate(['/projects', this.detail.slug(), 'tasks', task.name]);
  }

  /* Reversible lifecycle actions do not require confirmation. */
  protected handleTaskAction({ action, task }: TaskActionRequest): void {
    const slug = this.detail.slug();

    if (action === 'edit') {
      void this.router.navigate(['/projects', slug, 'tasks', task.name, 'edit']);
      return;
    }

    if (action === 'delete') {
      this.confirmations
        .confirm({
          title: `Delete ${task.name}?`,
          message:
            'The container, environment metadata, and proxy route will be deleted. This action cannot be undone.',
          confirmLabel: 'Delete task',
          destructive: true,
        })
        .pipe(
          filter(Boolean),
          switchMap(() => this.commands.delete(slug, task)),
        )
        .subscribe((result) => this.completeCommand(result));
      return;
    }

    this.commands
      .changeState(slug, task, action)
      .subscribe((result) => this.completeCommand(result));
  }

  protected typeName(event: Event): void {
    this.draftName.set((event.target as HTMLInputElement).value);
  }

  protected saveName(project: Project): void {
    const name = this.draftName().trim();
    if (!name || name === project.name) return;

    this.manage.update(project.slug, { name }).subscribe((result) => this.completeCommand(result));
  }

  protected saveDefaults(project: Project, defaults: TaskDefaultsInput): void {
    this.manage
      .update(project.slug, { defaults })
      .subscribe((result) => this.completeCommand(result));
  }

  protected changeCredential(project: Project, value: string): void {
    if (value === (project.registryCredentialId ?? '')) return;

    this.manage
      .update(project.slug, { registryCredentialId: value || null })
      .subscribe((result) => this.completeCommand(result));
  }

  protected addMember(input: { userId: string; role: 'owner' | 'member' }): void {
    this.manage
      .addMember(this.detail.slug(), input)
      .subscribe((result) => this.completeCommand(result));
  }

  protected removeMember(member: Member): void {
    this.confirmations
      .confirm({
        title: `Remove ${member.username}?`,
        message: 'They lose access to this project immediately.',
        confirmLabel: 'Remove member',
        destructive: true,
      })
      .pipe(
        filter(Boolean),
        switchMap(() =>
          this.manage.removeMember(this.detail.slug(), member.userId, member.username),
        ),
      )
      .subscribe((result) => this.completeCommand(result));
  }

  protected deleteProject(project: Project): void {
    this.confirmations
      .confirm({
        title: `Delete ${project.slug}?`,
        message: 'The project and its member list will be deleted. Tasks must be deleted first.',
        confirmLabel: 'Delete project',
        destructive: true,
      })
      .pipe(
        filter(Boolean),
        switchMap(() => this.manage.delete(project.slug)),
      )
      .subscribe((result) => {
        this.notify(result.message, result.success);
        if (result.success) {
          this.fleet.invalidate();
          void this.router.navigate(['/projects']);
        }
      });
  }

  /* Every command here — lifecycle, delete, rename, members — changes what Home shows. */
  private completeCommand(result: TaskCommandResult | ProjectCommandResult): void {
    this.notify(result.message, result.success);

    if (result.success) {
      this.fleet.invalidate();
      this.reload();
    }
  }

  private notify(message: string, success: boolean): void {
    this.toasts
      .open(message, { appearance: success ? 'positive' : 'negative' })
      .pipe(take(1))
      .subscribe();
  }
}

/* Deep links have no navigation state; the slug from the URL stands in instead. */
function readSeededName(document: Document): string {
  const state: unknown = document.defaultView?.history.state;

  if (state && typeof state === 'object' && 'projectName' in state) {
    const name = (state as Record<string, unknown>)['projectName'];
    return typeof name === 'string' ? name : '';
  }

  return '';
}
