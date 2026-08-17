import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TuiIcon } from '@taiga-ui/core';

@Component({
  selector: 'app-back-link',
  imports: [RouterLink, TuiIcon],
  template: `
    <a class="back" [routerLink]="link()">
      <tui-icon class="icon-sm" icon="@tui.chevron-left" />
      {{ label() }}
    </a>
  `,
  styles: `
    .back {
      display: inline-flex;
      align-items: center;
      gap: 0.125rem;
      margin-inline-start: -0.25rem;
      font-size: 1.0625rem;
      font-weight: 500;
      color: var(--tui-text-secondary);
      text-decoration: none;
      transition: color var(--tui-duration);
    }

    .back:hover {
      color: var(--tui-text-primary);
    }
  `,
})
export class BackLink {
  readonly link = input.required<string>();
  readonly label = input.required<string>();
}
