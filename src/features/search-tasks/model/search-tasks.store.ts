import { Injectable, signal } from '@angular/core';

import { Task } from '@entities/task';

@Injectable()
export class SearchTasksStore {
  readonly query = signal('');

  filter(tasks: readonly Task[]): readonly Task[] {
    const query = this.query().trim().toLowerCase();
    if (!query) {
      return tasks;
    }

    return tasks.filter(
      (task) => task.id.toLowerCase().includes(query) || task.image.toLowerCase().includes(query),
    );
  }
}
