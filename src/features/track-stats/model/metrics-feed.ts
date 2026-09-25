import { Observable, defer, filter, map, repeat, retry, takeWhile, tap, timer } from 'rxjs';

import { ProjectApi } from '@entities/project';
import { TaskSample, toTaskSample } from '@entities/system-stats';
import { sseData } from '@shared/api/sse-data';
import { Logger } from '@shared/lib/logging/logger';

export const TICK_MS = 1000;
const RECONNECT_DELAY_MS = 3000;
/* The transport re-emits the whole body; past this size reopen to shed the backlog. */
const MAX_BUFFER_CHARS = 1_500_000;

/** Never errors or completes: one failed project must not end the merge of all of them. */
export function metricsFeed(
  api: ProjectApi,
  slug: string,
  logger: Logger,
): Observable<readonly [string, TaskSample]> {
  let oversize = false;
  return defer(() => {
    oversize = false;
    return api.metricsStream(slug);
  }).pipe(
    tap((body) => (oversize = body.length > MAX_BUFFER_CHARS)),
    takeWhile(() => !oversize, true),
    sseData(),
    map((data) => toTaskSample(data, Date.now())),
    filter((sample) => sample !== undefined),
    map((sample) => [slug, sample] as const),
    retry({
      delay: (error) => {
        logger.warn('Metrics stream failed; reconnecting', { project: slug, error });
        return timer(RECONNECT_DELAY_MS);
      },
    }),
    /* A server that ends the stream waits before the reopen, or it would hot-loop. */
    repeat({ delay: () => timer(oversize ? 0 : RECONNECT_DELAY_MS) }),
  );
}
