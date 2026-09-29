import { type OperatorFunction, map, mergeMap, scan } from 'rxjs';

/* Apart from sse.ts and free of Angular, so scripts/check-sse.ts runs it under plain node. */

/** Each frame's `data:` lines once, from decoded chunks cut anywhere; a heartbeat frame is ''. */
export function sseData(): OperatorFunction<string, string> {
  return (chunks) =>
    chunks.pipe(
      scan(
        ({ rest }, chunk) => {
          const frames = (rest + chunk).split(/\r?\n\r?\n/);
          return { rest: frames.pop() ?? '', frames };
        },
        { rest: '', frames: [] as string[] },
      ),
      mergeMap(({ frames }) => frames),
      map((frame) =>
        frame
          .split(/\r?\n/)
          .filter((line) => line.startsWith('data:'))
          .map((line) => line.slice(line.startsWith('data: ') ? 6 : 5))
          .join('\n'),
      ),
    );
}
