import { DOCUMENT } from '@angular/common';
import { computed, inject, Service, signal } from '@angular/core';

const STORAGE_KEY = 'boreas-server';

@Service()
export class ServerConfigStore {
  private readonly document = inject(DOCUMENT);
  private readonly baseUrlState = signal(this.read());

  readonly baseUrl = this.baseUrlState.asReadonly();
  readonly configured = computed(() => this.baseUrlState() !== '');

  suggestedUrl(): string {
    return (
      this.baseUrlState() || this.document.defaultView?.location.origin || 'http://127.0.0.1:8080'
    );
  }

  set(url: string): void {
    const normalized = normalizeBaseUrl(url);
    this.baseUrlState.set(normalized);
    try {
      this.document.defaultView?.localStorage.setItem(STORAGE_KEY, normalized);
    } catch {
      return;
    }
  }

  private read(): string {
    try {
      return normalizeBaseUrl(this.document.defaultView?.localStorage.getItem(STORAGE_KEY) ?? '');
    } catch {
      return '';
    }
  }
}

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, '');
}
