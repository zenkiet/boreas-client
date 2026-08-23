import { DOCUMENT } from '@angular/common';
import { Service, inject, signal } from '@angular/core';

const STORAGE_KEY = 'boreas-welcomed';

/** Remembers that this device finished the welcome tour, so it only ever shows once. */
@Service()
export class WelcomeSeenStore {
  private readonly document = inject(DOCUMENT);
  private readonly seenState = signal(this.read());

  readonly seen = this.seenState.asReadonly();

  markSeen(): void {
    this.seenState.set(true);
    try {
      this.document.defaultView?.localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      return;
    }
  }

  private read(): boolean {
    try {
      return this.document.defaultView?.localStorage.getItem(STORAGE_KEY) !== null;
    } catch {
      return false;
    }
  }
}
