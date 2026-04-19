export function pathToCommand(pathname: string): string | null {
  if (pathname === '/') return null;
  const stripped = pathname.replace(/^\//, '').replace(/\//g, ' ');
  return stripped || null;
}
