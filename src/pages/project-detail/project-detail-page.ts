import { DOCUMENT, DatePipe, NgTemplateOutlet } from '@angular/common';
import {
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import type { SelectCustomEvent } from '@ionic/angular';
import { IonBackButton } from '@ionic/angular/ion-back-button';
import { IonButton } from '@ionic/angular/ion-button';
import { IonButtons } from '@ionic/angular/ion-buttons';
import { IonInput } from '@ionic/angular/ion-input';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonList } from '@ionic/angular/ion-list';
import { IonNote } from '@ionic/angular/ion-note';
import { IonPopover } from '@ionic/angular/ion-popover';
import { IonRouterLinkWithHref } from '@ionic/angular/ion-router-link';
import { IonSegment } from '@ionic/angular/ion-segment';
import { IonSegmentButton } from '@ionic/angular/ion-segment-button';
import { IonSelect } from '@ionic/angular/ion-select';
import { IonSelectOption } from '@ionic/angular/ion-select-option';
import { NavController } from '@ionic/angular/nav-controller';
import { filter, from, switchMap } from 'rxjs';

import { AddMemberInput, Member, Project, TaskDefaultsInput } from '@entities/project';
import { toCredentialOptions } from '@entities/registry-credential';
import { Task, TaskActionRequest, newestDeploy } from '@entities/task';
import { SessionStore } from '@features/auth';
import { ControlTaskStore } from '@features/control-task';
import { ListProjectsStore } from '@features/list-projects/model';
import { TaskList } from '@features/list-tasks';
import {
  ManageProjectStore,
  MemberForm,
  MemberList,
  MemberRoleChange,
  ProjectDefaultsForm,
  RepositoryPicker,
} from '@features/manage-project';
import { PinnedProjectsStore } from '@features/pin-project';
import { ViewProjectStore } from '@features/view-project';
import { CommandResult } from '@shared/api/command';
import { IS_ADMIN, atLeastRole } from '@shared/api/role';
import { ServerConfigStore } from '@shared/config/server-config.store';
import { age } from '@shared/lib/format/age';
import { splitRepo } from '@shared/lib/format/repo';
import { whileOnScreen } from '@shared/lib/on-screen/on-screen';
import {
  PULL_REFRESH,
  PullRefreshSource,
  onReturn,
} from '@shared/lib/pull-to-refresh/pull-to-refresh';
import { wideScreen } from '@shared/ui/breakpoint/wide-screen';
import { Callout } from '@shared/ui/callout/callout';
import { ConfirmActionService } from '@shared/ui/confirm-action/confirm-action';
import { EmptyState } from '@shared/ui/empty-state/empty-state';
import { ErrorState } from '@shared/ui/error-state/error-state';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';
import { rise, sectionDir } from '@shared/ui/motion/page-motion';
import { SymbolGlyph, clipboardCopy } from '@shared/ui/motion/symbol';
import { Announcer } from '@shared/ui/notify/announcer';
import { NotifyService } from '@shared/ui/notify/notify';
import { PAGE_CHROME } from '@shared/ui/page-chrome/page-chrome';
import { NEW_TASK_DIALOG, SheetService } from '@shared/ui/sheet/sheet.service';
import { SkeletonRows } from '@shared/ui/skeleton-rows/skeleton-rows';

const VIEWS = ['tasks', 'members', 'about'] as const;

type View = (typeof VIEWS)[number];

@Component({
  selector: 'app-project-detail-page',
  imports: [
    Callout,
    DatePipe,
    NgTemplateOutlet,
    EmptyState,
    ErrorState,
    InsetGroup,
    IonBackButton,
    IonButton,
    IonButtons,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonPopover,
    IonRouterLinkWithHref,
    IonSegment,
    IonSegmentButton,
    IonSelect,
    IonSelectOption,
    MemberForm,
    MemberList,
    PAGE_CHROME,
    ProjectDefaultsForm,
    PULL_REFRESH,
    RouterLink,
    SkeletonRows,
    SymbolGlyph,
    TaskList,
  ],
  providers: [ViewProjectStore, ControlTaskStore, ManageProjectStore],
  host: { class: 'desk-wide' },
  template: `
    <ion-header [translucent]="true" class="wide-head" [class.condensed]="condensed()">
      <ion-toolbar>
        <!-- aria-hidden: the h1 already names the page. -->
        <ion-title aria-hidden="true">{{ displayName() }}</ion-title>
        <ion-buttons slot="start" class="desk-hide">
          <ion-back-button defaultHref="/projects" text="Home" aria-label="Back to Home" />
        </ion-buttons>
        <nav slot="start" class="crumbs desk-only" aria-label="Breadcrumb">
          <a routerLink="/projects" routerDirection="back">Home</a>
          <span aria-hidden="true">›</span>
          <span aria-current="page">{{ displayName() }}</span>
        </nav>
        <!-- New task leads: shown on Tasks only, it leaves the rest in place. -->
        <ion-buttons slot="end" class="narrow-only">
          @if (canCreateHere()) {
            <ion-button (click)="newTask()" aria-label="New task">
              <span slot="icon-only" class="icon-[regular--plus]" aria-hidden="true"></span>
            </ion-button>
          }
          @if (canAsk()) {
            <ion-button aria-label="Ask about this project" (click)="ask()">
              <span slot="icon-only" class="icon-[regular--message]" aria-hidden="true"></span>
            </ion-button>
          }
          <ion-button aria-label="Activity for this project" (click)="openActivity()">
            <span
              slot="icon-only"
              class="icon-[regular--clock-rotate-left]"
              aria-hidden="true"
            ></span>
          </ion-button>
        </ion-buttons>
        <ion-buttons slot="end" class="wide-only">
          @if (canCreateHere()) {
            <ion-button
              color="primary"
              fill="solid"
              class="act act--primary desk-hide"
              (click)="newTask()"
            >
              <span slot="start" class="icon-[regular--plus]" aria-hidden="true"></span>
              New task
            </ion-button>
          }
          @if (canAsk()) {
            <ion-button fill="solid" class="act" (click)="ask()">
              <span slot="start" class="icon-[light--message]" aria-hidden="true"></span>
              Ask
            </ion-button>
          }
          <ion-button fill="solid" class="act" [id]="moreId()" aria-label="More actions">
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
        <ion-toolbar class="phone-switch" appPhoneSwitch>
          <ng-container *ngTemplateOutlet="sectionSwitch" />
        </ion-toolbar>
      }

      <div
        class="mx-auto max-w-(--app-column)"
        [attr.data-dir]="sections.dir()"
        (transitionend)="sections.landed($event)"
        (transitioncancel)="sections.landed($event)"
      >
        @if (detail.error() && detail.hasLoaded()) {
          <app-callout class="m-5" tone="negative" role="alert">
            {{ detail.error() }} Existing data is still shown.
          </app-callout>
        }

        @if (detail.error() && !detail.hasLoaded()) {
          <app-error-state
            class="m-5 block"
            title="Unable to load project"
            [message]="detail.error()!"
            (retry)="reload()"
          />
        } @else if (!detail.hasLoaded()) {
          <app-inset-group [label]="skeletonLabel()">
            <app-skeleton-rows
              [variant]="view() === 'members' ? 'member' : 'task'"
              label="Loading project"
            />
          </app-inset-group>
        } @else {
          <!-- Sections hide, never unmount: the member form and scroll state survive switching. -->
          <div class="fx fx-section" [class.hidden]="view() !== 'tasks'">
            @if (detail.tasks().length === 0) {
              <app-inset-group label="Tasks">
                <app-empty-state
                  title="No tasks yet"
                  description="A task is one container with its own URL. Start from the project’s defaults."
                  [bordered]="false"
                >
                  @if (canCreate()) {
                    <ion-button size="small" (click)="newTask()">
                      <span slot="start" class="icon-[regular--plus]" aria-hidden="true"></span>
                      New task
                    </ion-button>
                  }
                </app-empty-state>
              </app-inset-group>
            } @else {
              <app-task-list
                [tasks]="detail.tasks()"
                [builds]="builds()"
                [pending]="commands.pending()"
                [canCreate]="canCreate()"
                (actionRequested)="handleTaskAction($event)"
                (taskOpened)="openTask($event)"
                (createRequested)="newTask()"
                (moved)="announcer.say($event)"
              />
            }
          </div>

          <div class="fx fx-section" [class.hidden]="view() !== 'members'">
            @if (detail.members(); as members) {
              <app-inset-group label="Members" [trailing]="memberSummary()">
                <app-member-list
                  [members]="members"
                  [selfId]="session.user()?.id ?? ''"
                  [busy]="manage.busy()"
                  (removeRequested)="removeMember($event)"
                  (roleChange)="changeRole($event)"
                />
                <ion-item>
                  <button
                    type="button"
                    class="disclose"
                    [attr.aria-expanded]="adding()"
                    (click)="adding.set(!adding())"
                  >
                    Add member…
                  </button>
                </ion-item>
                @if (adding()) {
                  <app-member-form
                    [members]="members"
                    [users]="manage.users()"
                    [busy]="manage.busy()"
                    (addRequested)="addMember($event)"
                  />
                }
                <ion-note>
                  Viewer sees · operator starts and stops · member edits tasks · owner manages the
                  project.
                </ion-note>
              </app-inset-group>
            } @else {
              <app-callout class="m-5" tone="info">
                Members and access are managed by the project owner.
              </app-callout>
            }
          </div>

          @if (detail.project(); as project) {
            <div class="fx fx-section" [class.hidden]="view() !== 'about'">
              <div class="about" [animate.enter]="rise()">
                <app-inset-group label="Project">
                  @if (canManage()) {
                    <ion-item>
                      <ion-input
                        label="Display name"
                        class="value-input text-end"
                        autocomplete="off"
                        [value]="draftName()"
                        (ionInput)="draftName.set($event.detail.value ?? '')"
                      />
                      @if (draftName() !== project.name) {
                        <ion-button
                          slot="end"
                          fill="clear"
                          [disabled]="manage.busy()"
                          (click)="saveName(project)"
                        >
                          Save
                        </ion-button>
                      }
                    </ion-item>
                  } @else {
                    <ion-item>
                      <ion-label>Display name</ion-label>
                      <ion-note slot="end">{{ project.name }}</ion-note>
                    </ion-item>
                  }

                  <ion-item>
                    <ion-label>
                      <span class="caption">URL prefix</span>
                      <span class="prefix">{{ prefixLabel() }}</span>
                    </ion-label>
                    <ion-button
                      slot="end"
                      fill="clear"
                      aria-label="Copy URL prefix"
                      (click)="copyPrefix()"
                    >
                      <app-symbol
                        slot="icon-only"
                        [name]="
                          prefixCopy.copied() ? 'icon-[light--check] text-ok' : 'icon-[light--copy]'
                        "
                      />
                    </ion-button>
                  </ion-item>

                  @if (credentialOptions(); as options) {
                    <ion-item>
                      <ion-select
                        label="Registry credential"
                        interface="popover"
                        placeholder="None"
                        [value]="project.registryCredentialId ?? ''"
                        [disabled]="manage.busy()"
                        (ionChange)="changeCredential(project, $event)"
                      >
                        @for (option of options; track option.value) {
                          <ion-select-option [value]="option.value">{{
                            option.label
                          }}</ion-select-option>
                        }
                      </ion-select>
                    </ion-item>
                  }

                  <ion-item>
                    <ion-label>Created</ion-label>
                    <ion-note slot="end" class="tabular">{{
                      project.createdAt | date: 'MMM d, y'
                    }}</ion-note>
                  </ion-item>
                </app-inset-group>

                @if (showCode()) {
                  <app-inset-group label="Code" [trailing]="repoCount()">
                    @for (repo of repos(); track repo.full) {
                      <ion-item>
                        <span slot="start" class="tile" aria-hidden="true">
                          <span class="icon-[regular--code]"></span>
                        </span>
                        <ion-label>
                          <span class="repo">{{ repo.name }}</span>
                          <span class="repo repo--owner">{{ repo.owner }}</span>
                        </ion-label>
                      </ion-item>
                    } @empty {
                      <ion-item>
                        <ion-label class="ion-text-wrap muted">{{
                          isAdmin()
                            ? 'No repositories yet. Chat can’t answer about this project until you choose some.'
                            : 'No code connected yet. Chat can’t answer about this project until an administrator adds repositories.'
                        }}</ion-label>
                      </ion-item>
                    }
                    @if (isAdmin()) {
                      <ion-item
                        button
                        [disabled]="!manage.codeSearch()"
                        (click)="chooseRepositories(project)"
                      >
                        <ion-label class="ion-text-wrap">
                          <span class="text-accent">{{
                            project.repositories.length
                              ? 'Choose repositories…'
                              : 'Add repositories…'
                          }}</span>
                          @if (!manage.codeSearch()) {
                            <span class="caption">Code search is not set up on this server</span>
                          }
                        </ion-label>
                      </ion-item>
                    }
                    @if (isAdmin()) {
                      <ion-note>
                        Chat reads the default branch of each one to answer questions about this
                        project. Only administrators can choose them.
                      </ion-note>
                    } @else {
                      <ion-note>
                        Chat reads the default branch of each one to answer questions about this
                        project. An administrator chooses them.
                      </ion-note>
                    }
                  </app-inset-group>
                }

                @if (canManage()) {
                  <app-inset-group label="Task defaults" trailing="Optional" class="defaults">
                    <app-project-defaults-form
                      [defaults]="project.defaults"
                      [busy]="manage.busy()"
                      (submitted)="saveDefaults(project, $event)"
                    />
                    <ion-note>
                      These only prefill the new-task form. Existing tasks never change on their
                      own.
                    </ion-note>
                  </app-inset-group>

                  <app-inset-group label="Danger zone">
                    <ion-item
                      button
                      [detail]="false"
                      [disabled]="manage.busy() || detail.tasks().length > 0"
                      (click)="deleteProject(project)"
                    >
                      <ion-label color="danger">Delete project…</ion-label>
                    </ion-item>
                    <ion-note>{{ deleteFooter() }}</ion-note>
                  </app-inset-group>
                }
              </div>
            </div>
          }
        }
      </div>
    </ion-content>

    <!-- iPad only: pins need the sidebar; phones have the Activity disc. -->
    <ion-popover aria-label="Project actions" [trigger]="moreId()" [dismissOnSelect]="true">
      <ng-template>
        <ion-list>
          <ion-item button [detail]="false" (click)="openActivity()">
            <ion-label>Show activity</ion-label>
          </ion-item>
          <ion-item button [detail]="false" (click)="pins.toggle(slug())">
            <ion-label>{{ pinned() ? 'Unpin from sidebar' : 'Pin to sidebar' }}</ion-label>
          </ion-item>
        </ion-list>
      </ng-template>
    </ion-popover>

    <ng-template #titleBlock>
      <div>
        <h1>{{ displayName() }}</h1>
        <p class="subtitle">
          <span class="slug">/{{ slug() }}</span>
          @if (detail.hasLoaded()) {
            · {{ taskCount() }}
            @if (memberCount()) {
              <span class="desk-only">· {{ memberCount() }}</span>
            }
            @if (lastDeploy(); as deploy) {
              ·
              <a
                class="history"
                routerLink="/notifications"
                routerDirection="root"
                [queryParams]="{ project: slug() }"
                [class.history--failed]="deploy.failed"
                >{{ deploy.label }}</a
              >
            }
          }
        </p>
      </div>
    </ng-template>

    <ng-template #sectionSwitch>
      <!-- Not a div: the global title-row rule stretches its div children. -->
      <span class="seg-wrap">
        <ion-segment [value]="view()" (ionChange)="setView($event.detail.value)">
          <ion-segment-button value="tasks"><ion-label>Tasks</ion-label></ion-segment-button>
          <ion-segment-button value="members"><ion-label>Members</ion-label></ion-segment-button>
          <ion-segment-button value="about"><ion-label>About</ion-label></ion-segment-button>
        </ion-segment>
      </span>
    </ng-template>
  `,
  styles: `
    @media (min-width: 64rem) and (min-height: 31.25rem) {
      .about {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        /* The tall defaults column feeds the last row, so the danger zone sits right under Code. */
        grid-template-rows: auto auto 1fr;
        align-items: start;
      }

      .defaults {
        grid-column: 2;
        grid-row: 1 / span 3;
      }
    }

    /* Ionic's label colour outranks Tailwind's layered utilities. */
    .muted {
      color: var(--app-text-tertiary);
    }

    .tile {
      display: flex;
      align-items: center;
      justify-content: center;
      inline-size: 1.75rem;
      block-size: 1.75rem;
      border-radius: 0.5rem;
      background: var(--app-fill);
      font-size: 0.875rem;
      color: var(--app-text-secondary);
    }

    .repo {
      display: block;
      overflow: hidden;
      font-family: var(--app-font-mono);
      font-size: 0.9375rem;
      line-height: 1.25rem;
      font-weight: 600;
      text-overflow: ellipsis;
    }

    .repo--owner {
      font-size: 0.75rem;
      line-height: 1rem;
      font-weight: 400;
      color: var(--app-text-tertiary);
    }

    .caption {
      display: block;
      font-size: 0.8125rem;
      color: var(--app-text-secondary);
    }

    .prefix {
      display: block;
      overflow: hidden;
      font-family: var(--app-font-mono);
      font-size: 0.875rem;
      color: var(--ion-color-primary);
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .subtitle {
      display: block;
    }

    .history {
      color: var(--ion-color-primary);
      text-decoration: underline;
      text-underline-offset: 0.15em;
    }

    .history--failed {
      color: var(--ion-color-danger);
    }

    .slug {
      font-family: var(--app-font-mono);
      font-size: 0.875rem;
      color: var(--app-text-tertiary);
    }

    .seg-wrap {
      display: flex;
      align-items: center;
      gap: 0.625rem;
    }

    @media (min-width: 80rem) {
      .title-row h1 {
        font-size: 2rem;
        line-height: 2.4375rem;
      }

      .seg-wrap ion-segment {
        inline-size: 18.75rem;
      }
    }
  `,
})
export class ProjectDetailPage {
  protected readonly detail = inject(ViewProjectStore);
  protected readonly commands = inject(ControlTaskStore);
  protected readonly announcer = inject(Announcer);
  private handOff = false;
  protected readonly manage = inject(ManageProjectStore);
  private readonly config = inject(ServerConfigStore);
  private readonly confirmations = inject(ConfirmActionService);
  private readonly notifications = inject(NotifyService);
  private readonly router = inject(Router);
  private readonly navCtrl = inject(NavController);
  private readonly sheets = inject(SheetService);
  private readonly newTaskDialog = inject(NEW_TASK_DIALOG);
  protected readonly wide = wideScreen();
  private readonly fleet = inject(ListProjectsStore);
  private readonly document = inject(DOCUMENT);
  protected readonly session = inject(SessionStore);

  readonly slug = input('');
  /** The `?section=` deep link; switching tabs writes it back. */
  readonly section = input<string>();

  protected readonly pins = inject(PinnedProjectsStore);
  protected readonly pinned = computed(() => this.pins.slugs().includes(this.slug()));
  /* Unique per instance: Ionic keeps several project pages in the DOM. */
  protected readonly moreId = computed(() => 'project-more-' + this.slug());

  private readonly seededName = readSeededName(this.document);

  /* The fleet carries the role and each task's newest deploy before the project loads. */
  private readonly listed = computed(() =>
    this.fleet.summaries().find(({ project }) => project.slug === this.slug()),
  );
  protected readonly builds = computed(
    () =>
      new Map(
        this.listed()?.tasks.flatMap(({ name, build }) => (build ? [[name, build] as const] : [])),
      ),
  );

  protected readonly canManage = computed(() => this.detail.project()?.myRole === 'owner');
  protected readonly isAdmin = inject(IS_ADMIN);
  /* Grantees arrive as viewers with no repositories; the client cannot tell them apart. */
  protected readonly showCode = computed(() => {
    const project = this.detail.project();
    return (
      !!project &&
      (!!this.isAdmin() || project.repositories.length > 0 || project.myRole !== 'viewer')
    );
  });
  protected readonly repos = computed(() =>
    (this.detail.project()?.repositories ?? []).map((full) => ({ full, ...splitRepo(full) })),
  );
  protected readonly repoCount = computed(() => {
    const count = this.repos().length;
    return count === 0 ? '' : `${count} ${count === 1 ? 'repository' : 'repositories'}`;
  });
  protected readonly canAsk = computed(
    () =>
      (this.detail.project()?.repositories ?? this.listed()?.project.repositories ?? []).length > 0,
  );
  /* Unknown shows it: the server still decides. */
  protected readonly canCreate = computed(() => {
    const role = this.detail.project()?.myRole ?? this.listed()?.project.myRole;
    return !role || atLeastRole(role, 'member');
  });
  protected readonly view = linkedSignal<View>(() => {
    const section = this.section();
    return VIEWS.includes(section as View) ? (section as View) : 'tasks';
  });
  protected readonly sections = sectionDir();
  protected readonly rise = rise();
  /* Only Tasks has a header action; Members adds from its list. */
  protected readonly canCreateHere = computed(() => this.canCreate() && this.view() === 'tasks');
  protected readonly draftName = signal('');
  protected readonly condensed = signal(false);
  protected readonly adding = signal(false);
  protected readonly prefixCopy = clipboardCopy(() =>
    this.notifications.failure('The URL prefix could not be copied.'),
  );

  protected readonly pull: PullRefreshSource = {
    busy: this.detail.loading,
    /* The one refresh left when the change stream cannot open. */
    trigger: () => {
      this.reload();
      this.fleet.load();
    },
  };

  protected readonly displayName = computed(
    () => this.detail.project()?.name ?? (this.seededName || this.slug()),
  );

  protected readonly skeletonLabel = computed(() => {
    const view = this.view();
    return view === 'members' ? 'Members' : view === 'about' ? 'About' : 'Tasks';
  });

  protected readonly taskCount = computed(() => plural(this.detail.tasks().length, 'task'));

  protected readonly memberCount = computed(() => {
    const members = this.detail.members();
    return members ? plural(members.length, 'member') : '';
  });

  protected readonly memberSummary = computed(() => {
    const members = this.detail.members();
    if (!members) return '';
    return `${members.length} ${members.length === 1 ? 'person' : 'people'}`;
  });

  protected readonly lastDeploy = computed(() => {
    const listed = this.listed();
    const deploy = listed && newestDeploy(listed.tasks);
    if (!deploy) return null;
    const when = `${age(deploy.at)} ago`;
    return {
      failed: deploy.failed,
      label: deploy.failed ? `last deploy failed ${when}` : `last deploy ${when}`,
    };
  });

  protected readonly prefixLabel = computed(() => `${this.config.host()}/${this.detail.slug()}/`);

  protected readonly deleteFooter = computed(() => {
    const count = this.detail.tasks().length;
    return count > 0
      ? `Delete its ${plural(count, 'task')} first; a project that still owns tasks cannot be deleted.`
      : 'A project that still owns tasks cannot be deleted.';
  });

  protected readonly credentialOptions = computed(() =>
    toCredentialOptions(this.manage.credentials()),
  );

  constructor() {
    /* Pushed task screens create, edit and delete the tasks listed here. */
    onReturn(() => this.reload());

    effect(() => {
      const slug = this.slug();
      if (slug) this.detail.refresh(slug);
    });
    whileOnScreen(this.fleet.changes, () => this.reload());

    effect(() => {
      const project = this.detail.project();
      if (project) this.draftName.set(project.name);
    });

    /* A deep link can open About directly, so the probe follows the view, not the switch. */
    effect(() => {
      if (this.view() === 'about') this.manage.probeCodeSearch();
    });

    /* The last row took its focus with it: the empty state's title takes over. */
    const injector = inject(Injector);
    const host: HTMLElement = inject(ElementRef).nativeElement;
    effect(() => {
      if (this.detail.tasks().length || !this.handOff) return;
      this.handOff = false;
      afterNextRender(
        () => {
          if (this.document.activeElement !== this.document.body) return;
          host.querySelector<HTMLElement>('app-empty-state h2')?.focus();
        },
        { injector },
      );
    });
  }

  protected setView(value: unknown): void {
    if (!VIEWS.includes(value as View)) return;
    this.sections.go(VIEWS.indexOf(this.view()), VIEWS.indexOf(value as View));
    this.view.set(value as View);
    /* Replaced, not pushed: Back leaves the project instead of replaying tab switches. */
    void this.router.navigate([], {
      queryParams: { section: value === 'tasks' ? null : value },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  protected ask(): void {
    void this.navCtrl.navigateForward(['/chats/new'], { queryParams: { project: this.slug() } });
  }

  /* A tab, so the stack resets as it does from the tab bar. */
  protected openActivity(): void {
    void this.navCtrl.navigateRoot(['/notifications'], { queryParams: { project: this.slug() } });
  }

  protected chooseRepositories(project: Project): void {
    this.sheets
      .open(
        RepositoryPicker,
        'Choose repositories',
        { project: project.slug, chosen: project.repositories },
        1,
      )
      .subscribe(() => {
        this.notifications.success('Repositories saved');
        this.reload();
      });
  }

  protected newTask(): void {
    if (!this.wide()) {
      void this.navCtrl.navigateForward(['/projects', this.slug(), 'tasks', 'new']);
      return;
    }
    from(this.newTaskDialog())
      .pipe(
        switchMap((page) =>
          this.sheets.open(page, 'New task', { dialog: true, slug: this.slug() }),
        ),
      )
      .subscribe();
  }

  protected reload(): void {
    if (this.slug()) this.detail.refresh(this.slug());
  }

  protected openTask(task: Task): void {
    void this.router.navigate(['/projects', this.detail.slug(), 'tasks', task.name]);
  }

  protected copyPrefix(): void {
    this.prefixCopy.copy(`${this.config.baseUrl()}/${this.detail.slug()}/`);
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
            'The container, its variables and its proxy route are removed. This can’t be undone.',
          confirmLabel: 'Delete task',
          destructive: true,
        })
        .pipe(
          filter(Boolean),
          switchMap(() => this.commands.delete(slug, task)),
        )
        .subscribe((result) => {
          this.handOff = result.success && this.detail.tasks().length <= 1;
          this.completeCommand(result);
        });
      return;
    }

    this.commands
      .changeState(slug, task, action)
      .subscribe((result) => this.completeCommand(result));
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

  /* The select flips itself on pick; a refused update has to flip it back. */
  protected changeCredential(project: Project, event: SelectCustomEvent<string>): void {
    const current = project.registryCredentialId ?? '';
    const value = event.detail.value;
    if (value === current) return;

    this.manage
      .update(project.slug, { registryCredentialId: value || null })
      .subscribe((result) => {
        if (!result.success) event.target.value = current;
        this.completeCommand(result);
      });
  }

  protected addMember(input: AddMemberInput): void {
    this.manage
      .addMember(this.detail.slug(), input)
      .subscribe((result) => this.completeCommand(result));
  }

  protected changeRole({ member, event }: MemberRoleChange): void {
    this.manage
      .addMember(
        this.detail.slug(),
        { userId: member.userId, role: event.detail.value },
        'Role updated.',
      )
      .subscribe((result) => {
        /* The select flipped itself on pick; a refused change has to flip it back. */
        if (!result.success) event.target.value = member.role;
        this.completeCommand(result);
      });
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
        this.notifications.result(result);
        if (result.success) void this.navCtrl.navigateBack(['/projects']);
      });
  }

  private completeCommand(result: CommandResult): void {
    this.notifications.result(result);

    if (result.success) this.reload();
  }
}

function plural(count: number, noun: string): string {
  return `${count} ${count === 1 ? noun : `${noun}s`}`;
}

/* Seeded by the pushing row so the title never waits; deep links fall back to the slug. */
function readSeededName(document: Document): string {
  const state: unknown = document.defaultView?.history.state;

  if (state && typeof state === 'object' && 'projectName' in state) {
    const name = (state as Record<string, unknown>)['projectName'];
    return typeof name === 'string' ? name : '';
  }

  return '';
}
