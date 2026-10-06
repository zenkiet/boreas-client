export function splitRepo(full: string): { readonly name: string; readonly owner: string } {
  const cut = full.lastIndexOf('/');
  return { name: full.slice(cut + 1), owner: full.slice(0, Math.max(cut, 0)) };
}
