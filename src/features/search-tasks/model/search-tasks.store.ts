import { DOCUMENT } from '@angular/common';
import { Service, inject, signal } from '@angular/core';

import { Project } from '@entities/project';
import { Task, taskKey } from '@entities/task/model';

/** A task paired with its project, since names are only unique per project. */
export interface FleetTask {
  readonly project: Project;
  readonly task: Task;
}

export interface RecentTask {
  readonly project: string;
  readonly name: string;
}

const RECENT_KEY = 'boreas-recent-tasks';
const RECENT_MAX = 5;

/** Root: the query is shared by the search page and the shell's bottom search field. */
@Service()
export class SearchTasksStore {
  private readonly view = inject(DOCUMENT).defaultView;

  readonly query = signal('');
  /** Per device, not per account: the page shows only entries the current fleet still has. */
  readonly recent = signal<readonly RecentTask[]>(this.read());

  remember(project: string, name: string): void {
    const key = taskKey(project, name);
    this.save([
      { project, name },
      ...this.recent().filter((entry) => taskKey(entry.project, entry.name) !== key),
    ]);
  }

  clearRecent(): void {
    this.save([]);
  }

  private save(recent: readonly RecentTask[]): void {
    const kept = recent.slice(0, RECENT_MAX);
    this.recent.set(kept);
    try {
      this.view?.localStorage.setItem(RECENT_KEY, JSON.stringify(kept));
    } catch {
      return;
    }
  }

  private read(): readonly RecentTask[] {
    try {
      const parsed: unknown = JSON.parse(this.view?.localStorage.getItem(RECENT_KEY) ?? '[]');
      return Array.isArray(parsed)
        ? parsed
            .filter(
              (entry): entry is RecentTask =>
                typeof entry?.project === 'string' && typeof entry?.name === 'string',
            )
            .slice(0, RECENT_MAX)
        : [];
    } catch {
      return [];
    }
  }
}
