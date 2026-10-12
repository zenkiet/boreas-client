import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonList } from '@ionic/angular/ion-list';
import { IonPopover } from '@ionic/angular/ion-popover';

import { BoraAbout, defaultQuestion } from '@entities/bora';
import type { Notification } from '@entities/notification';
import { DEV_STATUS_LABEL, isDown } from '@entities/task/model';
import { BoraStore } from '@features/bora/model';
import { ListAlertsStore } from '@features/list-alerts/model';
import { ListProjectsStore, type ProjectSummary } from '@features/list-projects/model';
import type { ApiError } from '@shared/api/api-error';
import { atLeastRole } from '@shared/api/role';
import { age } from '@shared/lib/format/age';

interface Chip {
  readonly name: string;
  readonly sub: string;
  readonly mono: boolean;
  readonly link: readonly string[] | null;
  readonly section?: string;
}

const FAILED: Record<string, string> = {
  deploy_failed: 'Deploy failed',
  build_failed: 'Build failed',
};

const plural = (count: number, noun: string) => `${count} ${count === 1 ? noun : `${noun}s`}`;

const PROBLEM: Partial<Record<ApiError['kind'], string>> = {
  network: 'Can’t reach the server. Bora answers again once Boreas is back.',
  forbidden:
    'You reach this project through a task grant, so Bora can’t answer about it. A project owner can add you as a member.',
  conflict: 'This server has no assistant any more.',
  'not-found': 'What you asked about is gone.',
  'rate-limited': 'Bora is answering other questions. Try again in a moment.',
};

/* Ionic keeps the sheet's and the panel's chips apart by id. */
let chips = 0;

/* Apple's suggested ceiling for a recognizer's contextual strings. */
const HINTS = 100;
const TIME = new Intl.DateTimeFormat('en', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

/** Recognizer hints: task names said in English inside Vietnamese. */
export function taskHints(
  about: BoraAbout | undefined,
  projects: readonly ProjectSummary[],
): string[] {
  const slug = about && 'project' in about ? about.project : undefined;
  return projects
    .filter(({ project }) => !slug || project.slug === slug)
    .flatMap(({ tasks }) => tasks.map(({ name }) => name))
    .slice(0, HINTS);
}

function subjectName(
  about: BoraAbout,
  projects: readonly ProjectSummary[],
  alerts: readonly Notification[],
): string {
  switch (about.kind) {
    case 'fleet':
      return 'Every project';
    case 'project':
      return (
        projects.find(({ project }) => project.slug === about.project)?.project.name ??
        about.project
      );
    case 'alert':
      return alerts.find(({ id }) => id === about.id)?.taskName || about.project;
    case 'log': {
      const at = new Date(about.at);
      return Number.isNaN(at.getTime()) ? about.task : `${about.task} · ${TIME.format(at)}`;
    }
    default:
      return about.task;
  }
}

export const failedRun = ({ taskName, kind }: Notification): string =>
  `${taskName}’s ${kind === 'build_failed' ? 'build' : 'deploy'}`;

export function freshFailure(
  unseen: readonly Notification[],
  projects: readonly ProjectSummary[],
): Notification | undefined {
  return unseen.find((alert) => {
    const summary = projects.find(({ project }) => project.slug === alert.project);
    const task = summary?.tasks.find(({ name }) => name === alert.taskName);
    return (
      !!summary?.project.bora && atLeastRole(task?.myRole ?? summary.project.myRole, 'operator')
    );
  });
}

export interface Suggestion {
  readonly question: string;
  readonly about: BoraAbout;
}

export function suggestions(
  about: BoraAbout,
  projects: readonly ProjectSummary[],
  failure: Notification | undefined,
): Suggestion[] {
  const here =
    about.kind === 'fleet' ||
    (about.kind === 'project' && failure?.project === about.project) ||
    (about.kind === 'task' &&
      failure?.project === about.project &&
      failure.taskName === about.task);
  const first: Suggestion[] =
    failure && here
      ? [
          {
            question: `Why did ${failedRun(failure)} fail?`,
            about: { kind: 'alert', id: failure.id, project: failure.project },
          },
        ]
      : [];
  return [...first, ...questions(about, projects).map((question) => ({ question, about }))].slice(
    0,
    3,
  );
}

export const problemText = (problem: ApiError): string =>
  PROBLEM[problem.kind] ?? 'Couldn’t get an answer. Try again.';

export function subjectLinks(
  about: BoraAbout,
  alerts: readonly Notification[],
  projects: readonly ProjectSummary[],
): { readonly task: readonly string[]; readonly build?: string } | null {
  if (about.kind === 'fleet' || about.kind === 'project' || about.kind === 'log') return null;
  const alert = about.kind === 'alert' ? alerts.find(({ id }) => id === about.id) : undefined;
  const task = alert ? alert.taskName : 'task' in about ? about.task : '';
  const build =
    about.kind === 'build' || alert?.kind === 'build_failed'
      ? projects
          .find(({ project }) => project.slug === about.project)
          ?.tasks.find(({ name }) => name === task)?.build?.url
      : undefined;
  return task ? { task: ['/projects', about.project, 'tasks', task], build } : null;
}

/* What Bora's sky shows, in words: colour is never the only sign. */
function health(projects: readonly ProjectSummary[], unseen: number, live: boolean): string {
  if (!live) return 'Offline';
  const down = projects.flatMap(({ tasks }) => tasks).filter(isDown).length;
  const state = unseen ? `${unseen} failed, not seen yet` : down ? `${down} down` : 'all running';
  return `${plural(projects.length, 'project')} · ${state}`;
}

function questions(about: BoraAbout, projects: readonly ProjectSummary[]): string[] {
  switch (about.kind) {
    case 'fleet':
      return ['What needs my attention?', 'Is anything down?', 'What failed today?'];
    case 'project':
      return ['How is this project doing?', 'Which tasks need attention?', 'What changed today?'];
    case 'task': {
      const task = projects
        .find(({ project }) => project.slug === about.project)
        ?.tasks.find(({ name }) => name === about.task);
      const down = !!task && isDown(task);
      return [
        down ? `Why isn’t ${about.task} running?` : 'How is this task doing?',
        'Explain the latest errors in its logs',
        // What the role forbids is never offered; the server checks again.
        task && atLeastRole(task.myRole, 'operator')
          ? `${down ? 'Start' : 'Restart'} ${about.task}`
          : 'What changed recently?',
      ];
    }
    default:
      return [defaultQuestion(about)];
  }
}

@Component({
  selector: 'app-bora-chip',
  imports: [IonItem, IonLabel, IonList, IonPopover, NgTemplateOutlet, RouterLink],
  template: `
    @let c = chip();
    <h2 class="sr-only" tabindex="-1">Bora, about {{ c.name }}</h2>
    @if (scopes().length) {
      <button
        type="button"
        class="chip"
        aria-haspopup="menu"
        [id]="menuId"
        [disabled]="bora.busy()"
      >
        <ng-container *ngTemplateOutlet="body" />
        <span class="icon-[regular--angle-down] caret" aria-hidden="true"></span>
      </button>
      <ion-popover aria-label="Ask about" [trigger]="menuId" [dismissOnSelect]="true">
        <ng-template>
          <ion-list>
            @for (scope of scopes(); track scope.label) {
              <ion-item button [detail]="false" (click)="bora.show(scope.about)">
                <ion-label>
                  {{ scope.label }}
                  @if (scope.current) {
                    <span class="sr-only">, current</span>
                  }
                </ion-label>
                @if (scope.current) {
                  <span
                    slot="end"
                    class="icon-[regular--check] text-accent"
                    aria-hidden="true"
                  ></span>
                }
              </ion-item>
            }
            @if (c.link) {
              <ion-item button [detail]="false" (click)="go(c)">
                <ion-label>Open {{ c.name }}</ion-label>
              </ion-item>
            }
          </ion-list>
        </ng-template>
      </ion-popover>
    } @else if (c.link) {
      <a
        class="chip"
        [routerLink]="c.link"
        [queryParams]="c.section ? { section: c.section } : null"
        (click)="opened.emit()"
      >
        <ng-container *ngTemplateOutlet="body" />
      </a>
    } @else {
      <span class="chip">
        <ng-container *ngTemplateOutlet="body" />
      </span>
    }
    <ng-template #body>
      <span class="text">
        <b class="name" [class.mono]="c.mono">{{ c.name }}</b>
        <small class="sub">{{ c.sub }}</small>
      </span>
    </ng-template>
  `,
  styles: `
    :host {
      display: block;
      min-inline-size: 0;
    }

    .chip {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      min-block-size: 2.75rem;
      max-inline-size: 100%;
      padding: 0.25rem 0.875rem;
      border-radius: 1.375rem;
      background: var(--app-fill);
      color: var(--app-text-primary);
      text-decoration: none;
    }

    button.chip {
      inline-size: 100%;
      border: 0;
      font: inherit;
      text-align: start;
      cursor: pointer;
    }

    button.chip:disabled {
      cursor: default;
    }

    .caret {
      flex: none;
      margin-inline-start: auto;
      font-size: 0.875rem;
      color: var(--app-text-tertiary);
    }

    .text {
      display: flex;
      flex-direction: column;
      min-inline-size: 0;
    }

    .name,
    .sub {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .name {
      font-size: 0.9375rem;
      line-height: 1.25rem;
      font-weight: 600;
    }

    .mono {
      font-family: var(--app-font-mono);
    }

    .sub {
      font-size: 0.8125rem;
      line-height: 1.125rem;
      color: var(--app-text-secondary);
    }
  `,
})
export class BoraChip {
  protected readonly bora = inject(BoraStore);
  private readonly router = inject(Router);
  private readonly fleet = inject(ListProjectsStore);
  private readonly alerts = inject(ListAlertsStore);

  readonly opened = output();

  protected readonly menuId = `bora-scope-${chips++}`;

  protected readonly scopes = computed(() => {
    const about: BoraAbout = this.bora.conversation()?.about ?? { kind: 'fleet' };
    if (about.kind === 'fleet') return [];
    const project = about.project;
    const task =
      about.kind === 'alert'
        ? this.alerts.alerts().find(({ id }) => id === about.id)?.taskName
        : 'task' in about
          ? about.task
          : undefined;
    const name =
      this.fleet.summaries().find((summary) => summary.project.slug === project)?.project.name ??
      project;
    const options: { label: string; about: BoraAbout }[] = [
      ...(task ? [{ label: task, about: { kind: 'task', project, task } as const }] : []),
      { label: name, about: { kind: 'project', project } },
      { label: 'Every project', about: { kind: 'fleet' } },
    ];
    return options.map((option) => ({
      ...option,
      current: JSON.stringify(option.about) === JSON.stringify(about),
    }));
  });

  protected readonly chip = computed<Chip>(() => {
    const about: BoraAbout = this.bora.conversation()?.about ?? { kind: 'fleet' };
    const projects = this.fleet.summaries();
    const name = subjectName(about, projects, this.alerts.alerts());
    const project =
      'project' in about ? projects.find((p) => p.project.slug === about.project) : undefined;
    const projectName = project?.project.name ?? ('project' in about ? about.project : '');
    const taskName = 'task' in about ? about.task : '';
    const task = project?.tasks.find((t) => t.name === taskName);
    const taskLink = ['/projects', 'project' in about ? about.project : '', 'tasks', taskName];
    switch (about.kind) {
      case 'fleet':
        return {
          name,
          sub: health(projects, this.alerts.unseenFailures().length, this.fleet.live()),
          mono: false,
          link: null,
        };
      case 'project':
        return {
          name,
          sub: plural(project?.tasks.length ?? 0, 'task'),
          mono: false,
          link: ['/projects', about.project],
        };
      case 'task':
        return {
          name,
          sub: `${projectName} · ${
            task && task.status !== 'running'
              ? task.status
              : task
                ? DEV_STATUS_LABEL[task.devStatus]
                : 'task'
          }`,
          mono: true,
          link: taskLink,
        };
      case 'alert': {
        const alert = this.alerts.alerts().find(({ id }) => id === about.id);
        return {
          name,
          sub: alert
            ? `${FAILED[alert.kind] ?? 'Activity'} · ${age(alert.createdAt)} ago`
            : projectName,
          mono: true,
          link: alert ? ['/projects', alert.project, 'tasks', alert.taskName] : null,
        };
      }
      case 'build':
        return {
          name,
          sub: `Build failed${task?.build?.stage ? ` at ${task.build.stage}` : ''}`,
          mono: true,
          link: taskLink,
        };
      case 'log':
        return {
          name,
          sub: 'Log line',
          mono: true,
          link: taskLink,
          section: 'logs',
        };
    }
  });

  protected go({ link, section }: Chip): void {
    if (!link) return;
    void this.router.navigate(link, { queryParams: section ? { section } : undefined });
    this.opened.emit();
  }
}
