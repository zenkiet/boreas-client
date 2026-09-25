import { DOCUMENT } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { IonBackButton } from '@ionic/angular/ion-back-button';
import { IonButtons } from '@ionic/angular/ion-buttons';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonNote } from '@ionic/angular/ion-note';
import { IonRouterLink } from '@ionic/angular/ion-router-link';

import { SessionStore } from '@features/auth';
import { HealthApi } from '@shared/api/health.api';
import { APP_VERSION, SUPPORT_EMAIL } from '@shared/config/app-info';
import { ServerConfigStore } from '@shared/config/server-config.store';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';
import { PAGE_CHROME } from '@shared/ui/page-chrome/page-chrome';

const DOC_LINKS: readonly { readonly label: string; readonly doc: string }[] = [
  { label: 'Terms of Service', doc: 'terms' },
  { label: 'Privacy Policy', doc: 'privacy' },
  { label: 'Open-source licences', doc: 'open-source' },
];

@Component({
  selector: 'app-about-page',
  imports: [
    InsetGroup,
    IonBackButton,
    IonButtons,
    IonItem,
    IonLabel,
    IonNote,
    IonRouterLink,
    PAGE_CHROME,
    RouterLink,
  ],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button defaultHref="/settings" /></ion-buttons>
        <ion-title>About</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <div class="mx-auto max-w-(--app-column)">
        <app-inset-group>
          <ion-item class="identity">
            <img slot="start" class="mark" src="icon.svg" alt="" width="58" height="58" />
            <ion-label><span class="name">Boreas</span></ion-label>
            <ion-note class="version tabular">Version {{ version }}</ion-note>
            @if (serverVersion(); as server) {
              <ion-note class="version tabular">Server {{ server }}</ion-note>
            }
          </ion-item>
        </app-inset-group>

        <app-inset-group label="Legal">
          @for (link of docLinks; track link.doc) {
            <ion-item [routerLink]="['/legal', link.doc]">
              <ion-label>{{ link.label }}</ion-label>
            </ion-item>
          }
        </app-inset-group>

        <app-inset-group label="Support">
          <ion-item routerLink="/legal/help">
            <ion-label>Help</ion-label>
          </ion-item>
          <!-- An email, not a screen: no disclosure chevron. -->
          <ion-item [href]="reportLink()" [detail]="false">
            <ion-label>Report a problem</ion-label>
          </ion-item>
          <ion-note>
            Report a problem opens a pre-filled email with the app version, server and device
            details — never your session.
          </ion-note>
        </app-inset-group>

        <p class="foot">© 2026 Zen Le in collaboration with Blogic Systems. All rights reserved.</p>
      </div>
    </ion-content>
  `,
  styles: `
    .identity {
      --padding-top: 1rem;
      --padding-bottom: 1rem;
    }

    .mark {
      margin: 0 1rem 0 0;
      border-radius: 0.875rem;
    }

    /* A span, because the theme pins the label's own size for two-line rows. */
    .name {
      font-size: 1.25rem;
      line-height: 1.5625rem;
      font-weight: 700;
    }

    .version {
      font-size: 0.9375rem;
    }

    .foot {
      margin: 2.5rem 2.25rem 1.5rem;
      font-size: 0.8125rem;
      line-height: 1.125rem;
      color: var(--app-text-tertiary);
      text-align: center;
    }
  `,
})
export class AboutPage {
  private readonly document = inject(DOCUMENT);
  private readonly config = inject(ServerConfigStore);
  private readonly session = inject(SessionStore);

  protected readonly serverVersion = toSignal(inject(HealthApi).version(this.config.baseUrl()));

  protected readonly docLinks = DOC_LINKS;
  protected readonly version = APP_VERSION;

  protected readonly reportLink = computed(
    () =>
      `mailto:${SUPPORT_EMAIL}` +
      `?subject=${encodeURIComponent(`Boreas ${APP_VERSION} problem report`)}` +
      `&body=${encodeURIComponent(this.diagnostics())}`,
  );

  /* Must never carry the session token. */
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
      `Server: ${this.config.baseUrl()} (${this.serverVersion() ?? 'version unknown'})`,
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
