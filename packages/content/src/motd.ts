export type MotdPools = {
  greetings: readonly string[];
  tips: readonly string[];
  facts: readonly string[];
  poetic: readonly string[];
};

export type MotdBootSet = {
  greeting: string;
  tip: string;
  fact: string;
  poetic: string;
};

const POOLS: MotdPools = {
  greetings: [
    'welcome back, traveller.',
    'good to see you.',
    'you made it.',
    "ok. let's build.",
    'glad you dropped in.',
    'session ready.',
  ],
  tips: [
    'try `projects` - most of the interesting stuff is there',
    'type `help` for commands, or `about` for the short version',
    'deep-link to anything: /about, /projects, /project/<slug>',
    '`clear` if things get noisy',
  ],
  facts: [
    'status: online',
    'timezone: ict (utc+7)',
    'editor: neovim',
    'shell: zsh',
  ],
  poetic: [
    'the river does not hurry, yet it arrives.',
    'good code is a letter to the future.',
    'make the small thing well.',
    'slow is smooth, smooth is fast.',
  ],
};

export function getMotd(): MotdPools {
  return POOLS;
}

function rng(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function pickOne<T>(arr: readonly T[], rand: () => number): T {
  const idx = Math.floor(rand() * arr.length);
  return arr[idx] as T;
}

export function pickBootSet(seed: number = Date.now()): MotdBootSet {
  const r = rng(seed);
  return {
    greeting: pickOne(POOLS.greetings, r),
    tip: pickOne(POOLS.tips, r),
    fact: pickOne(POOLS.facts, r),
    poetic: pickOne(POOLS.poetic, r),
  };
}

export function pickCompact(seed: number = Date.now()): string {
  const r = rng(seed);
  const all = [
    ...POOLS.greetings,
    ...POOLS.tips,
    ...POOLS.facts,
    ...POOLS.poetic,
  ];
  return pickOne(all, r);
}
