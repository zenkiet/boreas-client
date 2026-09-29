import { EMPTY, Observable, catchError, filter, map, tap } from 'rxjs';

import { TaskSample, toTaskSample } from '@entities/system-stats';
import { reconnect } from '@shared/api/sse';
import { Logger } from '@shared/lib/logging/logger';

export const TICK_MS = 1000;

/** Never errors: one failed project must not end the merge of all of them. */
export function metricsFeed(
  stream: Observable<string>,
  slug: string,
  logger: Logger,
): Observable<readonly [string, TaskSample]> {
  return stream.pipe(
    tap({
      error: (error: unknown) => logger.warn('Metrics stream failed', { project: slug, error }),
    }),
    reconnect(),
    /* A final status (signed out, no access): this project goes quiet. */
    catchError(() => EMPTY),
    map((data) => toTaskSample(data, Date.now())),
    filter((sample) => sample !== undefined),
    map((sample) => [slug, sample] as const),
  );
}
