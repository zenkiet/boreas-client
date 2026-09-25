import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  signal,
  untracked,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import type { SelectCustomEvent } from '@ionic/angular';
import { IonBackButton } from '@ionic/angular/ion-back-button';
import { IonButton } from '@ionic/angular/ion-button';
import { IonButtons } from '@ionic/angular/ion-buttons';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonNote } from '@ionic/angular/ion-note';
import { IonPopover } from '@ionic/angular/ion-popover';
import { IonRouterLink, IonRouterLinkWithHref } from '@ionic/angular/ion-router-link';
import { IonSegment } from '@ionic/angular/ion-segment';
import { IonSegmentButton } from '@ionic/angular/ion-segment-button';
import { IonSpinner } from '@ionic/angular/ion-spinner';
import { NavController } from '@ionic/angular/nav-controller';
import { filter, map, switchMap } from 'rxjs';

import { EnvironmentEditor } from '@entities/environment';
import { AddMemberInput, GRANTABLE_ROLES, Member } from '@entities/project';
import {
  DEV_STATUS_DOT,
  DEV_STATUS_LABEL,
  DevStatus,
  Task,
  TaskActionRequest,
  TaskMenu,
  TaskStateAction,
  isTransitioningTask,
  taskKey,
} from '@entities/task';
import { ControlTaskStore } from '@features/control-task';
import { ListAlertsStore } from '@features/list-alerts/model';
import { ListProjectsStore } from '@features/list-projects/model';
import {
  ManageGrantsStore,
  MemberForm,
  MemberList,
  MemberRoleChange,
} from '@features/manage-project';
import { LogConsole, LogStreamStore } from '@features/stream-task-logs';
import { TaskUsage, TaskUsageStore } from '@features/track-stats';
import { ViewTaskStore } from '@features/view-task';
import {
  PULL_REFRESH,
  PullRefreshSource,
  onReturn,
} from '@shared/lib/pull-to-refresh/pull-to-refresh';
import { desktopScreen, wideScreen } from '@shared/ui/breakpoint/wide-screen';
import { Callout } from '@shared/ui/callout/callout';
import { ConfirmActionService } from '@shared/ui/confirm-action/confirm-action';
import { ErrorState } from '@shared/ui/error-state/error-state';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';
import { NotifyService } from '@shared/ui/notify/notify';
import { PAGE_CHROME } from '@shared/ui/page-chrome/page-chrome';
import { SkeletonRows } from '@shared/ui/skeleton-rows/skeleton-rows';
import { TaskNoteCard, TaskOverview } from '@widgets/task-overview';

type View = 'info' | 'environment' | 'logs';

const VIEWS: readonly string[] = ['info', 'environment', 'logs'] satisfies View[];

@Component({
  selector: 'app-task-detail-page',
  imports: [
    Callout,
    NgTemplateOutlet,
    EnvironmentEditor,
    ErrorState,
    InsetGroup,
    IonBackButton,
    IonButton,
    IonButtons,
    IonItem,
    IonLabel,
    IonNote,
    IonPopover,
    IonRouterLink,
    IonRouterLinkWithHref,
    IonSegment,
    IonSegmentButton,
    IonSpinner,
    LogConsole,
    MemberForm,
    MemberList,
    PAGE_CHROME,
    PULL_REFRESH,
    RouterLink,
    SkeletonRows,
    TaskMenu,
    TaskNoteCard,
    TaskOverview,
    TaskUsage,
  ],
  providers: [ViewTaskStore, ControlTaskStore, LogStreamStore, ManageGrantsStore, TaskUsageStore],
  host: { class: 'desk-wide' },
  template: `
    <!-- iOS push: the name is already in the URL, so chrome renders before any data. -->
    <ion-header [translucent]="true" class="wide-head" [class.condensed]="condensed()">
      <ion-toolbar>
        <!-- aria-hidden: the h1 already names the page; this only fades in on phones. -->
        <ion-title class="font-mono" aria-hidden="true">{{ name() }}</ion-title>
        <ion-buttons slot="start" class="desk-hide">
          <!-- Re-created per label: ion-back-button copies aria-label only once.
               Tracking more than the item keeps Angular's re-creation warning off. -->
          @for (label of [projectName()]; track projectPath() + label) {
            <ion-back-button
              [defaultHref]="projectPath()"
              [text]="label"
              [attr.aria-label]="'Back to ' + label"
            />
          }
        </ion-buttons>
        <nav slot="start" class="crumbs desk-only" aria-label="Breadcrumb">
          <a routerLink="/projects" routerDirection="back">Home</a>
          <span aria-hidden="true">›</span>
          <a [routerLink]="projectPath()" routerDirection="back">{{ projectName() }}</a>
          <span aria-hidden="true">›</span>
          <span class="font-mono" aria-current="page">{{ name() }}</span>
        </nav>
        <ion-buttons slot="end" class="wide-only">
          @if (detail.task(); as task) {
            @if (task.status === 'running') {
              <ion-button
                class="act"
                fill="solid"
                target="_blank"
                rel="noopener"
                [href]="detail.proxyUrl()"
              >
                <span
                  slot="start"
                  class="icon-[light--arrow-up-right-from-square]"
                  aria-hidden="true"
                ></span>
                Open
              </ion-button>
            }
            <ion-button
              class="act"
              fill="solid"
              [disabled]="actionDisabled(task)"
              (click)="changeState(task.status === 'running' ? 'stop' : 'start')"
            >
              <span
                slot="start"
                [class]="task.status === 'running' ? 'icon-[solid--stop]' : 'icon-[solid--play]'"
                aria-hidden="true"
              ></span>
              {{ task.status === 'running' ? 'Stop' : 'Start' }}
            </ion-button>
            <ion-button
              class="act"
              fill="solid"
              [disabled]="actionDisabled(task)"
              (click)="changeState('restart')"
            >
              <span slot="start" class="icon-[light--arrow-rotate-right]" aria-hidden="true"></span>
              Restart
            </ion-button>
            <ion-button class="act" fill="solid" [routerLink]="editLink()">
              <span slot="start" class="icon-[light--pencil]" aria-hidden="true"></span>
              Edit
            </ion-button>
            <ion-button
              class="act act--icon"
              fill="solid"
              aria-label="More actions"
              (click)="openMenu($event)"
            >
              <span slot="icon-only" class="icon-[regular--ellipsis]" aria-hidden="true"></span>
            </ion-button>
          }
        </ion-buttons>
        <ion-buttons slot="end" class="narrow-only">
          @if (detail.task(); as task) {
            <ion-button
              [disabled]="actionDisabled(task)"
              [attr.aria-label]="task.status === 'running' ? 'Stop task' : 'Start task'"
              (click)="changeState(task.status === 'running' ? 'stop' : 'start')"
            >
              <span
                slot="icon-only"
                [class]="task.status === 'running' ? 'icon-[solid--stop]' : 'icon-[solid--play]'"
                aria-hidden="true"
              ></span>
            </ion-button>
          }
          <ion-button
            aria-label="More actions"
            [disabled]="!detail.task()"
            (click)="openMenu($event)"
          >
            <span slot="icon-only" class="icon-[regular--ellipsis]" aria-hidden="true"></span>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      @if (wide()) {
        <ion-toolbar>
          <div class="title-row">
            <ng-container *ngTemplateOutlet="titleBlock" />
            <ng-container *ngTemplateOutlet="sectionSwitch" />
          </div>
        </ion-toolbar>
      }
    </ion-header>

    <ion-content
      [fullscreen]="true"
      [scrollEvents]="true"
      (ionScroll)="condensed.set($event.detail.scrollTop > 48)"
    >
      <ion-refresher [appRefresh]="pull"><ion-refresher-content /></ion-refresher>

      @if (!wide()) {
        <div class="phone-title"><ng-container *ngTemplateOutlet="titleBlock" /></div>
        <ion-toolbar class="phone-switch">
          <ng-container *ngTemplateOutlet="sectionSwitch" />
        </ion-toolbar>
      }

      <div class="mx-auto max-w-(--app-column)">
        @if (detail.task(); as task) {
          <!-- Screen readers cannot infer status from the action set. -->
          <p class="sr-only">Status: {{ task.status }}</p>

          @if (detail.error()) {
            <app-callout class="m-5" tone="negative" role="alert">{{ detail.error() }}</app-callout>
          }
          @if (task.pendingRecreate) {
            <app-callout class="m-5" tone="warning" role="status">
              <p class="m-0">
                Changes are waiting for a container recreate. They apply on the next start or
                restart.
              </p>
              <ion-button
                class="mt-2"
                size="small"
                fill="outline"
                [disabled]="actionDisabled(task)"
                (click)="changeState('restart')"
              >
                Restart now
              </ion-button>
            </app-callout>
          }
        }

        @if (detail.error() && !detail.hasLoaded()) {
          <app-error-state
            class="m-5 block"
            title="Unable to load task"
            [message]="detail.error()!"
            (retry)="reload()"
          />
        } @else {
          <!-- Hidden, never destroyed: the console keeps its scroll, the editor its draft. -->
          <div class="body">
            <div class="main">
              <div class="console" [class.hidden]="mainView() !== 'logs'">
                <app-log-console
                  [entries]="logs.entries()"
                  [connected]="logs.connected()"
                  [connecting]="!detail.task() || logs.connecting()"
                  [downloading]="logs.downloading()"
                  (downloadRequested)="downloadLogs()"
                />
              </div>

              @if (detail.task()) {
                <div [class.hidden]="mainView() !== 'environment'">
                  <app-inset-group>
                    <app-environment-editor
                      class="tall"
                      [footer]="true"
                      [environment]="detail.environment()"
                      [resetKey]="environmentResetKey()"
                      (environmentChange)="draftEnvironment.set($event); environmentDirty.set(true)"
                      (errorsChange)="environmentErrors.set($event)"
                    />
                  </app-inset-group>
                  <div class="apply">
                    <p class="apply__note">
                      Applying replaces the whole map and recreates the container.
                    </p>
                    <ion-button
                      expand="block"
                      class="cta"
                      [disabled]="
                        !environmentDirty() ||
                        detail.savingEnvironment() ||
                        environmentErrors().length > 0
                      "
                      (click)="applyEnvironment()"
                    >
                      @if (detail.savingEnvironment()) {
                        <ion-spinner name="lines-small" />
                      } @else {
                        Apply and restart
                      }
                    </ion-button>
                  </div>
                </div>
              }
            </div>

            <div class="aside" [class.hidden]="!desktop() && view() !== 'info'">
              @if (detail.task(); as task) {
                <!-- One DOM for every width: the order-* classes arrange it. -->
                <div class="info">
                  <div class="info__col">
                    <app-task-overview
                      class="order-1"
                      [task]="task"
                      [proxyUrl]="detail.proxyUrl()"
                      [lastDeploy]="lastDeploy()"
                      [usage]="usage.points().at(-1) ?? null"
                      (copyFailed)="
                        notify('The proxy URL could not be copied to the clipboard.', false)
                      "
                      (imageCopyFailed)="
                        notify('The image reference could not be copied to the clipboard.', false)
                      "
                      (statusChange)="changeDevStatus(task, $event)"
                    />

                    <!-- Listing grants is owner-only: a null list self-gates the panel. -->
                    @if (grants.grants(); as grantList) {
                      <app-inset-group
                        class="order-4"
                        label="Access"
                        [trailing]="grantSummary(grantList.length)"
                      >
                        <app-member-list
                          dateVerb="Granted"
                          [members]="grantList"
                          [busy]="grants.busy()"
                          (removeRequested)="removeGrant($event)"
                          (roleChange)="changeGrantRole($event)"
                        />
                        <ion-item>
                          <button
                            type="button"
                            class="disclose"
                            [attr.aria-expanded]="granting()"
                            (click)="granting.update((open) => !open)"
                          >
                            Grant access…
                          </button>
                        </ion-item>
                        @if (granting()) {
                          <app-member-form
                            addLabel="Grant access"
                            defaultRole="viewer"
                            [members]="grantList"
                            [users]="grants.users()"
                            [busy]="grants.busy()"
                            [roles]="grantableRoles"
                            (addRequested)="addGrant($event)"
                          />
                        }
                        <ion-note>
                          A grant raises one person above their project role for this task only.
                        </ion-note>
                      </app-inset-group>
                    }
                  </div>

                  <div class="info__col">
                    <!-- Stopped tasks are absent from the stream; desktop has a Usage row. -->
                    @if (task.status === 'running') {
                      <app-inset-group
                        class="desk-hide order-2"
                        label="Live usage"
                        trailing="last 60 s"
                      >
                        <app-task-usage [points]="usage.points()" />
                      </app-inset-group>
                    }
                    <app-inset-group class="order-3" label="Note">
                      <app-task-note-card
                        [note]="task.note ?? ''"
                        [updatedAt]="task.updatedAt"
                        [editLink]="noteLink()"
                      />
                    </app-inset-group>
                  </div>
                </div>
              } @else {
                <app-inset-group>
                  <app-skeleton-rows variant="task" label="Loading task" />
                </app-inset-group>
              }
            </div>
          </div>
        }
      </div>
    </ion-content>

    <!-- One menu for both triggers, so it anchors with [event], not a trigger id. -->
    @if (detail.task(); as task) {
      <ion-popover
        side="bottom"
        alignment="end"
        style="--width: 15.625rem"
        [attr.aria-label]="'Actions for ' + task.name"
        [isOpen]="menuOpen()"
        [event]="menuEvent()"
        [dismissOnSelect]="true"
        (didDismiss)="menuOpen.set(false)"
      >
        <ng-template>
          <app-task-menu
            [task]="task"
            [accessUrl]="detail.proxyUrl()"
            [pending]="isPending(task)"
            (actionRequested)="onMenuAction($event)"
          />
        </ng-template>
      </ion-popover>
    }

    <ng-template #titleBlock>
      <div>
        <h1 class="task-h1">{{ name() }}</h1>
        @if (detail.task(); as task) {
          <p>
            <i
              class="size-2 flex-none rounded-full"
              [class]="devDot[task.devStatus]"
              aria-hidden="true"
            ></i>
            <span class="truncate">
              {{ devLabel[task.devStatus] }}
              @if (task.description) {
                · {{ task.description }}
              }
            </span>
          </p>
        }
      </div>
    </ng-template>

    <ng-template #sectionSwitch>
      <ion-segment [value]="mainView()" (ionChange)="view.set($any($event.detail.value))">
        <ion-segment-button value="info" class="desk-hide">
          <ion-label>Overview</ion-label>
        </ion-segment-button>
        <ion-segment-button value="environment">
          <ion-label>
            Environment
            @if (environmentDirty()) {
              <span class="unsaved" aria-hidden="true"></span
              ><span class="sr-only">, unsaved changes</span>
            }
          </ion-label>
        </ion-segment-button>
        <ion-segment-button value="logs"><ion-label>Logs</ion-label></ion-segment-button>
      </ion-segment>
    </ng-template>
  `,
  styles: `
    /* The emulated attribute outweighs the global .title-row h1 the other pushed pages use. */
    .task-h1 {
      font-family: var(--app-font-mono);
      font-size: 1.75rem;
      line-height: 2.125rem;
      font-weight: 600;
      letter-spacing: 0;
    }

    .title-row > div {
      min-inline-size: 0;
    }

    ion-button.act--icon {
      --padding-start: 0;
      --padding-end: 0;
      inline-size: 2.5rem;
    }

    .apply {
      display: flex;
      flex-direction: column-reverse;
      margin: 0.875rem 1.25rem 0;
    }

    .apply__note {
      margin: 0.5rem 1rem 0;
      font-size: 0.8125rem;
      line-height: 1.125rem;
      color: var(--app-text-tertiary);
    }

    .unsaved {
      display: inline-block;
      inline-size: 0.375rem;
      block-size: 0.375rem;
      margin-inline-start: 0.25rem;
      vertical-align: middle;
      border-radius: 999px;
      background: var(--ion-color-primary);
    }

    .info {
      display: flex;
      flex-direction: column;
    }

    .info__col {
      display: contents;
    }

    /* Fixed console bounds keep streaming lines from shifting the page. */
    .console {
      --console-max: clamp(16rem, calc(100dvh - 22rem), 48rem);
    }

    @media (min-width: 64rem) and (min-height: 31.25rem) {
      .task-h1 {
        font-size: 1.875rem;
        line-height: 2.375rem;
      }

      .apply {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }

      .apply__note {
        margin: 0 1rem;
      }

      .apply ion-button {
        flex: none;
        inline-size: auto;
        min-block-size: 3rem;
        --padding-start: 1.5rem;
        --padding-end: 1.5rem;
        --button-font-size: 1rem;
      }
    }

    @media (min-width: 64rem) and (min-height: 31.25rem) and (max-width: 79.99rem) {
      .info {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        align-items: start;
      }

      .info__col {
        display: flex;
        flex-direction: column;
      }
    }

    @media (min-width: 80rem) {
      .task-h1 {
        font-size: 1.75rem;
        line-height: 2.25rem;
      }

      .body {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 23.125rem;
        align-items: start;
      }

      .main {
        grid-area: 1 / 1;
      }

      .aside {
        grid-area: 1 / 2;
      }

      :host ::ng-deep .main app-inset-group .list-ios.list-inset {
        margin-inline-end: 0.625rem;
      }

      :host ::ng-deep .aside app-inset-group .list-ios.list-inset {
        margin-inline-start: 0.625rem;
      }

      .console {
        --console-max: calc(100dvh - var(--offset-top, 0px) - 8rem);
      }
    }
  `,
})
export class TaskDetailPage {
  protected readonly grants = inject(ManageGrantsStore);
  protected readonly grantableRoles = GRANTABLE_ROLES;
  protected readonly detail = inject(ViewTaskStore);
  protected readonly usage = inject(TaskUsageStore);
  private readonly commands = inject(ControlTaskStore);
  private readonly confirmations = inject(ConfirmActionService);
  private readonly notifications = inject(NotifyService);
  private readonly router = inject(Router);
  private readonly navCtrl = inject(NavController);
  private readonly fleet = inject(ListProjectsStore);
  private readonly deploys = inject(ListAlertsStore);
  protected readonly logs = inject(LogStreamStore);
  protected readonly desktop = desktopScreen();
  protected readonly wide = wideScreen();

  readonly slug = input('');
  readonly name = input('');
  /** The `?section=` deep link. */
  readonly section = input<string>();

  protected readonly devLabel = DEV_STATUS_LABEL;
  protected readonly devDot = DEV_STATUS_DOT;

  protected readonly editLink = computed(() => [
    '/projects',
    this.slug(),
    'tasks',
    this.name(),
    'edit',
  ]);
  protected readonly noteLink = computed(() => [
    '/projects',
    this.slug(),
    'tasks',
    this.name(),
    'note',
  ]);
  protected readonly projectPath = computed(() => `/projects/${this.slug()}`);

  protected readonly lastDeploy = computed(
    () => this.deploys.latestDeploys().get(taskKey(this.slug(), this.name())) ?? null,
  );

  /* Untracked: a resize must never reset the section someone picked. */
  protected readonly view = linkedSignal<View>(() => {
    const section = this.section();
    if (section && VIEWS.includes(section)) return section as View;
    return untracked(this.desktop) ? 'logs' : 'info';
  });
  /* Desktop has no Overview tab: the aside always shows it. */
  protected readonly mainView = computed(() =>
    this.desktop() && this.view() === 'info' ? 'logs' : this.view(),
  );

  protected readonly projectName = computed(
    () =>
      this.fleet.summaries().find(({ project }) => project.slug === this.slug())?.project.name ??
      this.slug(),
  );

  protected readonly menuOpen = signal(false);
  protected readonly condensed = signal(false);
  protected readonly menuEvent = signal<Event | null>(null);
  protected readonly granting = signal(false);

  protected readonly draftEnvironment = signal<Record<string, string>>({});
  protected readonly environmentDirty = signal(false);
  protected readonly environmentErrors = signal<readonly string[]>([]);
  protected readonly environmentResetKey = signal(0);

  protected readonly pull: PullRefreshSource = {
    busy: this.detail.loading,
    trigger: () => this.reload(),
  };

  constructor() {
    this.detail.track(this.slug, this.name);
    /* Edit and note screens change this task underneath the cached page. */
    onReturn(() => this.reload());

    this.usage.watch(
      computed(() => {
        const task = this.detail.task();
        return task?.status === 'running' ? { slug: this.slug(), task: task.name } : undefined;
      }),
    );

    effect(() => {
      const slug = this.slug();
      const name = this.name();
      if (slug && name) this.grants.load(slug, name);
    });

    // A loaded task first, or an unknown route name would reconnect forever.
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

  /* A covered page keeps its stream otherwise; the reload on return reconnects it. */
  ionViewDidLeave(): void {
    this.logs.disconnect();
  }

  protected reload(): void {
    const slug = this.slug();
    const name = this.name();
    if (slug && name) this.detail.refresh(slug, name);
  }

  protected openMenu(event: Event): void {
    this.menuEvent.set(event);
    this.menuOpen.set(true);
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

  protected changeDevStatus(task: Task, event: SelectCustomEvent<DevStatus>): void {
    const status = event.detail.value;
    if (status === task.devStatus) return;

    this.commands.setDevStatus(this.slug(), task, status).subscribe((result) => {
      this.notify(result.message, result.success);

      if (result.success) {
        /* Home and the project list draw this as dot colours. */
        this.fleet.invalidate();
        this.reload();
      } else {
        /* The select flipped itself on pick; a refused change has to flip it back. */
        event.target.value = task.devStatus;
      }
    });
  }

  /* No confirm: lifecycle actions are reversible. */
  protected changeState(action: TaskStateAction): void {
    const task = this.detail.task();
    if (!task) return;
    this.commands.changeState(this.slug(), task, action).subscribe((result) => {
      this.notify(result.message, result.success);

      if (result.success) {
        /* Home's cached fleet draws task status. */
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
          'The container, its variables and its proxy route are removed. This can’t be undone.',
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
          void this.navCtrl.navigateBack(this.projectPath());
        }
      });
  }

  /* Only a success drops the draft: a refusal must never cost the unapplied edits. */
  protected applyEnvironment(): void {
    this.detail.updateEnvironment(this.draftEnvironment()).subscribe((result) => {
      this.notify(result.message, result.success);
      if (result.success) this.environmentDirty.set(false);
    });
  }

  protected grantSummary(count: number): string {
    return `${count} ${count === 1 ? 'grant' : 'grants'}`;
  }

  protected addGrant(input: AddMemberInput): void {
    this.grants.add(input).subscribe((result) => {
      this.notify(result.message, result.success);
      if (result.success) this.grants.reload();
    });
  }

  protected changeGrantRole({ member, event }: MemberRoleChange): void {
    this.grants
      .add({ userId: member.userId, role: event.detail.value }, 'Role updated.')
      .subscribe((result) => {
        this.notify(result.message, result.success);
        if (result.success) this.grants.reload();
        else event.target.value = member.role;
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

  protected notify(message: string, success: boolean): void {
    this.notifications.result({ message, success });
  }
}
