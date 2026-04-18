// Build-time contrast checker. Runs the AA/AAA math on our token pairs
// and fails the build if any pair drops below its target.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

type Hex = `#${string}`;

function readTokens(path: string): Record<string, string> {
  const src = readFileSync(path, 'utf8');
  const out: Record<string, string> = {};
  for (const m of src.matchAll(/--([a-z0-9-]+):\s*([^;]+);/gi)) {
    out[m[1]] = m[2].trim();
  }
  return out;
}

function parseHex(hex: Hex): [number, number, number] {
  const n = hex.replace('#', '');
  return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
}

function relLum([r, g, b]: [number, number, number]): number {
  const f = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrast(a: Hex, b: Hex): number {
  const la = relLum(parseHex(a));
  const lb = relLum(parseHex(b));
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

const tokensPath = resolve(import.meta.dir, '../src/styles/tokens.css');
const tokens = readTokens(tokensPath);
const bg = tokens['bg-base'] as Hex;

type Check = { label: string; fg: Hex; min: number };
const checks: Check[] = [
  { label: 'text-primary on bg', fg: tokens['text-primary'] as Hex, min: 7.0 },
  { label: 'text-muted on bg', fg: tokens['text-muted'] as Hex, min: 4.5 },
  // text-dim is decorative only, no AA target
  { label: 'accent-primary on bg', fg: tokens['accent-primary'] as Hex, min: 4.5 },
  { label: 'accent-secondary on bg', fg: tokens['accent-secondary'] as Hex, min: 4.5 },
  { label: 'state-error on bg', fg: tokens['state-error'] as Hex, min: 4.5 },
  { label: 'accent-hover on bg', fg: tokens['accent-hover'] as Hex, min: 4.5 },
];

let failed = 0;
for (const c of checks) {
  const r = contrast(c.fg, bg);
  const pass = r >= c.min;
  const status = pass ? 'OK ' : 'FAIL';
  console.log(`${status}  ${c.label}  ${c.fg} on ${bg} = ${r.toFixed(2)}:1 (min ${c.min}:1)`);
  if (!pass) failed++;
}

if (failed > 0) {
  console.error(`\n${failed} contrast check(s) failed.`);
  process.exit(1);
}
console.log('\nAll contrast checks passed.');
