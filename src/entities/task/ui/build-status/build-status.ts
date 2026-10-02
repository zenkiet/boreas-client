import { Component, computed, input } from '@angular/core';

import { age } from '@shared/lib/format/age';
import { Build, isQuietBuild } from '../../model/task';

/* `line` names itself (a list's third line), `cell` sits under a Build header, `value` adds when. */
type Mode = 'line' | 'cell' | 'value';

const ARC = 2 * Math.PI * 7.5;

@Component({
  selector: 'app-build-status',
  template: `
    @switch (state()) {
      @case ('failure') {
        <span class="glyph icon-[regular--circle-xmark]" aria-hidden="true"></span>
      }
      @case ('success') {
        <span class="glyph icon-[regular--circle-check]" aria-hidden="true"></span>
      }
      @case ('canceled') {
        <span class="glyph icon-[regular--ban]" aria-hidden="true"></span>
      }
      @default {
        <svg viewBox="0 0 20 20" aria-hidden="true" [class.spin]="spin()">
          <circle cx="10" cy="10" r="7.5" class="track" />
          <circle cx="10" cy="10" r="7.5" class="arc" [attr.stroke-dasharray]="dash()" />
        </svg>
      }
    }
    <span class="text">{{ text() }}</span>
  `,
  host: { '[attr.data-state]': 'state()' },
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

    .glyph {
      flex: none;
      font-size: 0.9375rem;
    }

    svg {
      flex: none;
      inline-size: 0.9375rem;
      block-size: 0.9375rem;
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
    }

    :host([data-state='quiet']) .arc {
      stroke: currentColor;
    }

    .spin {
      animation: spin 1.1s linear infinite;
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
  `,
})
export class BuildStatus {
  readonly build = input.required<Build>();
  readonly mode = input<Mode>('cell');

  protected readonly state = computed(() =>
    isQuietBuild(this.build()) ? 'quiet' : this.build().state,
  );
  protected readonly spin = computed(() => this.state() === 'running' && !this.build().progress);
  protected readonly dash = computed(() => `${(ARC * (this.build().progress ?? 25)) / 100} ${ARC}`);
  protected readonly text = computed(() => describe(this.build(), this.state(), this.mode()));
}

function describe({ stage, progress, at }: Build, state: string, mode: Mode): string {
  const line = mode === 'line';
  const when = mode === 'value' ? ` · ${age(at)} ago` : '';
  const where = stage ? ` at ${stage}` : '';
  switch (state) {
    case 'quiet':
      return [`No ${line ? 'build ' : ''}report for ${age(at)}`, stage].filter(Boolean).join(' · ');
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
