/** What `ion-popover [event]` reads: the element the menu points at. */
export interface PopoverAnchor {
  readonly target: EventTarget | null;
}

/** A click from a shadow root loses its target once dispatched; currentTarget keeps the button. */
export function popoverAnchor(event: Event): PopoverAnchor {
  return { target: event.currentTarget };
}
