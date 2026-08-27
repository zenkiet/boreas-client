import { Injectable, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, of } from 'rxjs';

import { Member, Project, ProjectApi } from '@entities/project';
import { Task, TaskApi } from '@entities/task';
import { keepLastValue, resourceError } from '@shared/api/resource-cache';

interface ProjectSnapshot {
  readonly project: Project;
  readonly tasks: readonly Task[];
  /* null when the caller may not list members; the page hides that section. */
  readonly members: readonly Member[] | null;
}

@Injectable()
export class ViewProjectStore {
  private readonly projectApi = inject(ProjectApi);
  private readonly taskApi = inject(TaskApi);
  private readonly slugState = signal('');

  private readonly snapshot = rxResource({
    params: () => this.slugState() || undefined,
    stream: ({ params }) =>
      forkJoin({
        project: this.projectApi.get(params),
        tasks: this.taskApi.list(params),
        members: this.projectApi
          .members(params)
          .pipe(catchError(() => of<readonly Member[] | null>(null))),
      }),
  });

  /* Keep stale data after reload failures, but never across slugs. */
  private readonly current = keepLastValue<ProjectSnapshot>(this.snapshot, () => this.slugState());

  readonly slug = this.slugState.asReadonly();
  readonly project = computed(() => this.current()?.project);
  readonly tasks = computed(() => this.current()?.tasks ?? []);
  readonly members = computed(() => this.current()?.members ?? null);
  readonly loading = this.snapshot.isLoading;
  readonly hasLoaded = computed(() => this.current() !== undefined);
  readonly error = resourceError(this.snapshot);

  refresh(slug: string): void {
    if (slug === this.slugState()) {
      this.snapshot.reload();
      return;
    }
    this.slugState.set(slug);
  }
}
