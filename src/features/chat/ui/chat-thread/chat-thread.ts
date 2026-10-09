import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, linkedSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { interval, map } from 'rxjs';

import type { ChatMessage } from '@entities/chat';
import { pathParts } from '@shared/lib/format/path';
import { splitRepo } from '@shared/lib/format/repo';
import { MarkdownView } from '@shared/lib/markdown/markdown-view';
import { rise } from '@shared/ui/motion/page-motion';
import { chatDay } from '../../model/chat-time';

const TIME = new Intl.DateTimeFormat('en', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

@Component({
  selector: 'app-chat-waiting',
  template: `
    <span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>
    Searching code…
    <span class="tabular text-label-3" aria-hidden="true">{{ seconds() }}s</span>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 0.625rem;
      align-self: flex-start;
      padding: 0.75rem 1rem;
      border-radius: 1.25rem;
      background: var(--ion-item-background);
      font-size: 0.9375rem;
      color: var(--app-text-secondary);
    }

    .dots {
      display: inline-flex;
      gap: 0.25rem;
    }

    .dots i {
      inline-size: 0.375rem;
      block-size: 0.375rem;
      border-radius: 50%;
      background: var(--ion-color-primary);
      opacity: 0.6;
      animation: pulse 1.2s ease-in-out infinite;
    }

    .dots i:nth-child(2) {
      animation-delay: 0.15s;
    }

    .dots i:nth-child(3) {
      animation-delay: 0.3s;
    }

    @keyframes pulse {
      0%,
      80%,
      100% {
        opacity: 0.25;
      }

      40% {
        opacity: 1;
      }
    }
  `,
})
export class ChatWaiting {
  readonly since = input.required<number>();

  private readonly now = toSignal(interval(1000).pipe(map(() => Date.now())), {
    initialValue: Date.now(),
  });

  protected readonly seconds = computed(() =>
    Math.max(0, Math.floor((this.now() - this.since()) / 1000)),
  );
}

@Component({
  selector: 'app-chat-thread',
  imports: [ChatWaiting, MarkdownView, NgTemplateOutlet],
  template: `
    @if (when(); as label) {
      <p class="when">{{ label }}</p>
    }
    @for (message of messages(); track $index; let last = $last) {
      @if (message.role === 'user') {
        <p class="me" [animate.enter]="rise()">{{ message.content }}</p>
      } @else {
        <article class="ans" aria-label="Answer" [animate.enter]="rise()">
          <app-markdown [text]="message.content" />
          @if (message.sources.length) {
            <section class="src" aria-label="Sources">
              <h3>Sources</h3>
              @for (source of message.sources; track $index) {
                @if (source.url) {
                  <a class="file" target="_blank" rel="noopener noreferrer" [href]="source.url">
                    <ng-container *ngTemplateOutlet="file; context: { $implicit: source }" />
                    <span
                      class="icon-[regular--arrow-up-right] flex-none text-accent"
                      aria-hidden="true"
                    ></span>
                  </a>
                } @else {
                  <span class="file text-label-3">
                    <ng-container *ngTemplateOutlet="file; context: { $implicit: source }" />
                  </span>
                }
              }
            </section>
          }
        </article>
        <!-- Once, under the newest answer: repeated per answer it is noise. -->
        @if (last && !asking()) {
          <p class="fine">AI-generated from the code, may be wrong</p>
        }
      }
    }
    @if (asking(); as asking) {
      <p class="me">{{ asking.question }}</p>
      <app-chat-waiting [since]="asking.since" />
    }
    <span class="sr-only" role="status">{{ status() }}</span>

    <ng-template #file let-source>
      <span class="grow"
        ><b>{{ repo(source.repo) }}</b> ·
        @for (part of parts(source.path); track $index) {
          <span>{{ part }}</span
          ><wbr />
        }
      </span>
    </ng-template>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
    }

    .when {
      align-self: center;
      margin: 0.125rem 0;
      font-size: 0.75rem;
      line-height: 1rem;
      font-weight: 500;
      color: var(--app-text-tertiary);
    }

    .me {
      align-self: flex-end;
      max-inline-size: 78%;
      margin: 0;
      padding: 0.625rem 0.875rem;
      border-radius: 1.25rem 1.25rem 0.375rem 1.25rem;
      background: var(--ion-color-primary);
      font-size: 1rem;
      line-height: 1.375rem;
      color: var(--ion-color-primary-contrast);
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }

    .ans {
      margin-inline-end: 1.5rem;
      padding: 0.875rem 1.125rem 0.375rem;
      border-radius: 1.375rem;
      background: var(--ion-item-background);
    }

    app-markdown {
      padding-block-end: 0.5rem;
      font-size: 1rem;
      line-height: 1.4375;
      color: var(--app-text-primary);
    }

    .src {
      margin: 0.25rem -1.125rem 0;
      padding: 0.5rem 1.125rem 0.125rem;
      border-block-start: 1px solid var(--app-border-normal);
    }

    .src h3 {
      margin: 0 0 0.125rem;
      font-size: 0.75rem;
      line-height: 1rem;
      font-weight: 600;
      color: var(--app-text-tertiary);
    }

    .file {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      min-block-size: 2.5rem;
      padding: 0.1875rem 0;
      font-family: var(--app-font-mono);
      font-size: 0.75rem;
      line-height: 1.0625rem;
      color: var(--app-text-primary);
      text-decoration: none;
      overflow-wrap: anywhere;
    }

    .file + .file {
      border-block-start: 1px solid var(--app-border-normal);
    }

    .file b {
      font-weight: 600;
    }

    .grow {
      flex-grow: 1;
      min-inline-size: 0;
    }

    .fine {
      margin: 0.125rem 0 0.25rem 1.125rem;
      font-size: 0.75rem;
      line-height: 1rem;
      color: var(--app-text-tertiary);
    }

    @media (min-width: 80rem) {
      .me,
      app-markdown {
        font-size: 0.9375rem;
      }

      .ans {
        margin-inline-end: 3rem;
      }
    }
  `,
})
export class ChatThread {
  readonly messages = input.required<readonly ChatMessage[]>();
  readonly asking = input<{ readonly question: string; readonly since: number }>();

  protected readonly rise = rise();
  protected readonly when = computed(() => {
    const asking = this.asking();
    const at = this.messages()[0]?.at ?? (asking && new Date(asking.since));
    return at ? `${chatDay(at)} ${TIME.format(at)}` : '';
  });

  /* One announcement per answer: the card itself is not a live region. */
  protected readonly status = linkedSignal<{ waiting: boolean; count: number }, string>({
    source: () => ({ waiting: !!this.asking(), count: this.messages().length }),
    computation: (now, previous) => {
      if (now.waiting) return 'Searching code…';
      return previous?.source.waiting && now.count > previous.source.count ? 'Answer ready' : '';
    },
  });

  protected readonly parts = pathParts;

  protected repo(full: string): string {
    return splitRepo(full).name;
  }
}
