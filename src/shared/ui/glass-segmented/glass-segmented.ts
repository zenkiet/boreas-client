import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  input,
  model,
  viewChild,
} from '@angular/core';
import { TuiIcon } from '@taiga-ui/core';
import { gsap } from 'gsap';

export interface GlassSegmentedItem {
  readonly label: string;
  readonly icon?: string;
  readonly dot?: boolean;
  readonly dotLabel?: string;
}

@Component({
  selector: 'app-glass-segmented',
  imports: [TuiIcon],
  host: {
    role: 'tablist',
    '[class.stacked]': 'stacked()',
    '(keydown.arrowRight)': 'step(1)',
    '(keydown.arrowLeft)': 'step(-1)',
  },
  template: `
    <div #thumb class="thumb" aria-hidden="true"></div>
    @for (item of items(); track $index; let i = $index) {
      <button
        type="button"
        role="tab"
        class="segment"
        [attr.aria-selected]="i === activeIndex()"
        [class.segment--active]="i === activeIndex()"
        (click)="onSegmentClick(i)"
        (pointerdown)="onPointerDown($event)"
        (pointerup)="onPointerUp($event)"
        (pointercancel)="onPointerUp($event)"
      >
        @if (item.icon) {
          <tui-icon class="segment__icon" [icon]="item.icon" />
        }
        <span class="segment__label">{{ item.label }}</span>
        @if (item.dot) {
          <span class="dot" [attr.aria-label]="item.dotLabel ?? 'Unsaved changes'"></span>
        }
      </button>
    }
  `,
  styles: `
    :host {
      position: relative;
      display: flex;
      align-items: stretch;
      block-size: 2.75rem;
      padding: 0.1875rem;
      border-radius: 999px;
      background: var(--app-chrome-bg);
      -webkit-backdrop-filter: var(--app-chrome-filter);
      backdrop-filter: var(--app-chrome-filter);
      box-shadow:
        0 0.5rem 2rem rgba(0, 0, 0, 0.09),
        inset 0 0 0.75rem var(--app-chrome-glow);
      /* Preserve vertical page scrolling while claiming horizontal thumb drags. */
      touch-action: pan-y;
    }

    :host::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      padding: 1px;
      background: var(--app-chrome-bevel);
      pointer-events: none;
      -webkit-mask-image: linear-gradient(#000 0 0), linear-gradient(#000 0 0);
      mask-image: linear-gradient(#000 0 0), linear-gradient(#000 0 0);
      -webkit-mask-origin: content-box, border-box;
      mask-origin: content-box, border-box;
      -webkit-mask-clip: content-box, border-box;
      mask-clip: content-box, border-box;
      -webkit-mask-composite: xor;
      mask-composite: exclude;
    }

    .thumb {
      position: absolute;
      inset-block: 0.1875rem;
      inset-inline-start: 0;
      border-radius: 999px;
      background: var(--app-segment-thumb);
      box-shadow: var(--app-segment-thumb-shadow);
      will-change: transform;
    }

    .segment {
      position: relative;
      z-index: 1;
      display: inline-flex;
      flex: 1;
      align-items: center;
      justify-content: center;
      gap: 0.375rem;
      min-inline-size: 0;
      margin: 0;
      border: 0;
      padding: 0 0.75rem;
      background: none;
      border-radius: 999px;
      font: inherit;
      font-size: 0.9375rem;
      font-weight: 500;
      white-space: nowrap;
      color: var(--tui-text-secondary);
      cursor: pointer;
      transition: color var(--tui-duration);
    }

    .segment--active {
      color: var(--tui-text-primary);
      font-weight: 600;
    }

    .segment:focus-visible {
      outline: 2px solid var(--tui-border-focus);
      outline-offset: -2px;
    }

    .segment__icon {
      inline-size: 1rem;
      block-size: 1rem;
      font-size: 1rem;
      flex: none;
    }

    .dot {
      inline-size: 0.375rem;
      block-size: 0.375rem;
      flex: none;
      border-radius: 999px;
      background: var(--tui-background-accent-1);
    }

    :host(.stacked) {
      block-size: 3.625rem;
    }

    :host(.stacked) .segment {
      flex-direction: column;
      gap: 0.1875rem;
      padding: 0 0.5rem;
    }

    :host(.stacked) .segment__icon {
      inline-size: 1.375rem;
      block-size: 1.375rem;
      font-size: 1.375rem;
    }

    :host(.stacked) .segment__label {
      font-size: 0.625rem;
      font-weight: 500;
      letter-spacing: 0.01em;
    }
  `,
})
export class GlassSegmented {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly thumb = viewChild.required<ElementRef<HTMLElement>>('thumb');

  readonly items = input.required<readonly GlassSegmentedItem[]>();
  readonly activeIndex = model.required<number>();
  readonly stacked = input(false);

  private motion = false;
  private itemWidth = 0;
  private quickX: ((value: number) => gsap.core.Tween) | null = null;
  private dragging = false;
  private dragMoved = false;
  private pointerId: number | null = null;
  private startX = 0;
  private lastPointerX = 0;

  constructor() {
    const destroyRef = inject(DestroyRef);

    effect(() => {
      const index = this.activeIndex();
      if (!this.dragging && this.itemWidth > 0) {
        this.settle(index);
      }
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
      observer.observe(this.host.nativeElement);
      this.layout();

      const host = this.host.nativeElement;
      const onMove = (event: PointerEvent) => this.onPointerMove(event);
      host.addEventListener('pointermove', onMove);

      destroyRef.onDestroy(() => {
        host.removeEventListener('pointermove', onMove);
        observer.disconnect();
        media.revert();
      });
    });
  }

  private layout(): void {
    const host = this.host.nativeElement;
    const pad = 3;
    const count = Math.max(this.items().length, 1);
    this.itemWidth = (host.clientWidth - pad * 2) / count;

    const thumb = this.thumb().nativeElement;
    gsap.set(thumb, { width: this.itemWidth, x: this.targetX(this.activeIndex()) });
    /* quickTo caches start values, so resizing requires a new follower. */
    this.quickX = gsap.quickTo(thumb, 'x', { duration: 0.16, ease: 'power3' });
  }

  private targetX(index: number): number {
    return 3 + index * this.itemWidth;
  }

  protected step(delta: number): void {
    const next = Math.min(Math.max(this.activeIndex() + delta, 0), this.items().length - 1);
    this.activeIndex.set(next);
  }

  protected onSegmentClick(index: number): void {
    /* Pointer release also clicks the segment under the finger; the drag already selected it. */
    if (this.dragMoved) {
      this.dragMoved = false;
      return;
    }
    this.activeIndex.set(index);
  }

  protected onPointerDown(event: PointerEvent): void {
    this.pointerId = event.pointerId;
    this.startX = event.clientX;
    this.lastPointerX = event.clientX;
    this.dragging = true;
    this.dragMoved = false;
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    /* GSAP quickTo followers cannot recover after overwrite, so each gesture gets a new one. */
    this.quickX = gsap.quickTo(this.thumb().nativeElement, 'x', {
      duration: 0.16,
      ease: 'power3',
    });
  }

  private onPointerMove(event: PointerEvent): void {
    if (!this.dragging || event.pointerId !== this.pointerId) {
      return;
    }

    if (!this.dragMoved && Math.abs(event.clientX - this.startX) < 6) {
      return;
    }
    this.dragMoved = true;
    this.lastPointerX = event.clientX;

    const rect = this.host.nativeElement.getBoundingClientRect();
    const min = 3;
    const max = rect.width - 3 - this.itemWidth;
    const x = Math.min(Math.max(event.clientX - rect.left - this.itemWidth / 2, min), max);

    if (this.motion && this.quickX) {
      this.quickX(x);
      const lag = Math.min(Math.abs(event.movementX) / 40, 0.18);
      gsap.to(this.thumb().nativeElement, {
        scaleX: 1 + lag,
        scaleY: 1 - lag * 0.5,
        duration: 0.12,
        overwrite: 'auto',
      });
    } else {
      gsap.set(this.thumb().nativeElement, { x });
    }
  }

  protected onPointerUp(event: PointerEvent): void {
    if (event.pointerId !== this.pointerId) {
      return;
    }
    this.dragging = false;
    this.pointerId = null;

    if (!this.dragMoved) {
      return;
    }

    /* Snap under the finger, not the lagging thumb; settle also handles unchanged indices. */
    const rect = this.host.nativeElement.getBoundingClientRect();
    const nearest = Math.min(
      Math.max(Math.floor((this.lastPointerX - rect.left - 3) / this.itemWidth), 0),
      this.items().length - 1,
    );
    this.activeIndex.set(nearest);
    this.settle(nearest);
  }

  private settle(index: number): void {
    const thumb = this.thumb().nativeElement;
    const x = this.targetX(index);

    if (!this.motion) {
      gsap.set(thumb, { x, scaleX: 1, scaleY: 1 });
      return;
    }

    gsap.to(thumb, { x, duration: 0.45, ease: 'back.out(1.5)', overwrite: 'auto' });
    gsap.to(thumb, {
      scaleX: 1,
      scaleY: 1,
      duration: 0.6,
      ease: 'elastic.out(1, 0.55)',
      overwrite: false,
    });
  }
}
