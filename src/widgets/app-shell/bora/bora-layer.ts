import { DOCUMENT } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ModalController } from '@ionic/angular/modal-controller';
import { Platform } from '@ionic/angular/platform';
import { from, fromEvent, merge, switchMap } from 'rxjs';

import { BoraFigure, BoraState, screenAbout } from '@entities/bora';
import type { Notification } from '@entities/notification';
import { BoraStore } from '@features/bora/model';
import { ListAlertsStore } from '@features/list-alerts/model';
import { ListProjectsStore } from '@features/list-projects/model';
import { AuthTokenStore } from '@shared/api/auth-token.store';
import { age } from '@shared/lib/format/age';
import { mediaQuery, wideScreen } from '@shared/ui/breakpoint/wide-screen';
import { Announcer } from '@shared/ui/notify/announcer';
import { NotifyService } from '@shared/ui/notify/notify';

import { failedRun, freshFailure } from './bora-chip';
import { BoraPanel } from './bora-panel';
import { boraPose } from './bora-pose';

/* Where Bora never sits: no chrome, Search, a form, a legal page, its own settings. */
const HIDDEN =
  /^\/(welcome|login|search|legal)|\/(new|edit|note)(?:[/?#]|$)|^\/settings(\/|\?pane=)bora/;
const FIELD =
  'input:not([type=checkbox],[type=radio],[type=range],[type=button]),textarea,[contenteditable]:not([contenteditable=false])';
const HEADS_UP_GAP = 10 * 60_000;
const BUSY = 'Bora is still answering. Try again in a moment.';

@Component({
  selector: 'app-bora-layer',
  imports: [BoraFigure, BoraPanel],
  host: { '[class.low]': '!tabs() || wide()', '[class.flat]': 'tabs() && flat()' },
  template: `
    @if (shown()) {
      <button
        #me
        type="button"
        class="bora fx"
        [class.aside]="aside()"
        [class.open]="wide() && bora.open()"
        [class.unread]="bora.unread()"
        [inert]="aside()"
        [attr.aria-label]="label()"
        [attr.aria-expanded]="wide() ? bora.open() : null"
        [attr.title]="tip()"
        (click)="tapped()"
      >
        <!-- Hidden, it holds still: a second player would only draw for nobody. -->
        <app-bora-figure
          [state]="state()"
          [still]="aside()"
          [shadow]="wide() && bora.open() ? 'none' : 'rest'"
        />
      </button>
      @if (bubble(); as failure) {
        <div class="pop" role="dialog" [attr.aria-label]="failed(failure)">
          <p>
            <b>{{ failed(failure) }}</b> {{ age(failure.createdAt) }} ago.
          </p>
          <div class="acts">
            <button type="button" class="btn" (click)="bubble.set(null)">Not now</button>
            <button type="button" class="btn btn--pri" (click)="explain(failure)">Explain</button>
          </div>
          <svg class="arrow" viewBox="0 0 24 12" aria-hidden="true">
            <path d="M0 0h24L13.4 11.1a2 2 0 0 1-2.8 0z" />
          </svg>
        </div>
      }
    }
    @if (wide() && bora.open()) {
      @defer (on immediate) {
        <app-bora-panel
          animate.enter="fx fx-appear"
          animate.leave="fx fx-out"
          [inert]="covered()"
          [home]="me()?.nativeElement"
        />
      }
    }
  `,
  styles: `
    /* In px, as the theme sizes Search (61, 16 from the edge): Dynamic Type must not pull them apart. */
    :host {
      --fab: var(--ios-theme-floating-safe-area-bottom, var(--ios26-floating-safe-area-bottom));
      --right: calc(18.5px + var(--ion-safe-area-right, 0px));
      --bottom: calc(var(--fab) + 69px);
      display: contents;
    }

    :host(.low) {
      --bottom: calc(var(--fab) + 2.5px);
    }

    :host(.flat) {
      --right: calc(89px + var(--ion-safe-area-right, 0px));
      --bottom: calc(var(--fab) + 2.5px);
    }

    .bora {
      position: fixed;
      z-index: 5;
      inset-inline-end: var(--right);
      inset-block-end: var(--bottom);
      inline-size: 56px;
      block-size: 56px;
      padding: 0;
      border: 0;
      border-radius: 50%;
      background: none;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      transition:
        opacity var(--t-quick) var(--e-out),
        scale var(--t-quick) var(--e-out);
    }

    .bora:focus-visible {
      outline: 3px solid var(--ion-color-primary);
      outline-offset: 3px;
    }

    .aside {
      opacity: 0;
    }

    .open {
      background: var(--color-glass);
      box-shadow: var(--shadow-glass);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      backdrop-filter: blur(20px) saturate(180%);
    }

    /* The body sits low in its box (the curl takes the top): on the plate, the body is centred. */
    app-bora-figure {
      transition: translate var(--t-base) var(--e-out);
    }

    .open app-bora-figure {
      translate: 0 -7px;
    }

    .unread::after {
      content: '';
      position: absolute;
      inset-block-start: 2px;
      inset-inline-end: 2px;
      inline-size: 12px;
      block-size: 12px;
      border-radius: 50%;
      background: var(--ion-color-primary);
      box-shadow: 0 0 0 2px var(--ion-background-color);
    }

    .pop {
      position: fixed;
      z-index: 7;
      inset-inline-end: var(--right);
      inset-block-end: calc(var(--bottom) + 70px);
      inline-size: min(18rem, calc(100vw - 2rem));
      padding: 0.875rem 1rem 0.75rem;
      border-radius: 1.375rem;
      background: var(--color-glass);
      box-shadow: var(--shadow-glass);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      backdrop-filter: blur(24px) saturate(180%);
    }

    .pop p {
      margin: 0;
      font-size: 0.9375rem;
      line-height: 1.25rem;
    }

    .acts {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-block-start: 0.625rem;
    }

    .btn {
      min-block-size: 2.75rem;
      padding: 0 1.125rem;
      border: 0;
      border-radius: 1.375rem;
      background: var(--app-fill);
      font: inherit;
      font-weight: 600;
      color: var(--app-text-primary);
      cursor: pointer;
    }

    .btn--pri {
      background: var(--ion-color-primary);
      color: var(--ion-color-primary-contrast);
    }

    .arrow {
      position: absolute;
      inset-block-end: -11px;
      inset-inline-end: 16px;
      inline-size: 24px;
      block-size: 12px;
      fill: var(--color-glass);
    }
  `,
})
export class BoraLayer {
  readonly url = input.required<string>();
  readonly tabs = input.required<boolean>();
  readonly covered = input.required<boolean>();

  protected readonly bora = inject(BoraStore);
  private readonly fleet = inject(ListProjectsStore);
  private readonly alerts = inject(ListAlertsStore);
  private readonly tokens = inject(AuthTokenStore);
  private readonly modals = inject(ModalController);
  private readonly platform = inject(Platform);
  private readonly notify = inject(NotifyService);
  private readonly announcer = inject(Announcer);
  private readonly document = inject(DOCUMENT);
  protected readonly wide = wideScreen();
  protected readonly flat = mediaQuery('(max-height: 31.1875rem)');
  /* A touch screen brings up a keyboard over the bottom; a mouse and a keyboard never do. */
  private readonly touch = mediaQuery('(pointer: coarse)');
  private readonly me = viewChild<ElementRef<HTMLButtonElement>>('me');
  private readonly pose = boraPose();

  protected readonly age = age;
  protected readonly live = this.fleet.live;
  private readonly typing = signal(false);
  protected readonly bubble = signal<Notification | null>(null);

  /* On a wide screen Bora is its panel's only toggle, so it stays wherever the panel is open. */
  protected readonly shown = computed(
    () =>
      (this.wide() && this.bora.open()) ||
      (this.tokens.authenticated() &&
        this.bora.prefs().show &&
        !HIDDEN.test(this.url()) &&
        this.fleet.summaries().some(({ project }) => project.bora)),
  );
  protected readonly aside = computed(() => (this.typing() && this.touch()) || this.covered());
  protected readonly tip = computed(() => (this.wide() && this.bora.open() ? 'Close Bora' : null));

  private readonly failure = computed(() =>
    freshFailure(this.alerts.unseenFailures(), this.fleet.summaries()),
  );
  private readonly problem = computed(() => this.bora.conversation()?.problem);

  protected readonly label = computed(() => {
    const failure = this.failure();
    return [
      'Bora, assistant',
      this.bora.unread() && 'answer ready',
      failure && this.failed(failure),
    ]
      .filter(Boolean)
      .join(', ');
  });

  protected readonly state = computed<BoraState>(() => {
    if (this.wide() && this.bora.open()) return this.pose();
    if (this.bora.busy()) return 'think';
    if (!this.live()) return 'sleep';
    if (this.bora.unread()) return this.bora.conversation()?.problem ? 'sorry' : 'speak';
    return this.bubble() ? 'heads' : 'idle';
  });

  private modal?: HTMLIonModalElement;
  private presenting = false;
  private headsAt = 0;

  constructor() {
    const root = this.document.documentElement;
    // The layer itself loads on idle: fetch the world now, so the first tap doesn't wait for it.
    if (!this.wide()) void import('./bora-world');
    // Its world goes with it: a new layer (a hot reload) would otherwise open a second one.
    inject(DestroyRef).onDestroy(() => void this.modal?.dismiss());
    this.bora.refused.pipe(takeUntilDestroyed()).subscribe(() => this.notify.failure(BUSY));
    merge(fromEvent(this.document, 'focusin'), fromEvent(this.document, 'focusout'))
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.typing.set(!!this.document.activeElement?.closest(FIELD)));

    /* Lists clear Bora as they clear the tab bar (styles.css). */
    effect(() =>
      root.classList.toggle('bora-resting', this.shown() && (this.tabs() || this.wide())),
    );

    effect(() => {
      const open = this.bora.open();
      untracked(() => (open ? this.present() : void this.modal?.dismiss()));
    });

    effect(() => {
      if (this.problem()?.kind !== 'not-found') return;
      untracked(() => {
        this.notify.failure('What you asked about is gone.');
        this.bora.close();
      });
    });

    effect(() => {
      if (!this.bora.unread()) return;
      untracked(() =>
        this.announcer.say(
          this.bora.conversation()?.problem ? 'Bora couldn’t answer' : 'Bora answered',
        ),
      );
    });

    let known: Set<string> | undefined;
    effect(() => {
      const failure = this.failure();
      const quiet = !this.shown() || this.aside() || this.bora.open() || this.bora.busy();
      untracked(() => {
        if (!this.alerts.hasLoaded()) return;
        // What was already unseen when the app opened is Activity's to show, not news.
        known ??= new Set(this.alerts.unseenFailures().map(({ id }) => id));
        if (!failure || quiet || known.has(failure.id)) return;
        if (Date.now() - this.headsAt < HEADS_UP_GAP) return;
        known.add(failure.id);
        this.headsAt = Date.now();
        this.bubble.set(failure);
      });
    });

    effect(() => {
      this.url();
      untracked(() => this.bubble.set(null));
    });
  }

  protected failed(failure: Notification): string {
    return `${failedRun(failure)} failed`;
  }

  protected tapped(): void {
    this.bubble.set(null);
    if (this.wide() && this.bora.open()) return this.bora.close();
    this.bora.show(screenAbout(this.url()));
  }

  protected explain(failure: Notification): void {
    this.bubble.set(null);
    this.bora.ask({ kind: 'alert', id: failure.id, project: failure.project });
  }

  private present(): void {
    if (this.modal || this.presenting || this.wide()) return;
    this.presenting = true;
    const spot = () => this.me()?.nativeElement.getBoundingClientRect();
    from(import('./bora-world'))
      .pipe(
        switchMap(({ BoraWorld, worldAnimation }) =>
          this.modals.create({
            component: BoraWorld,
            cssClass: ['bora-world', 'ion-palette-dark'],
            htmlAttributes: { 'aria-label': 'Bora' },
            enterAnimation: worldAnimation(spot, true),
            leaveAnimation: worldAnimation(spot, false),
          }),
        ),
        switchMap((modal) => {
          // Full screen below the iPad width too, where Ionic would draw a centred card.
          modal.style.cssText = '--width: 100%; --height: 100%; --border-radius: 0';
          return from(modal.present().then(() => modal));
        }),
      )
      .subscribe({
        next: (modal) => {
          this.presenting = false;
          this.modal = modal;
          // Back closes the world even while a toast tops it, which Ionic's own handler skips.
          const back = this.platform.backButton.subscribeWithPriority(50, () => this.bora.close());
          from(modal.onWillDismiss()).subscribe(() => {
            back.unsubscribe();
            this.modal = undefined;
            this.bora.close();
          });
          // Ionic refocuses what opened the world; when that is gone, Bora takes it.
          from(modal.onDidDismiss()).subscribe(() => {
            if (this.document.activeElement === this.document.body) {
              this.me()?.nativeElement.focus({ preventScroll: true });
            }
          });
          if (!this.bora.open()) void modal.dismiss();
        },
        error: () => {
          this.presenting = false;
          this.bora.close();
          this.notify.failure('Couldn’t open Bora. Try again.');
        },
      });
  }
}
