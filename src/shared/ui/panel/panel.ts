import { Component, input } from '@angular/core';

/* IDs must stay unique because several panels can be visible and dialogs can stack. */
let instances = 0;

@Component({
  selector: 'app-panel',
  template: `
    <section class="panel" [attr.aria-labelledby]="heading() ? titleId : null">
      @if (heading()) {
        <header class="panel__header">
          <hgroup class="panel__heading">
            <h2 class="panel__title" [id]="titleId">{{ heading() }}</h2>
            @if (description()) {
              <p class="panel__description">{{ description() }}</p>
            }
          </hgroup>
          <div class="panel__actions empty:hidden">
            <ng-content select="[panelActions]" />
          </div>
        </header>
      }

      <div class="panel__body" [class.panel__body--flush]="flush()">
        <ng-content />
      </div>
    </section>
  `,
  styles: `
    .panel {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid var(--tui-border-normal);
      border-radius: var(--tui-radius-l);
      background: var(--tui-background-base);
      box-shadow: var(--app-shadow-panel);
    }

    .panel__header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      min-block-size: 3rem;
      padding: 0.625rem 1rem;
      border-block-end: 1px solid var(--tui-border-normal);
    }

    .panel__heading {
      display: flex;
      min-inline-size: 0;
      flex-direction: column;
      gap: 0.0625rem;
      margin: 0;
    }

    .panel__title {
      margin: 0;
      font-size: 1.0625rem;
      font-weight: 600;
      line-height: 1.4;
      letter-spacing: -0.005em;
      color: var(--tui-text-primary);
    }

    .panel__description {
      margin: 0;
      font-size: 0.8125rem;
      line-height: 1.45;
      color: var(--tui-text-tertiary);
    }

    .panel__actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-inline-start: auto;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .panel__body {
      display: flex;
      min-inline-size: 0;
      flex-direction: column;
      gap: 0.875rem;
      padding: 1rem;
    }

    .panel__body--flush {
      gap: 0;
      padding: 0;
    }
  `,
})
export class Panel {
  private readonly uid = `panel-${(instances += 1)}`;

  readonly heading = input('');
  readonly description = input('');
  readonly flush = input(false);

  protected readonly titleId = `${this.uid}-title`;
}
