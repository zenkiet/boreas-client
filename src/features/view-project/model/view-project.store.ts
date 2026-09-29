import { Injectable, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, of, share, switchMap } from 'rxjs';

import { Member, Project, ProjectApi } from '@entities/project';
import { Task, TaskApi } from '@entities/task';
import { keepLastValue, resourceError } from '@shared/api/resource-cache';

interface ProjectSnapshot {
  readonly project: Project;
  readonly tasks: readonly Task[];
  /* null below owner; the page hides that section. */
  readonly members: readonly Member[] | null;
}

@Injectable()
export class ViewProjectStore {
  private readonly projectApi = inject(ProjectApi);
  private readonly taskApi = inject(TaskApi);
  private readonly slugState = signal('');

  private readonly snapshot = rxResource({
    params: () => this.slugState() || undefined,
    stream: ({ params }) => {
      const project = this.projectApi.get(params).pipe(share());
      return forkJoin({
        project,
        tasks: this.taskApi.list(params),
        /* Listing members is owner-only: it waits for the role instead of collecting a 403. */
        members: project.pipe(
          switchMap(({ myRole }) =>
            myRole === 'owner'
              ? this.projectApi
                  .members(params)
                  .pipe(catchError(() => of<readonly Member[] | null>(null)))
              : of(null),
          ),
        ),
      });
    },
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
