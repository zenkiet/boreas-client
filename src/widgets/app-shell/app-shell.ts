import { DOCUMENT } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import {
  TUI_IOS_LOADER,
  TUI_PULL_TO_REFRESH_COMPONENT,
  TUI_PULL_TO_REFRESH_LOADED,
  TuiPullToRefresh,
} from '@taiga-ui/addon-mobile';
import { TUI_BREAKPOINT, TuiButton, TuiIcon } from '@taiga-ui/core';
import { filter, map } from 'rxjs';

import { PullToRefresh } from '@shared/lib/pull-to-refresh/pull-to-refresh';
import { ThemeMode, ThemeStore } from '@shared/lib/theme/theme.store';
import { GlassSegmented, GlassSegmentedItem } from '@shared/ui/glass-segmented/glass-segmented';

interface NavItem {
  readonly label: string;
  readonly link: string;
  readonly icon: string;
}

const THEME_CYCLE: Record<ThemeMode, ThemeMode> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
};

const THEME_ICON: Record<ThemeMode, string> = {
  system: '@tui.monitor',
  light: '@tui.sun',
  dark: '@tui.moon',
};

@Component({
  selector: 'app-shell',
  imports: [GlassSegmented, RouterLink, RouterOutlet, TuiButton, TuiIcon, TuiPullToRefresh],
  providers: [
    {
      provide: TUI_PULL_TO_REFRESH_LOADED,
      useFactory: () => inject(PullToRefresh).loaded$,
    },
    { provide: TUI_PULL_TO_REFRESH_COMPONENT, useValue: TUI_IOS_LOADER },
  ],
  host: {
    class: 'flex flex-col min-h-dvh bg-canvas overflow-x-hidden',
    '(window:scroll)': 'onScroll()',
  },
  template: `
    @if (!mobile() && !onboarding()) {
      <header class="shell__bar">
        <div class="shell__bar-inner">
          <a routerLink="/projects" class="shell__brand" aria-label="Boreas projects">
            <img
              class="shell__mark"
              src="/brand-mark.png"
              width="28"
              height="28"
              alt=""
              aria-hidden="true"
            />
            Boreas
          </a>

          <nav class="flex items-center gap-0.5" aria-label="Sections">
            @for (item of navItems; track item.link) {
              <a
                class="shell__nav-item"
                [routerLink]="item.link"
                [class.shell__nav-item--active]="activeTab() === $index"
                [attr.aria-current]="activeTab() === $index ? 'page' : null"
              >
                {{ item.label }}
              </a>
            }
          </nav>

          <button
            tuiIconButton
            type="button"
            size="s"
            appearance="flat-grayscale"
            class="ms-auto"
            [attr.aria-label]="themeLabel()"
            [attr.title]="themeLabel()"
            (click)="cycleTheme()"
          >
            <tui-icon class="icon-sm" [icon]="themeIcon()" />
          </button>
        </div>
      </header>
    }

    <tui-pull-to-refresh class="block flex-1" [styleHandler]="pullStyle" (pulled)="refreshPulled()">
      <main class="w-full" [class]="mainClass()">
        <router-outlet />
      </main>
    </tui-pull-to-refresh>

    @if (mobile() && !onboarding() && !pushedPage()) {
      <nav
        class="app-shell__tab-bar"
        aria-label="Sections"
        [class.app-shell__dock--min]="minimized()"
      >
        <app-glass-segmented
          [items]="dockItems"
          [stacked]="true"
          [activeIndex]="activeTab()"
          (activeIndexChange)="openTab($event)"
        />
      </nav>
    }
  `,
  styles: `
    .app-shell__tab-bar {
      position: fixed;
      z-index: 10;
      inset-inline: 0;
      inset-block-end: max(env(safe-area-inset-bottom), 1.25rem);
      display: flex;
      justify-content: center;
      pointer-events: none;
      transition: transform var(--tui-duration) cubic-bezier(0.4, 0.1, 0.2, 1);
      will-change: transform;
      transform: translateZ(0);
    }

    .app-shell__tab-bar app-glass-segmented {
      pointer-events: auto;
      inline-size: min(21rem, calc(100vw - 2rem));
    }

    .app-shell__dock--min {
      transform: scale(0.86) translateZ(0);
      transform-origin: bottom center;
    }

    .shell__bar {
      position: sticky;
      z-index: 9;
      inset-block-start: 0;
      border-block-end: 1px solid var(--tui-border-normal);
      background: color-mix(in srgb, var(--tui-background-base) 82%, transparent);
      backdrop-filter: blur(12px) saturate(180%);
    }

    .shell__bar-inner {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      max-inline-size: 80rem;
      margin-inline: auto;
      block-size: 3.25rem;
      padding-inline: 1.5rem;
    }

    .shell__brand {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.0625rem;
      font-weight: 650;
      letter-spacing: -0.015em;
      color: var(--tui-text-primary);
      text-decoration: none;
    }

    .shell__mark {
      display: block;
      inline-size: 1.75rem;
      block-size: 1.75rem;
    }

    .shell__nav-item {
      display: inline-flex;
      align-items: center;
      block-size: 1.875rem;
      padding-inline: 0.625rem;
      border-radius: var(--tui-radius-s);
      font-size: 0.9375rem;
      font-weight: 500;
      color: var(--tui-text-secondary);
      text-decoration: none;
      transition:
        background-color var(--tui-duration),
        color var(--tui-duration);
    }

    .shell__nav-item:hover {
      background: var(--tui-background-neutral-1);
      color: var(--tui-text-primary);
    }

    .shell__nav-item--active,
    .shell__nav-item--active:hover {
      background: var(--app-accent-soft);
      color: var(--app-accent-text);
    }
  `,
})
export class AppShell {
  private readonly router = inject(Router);
  private readonly breakpoint = inject(TUI_BREAKPOINT);
  private readonly theme = inject(ThemeStore);
  private readonly document = inject(DOCUMENT);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly mobile = computed(() => this.breakpoint() === 'mobile');

  protected readonly onboarding = computed(
    () => this.url().startsWith('/welcome') || this.url().startsWith('/login'),
  );

  protected readonly pushedPage = computed(() => {
    const url = this.url();
    return /^\/projects\/./.test(url) || /^\/settings\/./.test(url);
  });

  protected readonly mainClass = computed(() => {
    if (this.onboarding()) {
      return 'block';
    }
    const base =
      'mx-auto max-w-[80rem] px-4 pt-[max(1rem,env(safe-area-inset-top))] md:px-6 md:py-6 md:pb-10';

    return `${base} ${this.pushedPage() ? 'pb-6' : 'pb-20'}`;
  });

  protected readonly navItems: readonly NavItem[] = [
    { label: 'Home', link: '/projects', icon: '@tui.house' },
    { label: 'Search', link: '/search', icon: '@tui.search' },
    { label: 'Alerts', link: '/notifications', icon: '@tui.bell' },
    { label: 'Settings', link: '/settings', icon: '@tui.settings-2' },
  ];

  protected readonly dockItems: readonly GlassSegmentedItem[] = this.navItems.map((item) => ({
    label: item.label,
    icon: item.icon,
  }));

  protected readonly activeTab = computed(() => {
    const index = this.navItems.findIndex((item, i) => i > 0 && this.url().startsWith(item.link));
    return index === -1 ? 0 : index;
  });

  protected readonly minimized = signal(false);
  private lastScrollY = 0;

  protected onScroll(): void {
    const y = this.document.defaultView?.scrollY ?? 0;
    const delta = y - this.lastScrollY;

    if (Math.abs(delta) < 6) {
      return;
    }

    this.lastScrollY = y;
    this.minimized.set(y > 72 && delta > 0);
  }

  protected readonly themeIcon = computed(() => THEME_ICON[this.theme.mode()]);
  protected readonly themeLabel = computed(
    () => `Appearance: ${this.theme.mode()}. Switch to ${THEME_CYCLE[this.theme.mode()]}.`,
  );

  protected cycleTheme(): void {
    this.theme.setMode(THEME_CYCLE[this.theme.mode()]);
  }

  protected openTab(index: number): void {
    const item = this.navItems[index];
    if (item) void this.router.navigate([item.link]);
  }

  private readonly pull = inject(PullToRefresh);

  protected readonly pullStyle = (distance: number): Record<string, string> => ({
    top: `${distance / 2}px`,
  });

  protected refreshPulled(): void {
    void this.pull.refresh();
  }
}
