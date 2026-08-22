import { TuiDay, TuiDayRange } from '@taiga-ui/cdk';

import { ProjectAlert } from './list-alerts.store';

export type AlertStatusFilter = 'all' | 'success' | 'failure';

/** project '' and range null both mean "no constraint". */
export interface AlertFilter {
  readonly project: string;
  readonly range: TuiDayRange | null;
  readonly status: AlertStatusFilter;
}

export const EMPTY_ALERT_FILTER: AlertFilter = { project: '', range: null, status: 'all' };

export function matchesFilter(alert: ProjectAlert, filter: AlertFilter): boolean {
  if (filter.project && alert.project !== filter.project) return false;
  if (filter.status !== 'all' && alert.status !== filter.status) return false;

  if (filter.range) {
    /* Compare local days: the picker selects days, not instants. */
    const day = TuiDay.fromLocalNativeDate(alert.createdAt);
    if (day.dayBefore(filter.range.from) || day.dayAfter(filter.range.to)) return false;
  }

  return true;
}
