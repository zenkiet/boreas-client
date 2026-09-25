export interface FieldErrorState {
  touched: () => boolean;
  errors: () => readonly { readonly message?: string }[];
}

/** Null until the field is touched. */
export function fieldError(state: FieldErrorState): string | null {
  if (!state.touched()) return null;
  return state.errors()[0]?.message ?? null;
}
