import { Component, computed, input } from '@angular/core';

import type { NotificationKind } from '@entities/notification';

/* Literal classes, so Tailwind generates them. */
const GLYPH: Record<NotificationKind, { readonly icon: string; readonly tone: string }> = {
  deploy_failed: { icon: 'icon-[regular--circle-xmark]', tone: 'bg-danger-soft text-danger' },
  build_failed: { icon: 'icon-[regular--hammer]', tone: 'bg-danger-soft text-danger' },
  deployed: { icon: 'icon-[regular--arrow-up]', tone: 'bg-ok-soft text-ok' },
  status_changed: {
    icon: 'icon-[regular--arrow-right-arrow-left]',
    tone: 'bg-accent-soft text-accent',
  },
  task_created: { icon: 'icon-[regular--plus]', tone: 'bg-fill text-label-2' },
  task_assigned: { icon: 'icon-[regular--user]', tone: 'bg-fill text-label-2' },
  other: { icon: 'icon-[regular--circle-info]', tone: 'bg-fill text-label-2' },
};

/** Decorative: the row's title says the kind in words. */
@Component({
  selector: 'app-activity-glyph',
  host: {
    'aria-hidden': 'true',
    '[class]': 'classes()',
  },
  template: `<span [class]="glyph().icon"></span>`,
})
export class ActivityGlyph {
  readonly kind = input.required<NotificationKind>();
  readonly size = input<'row' | 'hero'>('row');

  protected readonly glyph = computed(() => GLYPH[this.kind()]);

  protected readonly classes = computed(
    () =>
      `inline-flex flex-none items-center justify-center ${this.glyph().tone} ${
        this.size() === 'hero'
          ? 'size-11 rounded-[14px] text-[22px]'
          : 'size-8 rounded-[10px] text-lg'
      }`,
  );
}
