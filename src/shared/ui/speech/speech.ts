import { Signal, signal } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { ScreenReader } from '@capacitor/screen-reader';
import { SpeechSynthesis, type VoiceInfo } from '@capgo/capacitor-speech-synthesis';
import {
  EMPTY,
  Observable,
  ReplaySubject,
  Subject,
  catchError,
  concat,
  concatMap,
  defer,
  distinctUntilChanged,
  filter,
  finalize,
  forkJoin,
  from,
  fromEvent,
  ignoreElements,
  map,
  merge,
  of,
  shareReplay,
  startWith,
  switchMap,
  takeUntil,
  timer,
} from 'rxjs';

import { LOCALE, type Pace, isVietnamese, sentences, wordAt, wordMs, words } from './voice';

export type Chime = 'listen' | 'follow' | 'sent' | 'error';

export interface Spoken {
  readonly sentence: number;
  readonly word: number;
}

interface Said {
  readonly utteranceId: string;
  readonly charIndex?: number;
  readonly ended?: boolean;
}

const RATE: Readonly<Record<Pace, number>> = { slower: 0.85, normal: 1, faster: 1.2 };
const NOTES: Readonly<Record<Chime, readonly (readonly [hz: number, at: number])[]>> = {
  listen: [
    [988, 0],
    [1319, 0.09],
  ],
  follow: [[1319, 0]],
  sent: [
    [880, 0],
    [659, 0.08],
  ],
  error: [[220, 0]],
};

/* Registered once, before the first utterance, so none of its words is missed. */
const said = new Subject<Said>();
const listening = forkJoin([
  defer(() => SpeechSynthesis.addListener('boundary', (event) => said.next(event))),
  defer(() => SpeechSynthesis.addListener('end', (event) => said.next({ ...event, ended: true }))),
  defer(() =>
    SpeechSynthesis.addListener('error', (event) => said.next({ ...event, ended: true })),
  ),
]).pipe(shareReplay(1));

const reader = signal(false);
let watched = false;
let audio: AudioContext | undefined;

/** Readies the device's voice: Android refuses to speak before its engine starts. */
export function warmUp(): void {
  from(SpeechSynthesis.initialize()).subscribe({ error: () => undefined });
}

/** Call it in a tap: mobile Safari speaks only after a first utterance started by one. */
export function unlockSpeech(): void {
  if (!Capacitor.isNativePlatform())
    globalThis.speechSynthesis?.speak(new SpeechSynthesisUtterance(''));
}

/** Unsubscribing stops the voice. */
export function speak(
  text: string,
  options: { readonly pace: Pace; readonly voice?: string },
): Observable<Spoken> {
  const language = LOCALE[isVietnamese(text) ? 'vi' : 'en'];
  return concat(
    ...sentences(text).map((line, sentence) =>
      voiced(line, language, options).pipe(map((word) => ({ sentence, word }))),
    ),
  ).pipe(finalize(() => void SpeechSynthesis.cancel()));
}

/** Read again as the browser loads its voices. */
export function voices(): Observable<readonly VoiceInfo[]> {
  const loaded =
    Capacitor.isNativePlatform() || !globalThis.speechSynthesis
      ? EMPTY
      : fromEvent(globalThis.speechSynthesis, 'voiceschanged');
  return loaded.pipe(
    startWith(null),
    switchMap(() => SpeechSynthesis.getVoices()),
    map(({ voices }) => voices),
    catchError(() => of([])),
  );
}

export function screenReader(): Signal<boolean> {
  if (!watched && Capacitor.isNativePlatform()) {
    watched = true;
    from(ScreenReader.isEnabled()).subscribe({
      next: ({ value }) => reader.set(value),
      error: () => undefined,
    });
    void ScreenReader.addListener('stateChange', ({ value }) => reader.set(value));
  }
  return reader.asReadonly();
}

/** A short cue; the first one must come from a tap, which lets the page make sound. */
export function chime(kind: Chime): void {
  audio ??= new AudioContext();
  if (audio.state === 'suspended') void audio.resume();
  const now = audio.currentTime;
  for (const [hz, at] of NOTES[kind]) {
    const tone = audio.createOscillator();
    const gain = audio.createGain();
    tone.frequency.value = hz;
    gain.gain.setValueAtTime(0.0001, now + at);
    gain.gain.exponentialRampToValueAtTime(0.12, now + at + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + at + 0.18);
    tone.connect(gain).connect(audio.destination);
    tone.start(now + at);
    tone.stop(now + at + 0.2);
  }
}

const paced = (line: string, pace: Pace): Observable<number> =>
  from(words(line)).pipe(
    concatMap((word, i) => concat(of(i), timer(wordMs(word, pace)).pipe(ignoreElements()))),
  );

/* The text's own clock runs until the voice reports a word, and stands in where it never does. */
function voiced(
  line: string,
  language: string,
  { pace, voice }: { readonly pace: Pace; readonly voice?: string },
): Observable<number> {
  return defer(() => {
    const heard = new ReplaySubject<Said>();
    const tap = said.subscribe(heard);
    return listening.pipe(
      // Ambient keeps to the silent switch, and takes the speaker back from the mic.
      switchMap(() =>
        Capacitor.getPlatform() === 'ios'
          ? SpeechSynthesis.activateAudioSession({ category: 'Ambient' })
          : of(null),
      ),
      switchMap(() =>
        SpeechSynthesis.speak({
          text: line,
          language,
          voiceId: voice,
          rate: RATE[pace],
        }),
      ),
      switchMap(({ utteranceId }) => {
        const mine = heard.pipe(filter((event) => event.utteranceId === utteranceId));
        const spoken = mine.pipe(
          filter((event) => event.charIndex !== undefined),
          map((event) => wordAt(line, event.charIndex ?? 0)),
        );
        // A call or Siri can cut an utterance without an end: a deadline moves on regardless.
        const deadline = timer(words(line).reduce((ms, word) => ms + wordMs(word, pace), 3000) * 2);
        return merge(paced(line, pace).pipe(takeUntil(spoken)), spoken).pipe(
          distinctUntilChanged(),
          takeUntil(merge(mine.pipe(filter((event) => !!event.ended)), deadline)),
        );
      }),
      catchError(() => paced(line, pace)),
      finalize(() => tap.unsubscribe()),
    );
  });
}
