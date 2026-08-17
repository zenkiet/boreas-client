import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TuiIcon } from '@taiga-ui/core';

export type SkeletonRowVariant = 'task' | 'project' | 'member';

/* Staggered widths read as organic text; a uniform grid reads as a wireframe. */
const WIDTHS: readonly (readonly [number, number])[] = [
  [44, 66],
  [58, 52],
  [37, 58],
  [50, 44],
  [42, 62],
];

/**
 * Redacted list rows mirroring the real row shapes, so content lands without
 * layout shift. Static glyphs the client already knows (chevrons) stay real.
 */
@Component({
  selector: 'app-skeleton-rows',
  imports: [TuiIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="sr-only" role="status">{{ label() }}</span>

    <div class="skeleton-defer" aria-hidden="true">
      @for (width of rowWidths(); track $index) {
        <div class="row row-divider relative">
          @switch (variant()) {
            @case ('task') {
              <span class="skeleton skeleton--dot"></span>
            }
            @case ('member') {
              <span class="skeleton skeleton--circle"></span>
            }
            @default {}
          }

          <span class="row__text">
            <span class="skeleton skeleton--bar" [style.inline-size.%]="width[0]"></span>
            <span class="skeleton skeleton--sub" [style.inline-size.%]="width[1]"></span>
          </span>

          @switch (variant()) {
            @case ('member') {
              <span class="skeleton skeleton--badge"></span>
            }
            @default {
              @if (variant() === 'project') {
                <span class="row__dots">
                  <span class="skeleton skeleton--dot"></span>
                  <span class="skeleton skeleton--dot"></span>
                  <span class="skeleton skeleton--dot"></span>
                </span>
              }
              <tui-icon class="row__chevron" icon="@tui.chevron-right" />
            }
          }
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.6875rem 1rem;
      min-block-size: 3.75rem;
    }

    .row__text {
      display: grid;
      gap: 0.375rem;
      flex: 1;
      min-inline-size: 0;
    }

    .row__dots {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      flex: none;
    }

    .row__chevron {
      flex: none;
      font-size: 0.9375rem;
      color: var(--tui-text-tertiary);
    }
  `,
})
export class SkeletonRows {
  readonly variant = input<SkeletonRowVariant>('task');
  readonly rows = input(3);
  readonly label = input('Loading');

  protected readonly rowWidths = computed(() =>
    Array.from({ length: this.rows() }, (_, index) => WIDTHS[index % WIDTHS.length]!),
  );
}
