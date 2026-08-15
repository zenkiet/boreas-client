import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { TuiIcon } from '@taiga-ui/core';
import { gsap } from 'gsap';

const COMMIT = 0.9;
const PAD = 4;

@Component({
  selector: 'app-slide-to-confirm',
  imports: [TuiIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #track class="track" [class.track--disabled]="disabled()">
      <span #text class="label">{{ label() }}</span>
      <button
        #knob
        type="button"
        class="knob"
        [attr.aria-label]="label()"
        (keydown.enter)="fire()"
        (pointerdown)="onDown($event)"
        (pointermove)="onMove($event)"
        (pointerup)="onUp($event)"
        (pointercancel)="onUp($event)"
      >
        <tui-icon class="knob__icon" icon="@tui.chevrons-right" />
      </button>
    </div>
  `,
  styles: `
    .track {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      block-size: 3rem;
      border-radius: 999px;
      background: var(--tui-status-negative-pale);
      box-shadow: inset 0 0 0 1px var(--tui-status-negative-pale-hover);
      overflow: hidden;
      touch-action: none;
    }

    .track--disabled {
      opacity: 0.5;
      pointer-events: none;
    }

    .label {
      font-size: 0.9375rem;
      font-weight: 500;
      color: var(--tui-text-negative);
      pointer-events: none;
    }

    .knob {
      position: absolute;
      inset-block: 0.25rem;
      inset-inline-start: 0.25rem;
      inline-size: 2.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
      border: 0;
      border-radius: 999px;
      padding: 0;
      background: var(--tui-status-negative);
      color: var(--tui-text-primary-on-accent-1);
      cursor: grab;
      will-change: transform;
    }

    .knob:active {
      cursor: grabbing;
    }

    .knob__icon {
      font-size: 1.25rem;
    }
  `,
})
export class SlideToConfirm {
  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');
  private readonly knob = viewChild.required<ElementRef<HTMLElement>>('knob');
  private readonly text = viewChild.required<ElementRef<HTMLElement>>('text');

  readonly label = input.required<string>();
  readonly disabled = input(false);
  readonly confirmed = output<void>();

  private motion = false;
  private dragging = false;
  private pointerId: number | null = null;
  private startX = 0;
  private lastX = 0;
  private done = false;
  private quickX: ((value: number) => gsap.core.Tween) | null = null;

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        this.motion = true;
        return () => {
          this.motion = false;
        };
      });
      destroyRef.onDestroy(() => media.revert());
    });
  }

  protected onDown(event: PointerEvent): void {
    if (this.done) return;
    this.pointerId = event.pointerId;
    this.startX = event.clientX;
    this.lastX = 0;
    this.dragging = true;
    /* Capture can throw if the pointer was already released; dragging still degrades safely. */
    try {
      (event.target as HTMLElement).setPointerCapture(event.pointerId);
    } catch {
      /* empty */
    }
    /* GSAP quickTo followers cannot recover after overwrite, so each gesture gets a new one. */
    this.quickX = gsap.quickTo(this.knob().nativeElement, 'x', { duration: 0.1, ease: 'power2' });
  }

  protected onMove(event: PointerEvent): void {
    if (!this.dragging || event.pointerId !== this.pointerId) return;

    const x = Math.min(Math.max(event.clientX - this.startX, 0), this.maxX());
    this.lastX = x;

    if (this.motion && this.quickX) {
      this.quickX(x);
    } else {
      gsap.set(this.knob().nativeElement, { x });
    }
    gsap.set(this.text().nativeElement, { opacity: 1 - (x / this.maxX()) * 1.4 });
  }

  protected onUp(event: PointerEvent): void {
    if (!this.dragging || event.pointerId !== this.pointerId) return;
    this.dragging = false;
    this.pointerId = null;

    if (this.lastX >= this.maxX() * COMMIT) {
      if (this.motion) {
        gsap.to(this.knob().nativeElement, { x: this.maxX(), duration: 0.15, overwrite: 'auto' });
      } else {
        gsap.set(this.knob().nativeElement, { x: this.maxX() });
      }
      this.fire();
      return;
    }

    if (this.motion) {
      gsap.to(this.knob().nativeElement, {
        x: 0,
        duration: 0.4,
        ease: 'back.out(1.4)',
        overwrite: 'auto',
      });
      gsap.to(this.text().nativeElement, { opacity: 1, duration: 0.3, overwrite: 'auto' });
    } else {
      gsap.set(this.knob().nativeElement, { x: 0 });
      gsap.set(this.text().nativeElement, { opacity: 1 });
    }
  }

  protected fire(): void {
    if (this.done || this.disabled()) return;
    this.done = true;
    this.confirmed.emit();
  }

  private maxX(): number {
    const track = this.track().nativeElement;
    const knob = this.knob().nativeElement;
    return track.clientWidth - knob.clientWidth - PAD * 2;
  }
}
