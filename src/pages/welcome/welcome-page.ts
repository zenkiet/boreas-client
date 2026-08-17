import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormField, form, pattern, required, submit } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { TuiResponsiveDialogService } from '@taiga-ui/addon-mobile';
import { TuiError, TuiIcon, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { gsap } from 'gsap';
import { EMPTY, defaultIfEmpty, switchMap } from 'rxjs';

import { ConnectFailedDialog, ConnectServerStore } from '@features/connect-server';
import { OnboardingHero } from '@features/onboarding';
import { Reveal } from '@shared/lib/motion/reveal.directive';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';

const URL_PATTERN = /^https?:\/\/\S+$/i;
const STEPS = [0, 1, 2] as const;
const LAST = STEPS.length - 1;
const HERO_SCALE = 0.6;
// A fast flick advances before the distance threshold is reached, measured in px/ms.
const FLICK = 0.5;

const FEATURES = [
  {
    icon: '@tui.play',
    title: 'Lifecycle control',
    detail: 'Start, stop, restart and delete environments.',
  },
  {
    icon: '@tui.terminal',
    title: 'Live logs',
    detail: 'Stream, filter and download container output.',
  },
  {
    icon: '@tui.file-text',
    title: 'Environment as .env',
    detail: 'Paste or import a file, apply with a recreate.',
  },
] as const;

@Component({
  selector: 'app-welcome-page',
  imports: [
    FormField,
    InsetGroup,
    OnboardingHero,
    Reveal,
    TuiError,
    TuiIcon,
    TuiLoader,
    TuiTextfield,
  ],
  providers: [ConnectServerStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flow">
      <div #hero class="flow__hero">
        <div appReveal class="flow__hero-content">
          <app-onboarding-hero />
          <h1 class="flow__brand">Boreas</h1>
        </div>
        <p
          #tagline
          class="flow__tagline"
          [class.flow__tagline--hidden]="step() !== 0"
          [attr.aria-hidden]="step() === 0 ? null : true"
        >
          Spin up isolated Docker environments, each with its own proxy URL.
        </p>
      </div>

      <div
        #viewport
        class="flow__viewport"
        (pointerdown)="onDown($event)"
        (pointermove)="onMove($event)"
        (pointerup)="onUp($event)"
        (pointercancel)="onUp($event)"
      >
        <div #track class="flow__track">
          <section class="flow__step" [inert]="step() !== 0"></section>

          <section class="flow__step" [inert]="step() !== 1">
            <h2 class="flow__title">Run it all from one place</h2>
            <app-inset-group>
              @for (feature of features; track feature.title) {
                <div class="flow__row row-divider relative">
                  <tui-icon class="flow__icon icon-sm" [icon]="feature.icon" aria-hidden="true" />
                  <div class="min-w-0">
                    <div class="flow__name">{{ feature.title }}</div>
                    <div class="flow__detail">{{ feature.detail }}</div>
                  </div>
                </div>
              }
            </app-inset-group>
          </section>

          <section class="flow__step" [inert]="step() !== 2">
            <form #connectForm id="connect-form" novalidate (submit)="onSubmit($event)">
              <h2 class="flow__title">Connect to your server</h2>
              <p class="flow__hint">Where is the Boreas API running?</p>

              <div class="grid gap-1.5">
                <label class="flow__label" for="server-url">Server address</label>
                <tui-textfield tuiTextfieldSize="m" [tuiTextfieldCleaner]="false">
                  <input
                    #address
                    tuiInput
                    id="server-url"
                    type="url"
                    autocomplete="url"
                    spellcheck="false"
                    class="font-mono!"
                    placeholder="http://127.0.0.1:8080"
                    [formField]="draft.url"
                  />
                </tui-textfield>
                <tui-error [error]="urlError()" />
              </div>
            </form>
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

        <button
          type="button"
          class="glass-button glass-button--pill"
          [disabled]="connection.checking()"
          (click)="next()"
        >
          @if (step() === 2 && connection.checking()) {
            <tui-loader size="s" [inheritColor]="true" />
            Checking
          } @else {
            {{ step() === 2 ? 'Connect' : 'Continue' }}
          }
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

    .flow__brand {
      margin: 0;
      font-size: 2.125rem;
      font-weight: 700;
      letter-spacing: -0.025em;
      color: var(--tui-text-primary);
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
      inset-block-start: calc(100% + 0.75rem);
      inset-inline: 1.5rem;
      margin: 0;
      max-inline-size: 16rem;
      margin-inline: auto;
      font-size: 1.0625rem;
      line-height: 1.55;
      text-align: center;
      color: var(--tui-text-secondary);
    }

    .flow__tagline--hidden {
      visibility: hidden;
      opacity: 0;
    }

    .flow__title {
      margin: 0;
      font-size: 1.375rem;
      font-weight: 700;
      line-height: 1.25;
      letter-spacing: -0.02em;
      color: var(--tui-text-primary);
    }

    .flow__hint {
      margin: -0.375rem 0 0;
      font-size: 0.9375rem;
      color: var(--tui-text-secondary);
    }

    .flow__label {
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--tui-text-tertiary);
      padding-inline-start: 0.25rem;
    }

    #connect-form {
      display: grid;
      gap: 1rem;
    }

    .flow__row {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.75rem 0.875rem;
    }

    .flow__icon {
      margin-block-start: 0.125rem;
      color: var(--tui-text-action);
    }

    .flow__name {
      font-size: 1.0625rem;
      font-weight: 600;
      color: var(--tui-text-primary);
    }

    .flow__detail {
      font-size: 0.9375rem;
      line-height: 1.5;
      color: var(--tui-text-tertiary);
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

    .glass-button[disabled] {
      opacity: 0.6;
      pointer-events: none;
    }
  `,
})
export class WelcomePage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialogs = inject(TuiResponsiveDialogService);
  protected readonly connection = inject(ConnectServerStore);

  private readonly hero = viewChild.required<ElementRef<HTMLElement>>('hero');
  private readonly tagline = viewChild.required<ElementRef<HTMLElement>>('tagline');
  private readonly viewport = viewChild.required<ElementRef<HTMLElement>>('viewport');
  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');
  private readonly connectForm = viewChild<ElementRef<HTMLFormElement>>('connectForm');
  private readonly address = viewChild<ElementRef<HTMLInputElement>>('address');

  protected readonly steps = STEPS;
  protected readonly features = FEATURES;

  private readonly params = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  protected readonly step = computed(() => {
    const raw = Number(this.params().get('step') ?? 0);
    return Number.isInteger(raw) ? Math.min(Math.max(raw, 0), LAST) : 0;
  });

  private readonly model = signal({ url: this.connection.suggestedUrl() });

  protected readonly draft = form(this.model, (path) => {
    required(path.url, { message: 'Server address is required.' });
    pattern(path.url, URL_PATTERN, { message: 'Use a full http:// or https:// address.' });
  });

  protected readonly urlError = computed(() => {
    const field = this.draft.url();
    if (!field.touched()) return null;
    return field.errors()[0]?.message ?? null;
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

      const observer = new ResizeObserver(() => this.layout());
      observer.observe(this.viewport().nativeElement);
      this.layout();
      this.ready = true;

      destroyRef.onDestroy(() => {
        observer.disconnect();
        media.revert();
      });
    });
  }

  protected next(): void {
    if (this.step() === LAST) {
      this.connectForm()?.nativeElement.requestSubmit();
      return;
    }
    this.go(this.step() + 1);
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

  protected onMove(event: PointerEvent): void {
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

  protected onSubmit(event: Event): void {
    event.preventDefault();
    // Signal Forms requires an async submit action; connect remains Observable-driven.
    void submit(this.draft, async () => this.connect());
  }

  private connect(): void {
    this.connection
      .connect(this.model().url.trim())
      .pipe(
        switchMap((connected) => {
          if (connected) {
            /* The API is token-guarded; sign-in is the step after a reachable server. */
            void this.router.navigate(['/login']);
            return EMPTY;
          }

          return this.dialogs
            .open<void>(new PolymorpheusComponent(ConnectFailedDialog), {
              label: "Couldn't reach the server",
              size: 's',
              dismissible: true,
            })
            .pipe(defaultIfEmpty(undefined));
        }),
      )
      .subscribe(() => this.address()?.nativeElement.focus());
  }
}
