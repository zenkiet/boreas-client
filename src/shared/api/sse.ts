import {
  HttpClient,
  HttpDownloadProgressEvent,
  HttpEventType,
  HttpParams,
} from '@angular/common/http';
import { Observable, filter, map } from 'rxjs';

/** Each emission is the whole body so far, not a delta; EventSource cannot send the auth header. */
export function streamSse(
  http: HttpClient,
  url: string,
  params?: HttpParams | Record<string, string | number>,
): Observable<string> {
  return http
    .get(url, {
      headers: { Accept: 'text/event-stream' },
      params,
      observe: 'events',
      responseType: 'text',
      reportProgress: true,
    })
    .pipe(
      filter((event) => event.type === HttpEventType.DownloadProgress),
      map((event) => (event as HttpDownloadProgressEvent).partialText ?? ''),
    );
}
