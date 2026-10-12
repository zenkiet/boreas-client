import {
  Component,
  afterNextRender,
  computed,
  inject,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { BoraWaiting, CodeSources } from '@entities/bora';
import { BoraStore } from '@features/bora/model';
import { ListAlertsStore } from '@features/list-alerts/model';
import { ListProjectsStore } from '@features/list-projects/model';
import { MarkdownView } from '@shared/lib/markdown/markdown-view';

import { freshFailure, problemText, subjectLinks, suggestions } from './bora-chip';
import { BoraSteps } from './bora-steps';

@Component({
  selector: 'app-bora-answer',
  imports: [BoraSteps, BoraWaiting, CodeSources, MarkdownView, RouterLink],
  /* Focusable, so a keyboard scrolls an answer with no buttons in it. */
  host: { tabindex: '0', role: 'region', 'aria-label': 'Conversation with Bora' },
  template: `
    @if (bora.conversation(); as talk) {
      @if (!talk.messages.length && !talk.asking && !bora.ended()) {
        <div class="choices" role="group" aria-label="Suggested questions">
          @for (suggestion of suggested(); track suggestion.question) {
            <button
              type="button"
              class="choice"
              (click)="bora.ask(suggestion.about, suggestion.question)"
            >
              {{ suggestion.question }}
            </button>
          }
        </div>
      }
      @for (message of talk.messages; track $index; let last = $last) {
        @if (message.role === 'user') {
          <p class="me" [animate.enter]="enter()">{{ message.content }}</p>
        } @else {
          <article class="ans" aria-label="Bora’s answer" [animate.enter]="enter()">
            <app-markdown [text]="message.content" />
            @if (message.sources.length) {
              <app-code-sources [sources]="message.sources" />
            }
            <!-- Under the newest answer only, never while Bora thinks: an older one may be stale. -->
            @if (last && !talk.asking && message.actions.length && !inWorld()) {
              <app-bora-steps class="steps" [message]="message" (left)="left.emit()" />
            }
          </article>
          @if (last && !talk.asking) {
            @if (message.choices.length) {
              <div class="choices" role="group" aria-label="Pick one">
                @for (choice of message.choices; track choice) {
                  <button type="button" class="choice" (click)="bora.reply(choice)">
                    {{ choice }}
                  </button>
                }
              </div>
            }
            <p class="fine">AI-generated, may be wrong</p>
          }
        }
      }
      @if (talk.asking; as asking) {
        @if (asking.text) {
          <article class="ans" aria-label="Bora’s answer, still being written">
            <app-markdown [text]="asking.text" />
          </article>
        }
        <div class="wait">
          <app-bora-waiting [label]="asking.step || 'Looking into it…'" [since]="asking.since" />
          <button type="button" class="pill" (click)="bora.cancel()">Stop</button>
        </div>
      }
      @if (talk.problem; as problem) {
        <div class="note">
          <span class="grow">{{ problemText(problem) }}</span>
          @if (!bora.ended()) {
            <button type="button" class="pill" (click)="bora.retry()">Try again</button>
          }
        </div>
      }
      @if (talk.messages.length && !talk.asking) {
        @if (links(); as link) {
          <div class="links">
            <a
              class="pill"
              [routerLink]="link.task"
              [queryParams]="{ section: 'logs' }"
              (click)="left.emit()"
              >View logs</a
            >
            @if (link.build) {
              <a class="pill" target="_blank" rel="noopener" [href]="link.build">View the build</a>
            }
          </div>
        }
      }
    }
    @if (!inWorld()) {
      <span class="sr-only" role="status">{{ status() }}</span>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
      border-radius: 1rem;
      outline: none;
    }

    :host(:focus-visible) {
      outline: 2px solid var(--ion-color-primary);
      outline-offset: 4px;
    }

    .me {
      align-self: flex-end;
      max-inline-size: 82%;
      margin: 0;
      padding: 0.625rem 0.875rem;
      border-radius: 1.25rem 1.25rem 0.375rem 1.25rem;
      background: var(--ion-color-primary);
      line-height: 1.375rem;
      color: var(--ion-color-primary-contrast);
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }

    .ans {
      padding: 0.875rem 1rem 0.375rem;
      border-radius: 1.375rem;
      background: var(--ion-item-background);
    }

    app-markdown {
      padding-block-end: 0.5rem;
      line-height: 1.4375;
      color: var(--app-text-primary);
    }

    .steps {
      margin: 0.25rem -1rem 0;
      padding: 0.5rem 1rem 0.25rem;
      border-block-start: 1px solid var(--app-border-normal);
    }

    .pill,
    .choice {
      min-block-size: 2.75rem;
      border: 0;
      font: inherit;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
    }

    .grow {
      flex-grow: 1;
      min-inline-size: 0;
    }

    .pill {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0 1.125rem;
      border-radius: 1.375rem;
      background: var(--app-fill);
      color: var(--app-text-action);
    }

    .choices {
      display: grid;
      gap: 0.5rem;
    }

    .choice {
      padding: 0.75rem 1rem;
      border-radius: 1rem;
      background: var(--ion-item-background);
      font-size: 0.9375rem;
      line-height: 1.25rem;
      font-weight: 400;
      text-align: start;
      color: var(--app-text-primary);
    }

    .fine {
      margin: 0 0 0.25rem 1rem;
      font-size: 0.75rem;
      line-height: 1rem;
      color: var(--app-text-tertiary);
    }

    .note {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.5rem 0.5rem 0.5rem 1rem;
      border-radius: 1.375rem;
      background: var(--color-danger-soft);
      font-size: 0.9375rem;
      line-height: 1.25rem;
    }

    .links {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .wait {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
    }
  `,
})
export class BoraAnswer {
  protected readonly bora = inject(BoraStore);
  private readonly fleet = inject(ListProjectsStore);
  private readonly alerts = inject(ListAlertsStore);

  /** Inside Bora's world, which shows the suggestions and says the answers itself. */
  readonly inWorld = input(false);
  readonly left = output();

  /* Off for what the sheet opens with: it rises with the sheet already. */
  private readonly opened = signal(false);
  protected readonly enter = computed(() => (this.opened() ? 'fx fx-rise' : ''));
  protected readonly problemText = problemText;
  protected readonly suggested = computed(() => {
    const about = this.bora.conversation()?.about;
    const projects = this.fleet.summaries();
    const failure = freshFailure(this.alerts.unseenFailures(), projects);
    return about ? suggestions(about, projects, failure) : [];
  });
  protected readonly links = computed(() => {
    const about = this.bora.conversation()?.about;
    return about ? subjectLinks(about, this.alerts.alerts(), this.fleet.summaries()) : null;
  });

  /* One announcement per answer: the card itself is not a live region. */
  protected readonly status = linkedSignal<{ waiting: boolean; count: number }, string>({
    source: () => ({
      waiting: this.bora.busy(),
      count: this.bora.conversation()?.messages.length ?? 0,
    }),
    computation: (now, previous) =>
      now.waiting
        ? 'Looking into it…'
        : previous?.source.waiting && now.count > previous.source.count
          ? 'Bora answered'
          : '',
  });

  constructor() {
    afterNextRender(() => this.opened.set(true));
  }
}
