import { DOCUMENT } from '@angular/common';
import { DestroyRef, Signal, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NavigationStart, Router } from '@angular/router';
import { Capacitor, type PluginListenerHandle } from '@capacitor/core';
import { SpeechRecognition } from '@capgo/capacitor-speech-recognition';
import {
  EMPTY,
  NEVER,
  Observable,
  Subject,
  Subscription,
  catchError,
  defer,
  filter,
  finalize,
  from,
  fromEvent,
  fromEventPattern,
  map,
  merge,
  of,
  switchMap,
  take,
  timer,
} from 'rxjs';

import { Announcer } from '@shared/ui/notify/announcer';
import { NotifyService } from '@shared/ui/notify/notify';
import { LOCALE, type Language } from '@shared/ui/speech/voice';

const LIMIT_MS = 60_000;
/* iOS 26's SpeechAnalyzer path may never emit partial results. */
const NATIVE = { preferLegacyRecognizer: true };

const DENIED: Readonly<Record<string, string>> = {
  ios: 'Allow Microphone and Speech Recognition for Boreas in Settings, then try again.',
  android: 'Allow the microphone for Boreas in Settings, then try again.',
  web: 'Microphone access is blocked for this site. Allow it in the browser settings, then try again.',
};

/* lib.dom types the events but not the recognizer, which Chrome and Safari still prefix. */
interface Recognizer {
  lang: string;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type RecognizerType = new () => Recognizer;

export type DictationState = 'idle' | 'recording';

/* The plugin is one recognizer app-wide, and its teardown is global: a new take ends the last. */
let active: Subscription | undefined;

/** Push-to-talk into a draft: what is heard is written as it comes, and never sent. */
export function dictation(
  draft: () => string,
  write: (draft: string) => void,
  hints: () => readonly string[],
  language: () => Language,
) {
  const notify = inject(NotifyService);
  const announcer = inject(Announcer);
  const state = signal<DictationState>('idle');
  const stop = new Subject<void>();
  let current: Subscription | undefined;
  const cancel = () => current?.unsubscribe();
  inject(DestroyRef).onDestroy(cancel);
  const document = inject(DOCUMENT);
  /* Any navigation (a split pane never sees Ionic's leave) or hiding the app drops a take. */
  merge(
    inject(Router).events.pipe(filter((event) => event instanceof NavigationStart)),
    fromEvent(document, 'visibilitychange').pipe(filter(() => document.hidden)),
  )
    .pipe(takeUntilDestroyed())
    .subscribe(cancel);

  return {
    state: state.asReadonly(),
    supported: canHear(),
    /** Call it in the tap itself: Safari drops the user gesture after an async hop. */
    toggle(): void {
      if (state() === 'recording') return stop.next();
      state.set('recording');
      const base = draft().trimEnd();
      let said = '';
      current = active = hear(language(), hints(), stop)
        .pipe(finalize(() => state.set('idle')))
        .subscribe({
          next: (text) => {
            said = text.trim();
            write([base, said].filter(Boolean).join(' '));
          },
          complete: () =>
            said
              ? announcer.say('Added to your question')
              : notify.failure('Nothing was heard. Try again.'),
          error: (error: unknown) => notify.failure(hearingFailed(error)),
        });
    },
    cancel,
  };
}

/** Call it in an injection context. */
export function canHear(): Signal<boolean> {
  return Capacitor.isNativePlatform()
    ? toSignal(
        defer(() => SpeechRecognition.available()).pipe(
          map(({ available }) => available),
          catchError(() => of(false)),
        ),
        { initialValue: false },
      )
    : signal(!!webRecognizer()).asReadonly();
}

export const hearingFailed = (error: unknown): string =>
  error instanceof DOMException && error.name === 'NotAllowedError'
    ? DENIED[Capacitor.getPlatform()]
    : 'Couldn’t listen. Try again, or type your question.';

/** The one take app-wide; it ends with `end`, the recognizer's pause, or 60 s. */
export function hear(
  language: Language,
  hints: readonly string[],
  end: Observable<unknown> = NEVER,
): Observable<string> {
  return new Observable<string>((subscriber) => {
    active?.unsubscribe();
    const Web = Capacitor.isNativePlatform() ? undefined : webRecognizer();
    const stop = merge(end, timer(LIMIT_MS)).pipe(take(1));
    const locale = LOCALE[language];
    return (active = (
      Web ? listen(Web, locale, stop) : listenNative(locale, hints, stop)
    ).subscribe(subscriber));
  });
}

export const audioLevel = (): Observable<number> =>
  Capacitor.isNativePlatform()
    ? fromEventPattern<{ level: number }>(
        (handler) => SpeechRecognition.addListener('audioLevel', handler),
        (_, handle: Promise<PluginListenerHandle>) =>
          from(handle).subscribe((listener) => void listener.remove()),
      ).pipe(map(({ level }) => level))
    : EMPTY;

/* An iOS home-screen app exposes the API, but it never hears anything. */
function webRecognizer(): RecognizerType | undefined {
  const scope = globalThis as {
    SpeechRecognition?: RecognizerType;
    webkitSpeechRecognition?: RecognizerType;
  };
  const standalone = (navigator as Navigator & { standalone?: boolean }).standalone;
  return standalone ? undefined : (scope.SpeechRecognition ?? scope.webkitSpeechRecognition);
}

/* One utterance: Chrome and Safari both end it at a pause. Chrome splits a hypothesis in parts. */
function listen(
  Recognizer: RecognizerType,
  locale: string,
  end: Observable<unknown>,
): Observable<string> {
  return new Observable<string>((subscriber) => {
    const recognizer = new Recognizer();
    recognizer.lang = locale;
    recognizer.interimResults = true;
    recognizer.onresult = ({ results }) =>
      subscriber.next(Array.from(results, (result) => result[0].transcript).join(''));
    recognizer.onerror = ({ error, message }) => {
      if (error === 'no-speech') return;
      subscriber.error(
        error === 'not-allowed' ? new DOMException(message, 'NotAllowedError') : new Error(error),
      );
    };
    recognizer.onend = () => subscriber.complete();
    recognizer.start();
    const ended = end.subscribe(() => recognizer.stop());
    return () => {
      ended.unsubscribe();
      recognizer.onresult = null;
      recognizer.onerror = null;
      recognizer.onend = null;
      recognizer.abort();
    };
  });
}

/* The final result arrives as a last partial one; the session's `stopped` state ends the take. */
function listenNative(
  locale: string,
  hints: readonly string[],
  end: Observable<unknown>,
): Observable<string> {
  const options = { ...NATIVE, language: locale };
  return defer(() => SpeechRecognition.requestPermissions()).pipe(
    switchMap(({ speechRecognition }) => {
      if (speechRecognition !== 'granted') throw new DOMException('', 'NotAllowedError');
      return SpeechRecognition.isOnDeviceRecognitionAvailable(options);
    }),
    switchMap(
      ({ available }) =>
        new Observable<string>((subscriber) => {
          void SpeechRecognition.addListener('partialResults', ({ matches }) => {
            if (matches?.[0]) subscriber.next(matches[0]);
          });
          void SpeechRecognition.addListener('listeningState', ({ state }) => {
            if (state === 'stopped') subscriber.complete();
          });
          const started = defer(() =>
            SpeechRecognition.start({
              ...options,
              partialResults: true,
              popup: false,
              // Task names said in English inside Vietnamese (iOS only).
              contextualStrings: [...hints],
              useOnDeviceRecognition: available,
            }),
          ).subscribe({ error: (error: unknown) => subscriber.error(error) });
          const ended = end.subscribe(() => void SpeechRecognition.stop());
          return () => {
            started.unsubscribe();
            ended.unsubscribe();
            void SpeechRecognition.removeAllListeners();
            void SpeechRecognition.forceStop();
          };
        }),
    ),
  );
}
