import { Component, computed, input, signal } from '@angular/core';

import type { ProjectLoad, ProjectLoads } from '@entities/system-stats';
import { toByteSize } from '@shared/lib/format/bytes';

const KILOBYTES = new Intl.NumberFormat('en', { maximumFractionDigits: 0 });

/** A table, so screen readers get the columns. */
@Component({
  selector: 'app-project-split',
  template: `
    @if (loads().rows.length === 0) {
      <p class="m-0 py-1 text-[13px] text-label-3">No projects to measure yet.</p>
    } @else {
      <table class="w-full table-fixed border-collapse tabular">
        <colgroup>
          <col />
          <col class="c1" />
          <col class="c2" />
          <col class="c3" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">By project</th>
            <th scope="col">CPU</th>
            <th scope="col">Memory</th>
            <th scope="col">Net KB/s</th>
          </tr>
        </thead>
        <tbody>
          @for (row of visible(); track row.slug) {
            <tr>
              <th scope="row">{{ row.name }}</th>
              <td>{{ cpu(row) }}</td>
              <td>{{ memory(row) }}</td>
              <td>{{ network(row) }}</td>
            </tr>
          }
          @if (loads().rest; as rest) {
            <tr class="fold">
              <th scope="row" [attr.colspan]="expanded() ? 4 : null">
                <button
                  type="button"
                  class="toggle"
                  [attr.aria-expanded]="expanded()"
                  (click)="expanded.set(!expanded())"
                >
                  {{ expanded() ? 'Show fewer' : rest.count + ' more' }}
                  <span class="icon-[regular--angle-down]" aria-hidden="true"></span>
                </button>
              </th>
              @if (!expanded()) {
                <td>{{ cpu(rest) }}</td>
                <td>{{ memory(rest) }}</td>
                <td>{{ network(rest) }}</td>
              }
            </tr>
          }
        </tbody>
      </table>
    }
  `,
  styles: `
    :host {
      display: block;
      container-type: inline-size;
    }

    th,
    td {
      padding: 0 0 0 0.5rem;
      font-size: 0.8125rem;
      font-weight: 400;
      text-align: end;
      color: var(--color-label-2);
      white-space: nowrap;
    }

    th:first-child {
      padding-inline-start: 0;
      text-align: start;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    thead th {
      padding-block-end: 0.25rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--color-label-3);
    }

    tbody th {
      font-size: 0.875rem;
      color: var(--color-label);
    }

    tbody tr {
      block-size: 1.875rem;
    }

    .toggle {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      min-block-size: 1.875rem;
      padding: 0;
      border: 0;
      background: none;
      font: inherit;
      font-weight: 500;
      color: var(--ion-color-primary);
      cursor: pointer;
    }

    .toggle [class*='icon-['] {
      font-size: 0.875rem;
      transition: transform 0.2s ease;
    }

    .toggle[aria-expanded='true'] [class*='icon-['] {
      transform: rotate(180deg);
    }

    /* Column widths include the 8px gap each value cell pads in front of itself. */
    .c1 {
      inline-size: 3.5rem;
    }

    .c2 {
      inline-size: 4.25rem;
    }

    .c3 {
      inline-size: 4.5rem;
    }

    @container (min-width: 32rem) {
      .c1 {
        inline-size: 5.5rem;
      }

      .c2,
      .c3 {
        inline-size: 6.5rem;
      }
    }
  `,
})
export class ProjectSplit {
  readonly loads = input.required<ProjectLoads>();

  protected readonly expanded = signal(false);

  protected readonly visible = computed(() => {
    const { rows, rest } = this.loads();
    return this.expanded() && rest ? [...rows, ...rest.loads] : rows;
  });

  protected cpu(load: Pick<ProjectLoad, 'cpu'>): string {
    return `${load.cpu.toFixed(1)}%`;
  }

  protected memory(load: Pick<ProjectLoad, 'mem'>): string {
    const { value, unit } = toByteSize(load.mem);
    return `${value} ${unit}`;
  }

  protected network(load: Pick<ProjectLoad, 'net'>): string {
    return KILOBYTES.format(load.net / 1024);
  }
}
