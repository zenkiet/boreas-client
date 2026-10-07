/** "a/b/c" → ["a/", "b/", "c"], for a `<wbr>` after each part. */
export function pathParts(value: string): readonly string[] {
  return value.match(/[^/]*\/|[^/]+$/g) ?? [value];
}
