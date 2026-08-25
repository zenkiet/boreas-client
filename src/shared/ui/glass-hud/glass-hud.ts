import { DOCUMENT } from '@angular/common';
import {
  ApplicationRef,
  Component,
  createComponent,
  EnvironmentInjector,
  inject,
  Service,
  signal,
} from '@angular/core';
import { defer, finalize, Observable, tap } from 'rxjs';

/* Long enough to read the confirmation, short enough to never feel like a dialog. */
const DONE_MS = 1200;

@Component({
  selector: 'app-glass-hud',
  host: {
    role: 'status',
    '[class.shown]': 'visible()',
  },
  template: `
    @if (state() === 'working') {
      <span class="spinner" aria-hidden="true">
        <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
      </span>
    } @else {
      <span class="check" aria-hidden="true">✓</span>
    }
    <span>{{ label() }}</span>
  `,
  styles: `
    :host {
      position: fixed;
      inset-block-start: max(0.75rem, env(safe-area-inset-top));
      inset-inline-start: 50%;
      /* Above Taiga dialogs and the dock; the capsule is transient status, never chrome. */
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 0.55rem;
      padding: 0.5rem 1rem;
      border-radius: 999px;
      background: var(--app-chrome-bg);
      -webkit-backdrop-filter: var(--app-edge-filter);
      backdrop-filter: var(--app-edge-filter);
      box-shadow:
        inset 0 1px 0 var(--app-glass-bevel),
        0 10px 30px rgba(0, 0, 0, 0.2);
      color: var(--tui-text-primary);
      font-size: 0.875rem;
      font-weight: 550;
      white-space: nowrap;
      transform: translate(-50%, -150%);
      opacity: 0;
      pointer-events: none;
      transition:
        transform var(--tui-duration) var(--tui-curve-expressive-standard),
        opacity var(--tui-duration);
    }

    :host(.shown) {
      transform: translate(-50%, 0);
      opacity: 1;
    }

    .check {
      color: var(--tui-status-positive);
      font-weight: 700;
    }

    .spinner {
      position: relative;
      inline-size: 1rem;
      block-size: 1rem;
    }

    .spinner i {
      position: absolute;
      inset-inline-start: 46.5%;
      inset-block-start: 8%;
      inline-size: 7%;
      block-size: 26%;
      border-radius: 999px;
      background: var(--tui-text-secondary);
      transform-origin: 50% 162%;
      animation: blade 0.8s linear infinite;
    }

    .spinner i:nth-child(1) { transform: rotate(0deg);   animation-delay: -0.8s; }
    .spinner i:nth-child(2) { transform: rotate(45deg);  animation-delay: -0.7s; }
    .spinner i:nth-child(3) { transform: rotate(90deg);  animation-delay: -0.6s; }
    .spinner i:nth-child(4) { transform: rotate(135deg); animation-delay: -0.5s; }
    .spinner i:nth-child(5) { transform: rotate(180deg); animation-delay: -0.4s; }
    .spinner i:nth-child(6) { transform: rotate(225deg); animation-delay: -0.3s; }
    .spinner i:nth-child(7) { transform: rotate(270deg); animation-delay: -0.2s; }
    .spinner i:nth-child(8) { transform: rotate(315deg); animation-delay: -0.1s; }

    @keyframes blade {
      from { opacity: 1; }
      to { opacity: 0.15; }
    }

    @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
      :host {
        background: var(--tui-background-base);
        box-shadow:
          inset 0 0 0 1px var(--tui-border-normal),
          0 10px 30px rgba(0, 0, 0, 0.2);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      :host {
        transform: translate(-50%, 0);
        transition: opacity var(--tui-duration);
      }
    }
  `,
})
export class GlassHudOverlay {
  readonly label = signal('');
  readonly state = signal<'working' | 'done'>('working');
  readonly visible = signal(false);
}

/** App-wide Liquid Glass progress capsule: hud.track(source, 'Enabling…', 'Done'). */
@Service()
export class GlassHud {
  private readonly appRef = inject(ApplicationRef);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly document = inject(DOCUMENT);

  private overlay: GlassHudOverlay | undefined;
  /* A newer track() owns the capsule; stale completions must not touch it. */
  private generation = 0;
  private hideTimer: number | undefined;

  /** Completion shows the done label (empty hides silently); error or unsubscribe hides at once. */
  track<T>(source: Observable<T>, working: string, done = ''): Observable<T> {
    return defer(() => {
      const id = ++this.generation;
      this.show(working);
      let completed = false;

      return source.pipe(
        tap({ complete: () => (completed = true) }),
        finalize(() => (completed ? this.settle(id, done) : this.hide(id))),
      );
    });
  }

  private show(label: string): void {
    const view = this.document.defaultView;
    view?.clearTimeout(this.hideTimer);

    const hud = (this.overlay ??= this.create());
    hud.state.set('working');
    hud.label.set(label);
    /* Next frame, so even the first show enters with the drop transition. */
    view?.requestAnimationFrame(() => hud.visible.set(true));
  }

  private settle(id: number, done: string): void {
    if (id !== this.generation || !this.overlay) {
      return;
    }
    if (!done) {
      this.overlay.visible.set(false);
      return;
    }
    this.overlay.state.set('done');
    this.overlay.label.set(done);
    this.hideTimer = this.document.defaultView?.setTimeout(() => {
      if (id === this.generation) {
        this.overlay?.visible.set(false);
      }
    }, DONE_MS);
  }

  private hide(id: number): void {
    if (id === this.generation) {
      this.overlay?.visible.set(false);
    }
  }

  private create(): GlassHudOverlay {
    const ref = createComponent(GlassHudOverlay, {
      environmentInjector: this.environmentInjector,
    });
    this.appRef.attachView(ref.hostView);
    this.document.body.appendChild(ref.location.nativeElement as HTMLElement);

    return ref.instance;
  }
}
