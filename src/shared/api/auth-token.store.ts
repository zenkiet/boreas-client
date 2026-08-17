import { DOCUMENT } from '@angular/common';
import { computed, inject, Service, signal } from '@angular/core';

const STORAGE_KEY = 'boreas-token';

/** Owns only the bearer token; the session user lives in features/auth. */
@Service()
export class AuthTokenStore {
  private readonly document = inject(DOCUMENT);
  private readonly tokenState = signal(this.read());

  readonly token = this.tokenState.asReadonly();
  readonly authenticated = computed(() => this.tokenState() !== '');

  set(token: string): void {
    this.tokenState.set(token);
    try {
      this.document.defaultView?.localStorage.setItem(STORAGE_KEY, token);
    } catch {
      return;
    }
  }

  clear(): void {
    this.tokenState.set('');
    try {
      this.document.defaultView?.localStorage.removeItem(STORAGE_KEY);
    } catch {
      return;
    }
  }

  private read(): string {
    try {
      return this.document.defaultView?.localStorage.getItem(STORAGE_KEY) ?? '';
    } catch {
      return '';
    }
  }
}
