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
import { TuiResponsiveDialogService } from '@taiga-ui/addon-mobile';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { gsap } from 'gsap';

import { ChangeServerSheet } from '@features/connect-server';
import { OnboardingHero } from '@features/onboarding';
import { AuthTokenStore } from '@shared/api/auth-token.store';
import { WelcomeSeenStore } from '@shared/api/welcome-seen.store';
import { ServerConfigStore } from '@shared/config/server-config.store';
import { Reveal } from '@shared/lib/motion/reveal.directive';

const STEPS = [0, 1, 2] as const;
const LAST = STEPS.length - 1;
const HERO_SCALE = 0.6;
// A fast flick advances before the distance threshold is reached, measured in px/ms.
const FLICK = 0.5;

@Component({
  selector: 'app-welcome-page',
  imports: [OnboardingHero, Reveal],
  template: `
    <div class="flow">
      <div #hero class="flow__hero">
        <div appReveal class="flow__hero-content">
          <app-onboarding-hero />
        </div>
        <div
          #tagline
          class="flow__tagline"
          [class.flow__tagline--hidden]="step() !== 0"
          [attr.aria-hidden]="step() === 0 ? null : true"
        >
          <h1 class="flow__title flow__title--hero">Every branch,<br />its own URL.</h1>
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
            <h2 class="flow__title">Deploy from CI,<br />not from a laptop</h2>
            <p class="flow__sub flow__sub--start">
              One API token, one call. The exact image your pipeline built is the one that runs.
            </p>
            <div class="mini">
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
            <h2 class="flow__title">Logs, alerts,<br />and glass</h2>
            <p class="flow__sub flow__sub--start">
              Live logs stream in, deploys land in Alerts, and the whole thing wears Liquid Glass.
            </p>
            <div class="mini mini--lit" aria-hidden="true">
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
                <span class="mini__tab">Alerts</span>
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

        <button type="button" class="glass-button glass-button--pill" (click)="next()">
          {{ step() === last ? 'Sign in' : 'Continue' }}
        </button>
        <!-- Hidden (not removed) off the last step so the footer never changes height mid-swipe. -->
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
  `,
  styles: `
    .flow {
      display: flex;
      min-block-size: 100dvh;
      max-inline-size: 24rem;
      flex-direction: column;
      margin-inline: auto;
      padding-block: max(2rem, env(safe-area-inset-top)) calc(1.5rem + env(safe-area-inset-bottom));
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

    .flow__viewport {
      flex: 1;
      min-block-size: 0;
      overflow: hidden;
      touch-action: pan-y;
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
      justify-content: center;
      gap: 0.75rem;
      padding-inline: 1.5rem;
    }

    .flow__tagline {
      position: absolute;
      inset-block-start: calc(100% - 0.25rem);
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
      font-size: 1.375rem;
      font-weight: 700;
      line-height: 1.2;
      letter-spacing: -0.02em;
      color: var(--tui-text-primary);
    }

    .flow__title--hero {
      font-size: 2rem;
      letter-spacing: -0.03em;
    }

    .flow__sub {
      margin: 0;
      max-inline-size: 17.5rem;
      font-size: 0.9375rem;
      line-height: 1.55;
      color: var(--tui-text-secondary);
    }

    .flow__tagline .flow__sub {
      margin-inline: auto;
    }

    .flow__sub--start {
      margin-block-end: 0.375rem;
    }

    /* Miniature of the real product: a terminal call and the alert row it produces. */
    .mini {
      display: grid;
      gap: 0.5rem;
      border-radius: 1.125rem;
      padding: 0.875rem;
      background: var(--tui-background-neutral-1);
    }

    .mini--lit {
      background:
        radial-gradient(circle at 30% 15%, var(--app-accent-soft), transparent 65%),
        var(--tui-background-neutral-1);
    }

    .mini__code {
      margin: 0;
      overflow-x: auto;
      scrollbar-width: none;
      border-radius: 0.625rem;
      padding: 0.625rem 0.75rem;
      /* A terminal stays dark in both themes. */
      background: #131316;
      font-family: var(--tui-font-text-mono, monospace);
      font-size: 0.6875rem;
      line-height: 1.6;
      color: #c2c6cf;
    }

    .mini__row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding-inline: 0.25rem;
      font-size: 0.75rem;
      color: var(--tui-text-primary);
    }

    .mini__row--err {
      border-radius: 0.5rem;
      padding-block: 0.125rem;
      background: var(--tui-status-negative-pale);
      color: var(--tui-text-negative);
    }

    .mini__dot {
      inline-size: 0.5rem;
      block-size: 0.5rem;
      flex: none;
      border-radius: 999px;
      background: var(--tui-status-positive);
    }

    .mini__deployed {
      font-size: 0.75rem;
      font-weight: 600;
    }

    .mini__when {
      margin-inline-start: auto;
      font-size: 0.6875rem;
      color: var(--tui-text-tertiary);
    }

    .mini__time {
      color: var(--tui-text-tertiary);
    }

    .mini__dock {
      display: flex;
      justify-content: center;
      gap: 0.25rem;
      margin-block-start: 0.25rem;
      border-radius: 999px;
      padding: 0.25rem;
      background: var(--app-glass-lens, var(--tui-background-neutral-1));
      backdrop-filter: var(--app-segment-filter);
    }

    .mini__tab {
      border-radius: 999px;
      padding: 0.3125rem 0.75rem;
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--tui-text-secondary);
    }

    .mini__tab--on {
      background: var(--app-segment-thumb-fill);
      color: var(--tui-text-primary);
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
      inline-size: 0.3125rem;
      block-size: 0.3125rem;
      border-radius: 999px;
      background: var(--tui-background-neutral-2);
      transition:
        inline-size var(--tui-duration),
        background-color var(--tui-duration);
    }

    .flow__dot--active {
      inline-size: 0.875rem;
      background: var(--tui-text-action);
    }

    .flow__ghost {
      margin: 0;
      border: 0;
      padding: 0.5rem;
      background: none;
      font: inherit;
      font-size: 0.9375rem;
      font-weight: 500;
      color: var(--tui-text-secondary);
      cursor: pointer;
      transition: opacity var(--tui-duration);
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
  private readonly dialogs = inject(TuiResponsiveDialogService);
  private readonly welcome = inject(WelcomeSeenStore);
  private readonly tokens = inject(AuthTokenStore);
  private readonly config = inject(ServerConfigStore);

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

  private motion = false;
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
      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        this.motion = true;
        return () => {
          this.motion = false;
        };
      });

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
        media.revert();
      });
    });
  }

  protected next(): void {
    if (this.step() < LAST) {
      this.go(this.step() + 1);
      return;
    }
    /* The flag is what keeps the tour from ever coming back on this device. */
    this.welcome.markSeen();
    void this.router.navigate(['/login']);
  }

  protected changeServer(): void {
    const before = this.config.baseUrl();
    this.dialogs
      .open<string>(new PolymorpheusComponent(ChangeServerSheet), { label: 'Change server' })
      .subscribe((url) => {
        /* A leftover token belongs to the previous server. */
        if (url !== before) {
          this.tokens.clear();
        }
      });
  }

  // Query state lets back, forward, and deep links address each onboarding step.
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
    gsap.set(hero, { scale: this.shrunk ? HERO_SCALE : 1, y: this.shrunk ? 0 : this.heroY() });
    gsap.set(this.tagline().nativeElement, { autoAlpha: this.shrunk ? 0 : 1 });
  }

  private heroY(): number {
    return this.viewport().nativeElement.offsetHeight / 2;
  }

  private settle(step: number): void {
    const x = -step * this.width;
    if (this.motion) {
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
    const heroVars = { scale: shrunk ? HERO_SCALE : 1, y: shrunk ? 0 : this.heroY() };
    const taglineVars = { autoAlpha: shrunk ? 0 : 1 };

    if (this.motion) {
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
    // Interactive controls must not initiate track dragging.
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
    // Pointer capture can race with release; dragging still degrades safely without it.
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

    if (this.motion && this.quickX) {
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
