import { Service, signal } from '@angular/core';

/** The one polite status region, rendered by the shell, for outcomes that show no toast. */
@Service()
export class Announcer {
  readonly message = signal('');

  say(text: string): void {
    // Cleared first, so the same words twice are read twice.
    this.message.set('');
    setTimeout(() => this.message.set(text), 100);
  }
}
