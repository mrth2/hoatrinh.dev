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

export type MotdBuildData = {
  latestCommitSubject: string;
  latestCommitIso: string;
  buildTimeIso: string;
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
  facts: [],  // populated at runtime via getMotd(buildData)
  poetic: [
    'the river does not hurry, yet it arrives.',
    'good code is a letter to the future.',
    'make the small thing well.',
    'slow is smooth, smooth is fast.',
  ],
};

function relative(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime();
  const diffMs = now.getTime() - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export function getMotd(buildData?: MotdBuildData): MotdPools {
  if (!buildData) return POOLS;
  const facts = [
    'status: online',
    'timezone: ict (utc+7)',
    'editor: neovim',
    'shell: zsh',
    `last deploy: ${relative(buildData.buildTimeIso)}`,
    `\`${buildData.latestCommitSubject}\``,
  ];
  return { ...POOLS, facts };
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

export function pickBootSet(seed: number = Date.now(), buildData?: MotdBuildData): MotdBootSet {
  const pools = getMotd(buildData);
  const r = rng(seed);
  return {
    greeting: pickOne(pools.greetings, r),
    tip:      pickOne(pools.tips, r),
    fact:     pickOne(pools.facts.length ? pools.facts : POOLS.greetings, r),
    poetic:   pickOne(pools.poetic, r),
  };
}

export function pickCompact(seed: number = Date.now(), buildData?: MotdBuildData): string {
  const pools = getMotd(buildData);
  const r = rng(seed);
  const all = [
    ...pools.greetings,
    ...pools.tips,
    ...pools.facts,
    ...pools.poetic,
  ].filter(Boolean);
  return pickOne(all, r);
}
