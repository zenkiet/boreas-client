import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { TuiThemeColorService } from '@taiga-ui/addon-mobile';
import { TUI_DARK_MODE } from '@taiga-ui/core';

export type ThemeMode = 'system' | 'light' | 'dark';
export type Theme = 'light' | 'dark';

const MODE_STORAGE_KEY = 'boreas-theme';

const STATUS_BAR_COLOR: Record<Theme, string> = {
  dark: '#0a0d13',
  light: '#f4f6fa',
};

/** Resolves appearance through Taiga so explicit choices cannot desynchronize body and tui-root. */
@Injectable({ providedIn: 'root' })
export class ThemeStore {
  private readonly document = inject(DOCUMENT);
  private readonly themeColor = inject(TuiThemeColorService);
  private readonly darkMode = inject(TUI_DARK_MODE);
  private readonly modeState = signal<ThemeMode>(this.readMode());

  readonly mode = this.modeState.asReadonly();
  readonly theme = computed<Theme>(() => (this.darkMode() ? 'dark' : 'light'));

  constructor() {
    effect(() => this.persistMode(this.modeState()));

    /* reset() restores Taiga's media listener; set() pins an explicit choice. */
    effect(() => {
      const mode = this.modeState();
      if (mode === 'system') {
        this.darkMode.reset();
      } else {
        this.darkMode.set(mode === 'dark');
      }
    });

    effect(() => {
      this.themeColor.color = STATUS_BAR_COLOR[this.theme()];
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
