import { Component, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonSpinner } from '@ionic/angular/ion-spinner';

import { BoraAction, BoraMessage, actionEffect, actionLabel, confirmsFirst } from '@entities/bora';
import { BoraStore } from '@features/bora/model';
import { ControlTaskStore } from '@features/control-task';
import { ListProjectsStore } from '@features/list-projects/model';
import { Announcer } from '@shared/ui/notify/announcer';
import { NotifyService } from '@shared/ui/notify/notify';

import { BoraOutcome, BoraRunner } from './bora-actions';

/* Without an outcome: tapped, then running once busy. With one: done, then undoing once busy. */
interface Run {
  readonly busy: boolean;
  readonly outcome?: BoraOutcome;
}

@Component({
  selector: 'app-bora-steps',
  imports: [IonSpinner, RouterLink],
  providers: [BoraRunner, ControlTaskStore],
  host: { role: 'group', 'aria-label': 'Suggested' },
  template: `
    <h3>Suggested</h3>
    @for (action of message().actions; track $index) {
      @let ran = runs().get(action);
      <div class="row">
        @if (ran?.outcome; as outcome) {
          <span class="icon-[solid--circle-check] ok" aria-hidden="true"></span>
          <span class="grow">{{ outcome.message }}</span>
          @if (outcome.undo) {
            <button
              type="button"
              class="pill"
              [disabled]="ran?.busy"
              (click)="undo(action, outcome)"
            >
              @if (ran?.busy) {
                <ion-spinner name="lines-small" aria-hidden="true" />
              }
              Undo
            </button>
          } @else if (action.op === 'task.create') {
            <a
              class="pill"
              [routerLink]="['/projects', action.project, 'tasks', action.task]"
              (click)="left.emit()"
              >Open {{ action.task }}</a
            >
          }
        } @else {
          <button
            type="button"
            class="act"
            [class.danger]="destructive(action)"
            [disabled]="!!ran"
            (click)="run(action)"
          >
            @if (ran?.busy) {
              <ion-spinner name="lines-small" aria-hidden="true" />
            }
            {{ labelOf(action) }}
          </button>
          @if (action.reason) {
            <span class="reason">{{ action.reason }}</span>
          }
          <span class="effect">{{ effectOf(action) }}</span>
        }
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
    }

    h3 {
      margin: 0;
      font-size: 0.75rem;
      line-height: 1rem;
      font-weight: 600;
      color: var(--app-text-tertiary);
    }

    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.25rem 0.75rem;
      padding-block: 0.375rem;
    }

    .act,
    .pill {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      min-block-size: 2.75rem;
      border: 0;
      border-radius: 1.375rem;
      font: inherit;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
    }

    .act {
      padding: 0 1rem;
      background: var(--app-accent-soft);
      color: var(--app-accent-text);
    }

    .act.danger {
      background: var(--color-danger-soft);
      color: var(--ion-color-danger);
    }

    .pill {
      padding: 0 1.125rem;
      background: var(--app-fill);
      color: var(--app-text-action);
    }

    /* Disabled only while it runs: the spinner says so, the words stay readable. */
    :disabled {
      cursor: default;
    }

    ion-spinner {
      inline-size: 1rem;
      block-size: 1rem;
    }

    .reason,
    .effect {
      font-size: 0.8125rem;
      line-height: 1.125rem;
      color: var(--app-text-secondary);
    }

    .effect {
      flex-basis: 100%;
      color: var(--app-text-tertiary);
    }

    .ok {
      color: var(--app-status-positive);
    }

    .grow {
      flex-grow: 1;
      min-inline-size: 0;
    }
  `,
})
export class BoraSteps {
  readonly message = input.required<BoraMessage>();
  readonly ran = output<string>();
  readonly left = output();

  private readonly bora = inject(BoraStore);
  private readonly runner = inject(BoraRunner);
  private readonly fleet = inject(ListProjectsStore);
  private readonly notify = inject(NotifyService);
  private readonly announcer = inject(Announcer);

  protected readonly labelOf = actionLabel;
  protected readonly effectOf = actionEffect;
  protected readonly destructive = (action: BoraAction) => confirmsFirst(action.op);
  protected readonly runs = signal<ReadonlyMap<BoraAction, Run>>(new Map());

  protected run(action: BoraAction): void {
    const was = this.fleet
      .summaries()
      .find(({ project }) => project.slug === action.project)
      ?.tasks.find(({ name }) => name === action.task)?.devStatus;
    // Taken at once, so a second tap can't ask twice; busy only once it runs, past the confirmation.
    this.mark(action, { busy: false });
    this.runner
      .run(action, () => this.mark(action, { busy: true }), was)
      .subscribe({
        next: (outcome) => {
          if (!outcome.success) {
            this.notify.failure(outcome.message);
            return this.forget(action);
          }
          this.mark(action, { busy: false, outcome });
          this.said(outcome.message);
          this.bora.cheered.set(Date.now());
          this.bora.ran(this.message(), outcome.message);
        },
        // A declined confirmation completes empty: the button comes back.
        complete: () => {
          if (!this.runs().get(action)?.outcome) this.forget(action);
        },
      });
  }

  protected undo(action: BoraAction, outcome: BoraOutcome): void {
    this.mark(action, { busy: true, outcome });
    outcome.undo?.().subscribe((result) => {
      if (!result.success) {
        this.notify.failure(result.message);
        return this.mark(action, { busy: false, outcome });
      }
      this.said(result.message);
      this.bora.ran(this.message(), `Undid: ${outcome.message}`);
      this.forget(action);
    });
  }

  private said(line: string): void {
    this.announcer.say(line);
    this.ran.emit(line);
  }

  private mark(action: BoraAction, run: Run): void {
    this.runs.update((runs) => new Map(runs).set(action, run));
  }

  private forget(action: BoraAction): void {
    this.runs.update((runs) => {
      const next = new Map(runs);
      next.delete(action);
      return next;
    });
  }
}
