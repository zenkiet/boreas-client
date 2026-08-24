import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TUI_BREAKPOINT, TuiButton, TuiIcon } from '@taiga-ui/core';

import { Project } from '@entities/project';
import { SessionStore } from '@features/auth';
import { ListProjectsStore, ProjectList } from '@features/list-projects';
import { LiveMonitor, StatTiles } from '@features/track-stats';
import { Reveal } from '@shared/lib/motion/reveal.directive';
import { registerPullRefresh } from '@shared/lib/pull-to-refresh/pull-to-refresh';
import { Callout } from '@shared/ui/callout/callout';
import { EmptyState } from '@shared/ui/empty-state/empty-state';
import { ErrorState } from '@shared/ui/error-state/error-state';
import { GlassIconButton } from '@shared/ui/glass-icon-button/glass-icon-button';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';
import { SkeletonRows } from '@shared/ui/skeleton-rows/skeleton-rows';

@Component({
  selector: 'app-projects-page',
  imports: [
    Callout,
    EmptyState,
    ErrorState,
    GlassIconButton,
    InsetGroup,
    ProjectList,
    Reveal,
    RouterLink,
    SkeletonRows,
    StatTiles,
    LiveMonitor,
    TuiButton,
    TuiIcon,
  ],
  template: `
    <div appReveal class="mx-auto grid w-full max-w-160 grid-cols-1 gap-4">
      <header class="flex items-center justify-between gap-3">
        <h1 class="page-title">Projects</h1>
        <!-- POST /projects is admin-only; a visible button would just collect 403s. -->
        @if (session.isAdmin()) {
          @if (mobile()) {
            <a
              appGlassIconButton
              icon="@tui.plus"
              routerLink="/projects/new"
              aria-label="New project"
            ></a>
          } @else {
            <a tuiButton routerLink="/projects/new" size="s" appearance="primary">
              <tui-icon class="icon-sm" icon="@tui.plus" />
              New project
            </a>
          }
        }
      </header>

      @if (overview.loading() && !overview.hasLoaded()) {
        <!-- The real layout, redacted: chrome and known labels stay, only values wait. -->
        <div class="grid grid-cols-1 gap-4">
          <div class="sk-trend skeleton-defer" aria-hidden="true">
            <div class="flex items-center justify-between gap-4">
              <span class="sk-label">Running tasks</span>
              <span class="skeleton skeleton--num"></span>
            </div>
            <span class="skeleton skeleton--chart"></span>
          </div>

          <div class="sk-tiles skeleton-defer" aria-hidden="true">
            @for (label of tileLabels; track label) {
              <div class="sk-tile">
                <span class="sk-tile__label">{{ label }}</span>
                <span class="skeleton skeleton--num"></span>
              </div>
            }
          </div>

          <app-inset-group label="Projects">
            <app-skeleton-rows variant="project" label="Loading projects" />
          </app-inset-group>
        </div>
      } @else if (overview.error() && !overview.hasLoaded()) {
        <app-error-state [message]="overview.error()!" (retry)="overview.load()" />
      } @else {
        <div class="grid grid-cols-1 gap-4">
          @if (overview.stats(); as stats) {
            <app-live-monitor [projects]="slugs()" [hostMemoryMb]="stats.totalMemoryMb" />
            <app-stat-tiles [stats]="stats" />
          }

          @if (overview.error()) {
            <app-callout tone="negative" role="alert">
              {{ overview.error() }} Existing data is still shown.
            </app-callout>
          }

          <app-inset-group label="Projects" [trailing]="summary()">
            @if (overview.summaries().length === 0) {
              <app-empty-state
                title="No projects yet"
                [description]="
                  session.isAdmin()
                    ? 'A project groups related task environments under one URL prefix and one team.'
                    : 'An administrator has to create a project or grant you access to one.'
                "
                [bordered]="false"
              />
            } @else {
              <app-project-list
                [summaries]="overview.summaries()"
                (projectOpened)="openProject($event)"
              />
            }

            @if (session.isAdmin()) {
              <a class="add-row row-divider relative" routerLink="/projects/new">
                <tui-icon class="icon-sm" icon="@tui.plus" />
                New project
              </a>
            }
          </app-inset-group>
        </div>
      }
    </div>
  `,
  styles: `
    /* Mirrors the trend card and stat tiles so content lands without layout shift. */
    .sk-trend {
      display: grid;
      gap: 0.625rem;
      border-radius: var(--tui-radius-l);
      background: var(--tui-background-base);
      padding: 0.875rem 1rem 0.75rem;
    }

    .sk-label {
      font-size: 0.8125rem;
      color: var(--tui-text-secondary);
    }

    .sk-tiles {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0.5rem;
    }

    .sk-tile {
      display: flex;
      flex-direction: column;
      gap: 0.4375rem;
      border-radius: var(--tui-radius-l);
      background: var(--tui-background-base);
      padding: 0.75rem 1rem;
    }

    .sk-tile__label {
      font-size: 0.8125rem;
      color: var(--tui-text-secondary);
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
  `,
})
export class ProjectsPage {
  protected readonly session = inject(SessionStore);
  protected readonly overview = inject(ListProjectsStore);
  private readonly router = inject(Router);
  private readonly breakpoint = inject(TUI_BREAKPOINT);

  protected readonly mobile = computed(() => this.breakpoint() === 'mobile');

  /* Must match StatTiles so the redacted grid swaps in place. */
  protected readonly tileLabels = ['Projects', 'Stopped', 'Host memory'] as const;

  protected readonly slugs = computed(() =>
    this.overview.summaries().map((summary) => summary.project.slug),
  );

  protected readonly summary = computed(() => {
    const total = this.overview.summaries().length;
    return `${total} ${total === 1 ? 'project' : 'projects'}`;
  });

  constructor() {
    this.overview.ensureFresh();
    registerPullRefresh({ busy: this.overview.loading, trigger: () => this.overview.load() });
  }

  protected openProject(project: Project): void {
    /* The detail page seeds its title from this so the push shows a real name at once. */
    void this.router.navigate(['/projects', project.slug], {
      state: { projectName: project.name },
    });
  }
}
