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
  /* A new param cancels a fetch in flight and starts over, where reload() would be dropped. */
  private readonly rev = signal(0);

  private readonly snapshot = rxResource({
    params: () => {
      const slug = this.slugState();
      return slug ? { slug, rev: this.rev() } : undefined;
    },
    stream: ({ params: { slug } }) => {
      const project = this.projectApi.get(slug).pipe(share());
      return forkJoin({
        project,
        tasks: this.taskApi.list(slug),
        /* Listing members is owner-only: it waits for the role instead of collecting a 403. */
        members: project.pipe(
          switchMap(({ myRole }) =>
            myRole === 'owner'
              ? this.projectApi
                  .members(slug)
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
    this.slugState.set(slug);
    this.rev.update((rev) => rev + 1);
  }
}
