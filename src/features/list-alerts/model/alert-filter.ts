import { ProjectAlert } from './list-alerts.store';

/** '' and null mean "no constraint"; range days are local `YYYY-MM-DD`, inclusive. */
export interface AlertFilter {
  readonly project: string;
  readonly range: { readonly from: string; readonly to: string } | null;
}

export const EMPTY_ALERT_FILTER: AlertFilter = { project: '', range: null };

/** Local, not UTC; ISO order keeps string comparison chronological. */
export function localDay(date: Date): string {
  const pad = (value: number): string => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function matchesFilter(alert: ProjectAlert, filter: AlertFilter): boolean {
  if (filter.project && alert.project !== filter.project) return false;

  if (filter.range) {
    const day = localDay(alert.createdAt);
    if (day < filter.range.from || day > filter.range.to) return false;
  }

  return true;
}
