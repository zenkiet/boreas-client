import { DOCUMENT } from '@angular/common';
import { Service, effect, inject, signal } from '@angular/core';

const STORAGE_KEY = 'boreas-pins';

/** Sidebar pins (project slugs, in pin order), kept on this device only. */
@Service()
export class PinnedProjectsStore {
  private readonly view = inject(DOCUMENT).defaultView;
  private readonly state = signal<readonly string[]>(this.read());

  readonly slugs = this.state.asReadonly();

  constructor() {
    effect(() => {
      try {
        this.view?.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state()));
      } catch {
        return;
      }
    });
  }

  toggle(slug: string): void {
    this.state.update((slugs) =>
      slugs.includes(slug) ? slugs.filter((pinned) => pinned !== slug) : [...slugs, slug],
    );
  }

  private read(): readonly string[] {
    try {
      const value: unknown = JSON.parse(this.view?.localStorage.getItem(STORAGE_KEY) ?? '[]');
      return Array.isArray(value)
        ? value.filter((slug): slug is string => typeof slug === 'string')
        : [];
    } catch {
      return [];
    }
  }
}
