import { DOCUMENT } from '@angular/common';
import { Service, computed, effect, inject, signal } from '@angular/core';

export type ThemeMode = 'system' | 'light' | 'dark';
export type Theme = 'light' | 'dark';

const MODE_STORAGE_KEY = 'boreas-theme';

const STATUS_BAR_COLOR: Record<Theme, string> = {
  dark: '#000000',
  light: '#f2f2f7',
};

@Service()
export class ThemeStore {
  private readonly document = inject(DOCUMENT);
  private readonly modeState = signal<ThemeMode>(this.readMode());
  private readonly systemDark = signal(false);

  readonly mode = this.modeState.asReadonly();
  readonly theme = computed<Theme>(() => {
    const mode = this.modeState();
    if (mode !== 'system') return mode;
    return this.systemDark() ? 'dark' : 'light';
  });

  constructor() {
    const media = this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)');
    if (media) {
      this.systemDark.set(media.matches);
      media.addEventListener('change', (event) => this.systemDark.set(event.matches));
    }

    effect(() => this.persistMode(this.modeState()));

    effect(() => {
      const theme = this.theme();
      this.document.documentElement.classList.toggle('ion-palette-dark', theme === 'dark');
      this.document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', STATUS_BAR_COLOR[theme]);
    });
  }

  setMode(mode: ThemeMode): void {
    this.modeState.set(mode);
  }

  private readMode(): ThemeMode {
    try {
      const value = this.document.defaultView?.localStorage.getItem(MODE_STORAGE_KEY);
      return value === 'light' || value === 'dark' || value === 'system' ? value : 'system';
    } catch {
      return 'system';
    }
  }

  private persistMode(mode: ThemeMode): void {
    try {
      this.document.defaultView?.localStorage.setItem(MODE_STORAGE_KEY, mode);
    } catch {
      return;
    }
  }
}
