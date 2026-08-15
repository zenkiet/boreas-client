import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-dashboard-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid grid-cols-1 gap-4" role="status" aria-live="polite" aria-label="Loading tasks">
      <div class="skeleton h-10 w-full rounded-lg"></div>

      <div>
        <div class="skeleton mb-2 ms-1 h-3 w-16"></div>
        <div class="overflow-hidden rounded-2xl bg-base">
          @for (row of overviewRows; track row) {
            <div class="flex items-center justify-between border-t border-border px-3.5 py-3 first:border-t-0">
              <div class="skeleton h-3 w-20"></div>
              <div class="skeleton h-3 w-14"></div>
            </div>
          }
        </div>
      </div>

      <div>
        <div class="mb-2 flex items-center justify-between px-1">
          <div class="skeleton h-3 w-24"></div>
          <div class="skeleton h-3 w-12"></div>
        </div>
        <div class="overflow-hidden rounded-2xl bg-base">
          @for (row of taskRows; track row) {
            <div class="flex items-center gap-3 border-t border-border px-3.5 py-2.5 first:border-t-0">
              <div class="skeleton size-2 rounded-full"></div>
              <div class="min-w-0 flex-1">
                <div class="skeleton h-3 w-28"></div>
                <div class="skeleton mt-1.5 h-2.5 w-44 max-w-full"></div>
              </div>
              <div class="skeleton h-2.5 w-24"></div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class DashboardSkeleton {
  protected readonly overviewRows = [0, 1, 2];
  protected readonly taskRows = [0, 1, 2];
}
