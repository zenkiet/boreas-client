import { Component, ElementRef, input, model, viewChild } from '@angular/core';
import { TuiBottomSheet } from '@taiga-ui/addon-mobile';
import { gsap } from 'gsap';

import { motionFlag } from '../motion/motion-flag';

const DISMISS_VELOCITY = 0.6;
const RUBBER_BAND_MAX = 24;

@Component({
  selector: 'app-bottom-sheet',
  imports: [TuiBottomSheet],
  /* A reveal transform would trap the fixed layer inside the host's zero-height box. */
  host: { '(document:keydown.escape)': 'close()', 'data-no-reveal': '' },
  template: `
    @if (open()) {
      <!-- Keep sheet touches out of the shell's pull-to-refresh gesture. -->
      <div
        class="sheet__layer"
        role="dialog"
        aria-modal="true"
        (touchstart)="$event.stopPropagation()"
        (pointerdown)="$event.stopPropagation()"
      >
        <button type="button" class="sheet__scrim" aria-label="Dismiss" (click)="close()"></button>
        <tui-bottom-sheet
          #panel
          [stops]="stops()"
          (pointerdown)="onDown($event)"
          (pointermove)="onMove($event)"
          (pointerup)="onUp($event)"
          (pointercancel)="onUp($event)"
        >
          <ng-content />
        </tui-bottom-sheet>
      </div>
    }
  `,
  styles: `
    .sheet__layer {
      position: fixed;
      inset: 0;
      z-index: 30;
      transition: opacity 200ms ease;
    }

    @starting-style {
      .sheet__layer {
        opacity: 0;
      }
    }

    .sheet__scrim {
      position: absolute;
      inset: 0;
      margin: 0;
      border: 0;
      padding: 0;
      background: var(--tui-service-backdrop);
      cursor: default;
      touch-action: none;
    }

    /* Notices fit the first stop, so drag dismissal intentionally replaces scroll expansion. */
    :host ::ng-deep tui-bottom-sheet {
      padding-block-end: env(safe-area-inset-bottom);
      touch-action: none;
      will-change: transform;
    }
  `,
})
export class BottomSheet {
  private readonly panel = viewChild('panel', { read: ElementRef<HTMLElement> });

  readonly open = model(false);
  readonly stops = input<readonly string[]>(['18rem']);

  private readonly motion = motionFlag();
  private dragging = false;
  private pointerId: number | null = null;
  private startY = 0;
  private lastY = 0;
  private lastAt = 0;
  private velocity = 0;
  private offset = 0;
  private quickY: ((value: number) => gsap.core.Tween) | null = null;

  protected close(): void {
    if (this.open()) {
      this.open.set(false);
    }
  }

  protected onDown(event: PointerEvent): void {
    if ((event.target as HTMLElement).closest('button, a, input')) {
      return;
    }

    const panel = this.panel()?.nativeElement;
    if (!panel) {
      return;
    }

    this.pointerId = event.pointerId;
    this.startY = event.clientY;
    this.lastY = event.clientY;
    this.lastAt = event.timeStamp;
    this.velocity = 0;
    this.offset = 0;
    this.dragging = true;
    /* Capture can throw if the pointer was already released; dragging still degrades safely. */
    try {
      panel.setPointerCapture(event.pointerId);
    } catch {
      /* empty */
    }
    /* GSAP quickTo followers cannot recover after overwrite, so each gesture gets a new one. */
    this.quickY = gsap.quickTo(panel, 'y', { duration: 0.12, ease: 'power2' });
  }

  protected onMove(event: PointerEvent): void {
    if (!this.dragging || event.pointerId !== this.pointerId) {
      return;
    }

    const elapsed = event.timeStamp - this.lastAt;
    if (elapsed > 0) {
      this.velocity = (event.clientY - this.lastY) / elapsed;
      this.lastY = event.clientY;
      this.lastAt = event.timeStamp;
    }

    const dy = event.clientY - this.startY;
    /* Upward motion rubber-bands because the sheet has no content above its resting stop. */
    this.offset = dy >= 0 ? dy : Math.max(dy / 4, -RUBBER_BAND_MAX);

    const panel = this.panel()?.nativeElement;
    if (!panel) {
      return;
    }
    if (this.motion.enabled && this.quickY) {
      this.quickY(this.offset);
    } else {
      gsap.set(panel, { y: this.offset });
    }
  }

  protected onUp(event: PointerEvent): void {
    if (!this.dragging || event.pointerId !== this.pointerId) {
      return;
    }
    this.dragging = false;
    this.pointerId = null;

    const panel = this.panel()?.nativeElement;
    if (!panel) {
      return;
    }

    const threshold = Math.min(panel.clientHeight / 3, 120);
    const flick = this.velocity > DISMISS_VELOCITY && this.offset > RUBBER_BAND_MAX;

    if (this.offset > threshold || flick) {
      if (this.motion.enabled) {
        gsap.to(panel, {
          y: panel.clientHeight,
          duration: 0.2,
          ease: 'power2.in',
          overwrite: 'auto',
          onComplete: () => this.close(),
        });
      } else {
        this.close();
      }
      return;
    }

    if (this.motion.enabled) {
      gsap.to(panel, { y: 0, duration: 0.4, ease: 'back.out(1.6)', overwrite: 'auto' });
    } else {
      gsap.set(panel, { y: 0 });
    }
  }
}
