import { Component, DestroyRef, inject, input } from '@angular/core';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';

import { skeletonLeft } from '../motion/page-motion';

export type SkeletonRowVariant = 'task' | 'project' | 'member';

/* Staggered widths read as organic text; a uniform grid reads as a wireframe. */
const WIDTHS: readonly (readonly [number, number])[] = [
  [44, 66],
  [58, 52],
  [37, 58],
];

/** Real `ion-item`s, so loaded rows land in the same metrics without a layout shift. */
@Component({
  selector: 'app-skeleton-rows',
  imports: [IonItem, IonLabel],
  /* Inside a group's role="list", its status line must sit in a listitem. */
  host: { role: 'listitem' },
  template: `
    <span class="sr-only" role="status">{{ label() }}</span>

    <div
      class="skeleton-defer"
      aria-hidden="true"
      (animationend)="seen = seen || $event.animationName === 'skeleton-appear'"
    >
      @for (width of widths; track $index) {
        <ion-item [detail]="variant() !== 'member'">
          @if (variant() === 'task') {
            <span slot="start" class="skeleton skeleton--dot"></span>
          } @else if (variant() === 'member') {
            <span slot="start" class="skeleton skeleton--circle"></span>
          }
          <ion-label class="grid gap-1.5">
            <span class="skeleton skeleton--bar" [style.inline-size.%]="width[0]"></span>
            <span class="skeleton skeleton--sub" [style.inline-size.%]="width[1]"></span>
          </ion-label>
          @if (variant() === 'member') {
            <span slot="end" class="skeleton skeleton--badge"></span>
          }
        </ion-item>
      }
    </div>
  `,
})
export class SkeletonRows {
  readonly variant = input<SkeletonRowVariant>('task');
  readonly label = input('Loading');

  protected readonly widths = WIDTHS;
  /* Rows rise in only where a skeleton was actually seen. */
  protected seen = false;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      if (this.seen) skeletonLeft();
    });
  }
}
