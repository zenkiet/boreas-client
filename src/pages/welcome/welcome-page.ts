import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { IonButton } from '@ionic/angular/ion-button';
import { IonContent } from '@ionic/angular/ion-content';
import { NavController } from '@ionic/angular/nav-controller';
import { gsap } from 'gsap';

import { ChangeServerService } from '@features/connect-server';
import { OnboardingHero } from '@features/onboarding';
import { AuthTokenStore } from '@shared/api/auth-token.store';
import { WelcomeSeenStore } from '@shared/api/welcome-seen.store';
import { reduced } from '@shared/ui/motion/motion';

const STEPS = [0, 1, 2] as const;
const LAST = STEPS.length - 1;
const HERO_SCALE = 0.5;
const HERO_DROP = 48;
const HERO_INSET = 52;
// px/ms: a flick this fast advances before the distance threshold.
const FLICK = 0.5;

@Component({
  selector: 'app-welcome-page',
  imports: [IonButton, IonContent, OnboardingHero],
  template: `
    <ion-content [scrollY]="false">
      <div class="flow">
        <div #hero class="flow__hero">
          <div class="flow__hero-content">
            <app-onboarding-hero />
          </div>
          <div
            #tagline
            class="flow__tagline"
            [class.flow__tagline--hidden]="step() !== 0"
            [attr.aria-hidden]="step() === 0 ? null : true"
          >
            <h1 class="flow__title flow__title--hero">Every branch, its own URL.</h1>
            <p class="flow__sub">
              Boreas runs each task in an isolated container and serves it at /project/task/ — ready
              before the coffee is.
            </p>
          </div>
        </div>

        <div
          #viewport
          class="flow__viewport"
          (pointerdown)="onDown($event)"
          (pointerup)="onUp($event)"
          (pointercancel)="onUp($event)"
        >
          <div #track class="flow__track">
            <section class="flow__step" [inert]="step() !== 0"></section>

            <section class="flow__step" [inert]="step() !== 1">
              <h2 class="flow__title">Deploy from CI, not from a laptop</h2>
              <p class="flow__sub flow__sub--start">
                One API token, one call. The exact image your pipeline built is the one that runs.
              </p>
              <div class="mini">
                <!-- Keep the backslash doubled: a lone one would eat the newline. -->
                <pre class="mini__code" aria-hidden="true">
curl -X POST …/tasks/web/deploy \\
  -d '&#123;"image":"ghcr.io/acme/web@sha256:…"&#125;'</pre>
                <div class="mini__row" aria-hidden="true">
                  <span class="mini__dot"></span>
                  <span class="font-mono mini__deployed">Deployed: acme/web</span>
                  <span class="mini__when">now</span>
                </div>
              </div>
            </section>

            <section class="flow__step" [inert]="step() !== 2">
              <h2 class="flow__title">Logs, alerts, and glass</h2>
              <p class="flow__sub flow__sub--start">
                Live logs stream in, deploys land in Activity, and the whole thing wears Liquid
                Glass.
              </p>
              <div class="mini mini--logs" aria-hidden="true">
                <div class="mini__row font-mono">
                  <span class="mini__time">16:12:44</span>
                  <span>GET / 200</span>
                </div>
                <div class="mini__row mini__row--err font-mono">
                  <span class="mini__time">16:12:45</span>
                  <span>open() failed</span>
                </div>
                <div class="mini__dock">
                  <span class="mini__tab mini__tab--on">Home</span>
                  <span class="mini__tab">Search</span>
                  <span class="mini__tab">Activity</span>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div class="flow__footer">
          <p class="sr-only" aria-live="polite">Step {{ step() + 1 }} of {{ steps.length }}</p>
          <div class="flow__dots" aria-hidden="true">
            @for (dot of steps; track dot) {
              <span class="flow__dot" [class.flow__dot--active]="dot === step()"></span>
            }
          </div>

          <ion-button expand="block" class="cta" (click)="next()">
            {{ step() === last ? 'Sign in' : 'Continue' }}
          </ion-button>
          <!-- Hidden, not removed: the footer must never change height mid-swipe. -->
          <button
            type="button"
            class="flow__ghost"
            [class.flow__ghost--hidden]="step() !== last"
            [attr.aria-hidden]="step() === last ? null : true"
            [tabindex]="step() === last ? null : -1"
            (click)="changeServer()"
          >
            Use a different server
          </button>
        </div>
      </div>
    </ion-content>
  `,
  styles: `
    .flow {
      display: flex;
      block-size: 100%;
      max-inline-size: 24rem;
      flex-direction: column;
      margin-inline: auto;
      /* The board's 96pt top = a 54pt status bar + 42; the footer ends on the home indicator. */
      padding-block: calc(max(2rem, env(safe-area-inset-top)) + 1.75rem)
        max(1.5rem, env(safe-area-inset-bottom));
      overflow: hidden;
    }

    .flow__hero {
      position: relative;
      z-index: 1;
      transform-origin: 50% 0;
      pointer-events: none;
      will-change: transform;
    }

    .flow__hero-content {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    /* -7rem: the height the shrunk hero gives back (half of 14rem). */
    .flow__viewport {
      flex: 1;
      min-block-size: 0;
      margin-block-start: -7rem;
      overflow: hidden;
      touch-action: pan-y;
    }

    @media (max-height: 43.75rem) {
      .flow__viewport {
        margin-block-start: -6rem;
      }
    }

    /* Explicit viewport sizing avoids a min-width:auto flex-basis feedback loop. */
    .flow__track {
      display: flex;
      inline-size: 100%;
      block-size: 100%;
      will-change: transform;
    }

    .flow__step {
      display: flex;
      flex: 0 0 100%;
      flex-direction: column;
      gap: 0.75rem;
      padding: 1.75rem 1.5rem 0;
    }

    .flow__tagline {
      position: absolute;
      inset-block-start: calc(100% + 0.375rem);
      inset-inline: 1.5rem;
      display: grid;
      gap: 0.875rem;
      text-align: center;
    }

    .flow__tagline--hidden {
      visibility: hidden;
      opacity: 0;
    }

    .flow__title {
      margin: 0;
      font-size: 1.875rem;
      font-weight: 800;
      line-height: 2.1875rem;
      letter-spacing: -0.02em;
      color: var(--app-text-primary);
      text-wrap: balance;
    }

    .flow__title--hero {
      font-size: 2.25rem;
      line-height: 2.5625rem;
    }

    .flow__sub {
      margin: 0;
      font-size: 1.0625rem;
      line-height: 1.5rem;
      color: var(--app-text-secondary);
      text-wrap: pretty;
    }

    .flow__tagline .flow__sub {
      max-inline-size: 19.375rem;
    }

    .flow__tagline .flow__sub {
      margin-inline: auto;
    }

    .flow__sub--start {
      margin-block-end: 0.375rem;
    }

    .mini {
      margin-block-start: 0.75rem;
      border-radius: 1.5rem;
      overflow: hidden;
      background: var(--app-background-base);
    }

    .mini__code {
      margin: 0;
      padding: 1rem 1.125rem;
      background: var(--app-code-bg);
      font-family: var(--app-font-mono);
      font-size: 0.75rem;
      line-height: 1.1875rem;
      color: var(--app-text-secondary);
      white-space: pre-wrap;
    }

    .mini__row {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      min-block-size: 3.25rem;
      padding-inline: 1.125rem;
    }

    .mini__dot {
      inline-size: 0.5rem;
      block-size: 0.5rem;
      flex: none;
      border-radius: 999px;
      background: var(--app-status-positive);
    }

    .mini__deployed {
      flex: 1;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .mini__when {
      font-size: 0.8125rem;
      color: var(--app-text-tertiary);
    }

    .mini--logs {
      position: relative;
      block-size: 11rem;
      padding-block-start: 0.625rem;
      font-size: 0.8125rem;
    }

    .mini--logs .mini__row {
      gap: 0.75rem;
      min-block-size: 0;
      padding-block: 0.375rem;
    }

    .mini__row--err {
      background: var(--app-status-negative-pale);
    }

    .mini__time {
      color: var(--app-text-tertiary);
    }

    .mini__dock {
      position: absolute;
      inset-block-end: 1rem;
      inset-inline-start: 50%;
      display: flex;
      gap: 0.125rem;
      translate: -50% 0;
      border-radius: 1.375rem;
      padding: 0.25rem;
      background: var(--app-sheet);
      box-shadow:
        0 0 0 0.5px rgba(15, 23, 42, 0.1),
        0 8px 24px rgba(15, 23, 42, 0.1);
      font-size: 0.75rem;
      font-weight: 600;
    }

    .mini__tab {
      border-radius: 1.125rem;
      padding: 0.5rem 0.875rem;
    }

    .mini__tab--on {
      background: rgba(120, 120, 128, 0.16);
      color: var(--ion-color-primary);
    }

    .flow__footer {
      display: grid;
      gap: 0.5rem;
      padding-inline: 1.5rem;
    }

    .flow__dots {
      display: flex;
      justify-content: center;
      gap: 0.375rem;
      padding-block: 0.5rem;
    }

    .flow__dot {
      inline-size: 0.4375rem;
      block-size: 0.4375rem;
      border-radius: 999px;
      background: rgba(120, 120, 128, 0.22);
      transition:
        inline-size var(--app-duration),
        background-color var(--app-duration);
    }

    .flow__dot--active {
      inline-size: 1.375rem;
      background: var(--ion-color-primary);
    }

    .flow__ghost {
      min-block-size: 2.75rem;
      margin: 0;
      border: 0;
      padding: 0 1rem;
      background: none;
      font: inherit;
      font-size: 0.9375rem;
      font-weight: 500;
      color: var(--ion-color-primary);
      cursor: pointer;
      transition: opacity var(--app-duration);
    }

    .flow__ghost--hidden {
      visibility: hidden;
      opacity: 0;
      pointer-events: none;
    }
  `,
})
export class WelcomePage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly server = inject(ChangeServerService);
  private readonly welcome = inject(WelcomeSeenStore);
  private readonly tokens = inject(AuthTokenStore);
  private readonly nav = inject(NavController);

  private readonly hero = viewChild.required<ElementRef<HTMLElement>>('hero');
  private readonly tagline = viewChild.required<ElementRef<HTMLElement>>('tagline');
  private readonly viewport = viewChild.required<ElementRef<HTMLElement>>('viewport');
  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');

  protected readonly steps = STEPS;
  protected readonly last = LAST;

  private readonly params = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  protected readonly step = computed(() => {
    const raw = Number(this.params().get('step') ?? 0);
    return Number.isInteger(raw) ? Math.min(Math.max(raw, 0), LAST) : 0;
  });

  private ready = false;
  private width = 0;
  private shrunk = false;

  private dragging = false;
  private dragMoved = false;
  private pointerId: number | null = null;
  private startX = 0;
  private lastX = 0;
  private lastAt = 0;
  private velocity = 0;
  private quickX: ((value: number) => gsap.core.Tween) | null = null;

  constructor() {
    const destroyRef = inject(DestroyRef);

    effect(() => {
      const step = this.step();
      if (!this.ready) {
        return;
      }
      this.settle(step);
      this.setHero(step > 0);
    });

    afterNextRender(() => {
      const viewport = this.viewport().nativeElement;
      const observer = new ResizeObserver(() => this.layout());
      observer.observe(viewport);
      this.layout();
      this.ready = true;

      const onMove = (event: PointerEvent) => this.onMove(event);
      viewport.addEventListener('pointermove', onMove);

      destroyRef.onDestroy(() => {
        viewport.removeEventListener('pointermove', onMove);
        observer.disconnect();
      });
    });
  }

  protected next(): void {
    if (this.step() < LAST) {
      this.go(this.step() + 1);
      return;
    }
    this.welcome.markSeen();
    void this.nav.navigateRoot('/login');
  }

  protected changeServer(): void {
    /* A leftover token belongs to the previous server. */
    this.server.open().subscribe((changed) => {
      if (changed) this.tokens.clear();
    });
  }

  // Through the URL, so back, forward and deep links address each step.
  private go(step: number): void {
    const target = Math.min(Math.max(step, 0), LAST);
    if (target === this.step()) {
      this.settle(target);
      return;
    }
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { step: target === 0 ? null : target },
      queryParamsHandling: 'merge',
    });
  }

  private layout(): void {
    this.width = this.viewport().nativeElement.clientWidth;
    gsap.set(this.track().nativeElement, { x: -this.step() * this.width });

    this.shrunk = this.step() > 0;
    const hero = this.hero().nativeElement;
    gsap.set(hero, this.heroVars(this.shrunk));
    gsap.set(this.tagline().nativeElement, { autoAlpha: this.shrunk ? 0 : 1 });
  }

  private heroVars(shrunk: boolean): gsap.TweenVars {
    const half = this.hero().nativeElement.offsetWidth / 2;
    return shrunk
      ? { scale: HERO_SCALE, x: HERO_INSET - half, y: 0 }
      : { scale: 1, x: 0, y: HERO_DROP };
  }

  private settle(step: number): void {
    const x = -step * this.width;
    if (!reduced()) {
      gsap.to(this.track().nativeElement, {
        x,
        duration: 0.55,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    } else {
      gsap.set(this.track().nativeElement, { x });
    }
  }

  private setHero(shrunk: boolean): void {
    if (shrunk === this.shrunk) {
      return;
    }
    this.shrunk = shrunk;

    const hero = this.hero().nativeElement;
    const tagline = this.tagline().nativeElement;
    const heroVars = this.heroVars(shrunk);
    const taglineVars = { autoAlpha: shrunk ? 0 : 1 };

    if (!reduced()) {
      gsap.to(hero, { ...heroVars, duration: 0.55, ease: 'power3.inOut', overwrite: 'auto' });
      gsap.to(tagline, {
        ...taglineVars,
        duration: 0.25,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    } else {
      gsap.set(hero, heroVars);
      gsap.set(tagline, taglineVars);
    }
  }

  protected onDown(event: PointerEvent): void {
    if ((event.target as HTMLElement).closest('input, textarea, button, a')) {
      return;
    }

    this.pointerId = event.pointerId;
    this.startX = event.clientX;
    this.lastX = event.clientX;
    this.lastAt = event.timeStamp;
    this.velocity = 0;
    this.dragging = true;
    this.dragMoved = false;
    // Capture can race with release; dragging still works without it.
    try {
      this.viewport().nativeElement.setPointerCapture(event.pointerId);
    } catch {
      /* empty */
    }
    // GSAP cannot reuse a quickTo tween after settle overwrites it.
    this.quickX = gsap.quickTo(this.track().nativeElement, 'x', { duration: 0.12, ease: 'power2' });
  }

  private onMove(event: PointerEvent): void {
    if (!this.dragging || event.pointerId !== this.pointerId) {
      return;
    }

    const dx = event.clientX - this.startX;
    if (!this.dragMoved && Math.abs(dx) < 8) {
      return;
    }
    this.dragMoved = true;

    const elapsed = event.timeStamp - this.lastAt;
    if (elapsed > 0) {
      this.velocity = (event.clientX - this.lastX) / elapsed;
      this.lastX = event.clientX;
      this.lastAt = event.timeStamp;
    }

    let x = -this.step() * this.width + dx;
    const min = -LAST * this.width;
    if (x > 0) {
      x = Math.min(x / 3, 48);
    } else if (x < min) {
      x = min + Math.max((x - min) / 3, -48);
    }

    if (!reduced() && this.quickX) {
      this.quickX(x);
    } else {
      gsap.set(this.track().nativeElement, { x });
    }
  }

  protected onUp(event: PointerEvent): void {
    if (!this.dragging || event.pointerId !== this.pointerId) {
      return;
    }
    this.dragging = false;
    this.pointerId = null;

    if (!this.dragMoved) {
      return;
    }

    const dx = event.clientX - this.startX;
    const step = this.step();

    if ((dx < -this.width / 4 || (this.velocity < -FLICK && dx < -24)) && step < LAST) {
      this.go(step + 1);
    } else if ((dx > this.width / 4 || (this.velocity > FLICK && dx > 24)) && step > 0) {
      this.go(step - 1);
    } else {
      this.settle(step);
    }
  }
}
