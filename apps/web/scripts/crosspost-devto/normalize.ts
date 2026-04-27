import { absolutize } from '../url-utils';

const FENCE_RE = /^\s{0,3}(```|~~~)/;
const HEADING_RE = /^\s{0,3}#{1,6}\s/;
const HR_RE = /^\s{0,3}([-*_])(\s*\1){2,}\s*$/;
const BLOCKQUOTE_RE = /^\s{0,3}>/;
const UNORDERED_LIST_RE = /^\s{0,3}[-*+]\s/;
const ORDERED_LIST_RE = /^\s{0,3}\d+[.)]\s/;
const INDENTED_CODE_RE = /^(?: {4}|\t)/;
const HTML_BLOCK_RE = /^\s{0,3}<\/?[a-zA-Z]/;
const LINK_TARGET_RE = /(!?\[[^\]]*\])\((\/[^)\s]*)\)/g;

function isListStart(line: string): boolean {
  return UNORDERED_LIST_RE.test(line) || ORDERED_LIST_RE.test(line);
}

function isBlockStart(line: string): boolean {
  return (
    HEADING_RE.test(line) ||
    HR_RE.test(line) ||
    BLOCKQUOTE_RE.test(line) ||
    INDENTED_CODE_RE.test(line) ||
    HTML_BLOCK_RE.test(line)
  );
}

function rewriteLinks(line: string, siteUrl: string): string {
  return line.replace(LINK_TARGET_RE, (_, head, path) => `${head}(${absolutize(path, siteUrl)})`);
}

export function normalizeBodyForDevto(raw: string, siteUrl: string): string {
  const lines = raw.split('\n');
  const out: string[] = [];
  let buffer: string[] = [];
  let mode: 'normal' | 'fence' | 'paragraph' | 'list' = 'normal';
  let fenceMarker = '';

  const flush = (): void => {
    if (buffer.length === 0) return;
    out.push(buffer.join(' '));
    buffer = [];
  };

  for (const line of lines) {
    if (mode === 'fence') {
      out.push(line);
      if (line.trimStart().startsWith(fenceMarker)) {
        mode = 'normal';
        fenceMarker = '';
      }
      continue;
    }

    const fenceMatch = line.match(FENCE_RE);
    if (fenceMatch) {
      flush();
      out.push(line);
      fenceMarker = fenceMatch[1] ?? '';
      mode = 'fence';
      continue;
    }

    if (line.trim() === '') {
      flush();
      out.push('');
      mode = 'normal';
      continue;
    }

    if (isBlockStart(line)) {
      flush();
      out.push(rewriteLinks(line, siteUrl));
      mode = 'normal';
      continue;
    }

    if (isListStart(line)) {
      flush();
      buffer.push(rewriteLinks(line.trimEnd(), siteUrl));
      mode = 'list';
      continue;
    }

    if (mode === 'list' && /^\s+/.test(line)) {
      buffer.push(rewriteLinks(line.trim(), siteUrl));
      continue;
    }

    if (mode === 'list') {
      flush();
    }
    buffer.push(rewriteLinks(line.trim(), siteUrl));
    mode = 'paragraph';
  }

  flush();

  while (out.length > 0 && out[out.length - 1] === '') {
    out.pop();
  }

  return raw.endsWith('\n') ? `${out.join('\n')}\n` : out.join('\n');
}
