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
  newestDeploy,
} from '@entities/task';
import { age } from '@shared/lib/format/age';
import { toByteSize } from '@shared/lib/format/bytes';
import { ProjectSummary } from '../../model/list-projects.store';

const NO_LOADS: ReadonlyMap<string, ProjectLoad> = new Map();
/* Past five tasks a row says "+n": a dot per task would outgrow the status column. */
const MAX_DOTS = 5;

/** Switches on its own width (container query), so iPad portrait keeps the stacked rows. */
@Component({
  selector: 'app-project-list',
  imports: [IonItem, IonLabel],
  template: `
    @if (summary() && tasks().length > 0) {
      <ion-item class="summary">
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
        <span>Tasks</span>
        <span>Status</span>
        <span class="load text-end">CPU</span>
        <span class="load text-end">Memory</span>
        <span class="text-end">Last deploy</span>
      </ion-label>
    </ion-item>

    @for (row of rows(); track row.project.id) {
      <ion-item button (click)="projectOpened.emit(row.project)">
        <ion-label class="cells">
          <span class="name truncate">{{ row.project.name }}</span>
          <span class="sub truncate">
            <span class="slug truncate font-mono">/{{ row.project.slug }}</span>
            <span class="meta"> · {{ row.meta }}</span>
          </span>
          <span class="count tabular"
            >{{ row.tasks }}<span class="sr-only"> {{ row.noun }}</span></span
          >
          <span class="bar-cell">
            <span class="dots" role="img" [attr.aria-label]="row.status">
              @for (dot of row.dots; track $index) {
                <i [attr.data-dev]="dot"></i>
              } @empty {
                <i class="none"></i>
              }
              @if (row.more) {
                <span class="dots__more tabular">+{{ row.more }}</span>
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
      gap: 0.1875rem;
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

    .dots__more {
      margin-inline-start: 0.25rem;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--color-label-3);
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
      grid-area: name;
      font-size: 1rem;
      line-height: 1.3125rem;
      font-weight: 500;
    }

    .sub {
      grid-area: sub;
      font-size: 0.875rem;
      line-height: 1.1875rem;
      color: var(--color-label-3);
    }

    .slug {
      font-size: 0.8125rem;
    }

    .bar-cell {
      display: flex;
      grid-area: bar;
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
        dots: counted
          .flatMap(({ status, count }) => Array<DevStatus>(count).fill(status))
          .slice(0, MAX_DOTS),
        more: Math.max(0, tasks.length - MAX_DOTS),
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

function meta(tasks: readonly TaskSummary[], deploy: DeployOutcome | undefined): string {
  const count =
    tasks.length === 0 ? 'No tasks' : `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'}`;
  const errors = tasks.filter((task) => task.status === 'error').length;
  const stopped = tasks.filter((task) => task.status === 'stopped').length;
  const fact = deploy?.failed
    ? `deploy failed ${age(deploy.at)} ago`
    : errors > 0
      ? `${errors} ${errors === 1 ? 'error' : 'errors'}`
      : stopped > 0
        ? `${stopped} stopped`
        : deploy
          ? `deployed ${age(deploy.at)} ago`
          : '';
  return fact ? `${count} · ${fact}` : count;
}
