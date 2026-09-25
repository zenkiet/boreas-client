import { Signal, computed, linkedSignal } from '@angular/core';

import { mapApiError } from './api-error';

export interface ReadableResource<T> {
  hasValue(): boolean;
  value(): T;
  error(): unknown;
}

/** Keeps the last value through a failed reload; without `key` it leaks across param changes. */
export function keepLastValue<T>(
  resource: ReadableResource<T | undefined>,
  key: () => string = () => '',
): Signal<T | undefined> {
  return linkedSignal<{ readonly key: string; readonly value: T | undefined }, T | undefined>({
    source: () => ({
      key: key(),
      value: resource.hasValue() ? resource.value() : undefined,
    }),
    computation: (source, previous) =>
      source.value ?? (previous && previous.source.key === source.key ? previous.value : undefined),
  });
}

export function resourceError(
  resource: Pick<ReadableResource<unknown>, 'error'>,
): Signal<string | undefined> {
  return computed(() => {
    const error = resource.error();
    return error ? mapApiError(error).message : undefined;
  });
}

export interface ListView<T> {
  readonly items: Signal<readonly T[]>;
  readonly loading: Signal<boolean>;
  readonly hasLoaded: Signal<boolean>;
  readonly error: Signal<string | undefined>;
}

export function listView<T>(
  resource: ReadableResource<readonly T[] | undefined> & { readonly isLoading: Signal<boolean> },
  key?: () => string,
): ListView<T> {
  const current = key ? keepLastValue(resource, key) : keepLastValue(resource);

  return {
    items: computed(() => current() ?? []),
    loading: resource.isLoading,
    hasLoaded: computed(() => current() !== undefined),
    error: resourceError(resource),
  };
}
