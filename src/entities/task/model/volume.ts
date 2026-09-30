export function mountPathError(path: string, mounted: readonly string[]): string {
  if (!path.startsWith('/')) return 'Start with /, like /etc/certs.';
  if (path === '/') return 'The container’s root can’t be a mount.';
  if (/\/(\.\.?)?(\/|$)/.test(path)) return 'Drop the .., the . and any doubled or trailing slash.';
  return mounted.includes(path) ? `${path} is already mounted.` : '';
}
