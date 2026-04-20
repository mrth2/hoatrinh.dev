type BunLike = {
  Glob: new (
    pattern: string,
  ) => {
    scanSync(options: { cwd: string; onlyFiles?: boolean }): Iterable<string>;
  };
  file(path: string): { text(): Promise<string> };
};

function joinPath(base: string, segment: string): string {
  if (base.endsWith('/')) return `${base}${segment}`;
  return `${base}/${segment}`;
}

function resolvePathname(url: URL): string {
  return decodeURIComponent(url.pathname);
}

export async function loadRawMarkdownFallback(
  pattern: string,
  baseUrl: string,
): Promise<Record<string, string>> {
  const bun = (globalThis as { Bun?: BunLike }).Bun;
  if (bun === undefined) {
    throw new Error('[content] import.meta.glob fallback requires Bun runtime');
  }

  const slashIndex = pattern.lastIndexOf('/');
  if (slashIndex < 0) {
    throw new Error(`[content] invalid markdown glob pattern "${pattern}"`);
  }

  const dirPattern = pattern.slice(0, slashIndex + 1);
  const filePattern = pattern.slice(slashIndex + 1);
  const cwd = resolvePathname(new URL(dirPattern, baseUrl));
  const glob = new bun.Glob(filePattern);
  const out: Record<string, string> = {};

  for (const file of glob.scanSync({ cwd, onlyFiles: true })) {
    const key = `${dirPattern}${file}`;
    out[key] = await bun.file(joinPath(cwd, file)).text();
  }

  return out;
}
