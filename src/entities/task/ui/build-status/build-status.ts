import { Component, ElementRef, computed, input, linkedSignal, viewChild } from '@angular/core';

import { age } from '@shared/lib/format/age';
import { replaced, swap } from '@shared/ui/motion/effects';
import { Build, isQuietBuild } from '../../model/task';

/* `line` names itself (a list's third line), `cell` sits under a Build header, `value` adds when. */
type Mode = 'line' | 'cell' | 'value';

const ARC = 2 * Math.PI * 7.5;

const GLYPH: Partial<Record<string, string>> = {
  failure: 'icon-[regular--circle-xmark]',
  success: 'icon-[regular--circle-check]',
  canceled: 'icon-[regular--ban]',
  /* A clock: a still ring reads as loading. */
  quiet: 'icon-[regular--clock]',
};

@Component({
  selector: 'app-build-status',
  template: `
    <span #mark class="mark" aria-hidden="true">
      @if (glyph()) {
        <span [class]="glyph()"></span>
      } @else {
        <svg
          viewBox="0 0 20 20"
          [class.spin]="spin()"
          (animationend)="spun.set(true); $event.stopPropagation()"
        >
          <circle cx="10" cy="10" r="7.5" class="track" />
          <circle cx="10" cy="10" r="7.5" class="arc" [attr.stroke-dasharray]="dash()" />
        </svg>
      }
    </span>
    <span #words class="text">{{ text() }}</span>
  `,
  /* The title carries what a narrow cell drops: the stage and age. */
  host: { '[attr.data-state]': 'said()', '[attr.data-mode]': 'mode()', '[attr.title]': 'full()' },
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      min-inline-size: 0;
      max-inline-size: 100%;
    }

    :host([data-state='failure']) {
      color: var(--color-danger);
      font-weight: 600;
    }

    :host([data-state='quiet']) {
      color: var(--color-label-3);
    }

    :host([data-state='success']) {
      color: var(--color-ok);
    }

    :host([data-state='canceled']) {
      color: var(--color-label-2);
    }

    .mark {
      display: grid;
      flex: none;
      font-size: 0.9375rem;
    }

    svg {
      inline-size: 1em;
      block-size: 1em;
      fill: none;
      stroke-width: 2.6;
    }

    .track {
      stroke: var(--color-fill);
    }

    .arc {
      stroke: var(--color-accent);
      stroke-linecap: round;
      transform: rotate(-90deg);
      transform-origin: center;
      transition: stroke-dasharray 300ms var(--e-out);
    }

    .spin {
      animation: spin 1.1s linear 4;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* A phone has no hover to read a cut stage. */
    :host([data-mode='value']) .text {
      white-space: normal;
    }
  `,
})
export class BuildStatus {
  readonly build = input.required<Build>();
  readonly mode = input<Mode>('cell');

  protected readonly state = computed(() =>
    isQuietBuild(this.build()) ? 'quiet' : this.build().state,
  );
  protected readonly spin = computed(() => this.state() === 'running' && !this.build().progress);
  /* Four turns, then a still hammer: a spinner past its cap reads as stuck. */
  protected readonly spun = linkedSignal({ source: this.state, computation: () => false });
  protected readonly dash = computed(() => `${(ARC * (this.build().progress ?? 25)) / 100} ${ARC}`);

  private readonly mark = viewChild<ElementRef<HTMLElement>>('mark');
  private readonly words = viewChild<ElementRef<HTMLElement>>('words');
  protected readonly glyph = replaced(
    computed(
      () => GLYPH[this.state()] ?? (this.spin() && this.spun() ? 'icon-[regular--hammer]' : ''),
    ),
    () => this.mark()?.nativeElement,
  );
  protected readonly said = replaced(this.state, () => this.words()?.nativeElement, swap);
  protected readonly text = computed(() => describe(this.build(), this.said(), this.mode()));
  protected readonly full = computed(() => describe(this.build(), this.state(), 'value'));
}

function describe({ stage, progress, at }: Build, state: string, mode: Mode): string {
  const line = mode === 'line';
  const when = mode === 'value' ? ` · ${age(at)} ago` : '';
  const where = stage ? ` at ${stage}` : '';
  switch (state) {
    case 'quiet':
      return [`${line ? 'Build quiet' : 'Quiet'} for ${age(at)}`, mode !== 'cell' && stage]
        .filter(Boolean)
        .join(' · ');
    case 'failure':
      return `${line ? 'Build failed' : 'Failed'}${where}${when}`;
    case 'success':
      return `Passed${when}`;
    case 'canceled':
      return `Canceled${where}${when}`;
    default: {
      const parts = [stage, progress && `${progress}%`].filter(Boolean);
      return (
        (line ? ['Building', ...parts] : parts.length ? parts : ['Running']).join(' · ') + when
      );
    }
  }
}
