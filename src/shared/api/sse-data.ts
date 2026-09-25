import { OperatorFunction, mergeMap, scan } from 'rxjs';

/* Not in sse.ts: that ships in main through ProjectApi, and only lazy stores parse. */

/** Each complete `data:` payload once, from the cumulative bodies `streamSse` emits. */
export function sseData(): OperatorFunction<string, string> {
  return (bodies) =>
    bodies.pipe(
      scan(
        ({ consumed }, body) => {
          const end = body.lastIndexOf('\n\n');
          if (end < consumed) return { consumed, fresh: [] };
          const fresh = body
            .slice(consumed, end + 2)
            .split('\n')
            .filter((line) => line.startsWith('data:'))
            .map((line) => line.slice(5).trimStart());
          return { consumed: end + 2, fresh };
        },
        { consumed: 0, fresh: [] as readonly string[] },
      ),
      mergeMap(({ fresh }) => fresh),
    );
}
