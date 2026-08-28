import { DOCUMENT } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TuiIcon } from '@taiga-ui/core';
import { TuiAppBar } from '@taiga-ui/layout';

import { SessionStore } from '@features/auth';
import { APP_VERSION, SUPPORT_EMAIL } from '@shared/config/app-info';
import { ServerConfigStore } from '@shared/config/server-config.store';
import { Reveal } from '@shared/lib/motion/reveal.directive';
import { BackLink } from '@shared/ui/back-link/back-link';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';
import { PageHeader } from '@shared/ui/page-header/page-header';

const DOC_LINKS: readonly { readonly label: string; readonly doc: string }[] = [
  { label: 'Terms of Service', doc: 'terms' },
  { label: 'Privacy Policy', doc: 'privacy' },
  { label: 'Open Source Licenses', doc: 'open-source' },
];

@Component({
  selector: 'app-about-page',
  imports: [BackLink, InsetGroup, PageHeader, Reveal, RouterLink, TuiAppBar, TuiIcon],
  template: `
    <div appReveal class="mx-auto grid w-full max-w-3xl grid-cols-1 gap-3.5 pb-16 md:gap-4 md:pb-0">
      <div
        class="scroll-edge sticky top-0 z-10 -mx-4 -mt-[max(1rem,env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] md:hidden"
      >
        <tui-app-bar tuiAppBarSize>
          <a tuiSlot="start" tuiAppBarBack routerLink="/settings" aria-label="Back to settings"></a>
          <span>About</span>
        </tui-app-bar>
      </div>

      <header class="hidden md:block">
        <app-back-link link="/settings" label="Settings" />
        <app-page-header title="About" />
      </header>

      <app-inset-group>
        <div class="identity">
          <img class="identity__mark" src="icon.svg" alt="" width="54" height="54" />
          <span>
            <span class="identity__name">Boreas</span>
            <span class="identity__version tabular">Version {{ version }}</span>
          </span>
        </div>
      </app-inset-group>

      <app-inset-group label="Legal">
        @for (link of docLinks; track link.doc) {
          <a class="lrow nav-row row-divider relative" [routerLink]="['/legal', link.doc]">
            <span class="flex-1">{{ link.label }}</span>
            <tui-icon class="icon-sm nav-row__chevron" icon="@tui.chevron-right" />
          </a>
        }
      </app-inset-group>

      <div>
        <app-inset-group label="Support">
          <a class="lrow nav-row row-divider relative" routerLink="/legal/help">
            <span class="flex-1">Help</span>
            <tui-icon class="icon-sm nav-row__chevron" icon="@tui.chevron-right" />
          </a>
          <a class="lrow nav-row row-divider relative" [href]="reportLink()">
            <span class="flex-1">Report a problem</span>
            <tui-icon class="icon-sm nav-row__chevron" icon="@tui.external-link" />
          </a>
        </app-inset-group>
        <p class="footnote">
          The draft is prefilled with the app version, this server, and your device details so the
          report can be traced. It never carries your session token or password.
        </p>
      </div>

      <p class="about__foot">
        © 2026 Kiet Le · Docker is a trademark of Docker, Inc. Boreas is not affiliated with Docker,
        Inc.
      </p>
    </div>
  `,
  styles: `
    .identity {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 0.875rem 1rem;
    }

    .identity__mark {
      flex: none;
      border-radius: 0.8125rem;
    }

    .identity__name {
      display: block;
      font-size: 1.1875rem;
      font-weight: 700;
      letter-spacing: -0.01em;
      color: var(--tui-text-primary);
    }

    .identity__version {
      display: block;
      margin-block-start: 0.125rem;
      font-size: 0.8125rem;
      color: var(--tui-text-tertiary);
    }

    .about__foot {
      margin: 0.5rem 0 0;
      padding-inline: 0.5rem;
      font-size: 0.75rem;
      line-height: 1.5;
      color: var(--tui-text-tertiary);
      text-align: center;
    }
  `,
})
export class AboutPage {
  private readonly document = inject(DOCUMENT);
  private readonly config = inject(ServerConfigStore);
  private readonly session = inject(SessionStore);

  protected readonly docLinks = DOC_LINKS;
  protected readonly version = APP_VERSION;

  protected readonly reportLink = computed(
    () =>
      `mailto:${SUPPORT_EMAIL}` +
      `?subject=${encodeURIComponent(`Boreas ${APP_VERSION} problem report`)}` +
      `&body=${encodeURIComponent(this.diagnostics())}`,
  );

  /* Whatever identifies the run without identifying the session: never the token. */
  private diagnostics(): string {
    const view = this.document.defaultView;
    const user = this.session.user();
    const screen = view?.screen;

    return [
      'What happened:',
      '',
      '',
      '--- diagnostics ---',
      `App: Boreas ${APP_VERSION}`,
      `Server: ${this.config.baseUrl()}`,
      `Signed in: ${user ? `${user.username} (${user.role})` : 'no'}`,
      `Device: ${view?.navigator.userAgent ?? 'unknown'}`,
      `Screen: ${screen ? `${screen.width}x${screen.height} @${view?.devicePixelRatio ?? 1}x` : 'unknown'}`,
      `Window: ${view ? `${view.innerWidth}x${view.innerHeight}` : 'unknown'}`,
      `Locale: ${view?.navigator.language ?? '?'} · ${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
      `Network: ${view?.navigator.onLine === false ? 'offline' : 'online'}`,
      `Reported: ${new Date().toISOString()}`,
    ].join('\n');
  }
}
