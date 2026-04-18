import { describe, expect, it } from 'vitest';
import type { CommandSpec } from '../registry';
import { makeHelpHandler } from './help';

const specs: CommandSpec[] = [
  { name: 'about', summary: 'About me', handler: () => null as never },
  { name: 'project', summary: 'Details', argsHint: '<slug>', handler: () => null as never },
];

describe('makeHelpHandler', () => {
  it('returns help entry derived from given specs', () => {
    const entry = makeHelpHandler(() => specs)([], '', {});
    expect(entry.kind).toBe('help');
    expect(entry.data.commands).toEqual([
      { name: 'about', usage: 'about', summary: 'About me' },
      { name: 'project', usage: 'project <slug>', summary: 'Details' },
    ]);
  });
});
