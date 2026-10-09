import { Component, computed, input, output } from '@angular/core';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';

import type { ProjectLoad } from '@entities/system-stats';
import {
  DEV_STATUSES,
  DEV_STATUS_LABEL,
  DeployOutcome,
  DevStatus,
  TaskSummary,
  countByDevStatus,
  isBuilding,
  newestDeploy,
} from '@entities/task';
import { age } from '@shared/lib/format/age';
import { toByteSize } from '@shared/lib/format/bytes';
import { bounce } from '@shared/ui/motion/effects';
import { NumericText } from '@shared/ui/motion/numeric-text';
import { rise } from '@shared/ui/motion/page-motion';
import { ProjectSummary } from '../../model/list-projects.store';

const NO_LOADS: ReadonlyMap<string, ProjectLoad> = new Map();

/** Switches on its own width (container query), so iPad portrait keeps the stacked rows. */
@Component({
  selector: 'app-project-list',
  imports: [IonItem, IonLabel, NumericText],
  template: `
    @if (summary() && tasks().length > 0) {
      <ion-item class="summary" [animate.enter]="rise()">
        <div class="flex w-full flex-col gap-2.5 py-4">
          <span class="bar" aria-hidden="true">
            @for (part of fleet(); track part.status) {
              <i [attr.data-dev]="part.status" [style.width.%]="part.share"></i>
            }
          </span>
          <span class="legend flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-label-2">
            @for (part of fleet(); track part.status) {
              <span class="flex items-center gap-1.5">
                <i class="size-2 rounded-full" [attr.data-dev]="part.status" aria-hidden="true"></i>
                <span class="tabular">{{ part.count }} {{ part.label }}</span>
              </span>
            }
            @if (containers()) {
              <span class="containers ms-auto text-label-3 tabular">{{ containers() }}</span>
            }
          </span>
        </div>
      </ion-item>
    }

    <ion-item class="head" [detail]="true" aria-hidden="true">
      <ion-label class="cells">
        <span>Project</span>
        <span>Slug</span>
        <span class="count">Tasks</span>
        <span>Status</span>
        <span class="load text-end">CPU</span>
        <span class="load text-end">Memory</span>
        <span class="text-end">Last deploy</span>
      </ion-label>
    </ion-item>

    @for (row of rows(); track row.project.id) {
      <ion-item button [animate.enter]="rise()" (click)="projectOpened.emit(row.project)">
        <ion-label class="cells">
          <!-- Outside the truncated name, so a long name never hides it. -->
          <span class="name">
            <span class="truncate">{{ row.project.name }}</span>
            <!-- Kept, not @if: the first failure has to roll and bounce too. -->
            <span #fail class="failing" [hidden]="!row.failing"
              ><app-numeric-text [value]="row.failing" (rose)="bounce(fail)" />
              {{ row.failing === 1 ? 'build' : 'builds' }} failed</span
            >
          </span>
          <!-- No slug on phones: it pushed the running count off the line. -->
          <span class="sub truncate">
            <span class="slug truncate font-mono">/{{ row.project.slug }}</span>
            <span class="meta">
              @if (row.meta.running !== null) {
                <app-numeric-text [value]="row.meta.running" />
              }
              {{ row.meta.text }}</span
            >
          </span>
          <span class="count tabular"
            >{{ row.tasks }}<span class="sr-only"> {{ row.noun }}</span></span
          >
          <span class="bar-cell">
            <!-- Counts, not only colours: colour alone fails colour-blind readers. -->
            <span class="dots" role="img" [attr.aria-label]="row.status" [attr.title]="row.status">
              @for (part of row.parts; track part.status) {
                <span class="dots__part tabular"
                  ><i [attr.data-dev]="part.status"></i>{{ part.count }}</span
                >
              } @empty {
                <i class="none"></i>
              }
            </span>
          </span>
          @let load = loads().get(row.project.slug);
          <span class="load tabular"><span class="sr-only">CPU </span>{{ cpu(load) }}</span>
          <span class="load tabular"><span class="sr-only">Memory </span>{{ memory(load) }}</span>
          <span class="deploy tabular" [class.text-danger]="row.deploy?.failed">
            <span class="sr-only">Last deploy </span>{{ row.deployed }}
          </span>
        </ion-label>
      </ion-item>
    }
  `,
  styles: `
    :host {
      display: block;
      container-type: inline-size;
    }

    .bar {
      display: flex;
      inline-size: 100%;
      block-size: 0.5rem;
      border-radius: 4px;
      overflow: hidden;
      background: var(--color-fill);
    }

    .bar i {
      display: block;
    }

    .dots {
      display: flex;
      flex: none;
      align-items: center;
      gap: 0.625rem;
    }

    .dots__part {
      display: inline-flex;
      align-items: center;
      gap: 0.3125rem;
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--color-label-2);
    }

    .dots i {
      inline-size: 0.5rem;
      block-size: 0.5rem;
      border-radius: 999px;
    }

    /* A project without tasks keeps an empty slot, so its status cell never reads as broken. */
    .dots .none {
      box-shadow: inset 0 0 0 1px var(--color-label-3);
    }

    [data-dev='blocked'] {
      background: var(--color-blocked);
    }

    [data-dev='in_progress'] {
      background: var(--color-progress);
    }

    [data-dev='ready'] {
      background: var(--color-ready);
    }

    /* Under the row, so grid outweighs Ionic's own label display instead of tying with it. */
    ion-item .cells {
      display: grid;
    }

    .cells {
      grid-template-columns: minmax(0, 1fr) auto;
      grid-template-areas: 'name bar' 'sub bar';
      align-items: center;
      column-gap: 0.75rem;
      row-gap: 0.1875rem;
      text-align: start;
    }

    .name {
      display: flex;
      align-items: baseline;
      grid-area: name;
      min-inline-size: 0;
      font-size: 1rem;
      line-height: 1.3125rem;
      font-weight: 500;
    }

    .name > .truncate {
      min-inline-size: 0;
    }

    .sub {
      grid-area: sub;
      font-size: 0.875rem;
      line-height: 1.1875rem;
      color: var(--color-label-3);
    }

    .slug {
      display: none;
      font-size: 0.8125rem;
    }

    .bar-cell {
      display: flex;
      grid-area: bar;
    }

    .failing {
      flex: none;
      margin-inline-start: 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--color-danger);
    }

    .head,
    .count,
    .load,
    .deploy,
    .containers {
      display: none;
    }

    .head {
      --row-min-height: 2.375rem;
    }

    .head .cells {
      margin-block: 0;
    }

    .head::part(detail-icon) {
      visibility: hidden;
    }

    /* On the spans: the theme sizes ion-label itself past anything a component rule outranks. */
    .head .cells > span {
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      color: var(--color-label-3);
    }

    @container (min-width: 44rem) {
      .head {
        display: revert;
      }

      .cells,
      .head .cells {
        grid-template-columns: minmax(0, 1fr) 10.625rem 4.375rem 5.625rem 7.5rem;
        grid-template-areas: none;
      }

      ion-item[button] {
        --row-min-height: 3.375rem;
      }

      .name,
      .sub,
      .bar-cell {
        grid-area: auto;
      }

      .sub {
        display: contents;
      }

      .slug {
        display: block;
        color: var(--color-label-3);
      }

      .meta {
        display: none;
      }

      .count,
      .deploy {
        display: revert;
        font-size: 0.875rem;
        color: var(--color-label-2);
      }

      /* Numbers align on their last digit; the gap keeps "3" apart from the status counts. */
      .count {
        text-align: end;
      }

      .bar-cell,
      .head .cells > .count + span {
        padding-inline-start: 0.75rem;
      }

      .deploy {
        text-align: end;
      }

      .deploy.text-danger {
        color: var(--color-danger);
      }
    }

    @container (min-width: 56rem) {
      .cells,
      .head .cells {
        grid-template-columns: minmax(0, 1fr) 11rem 4.5rem 6.875rem 4.5rem 5.5rem 8.5rem;
      }

      .load {
        display: revert;
        font-size: 0.875rem;
        color: var(--color-label-2);
        text-align: end;
      }

      ion-item[button] {
        --row-min-height: 3.125rem;
      }

      .name {
        font-size: 0.9375rem;
      }

      .legend {
        column-gap: 1.125rem;
      }

      .containers {
        display: revert;
      }
    }
  `,
})
export class ProjectList {
  readonly summaries = input.required<readonly ProjectSummary[]>();
  /** Keyed by project slug. */
  readonly loads = input(NO_LOADS);
  /** Off on iPad, where the group header carries the counts. */
  readonly summary = input(true);
  readonly projectOpened = output<ProjectSummary['project']>();

  protected readonly rise = rise();
  protected readonly bounce = bounce;

  protected readonly tasks = computed(() => this.summaries().flatMap(({ tasks }) => tasks));

  protected readonly fleet = computed(() => parts(this.tasks()));

  protected readonly containers = computed(() => {
    const tasks = this.tasks();
    return (['running', 'stopped', 'error'] as const)
      .map((status) => ({ status, count: tasks.filter((task) => task.status === status).length }))
      .filter(({ count }) => count > 0)
      .map(({ status, count }) => `${count} ${status}`)
      .join(' · ');
  });

  protected readonly rows = computed(() =>
    this.summaries().map(({ project, tasks }) => {
      const deploy = newestDeploy(tasks);
      const counted = parts(tasks).filter(({ count }) => count > 0);
      return {
        project,
        tasks: tasks.length,
        noun: tasks.length === 1 ? 'task' : 'tasks',
        parts: counted,
        failing: failingBuilds(tasks),
        status:
          counted.length > 0 ? counted.map((p) => `${p.count} ${p.label}`).join(', ') : 'No tasks',
        meta: meta(tasks, deploy),
        deploy,
        deployed: deploy ? `${deploy.failed ? 'Failed ' : ''}${age(deploy.at)} ago` : '—',
      };
    }),
  );

  protected cpu(load: ProjectLoad | undefined): string {
    return load ? `${load.cpu.toFixed(1)}%` : '—';
  }

  protected memory(load: ProjectLoad | undefined): string {
    if (!load) return '—';
    const { value, unit } = toByteSize(load.mem);
    return `${value} ${unit}`;
  }
}

function parts(tasks: readonly TaskSummary[]) {
  const counts = countByDevStatus(tasks);
  return DEV_STATUSES.map((status: DevStatus) => ({
    status,
    count: counts[status],
    label: DEV_STATUS_LABEL[status].toLowerCase(),
    share: tasks.length > 0 ? (counts[status] / tasks.length) * 100 : 0,
  }));
}

/* Counts every container not running, unknown ones included. */
function meta(
  tasks: readonly TaskSummary[],
  deploy: DeployOutcome | undefined,
): { running: number | null; text: string } {
  const running = tasks.filter((task) => task.status === 'running').length;
  const partial = tasks.length > 1 && running < tasks.length;
  const count =
    tasks.length === 0
      ? 'No tasks'
      : running === tasks.length
        ? `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'}`
        : partial
          ? `of ${tasks.length} running`
          : 'not running';
  const errors = tasks.filter((task) => task.status === 'error').length;
  const building = tasks.filter((task) => isBuilding(task.build)).length;
  /* A failing build has its own red badge beside the name. */
  const fact = deploy?.failed
    ? `deploy failed ${age(deploy.at)} ago`
    : errors > 0
      ? `${errors} ${errors === 1 ? 'error' : 'errors'}`
      : building > 0
        ? `${building} building`
        : deploy
          ? `deployed ${age(deploy.at)} ago`
          : '';
  return { running: partial ? running : null, text: fact ? `${count} · ${fact}` : count };
}

function failingBuilds(tasks: readonly TaskSummary[]): number {
  return tasks.filter((task) => task.build?.state === 'failure').length;
}
