import {
  EMPTY,
  type MonoTypeOperatorFunction,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  take,
  timeout,
} from 'rxjs';

export type Pace = 'slower' | 'normal' | 'faster';
export type Language = 'en' | 'vi';

export const LOCALE: Readonly<Record<Language, string>> = { en: 'en-US', vi: 'vi-VN' };

const SYLLABLE_MS: Readonly<Record<Pace, number>> = { faster: 230, normal: 290, slower: 360 };
const BREATH_MS = 250;
const VIETNAMESE = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

/** One utterance each: a long one gets cut off by Chrome. */
export const sentences = (text: string): string[] =>
  text
    .trim()
    .replace(/([.!?…])\s+/g, '$1\n')
    .split('\n')
    .filter(Boolean);

/** Vietnamese writes each syllable as a word, so every word is one beat. */
export const words = (text: string): string[] => text.split(/\s+/).filter(Boolean);

export const isVietnamese = (text: string): boolean => VIETNAMESE.test(text);

export const wordAt = (sentence: string, charIndex: number): number =>
  Math.max(0, words(sentence.slice(0, charIndex + 1)).length - 1);

export const wordMs = (word: string, pace: Pace): number =>
  SYLLABLE_MS[pace] + (/[,.:;!?…]$/.test(word) ? BREATH_MS : 0);

/** Sends once `pause` passes without new words, or as the take ends; nothing within `wait` ends it. */
export const endpoint =
  (wait: number, pause = 1500): MonoTypeOperatorFunction<string> =>
  (heard) =>
    heard.pipe(
      map((text) => text.trim()),
      filter(Boolean),
      // A recognizer repeats its last words through a silence: only new words restart the pause.
      distinctUntilChanged(),
      timeout({ first: wait, with: () => EMPTY }),
      debounceTime(pause),
      take(1),
    );
