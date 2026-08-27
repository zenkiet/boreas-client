/** The part of a Signal Forms field state an error message is read from. */
export interface FieldErrorState {
  touched: () => boolean;
  errors: () => readonly { readonly message?: string }[];
}

/**
 * First error of a touched field, or null.
 *
 * Must be null and never '' when there is no error: `tui-error` renders its own
 * generic message for any non-null empty value.
 */
export function fieldError(state: FieldErrorState): string | null {
  if (!state.touched()) return null;
  return state.errors()[0]?.message ?? null;
}
