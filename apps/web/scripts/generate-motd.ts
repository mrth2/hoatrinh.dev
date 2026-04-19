import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

function run(cmd: string): string {
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

const latestCommitSubject = run('git log -1 --pretty=%s');
const latestCommitIso = run('git log -1 --pretty=%cI');
const buildTimeIso = new Date().toISOString();

const outDir = resolve(import.meta.dir, '../src/generated');
mkdirSync(outDir, { recursive: true });

const payload = {
  latestCommitSubject,
  latestCommitIso,
  buildTimeIso,
};

writeFileSync(resolve(outDir, 'motd-build.json'), JSON.stringify(payload, null, 2));
console.log(`generated motd-build.json: ${JSON.stringify(payload)}`);
