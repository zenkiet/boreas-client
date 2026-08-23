import { Component, inject, signal } from '@angular/core';
import { TuiButton, TuiDialogContext, TuiLoader } from '@taiga-ui/core';
import { injectContext } from '@taiga-ui/polymorpheus';

import { Callout } from '@shared/ui/callout/callout';
import { ConnectServerStore } from '../../model/connect-server.store';

/** Opened through TuiResponsiveDialogService: a sheet on mobile, a dialog on desktop. */
@Component({
  selector: 'app-change-server-sheet',
  imports: [Callout, TuiButton, TuiLoader],
  providers: [ConnectServerStore],
  template: `
    <form class="grid grid-cols-1 gap-3" (submit)="connect($event)">
      @if (failed()) {
        <app-callout tone="negative" size="s" role="alert">
          No Boreas API answered at this address. Check it and try again.
        </app-callout>
      }

      <div class="box">
        <div class="frow row-divider relative">
          <label class="frow__label" for="change-server-url">Server address</label>
          <input
            id="change-server-url"
            class="url-field font-mono"
            type="url"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            placeholder="https://boreas.example.com"
            [value]="url()"
            (input)="typeUrl($event)"
          />
        </div>
      </div>
      <p class="footnote">
        The address is saved only after a health check answers. Switching servers signs this device
        out.
      </p>

      <button
        tuiButton
        type="submit"
        size="m"
        appearance="primary"
        [disabled]="connection.checking() || !url().trim()"
      >
        @if (connection.checking()) {
          <tui-loader size="s" [inheritColor]="true" />
          Checking
        } @else {
          Check and switch
        }
      </button>
    </form>
  `,
  styles: `
    :host {
      display: block;
    }

    .box {
      overflow: hidden;
      border-radius: var(--tui-radius-l);
      background: var(--tui-background-neutral-1);
    }

    .url-field {
      inline-size: 100%;
      margin: 0;
      border: 0;
      padding: 0;
      background: none;
      font-size: 1rem;
      color: var(--tui-text-primary);
    }

    .url-field:focus {
      outline: none;
    }

    .url-field::placeholder {
      color: var(--tui-text-tertiary);
      opacity: 0.6;
    }
  `,
})
export class ChangeServerSheet {
  protected readonly connection = inject(ConnectServerStore);
  protected readonly context = injectContext<TuiDialogContext<string>>();

  protected readonly url = signal(this.connection.suggestedUrl());
  protected readonly failed = signal(false);

  protected typeUrl(event: Event): void {
    this.url.set((event.target as HTMLInputElement).value);
    this.failed.set(false);
  }

  protected connect(event: Event): void {
    event.preventDefault();
    const url = this.url().trim();
    if (!url || this.connection.checking()) return;

    /* connect() persists the address itself once the health check passes. */
    this.connection.connect(url).subscribe((healthy) => {
      if (healthy) {
        this.context.completeWith(url);
      } else {
        this.failed.set(true);
      }
    });
  }
}
