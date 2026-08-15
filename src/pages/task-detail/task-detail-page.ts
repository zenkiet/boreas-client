import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TuiButton, TuiDropdown, TuiIcon, TuiLoader } from '@taiga-ui/core';
import { TuiAppBar } from '@taiga-ui/layout';
import { TuiToastService } from '@taiga-ui/kit';
import { filter, map, switchMap, take } from 'rxjs';

import { EnvironmentEditor, EnvironmentList } from '@entities/environment';
import { Task, TaskActionRequest, TaskMenu, TaskStateAction, isTransitioningTask } from '@entities/task';
import { ControlTaskStore } from '@features/control-task';
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
import { LoadingState } from '@shared/ui/loading-state/loading-state';
import { TaskOverview } from '@widgets/task-overview';

const VIEWS = ['logs', 'environment', 'info'] as const;

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
    LoadingState,
    LogConsole,
    Reveal,
    RouterLink,
    TaskMenu,
    TaskOverview,
    TuiAppBar,
    TuiButton,
    TuiDropdown,
    TuiIcon,
    TuiLoader,
  ],
  providers: [ViewTaskStore, ControlTaskStore, LogStreamStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (detail.loading() && !detail.hasLoaded()) {
      <app-loading-state label="Loading task" />
    } @else if (detail.error() && !detail.hasLoaded()) {
      <app-error-state title="Unable to load task" [message]="detail.error()!" (retry)="reload()" />
    } @else if (detail.task(); as task) {
      <div appReveal class="mx-auto grid w-full max-w-[48rem] grid-cols-1 gap-3.5 pb-16 md:gap-4 md:pb-0">
        <!-- The scroll edge prevents content showing through Taiga's transparent app bar. -->
        <div
          class="scroll-edge sticky top-0 z-10 -mx-4 -mt-[max(1rem,env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] md:hidden"
        >
          <tui-app-bar tuiAppBarSize>
            <a tuiSlot="start" tuiAppBarBack routerLink="/dashboard" aria-label="Back to tasks"></a>
            <span class="detail__bar-title">
              <span class="detail__dot" [attr.data-status]="task.status" aria-hidden="true"></span>
              {{ task.id }}
            </span>
            <!-- Use a menu here; bottom sheets are reserved for message surfaces. -->
            <button
              tuiSlot="end"
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
          </tui-app-bar>
        </div>

        <header class="hidden md:block">
          <app-back-link link="/dashboard" label="Tasks" />
          <h1 class="detail__title mt-1.5">
            <span class="detail__dot" [attr.data-status]="task.status" aria-hidden="true"></span>
            {{ task.id }}
          </h1>
          <p class="detail__subtitle">{{ task.image }} · port {{ task.port }}</p>
        </header>

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
          <button
            tuiButton
            type="button"
            size="s"
            appearance="flat-destructive"
            [disabled]="actionDisabled(task)"
            (click)="deleteTask(task.id)"
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
            Environment changes are waiting for a container recreate.
          </app-callout>
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

        <!-- Preserve console scroll/buffer and environment drafts while switching views. -->
        <div class="detail__console" [class.hidden]="view() !== 'logs'">
          <app-log-console
            [entries]="logs.entries()"
            [connected]="logs.connected()"
            [downloadUrl]="logs.downloadUrl()"
          />
        </div>

        <div class="grid grid-cols-1 gap-3.5" [class.hidden]="view() !== 'environment'">
          <app-glass-segmented
            [items]="envItems()"
            [activeIndex]="envModeIndex()"
            (activeIndexChange)="setEnvMode($event)"
          />

          <div class="detail__card" [class.hidden]="envMode() !== 'list'">
            <app-environment-list
              [environment]="detail.environment()"
              (copyFailed)="reportValueCopyFailure()"
            />
          </div>

          <div class="detail__card grid grid-cols-1 gap-4" [class.hidden]="envMode() !== 'raw'">
            <app-environment-editor
              [environment]="detail.environment()"
              [resetKey]="environmentResetKey()"
              (environmentChange)="draftEnvironment.set($event); environmentDirty.set(true)"
              (errorsChange)="environmentErrors.set($event)"
            />

            <div class="flex justify-end border-t border-border pt-4">
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
          </div>
        </div>

        <div [class.hidden]="view() !== 'info'">
          <app-task-overview
            [task]="task"
            [proxyUrl]="detail.proxyUrl()"
            (copyFailed)="reportCopyFailure()"
          />
        </div>
      </div>
    }
  `,
  styles: `
    .detail__bar-title {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      min-inline-size: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .detail__title {
      display: flex;
      align-items: center;
      gap: 0.625rem;
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

    .detail__dot {
      inline-size: 0.4375rem;
      block-size: 0.4375rem;
      flex: none;
      border-radius: 999px;
      background: var(--tui-status-neutral);
    }

    .detail__dot[data-status='running'] {
      background: var(--tui-status-positive);
    }

    .detail__dot[data-status='error'] {
      background: var(--tui-status-negative);
    }

    .detail__dot[data-status='creating'],
    .detail__dot[data-status='starting'] {
      background: var(--tui-status-warning);
      animation: detail-dot-pulse 1.4s ease-in-out infinite;
    }

    @keyframes detail-dot-pulse {
      50% {
        opacity: 0.4;
      }
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

    .detail__card {
      border: 1px solid var(--tui-border-normal);
      border-radius: var(--tui-radius-l);
      background: var(--tui-background-base);
      box-shadow: var(--app-shadow-panel);
      padding: 0.875rem 1rem;
    }

  `,
})
export class TaskDetailPage {
  protected readonly detail = inject(ViewTaskStore);
  private readonly commands = inject(ControlTaskStore);
  private readonly confirmations = inject(ConfirmActionService);
  private readonly toasts = inject(TuiToastService);
  private readonly router = inject(Router);
  protected readonly logs = inject(LogStreamStore);

  readonly id = input('');

  protected readonly view = signal<View>('logs');
  protected readonly viewIndex = computed(() => VIEWS.indexOf(this.view()));
  protected readonly menuOpen = signal(false);

  protected readonly envMode = signal<'raw' | 'list'>('list');
  protected readonly envModeIndex = computed(() => (this.envMode() === 'raw' ? 0 : 1));

  protected readonly viewItems = computed<readonly GlassSegmentedItem[]>(() => [
    { label: 'Logs' },
    { label: 'Environment', dot: this.environmentDirty() },
    { label: 'Info' },
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
      trigger: () => {
        const id = this.id();
        if (id) this.detail.refresh(id);
      },
    });

    effect(() => {
      const id = this.id();
      if (id) this.detail.refresh(id);
    });

    // Wait for a loaded task so an unknown route id does not reconnect forever.
    effect(() => {
      const task = this.detail.task();
      if (task) this.logs.connect(task.id);
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
    if (this.id()) this.detail.refresh(this.id());
  }

  protected actionDisabled(task: Task): boolean {
    return isTransitioningTask(task) || this.commands.isPending(task.id);
  }

  protected isPending(task: Task): boolean {
    return this.commands.isPending(task.id);
  }

  protected onMenuAction({ action, task }: TaskActionRequest): void {
    // Taiga auto-dismisses context dropdowns only, so explicitly close this menu.
    this.menuOpen.set(false);

    if (action === 'delete') {
      this.deleteTask(task.id);
      return;
    }

    this.changeState(action);
  }

  /* Reversible lifecycle actions do not require confirmation. */
  protected changeState(action: TaskStateAction): void {
    const task = this.detail.task();
    if (!task) return;
    this.commands.changeState(task, action).subscribe((result) => {
      this.notify(result.message, result.success);
      if (result.success) this.reload();
    });
  }

  protected deleteTask(taskId: string): void {
    this.confirmations
      .confirm({
        title: `Delete ${taskId}?`,
        message:
          'The container, environment metadata and proxy route will be deleted. This action cannot be undone.',
        confirmLabel: 'Delete task',
        destructive: true,
      })
      .pipe(
        filter(Boolean),
        map(() => this.detail.task()),
        filter((task): task is Task => task !== undefined),
        switchMap((task) => this.commands.delete(task)),
      )
      .subscribe((result) => {
        this.notify(result.message, result.success);
        if (result.success) void this.router.navigate(['/dashboard']);
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

  private notify(message: string, success: boolean): void {
    this.toasts
      .open(message, { appearance: success ? 'positive' : 'negative' })
      .pipe(take(1))
      .subscribe();
  }
}
