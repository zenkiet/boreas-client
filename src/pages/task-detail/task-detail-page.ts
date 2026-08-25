import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TuiResponsiveDialogService } from '@taiga-ui/addon-mobile';
import { TuiButton, TuiDropdown, TuiIcon, TuiLoader } from '@taiga-ui/core';
import { TuiToastService } from '@taiga-ui/kit';
import { TuiAppBar } from '@taiga-ui/layout';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { filter, map, switchMap, take } from 'rxjs';

import { EnvironmentEditor, EnvironmentList } from '@entities/environment';
import { AddMemberInput, GRANTABLE_ROLES, Member } from '@entities/project';
import {
  DevStatus,
  DevStatusSheet,
  Task,
  TaskActionRequest,
  TaskMenu,
  TaskStateAction,
  isTransitioningTask,
} from '@entities/task';
import { ControlTaskStore } from '@features/control-task';
import { ListProjectsStore } from '@features/list-projects';
import { ManageGrantsStore, MemberList } from '@features/manage-project';
import { LogConsole, LogStreamStore } from '@features/stream-task-logs';
import { ViewTaskStore } from '@features/view-task';
import { Reveal } from '@shared/lib/motion/reveal.directive';
import { registerPullRefresh } from '@shared/lib/pull-to-refresh/pull-to-refresh';
import { BackLink } from '@shared/ui/back-link/back-link';
import { Callout } from '@shared/ui/callout/callout';
import { ConfirmActionService } from '@shared/ui/confirm-action/confirm-action';
import { ErrorState } from '@shared/ui/error-state/error-state';
import { GlassIconButton } from '@shared/ui/glass-icon-button/glass-icon-button';
import { GlassSegmented, GlassSegmentedItem } from '@shared/ui/glass-segmented/glass-segmented';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';
import { SkeletonRows } from '@shared/ui/skeleton-rows/skeleton-rows';
import { TaskOverview } from '@widgets/task-overview';

const VIEWS = ['info', 'environment', 'logs'] as const;

type View = (typeof VIEWS)[number];

@Component({
  selector: 'app-task-detail-page',
  imports: [
    BackLink,
    Callout,
    EnvironmentEditor,
    EnvironmentList,
    ErrorState,
    GlassIconButton,
    GlassSegmented,
    InsetGroup,
    LogConsole,
    MemberList,
    Reveal,
    RouterLink,
    SkeletonRows,
    TaskMenu,
    TaskOverview,
    TuiAppBar,
    TuiButton,
    TuiDropdown,
    TuiIcon,
    TuiLoader,
  ],
  providers: [ViewTaskStore, ControlTaskStore, LogStreamStore, ManageGrantsStore],
  template: `
    <!-- iOS push: the name is already in the URL, so chrome renders before any data. -->
    <div appReveal class="mx-auto grid w-full max-w-3xl grid-cols-1 gap-3.5 pb-16 md:gap-4 md:pb-0">
      <!-- The scroll edge prevents content showing through Taiga's transparent app bar. -->
      <div
        class="scroll-edge sticky top-0 z-10 -mx-4 -mt-[max(1rem,env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] md:hidden"
      >
        <tui-app-bar tuiAppBarSize>
          <a
            tuiSlot="start"
            tuiAppBarBack
            [routerLink]="projectLink()"
            aria-label="Back to project"
          ></a>
          <span class="detail__bar-title">{{ name() }}</span>
          @if (detail.task(); as task) {
            <!-- A single ng-container root lets this @if project into tuiSlot="end". -->
            <ng-container tuiSlot="end">
              <!-- Use a menu here; bottom sheets are reserved for message surfaces. -->
              <button
                appGlassIconButton
                icon="@tui.ellipsis"
                type="button"
                aria-label="More actions"
                [tuiDropdown]="menu"
                [(tuiDropdownOpen)]="menuOpen"
              ></button>
              <ng-template #menu>
                <app-task-menu
                  [task]="task"
                  [accessUrl]="detail.proxyUrl()"
                  [pending]="isPending(task)"
                  (actionRequested)="onMenuAction($event)"
                />
              </ng-template>
            </ng-container>
          } @else {
            <button
              tuiSlot="end"
              appGlassIconButton
              icon="@tui.ellipsis"
              type="button"
              aria-label="More actions"
              [disabled]="true"
            ></button>
          }
        </tui-app-bar>
      </div>

      <header class="hidden md:block">
        <app-back-link [link]="projectPath()" [label]="project()" />
        <h1 class="detail__title mt-1.5">{{ name() }}</h1>
        @if (detail.task(); as task) {
          <p class="detail__subtitle">{{ task.image }} · port {{ task.port }}</p>
          @if (task.description) {
            <p class="detail__description">{{ task.description }}</p>
          }
        } @else {
          <p class="detail__subtitle skeleton-defer" aria-hidden="true">
            <span class="skeleton skeleton--sub inline-block w-44 max-w-full"></span>
          </p>
        }
      </header>

      @if (detail.task(); as task) {
        <!-- Screen readers cannot infer status from the action set. -->
        <p class="sr-only">Status: {{ task.status }}</p>

        <div class="hidden flex-wrap items-center gap-2 md:flex">
          @if (task.status === 'running') {
            <a
              tuiButton
              size="s"
              appearance="primary"
              rel="noopener"
              target="_blank"
              [href]="detail.proxyUrl()"
            >
              <tui-icon class="icon-sm" icon="@tui.external-link" />
              Open task
            </a>
            <button
              tuiButton
              type="button"
              size="s"
              appearance="secondary"
              [disabled]="actionDisabled(task)"
              (click)="changeState('stop')"
            >
              <tui-icon class="icon-sm" icon="@tui.square" />
              Stop
            </button>
          } @else {
            <button
              tuiButton
              type="button"
              size="s"
              appearance="primary"
              [disabled]="actionDisabled(task)"
              (click)="changeState('start')"
            >
              <tui-icon class="icon-sm" icon="@tui.play" />
              Start
            </button>
          }
          <button
            tuiButton
            type="button"
            size="s"
            appearance="secondary"
            [disabled]="actionDisabled(task)"
            (click)="changeState('restart')"
          >
            <tui-icon class="icon-sm" icon="@tui.rotate-cw" />
            Restart
          </button>
          <a tuiButton size="s" appearance="secondary" [routerLink]="editLink()">
            <tui-icon class="icon-sm" icon="@tui.pencil" />
            Edit
          </a>
          <button
            tuiButton
            type="button"
            size="s"
            appearance="flat-destructive"
            [disabled]="actionDisabled(task)"
            (click)="deleteTask(task.name)"
          >
            <tui-icon class="icon-sm" icon="@tui.trash-2" />
            Delete
          </button>
        </div>

        @if (detail.error()) {
          <app-callout tone="negative" role="alert">{{ detail.error() }}</app-callout>
        }
        @if (task.pendingRecreate) {
          <app-callout tone="warning" role="status">
            <p class="m-0">
              Changes are waiting for a container recreate. They apply on the next start or restart.
            </p>
            <div class="mt-2">
              <button
                tuiButton
                type="button"
                size="s"
                appearance="secondary"
                [disabled]="actionDisabled(task)"
                (click)="changeState('restart')"
              >
                Restart now
              </button>
            </div>
          </app-callout>
        }
      }

      <div class="hidden md:block">
        <app-glass-segmented
          [items]="viewItems()"
          [activeIndex]="viewIndex()"
          (activeIndexChange)="setView($event)"
        />
      </div>

      <div class="detail__nav md:hidden">
        <app-glass-segmented
          [items]="viewItems()"
          [activeIndex]="viewIndex()"
          (activeIndexChange)="setView($event)"
        />
      </div>

      @if (detail.error() && !detail.hasLoaded()) {
        <app-error-state
          title="Unable to load task"
          [message]="detail.error()!"
          (retry)="reload()"
        />
      } @else {
        <!-- Preserve console scroll/buffer and environment drafts while switching views. -->
        <div class="detail__console" [class.hidden]="view() !== 'logs'">
          <app-log-console
            [entries]="logs.entries()"
            [connected]="logs.connected()"
            [connecting]="!detail.task() || logs.connecting()"
            [downloading]="logs.downloading()"
            (downloadRequested)="downloadLogs()"
          />
        </div>

        @if (detail.task(); as task) {
          <div class="grid grid-cols-1 gap-3.5" [class.hidden]="view() !== 'environment'">
            <app-glass-segmented
              [items]="envItems()"
              [activeIndex]="envModeIndex()"
              (activeIndexChange)="setEnvMode($event)"
            />

            <div [class.hidden]="envMode() !== 'list'">
              <app-inset-group>
                <div class="detail__pad">
                  <app-environment-list
                    [environment]="detail.environment()"
                    (copyFailed)="reportValueCopyFailure()"
                  />
                </div>
              </app-inset-group>
            </div>

            <div [class.hidden]="envMode() !== 'raw'">
              <app-inset-group>
                <div class="detail__pad">
                  <app-environment-editor
                    [environment]="detail.environment()"
                    [resetKey]="environmentResetKey()"
                    (environmentChange)="draftEnvironment.set($event); environmentDirty.set(true)"
                    (errorsChange)="environmentErrors.set($event)"
                  />
                </div>

                <div class="detail__apply row-divider relative">
                  <button
                    tuiButton
                    type="button"
                    size="m"
                    appearance="primary"
                    [disabled]="
                      !environmentDirty() ||
                      detail.savingEnvironment() ||
                      environmentErrors().length > 0
                    "
                    (click)="applyEnvironment()"
                  >
                    @if (detail.savingEnvironment()) {
                      <tui-loader size="s" [inheritColor]="true" />
                    }
                    Apply environment
                  </button>
                </div>
              </app-inset-group>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-3.5" [class.hidden]="view() !== 'info'">
            <app-task-overview
              [task]="task"
              [proxyUrl]="detail.proxyUrl()"
              (copyFailed)="reportCopyFailure()"
              (statusClicked)="changeDevStatus(task)"
            />

            <!-- Listing grants is owner-only, so a null list self-gates the whole panel. -->
            @if (grants.grants(); as grantList) {
              <div>
                <app-inset-group label="Access" [trailing]="grantSummary(grantList.length)">
                  <app-member-list
                    dateVerb="Granted"
                    defaultRole="viewer"
                    [members]="grantList"
                    [users]="grants.users()"
                    [busy]="grants.busy()"
                    [roles]="grantableRoles"
                    (addRequested)="addGrant($event)"
                    (removeRequested)="removeGrant($event)"
                  />
                </app-inset-group>
                <p class="footnote">
                  A grant raises this task's access above the person's project role — it never
                  lowers it — and disappears with the task.
                </p>
              </div>
            }
          </div>
        } @else {
          <div [class.hidden]="view() === 'logs'">
            <app-inset-group>
              <app-skeleton-rows variant="task" label="Loading task" />
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
      font-family: var(--app-font-mono);
      font-size: clamp(1.375rem, 4vw, 1.75rem);
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--tui-text-primary);
      overflow-wrap: anywhere;
    }

    .detail__subtitle {
      margin: 0.375rem 0 0;
      font-family: var(--app-font-mono);
      font-size: 0.9375rem;
      color: var(--tui-text-tertiary);
      overflow-wrap: anywhere;
    }

    .detail__description {
      margin: 0.375rem 0 0;
      font-size: 0.9375rem;
      color: var(--tui-text-secondary);
      overflow-wrap: anywhere;
    }

    /* Fixed console bounds prevent streaming lines from shifting page layout. */
    .detail__console {
      --console-min: clamp(16rem, calc(100dvh - 19rem), 48rem);
      --console-max: clamp(16rem, calc(100dvh - 19rem), 48rem);
    }

    /* Split pointer events keep the fixed control's side bands scrollable. */
    /* Unlayered display wins over md:hidden, so the desktop override must also be unlayered. */
    .detail__nav {
      position: fixed;
      z-index: 10;
      inset-inline: 0;
      inset-block-end: max(env(safe-area-inset-bottom), 1.25rem);
      display: flex;
      justify-content: center;
      pointer-events: none;
    }

    .detail__nav app-glass-segmented {
      pointer-events: auto;
      inline-size: min(21rem, calc(100vw - 2rem));
    }

    @media (min-width: 48rem) {
      .detail__nav {
        display: none;
      }
    }

    @media (min-width: 48rem) {
      .detail__console {
        --console-min: clamp(18rem, calc(100dvh - 26.5rem), 48rem);
        --console-max: clamp(18rem, calc(100dvh - 26.5rem), 48rem);
      }
    }

    .detail__pad {
      padding: 0.875rem 1rem;
    }

    .detail__apply {
      display: flex;
      justify-content: flex-end;
      padding: 0.75rem 1rem;
    }
  `,
})
export class TaskDetailPage {
  protected readonly grants = inject(ManageGrantsStore);
  protected readonly grantableRoles = GRANTABLE_ROLES;
  protected readonly detail = inject(ViewTaskStore);
  private readonly commands = inject(ControlTaskStore);
  private readonly confirmations = inject(ConfirmActionService);
  private readonly dialogs = inject(TuiResponsiveDialogService);
  private readonly toasts = inject(TuiToastService);
  private readonly router = inject(Router);
  private readonly fleet = inject(ListProjectsStore);
  protected readonly logs = inject(LogStreamStore);

  readonly slug = input('');
  readonly name = input('');

  protected readonly project = computed(() => this.slug());
  protected readonly editLink = computed(() => [
    '/projects',
    this.slug(),
    'tasks',
    this.name(),
    'edit',
  ]);
  protected readonly projectLink = computed(() => ['/projects', this.slug()]);
  protected readonly projectPath = computed(() => `/projects/${this.slug()}`);

  protected readonly view = signal<View>('info');
  protected readonly viewIndex = computed(() => VIEWS.indexOf(this.view()));
  protected readonly menuOpen = signal(false);

  protected readonly envMode = signal<'raw' | 'list'>('list');
  protected readonly envModeIndex = computed(() => (this.envMode() === 'raw' ? 0 : 1));

  protected readonly viewItems = computed<readonly GlassSegmentedItem[]>(() => [
    { label: 'Info' },
    { label: 'Environment', dot: this.environmentDirty() },
    { label: 'Logs' },
  ]);

  protected readonly envItems = computed<readonly GlassSegmentedItem[]>(() => [
    { label: 'Raw', dot: this.environmentDirty() },
    { label: 'List' },
  ]);

  protected readonly draftEnvironment = signal<Record<string, string>>({});
  protected readonly environmentDirty = signal(false);
  protected readonly environmentErrors = signal<readonly string[]>([]);
  protected readonly environmentResetKey = signal(0);

  constructor() {
    registerPullRefresh({
      busy: this.detail.loading,
      trigger: () => this.reload(),
    });

    effect(() => {
      const slug = this.slug();
      const name = this.name();
      if (slug && name) this.detail.refresh(slug, name);
    });

    effect(() => {
      const slug = this.slug();
      const name = this.name();
      if (slug && name) this.grants.load(slug, name);
    });

    // Wait for a loaded task so an unknown route name does not reconnect forever.
    effect(() => {
      const task = this.detail.task();
      if (task) this.logs.connect(this.slug(), task.name);
    });

    effect(() => {
      if (!this.environmentDirty() && this.detail.hasLoaded()) {
        this.draftEnvironment.set({ ...this.detail.environment() });
        this.environmentResetKey.update((value) => value + 1);
      }
    });
  }

  protected setView(index: number): void {
    const view = VIEWS[index];
    if (view) this.view.set(view);
  }

  protected reload(): void {
    const slug = this.slug();
    const name = this.name();
    if (slug && name) this.detail.refresh(slug, name);
  }

  protected downloadLogs(): void {
    this.logs.download().subscribe((success) => {
      if (!success) this.notify('The log file could not be downloaded.', false);
    });
  }

  protected actionDisabled(task: Task): boolean {
    return isTransitioningTask(task) || this.commands.isPending(task.name);
  }

  protected isPending(task: Task): boolean {
    return this.commands.isPending(task.name);
  }

  protected onMenuAction({ action, task }: TaskActionRequest): void {
    // Taiga auto-dismisses context dropdowns only, so explicitly close this menu.
    this.menuOpen.set(false);

    if (action === 'delete') {
      this.deleteTask(task.name);
      return;
    }

    if (action === 'edit') {
      void this.router.navigate(this.editLink());
      return;
    }

    this.changeState(action);
  }

  protected changeDevStatus(task: Task): void {
    this.dialogs
      .open<DevStatus>(new PolymorpheusComponent(DevStatusSheet), {
        label: 'Dev status',
        data: task.devStatus,
      })
      .pipe(
        filter((status) => status !== task.devStatus),
        switchMap((status) => this.commands.setDevStatus(this.slug(), task, status)),
      )
      .subscribe((result) => {
        this.notify(result.message, result.success);

        if (result.success) {
          /* Home and the project list read this as dot colors. */
          this.fleet.invalidate();
          this.reload();
        }
      });
  }

  /* Reversible lifecycle actions do not require confirmation. */
  protected changeState(action: TaskStateAction): void {
    const task = this.detail.task();
    if (!task) return;
    this.commands.changeState(this.slug(), task, action).subscribe((result) => {
      this.notify(result.message, result.success);

      if (result.success) {
        /* Home reads task status as dots, so its cached fleet is now out of date. */
        this.fleet.invalidate();
        this.reload();
      }
    });
  }

  protected deleteTask(name: string): void {
    this.confirmations
      .confirm({
        title: `Delete ${name}?`,
        message:
          'The container, environment metadata and proxy route will be deleted. This action cannot be undone.',
        confirmLabel: 'Delete task',
        destructive: true,
      })
      .pipe(
        filter(Boolean),
        map(() => this.detail.task()),
        filter((task): task is Task => task !== undefined),
        switchMap((task) => this.commands.delete(this.slug(), task)),
      )
      .subscribe((result) => {
        this.notify(result.message, result.success);

        if (result.success) {
          this.fleet.invalidate();
          void this.router.navigate(['/projects', this.slug()]);
        }
      });
  }

  protected applyEnvironment(): void {
    this.detail.updateEnvironment(this.draftEnvironment()).subscribe((message) => {
      this.environmentDirty.set(false);
      this.notify(
        message,
        !message.toLowerCase().includes('failed') && !message.toLowerCase().includes('invalid'),
      );
    });
  }

  protected setEnvMode(index: number): void {
    this.envMode.set(index === 0 ? 'raw' : 'list');
  }

  protected reportValueCopyFailure(): void {
    this.notify('The value could not be copied to the clipboard.', false);
  }

  protected reportCopyFailure(): void {
    this.notify('The proxy URL could not be copied to the clipboard.', false);
  }

  protected grantSummary(count: number): string {
    return `${count} ${count === 1 ? 'person' : 'people'}`;
  }

  protected addGrant(input: AddMemberInput): void {
    this.grants.add(input).subscribe((result) => {
      this.notify(result.message, result.success);
      if (result.success) this.grants.reload();
    });
  }

  protected removeGrant(grant: Member): void {
    this.confirmations
      .confirm({
        title: `Revoke access for ${grant.username}?`,
        message: 'They lose this task immediately; their project role is untouched.',
        confirmLabel: 'Revoke access',
        destructive: true,
      })
      .pipe(
        filter(Boolean),
        switchMap(() => this.grants.remove(grant.userId, grant.username)),
      )
      .subscribe((result) => {
        this.notify(result.message, result.success);
        if (result.success) this.grants.reload();
      });
  }

  private notify(message: string, success: boolean): void {
    this.toasts
      .open(message, { appearance: success ? 'positive' : 'negative' })
      .pipe(take(1))
      .subscribe();
  }
}
