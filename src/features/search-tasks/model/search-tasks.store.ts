import { Injectable, signal } from '@angular/core';

import { Project } from '@entities/project';
import { Task } from '@entities/task';

/** A task paired with its project, since names are only unique per project. */
export interface FleetTask {
  readonly project: Project;
  readonly task: Task;
}

@Injectable()
export class SearchTasksStore {
  readonly query = signal('');

  filter(entries: readonly FleetTask[]): readonly FleetTask[] {
    const query = this.query().trim().toLowerCase();
    if (!query) {
      return entries;
    }

    return entries.filter(
      ({ project, task }) =>
        task.name.toLowerCase().includes(query) ||
        task.image.toLowerCase().includes(query) ||
        project.slug.toLowerCase().includes(query),
    );
  }
}
