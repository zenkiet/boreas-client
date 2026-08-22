import { TuiDay, TuiDayRange } from '@taiga-ui/cdk';

import { ProjectAlert } from './list-alerts.store';

/** project '' and range null both mean "no constraint". */
export interface AlertFilter {
  readonly project: string;
  readonly range: TuiDayRange | null;
  readonly failuresOnly: boolean;
}

export const EMPTY_ALERT_FILTER: AlertFilter = { project: '', range: null, failuresOnly: false };

export function matchesFilter(alert: ProjectAlert, filter: AlertFilter): boolean {
  if (filter.project && alert.project !== filter.project) return false;
  if (filter.failuresOnly && alert.status !== 'failure') return false;

  if (filter.range) {
    /* Compare local days: the picker selects days, not instants. */
    const day = TuiDay.fromLocalNativeDate(alert.createdAt);
    if (day.dayBefore(filter.range.from) || day.dayAfter(filter.range.to)) return false;
  }

  return true;
}
