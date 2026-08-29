import { Signal, computed, linkedSignal } from '@angular/core';

import { mapApiError } from './api-error';

/** The subset of `rxResource` these helpers read; keeps them usable from any resource-like value. */
export interface ReadableResource<T> {
  hasValue(): boolean;
  value(): T;
  error(): unknown;
}

/**
 * Keeps the last good value through a failed reload, but never across a key change.
 *
 * Pass the key whenever the resource is parameterised: without it, one task's data
 * flashes on another's screen while the new fetch is still in flight.
 */
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

/** A resource's error as display copy, or undefined while it is fine. */
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
