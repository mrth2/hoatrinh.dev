# Home-page ASCII avatar - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render a scalable, animated ASCII avatar in the empty gap on the home
page, positioned between the role heading and the command list, with a one-time
wave animation on hydrate.

**Architecture:** A new `Avatar` SolidJS component renders an arrow-glyph
raster inside a `<pre>`. Frame swap drives the wave (4 frames: idle + 3 wave
poses). A `useArtFit` hook observes the container and sets `font-size` via a
CSS custom property so the art fills available space without overflowing.
Below 300px container height the avatar hides itself, reclaiming the space.
SSR renders the static idle frame with a `clamp()` fallback font size so the
first paint looks right without JS. The `Motd` splash becomes a flex column so
the avatar absorbs the remaining vertical space and the `CommandIndex` anchors
near the prompt.

**Tech Stack:** SolidJS, TypeScript, CSS Modules (vanilla CSS + project design
tokens in `tokens.css`). Vitest + jsdom for unit tests. Playwright for the
e2e smoke test. Vite's `?raw` loader for the raster text file.

---

## File Structure

Added:

- `apps/web/src/components/Avatar/avatar-idle.txt` — the 85-col × 55-row idle
  raster, stored as a plain text asset and loaded with `?raw`.
- `apps/web/src/components/Avatar/avatar-frames.ts` — exports `FRAME_IDLE`,
  `FRAME_WAVE_1`, `FRAME_WAVE_2`, `FRAME_WAVE_3` as `FrameSegment[]`, plus
  `ROWS`, `COLS`, `CHAR_ASPECT`, `HIDE_BELOW_HEIGHT`.
- `apps/web/src/components/Avatar/useArtFit.ts` — container-size → font-size
  + hidden-flag reactive hook.
- `apps/web/src/components/Avatar/useArtFit.test.ts` — unit tests for fit math.
- `apps/web/src/components/Avatar/Avatar.tsx` — the component itself.
- `apps/web/src/components/Avatar/Avatar.module.css` — styles.
- `apps/web/src/components/Avatar/Avatar.test.tsx` — unit tests.

Modified:

- `apps/web/src/components/Motd/Motd.tsx` — insert `<Avatar />` slot in all
  three render branches (after boot in animated mode).
- `apps/web/src/components/Motd/Motd.module.css` — flex column + `.artSlot`.
- `apps/web/src/routes/TerminalPage.module.css` — permit flex growth on the
  scroll area's direct child section.
- `apps/web/tests/e2e/home.spec.ts` (or nearest existing home smoke) — assert
  the avatar renders and has content.

---

## Task 1: Idle raster asset

**Files:**
- Create: `apps/web/src/components/Avatar/avatar-idle.txt`

- [ ] **Step 1: Create the raster text file**

Create `apps/web/src/components/Avatar/avatar-idle.txt` containing exactly the
85-col × 55-row arrow-glyph raster the user provided during brainstorming.
Copy this content verbatim (preserve trailing whitespace, do not trim):

```
                                                                                                    
                                                                                                    
                               ↘       ↘↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↘                                      
                                   ↑↑↑↑↑→↙↖↖↖←←←←↖↖←←←↖←←←↙↓→↑↑↑↑↑↑↑                                
                                ↑↑↑↑↙←←↙↙↓↓↘↘↘↘↘↘↘↘↘↘↓↘↓↓↘↓↓↓↙↙↖↖←↓↑↑↑↑↑↑↑↑↑→↑→                     
                            ↑↑↑↑↑↙↓↑↑↑↘↓↘↓↓↓↘↑↑↑↓→↓↘↘↘↘↘↓→→→→↘↘↘↘↓↙↙↙←↖↖←←↙↙↓↑                      
                   ↙↑↑↙  ↑→↑↑↑↙↙↘→↑→ ←↘↓↘↘→↑↑←   →↘↓↓→↑↑↑↑↓ ↓↘↓↓↘↘↘↓↓↓↘↘↓↓↙↘↑↑                      
                      ←↙  ↑↑↙↙↓↘→↑→  ↑→↘↘↗↑↖  ↘↑↑→↘↗↑↑      ↙↘↘↘↘→→↑↑↑→↘↘↓↑↑↙                       
              ←↖         ↑↑↖↙↓↘↘→↑  ↑→↘↘→↗  ↖↑↑→→↑↑↙   ↑↑↑↑↑→→↗↑↑↑↑   ↙↘↓↙↙↗↑↑      ←               
                 ↙↙↙↖  ↘↑↑↙↘↘↘→↘→→ →↑↘↓↘→  ↓↑→↘↓↗↗  ↑↑↑→↘↓↘→→↘      ↗↑→↘→→↘↓↙↑↑↑  ↙↙→               
                      ↑↑→↑↑↙→↓↘↘→↘ ↖→↓↓↘→↖↖↑→↘↘↘↗ ↖↑↗↘↓↓↓↓↓↘   →↑↑↑↑→→↑↑↑↖→→↘↙→↑←     ↙↙            
           →      ↓ ↑↑↑↙↙↘↑↑←←↙↙↙↗↑↑↑↑↑↑↑→→↙←↖←↙→↑↑↘↙↖←←←↙→↑↑↑↑↑↑↑↓←↙↙    →↓↘↓↙↑↑↑ ↘→               
          ↖←↖ →↘    ↑→↙↓↘↙←↑↑↑↑↑↑↑↑↑←↖→↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑→↘↗↑↑↑↑↑↑↑↑↑→↓↙↙↑↑       ↑↙           
         ↖       ↑→↑↑↓↓↘↘↓←↙↑↑                                        ↑↑→↙↓↓↓↙↑↑↑↑      ↑↑↑↑        
     ↖↑↑↑    ↗     ↑↑↑↑↑↑↑→↑↓                                          ↙↑↓↓↓↘↙↑↑           ↙↑↑      
     ↘↖    ↑   ↑↓  ↓↑     ↑↑                                            ↑↑↓↘↘↓→↑↓            ↗      
           ↙↖  ↙   ↑↑↗↑↑↑↗↑↑                                            ↑↑↑↑↑↗→↑→    ↑    ↙  ↑      
   ↖↘↑   ↑   ↑     ↗↑↙↘↘↘↓↑↑                                            →↑    ↓↑             ↑↖↖    
     ↑   →   ↑   ← ↗↑↙↓↘↓↙↑↑                                            ↑↑→↑→↙↗↑↑  ↑ ↑ ↑  ↘  ↑↖↓↑↑  
   ↖↙↑   ←↑↑   →↑→ ↖↑↘↓↘↘↙↑↑                                            ↑↑↙↘→↘↗↑            ↗↑↑↑    
 ←↓↖  →↙    →↙↘     ↑→↓↘↙↑↑      →↑↑↑↑↑↑↑↑                ↑↑↑↑↑↑↑↑↑      ↑↑↓↓↙→↑↙         ↑↑↑    ↗↙ 
    ↙↓↙→↑↑→      ↑↑↗↑↘↖←↓↑                ↑↑            ←↑                ↑↙←←↘↑←↑↑↗   ↑↑↖  ↖  ↖↙   
 ↓↙↙←↖↖↖↖←→↑↑↑↗↑↑↙ ↙↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑          ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑→ ↖↘↑↑ ↑↙↙↙↘↑  ↖    
 ←←↖↖↖↖↖↖↖←↙→  ↙↖  ↑  ↑←↑↑↑↖                ↑↑↑↑↑↑↑↑↑↑↑↑↘               ↖↑↑↑↙→← ↑  ↖←↑ ↑←↖↙↘↘  ↙    
 ↖↖←↖←↖←←↙↙  ↙↓↖ ↗↑↑  ↑↑↙            ↖↑↑                    ↑               ↑↑↑ ↑↑↑↖↖↑ ↑↓↙  ↗  →↑   
 ↙↖↖↖↙↙↘   ↙↙↙↖ ↑↑   ↑↑↑             ↑↑↑                      →             ↑↑↑ ↓ ↑↑↖↑ ↑   ↓↑↖    ↑ 
 ↙↙↙↙↘   ↓↓↙↖↖↖←↑    ↑↑↑             ↑           ↓↓↖         ↑↑             ↑↑↑    ↑↗↑  ↗→↘↓↘↑↑↑    
 ←←←↖  →↓←↖↖↖↖↖↙↑     ↑↑                      ↑↓    ↖↑                      ↑↑→    ↗↖ ↖←        ↙↑↑ 
 ↙↙↓↖ →↙↙←↙↙↓→↙↗↑      ↑                    ↙↑        ↑→                    ↑↑     ↗↑→ ↖            
 ↙↙↓  ↘↙↙↙→↙    ↑      ↑↑                  ↑            ↑                  ↑↑      ↑↗→ ↗→↑→↓→↑↗↓↓→↑ 
 ↙←↓↖ ↘↙↓→  →↘↘↙↑↑     ↑  ↑↑↑↑↖          ↑↑              ↑↑           →↑↑↑  ↑     →↑←↗ ↓            
↖↙↙↓↖ →↘↓ ↖↘↙↙←←←↑↑     ↑           ↓→→→                    →↑↗↘↖          ↑↗    ↑↑↓↖↗     ←    ↖↗↘ 
 ↖↙↓↖ ←→  ↘↙↙↙↙↙←↖↑↑↑   ↑                                                  ↑   →↑↑   ↑ ↙↖←    ↙↖ ←  
 ↖↙↙→  →  ↙↓←↙↙←←←↖↖↑↑↑↑↑↑                                                ↑↑↑↑↑↑↘↙→→   ↑↓← ↓↓    ↖↖ 
  ↙↙→  ↗  ↓↓↙↙↙↙↙↙↙↙↖↖↖  ↑↑                 ↑↑        ↑↑                  ↑  ←↖↙↙↙↙↓→↑     ←        
 ↑↙→↑↙ ↑↖↖↑↑↗↑→→→→→→→→↘↑→ ↑                      ↗↑↓                     ↑↑↗↑↘↓↓↓↓↓↓↙↑ ↖ ↗    ↙↓↖   
  ←↖↓  ←  ↖←     ↖↙↓   ↑ ↑↑↑↑                                          →↑↑↑↑↑↑↑→↘↓↓↓↙→↙→↖←↓→↘   ↙   
    →  ↑↑       ←↗  ↑↑↑    ↑↑↑↑                                      →↑↑      ↑↑↑↑↘↓↓↓↘→→→→→↗↑↑↑↑↑  
          ↑↑↑↑↗↑↑↑↑           ↑↑↑                                  ↑↑↑   ↑↑↑↑←   ↑↑↑↘↘↘↘↘↘→↑↑↑↑     
     ↗↑↖         ↑    ↑   ↑ ↑←  ↙↑↑↑↑↑                        ↑↑↑↑↑↑  ↑↑↑↑         ↑↑↗→→→↗↑↑        
        ↑↑←  ↑↑↑       ↑↑    ↑   ↑↙↓↗↙→↑↑↑↑↑↑↑←       ↙↑↑↑↑↑↑↑↑→↙↙↓↑  ↑      ↙↑     ↙     ↘         
      ↑↑  ↑↖ ↙  ↖↑↑↑↑    ↑↖ ↖   →↑↑→ ←←↑↑↑↑↑↑↑       ↑↑↑↑↑↑↑↘ ←←↙↓→↑  ↑   ↑ ↑       ↑↗↗↗↑↗↑         
        ↑ ↖↖ ↑↑↑↑↑  ↑↙↑    ↑      ↖↑↑↑↑↑  ↑↘→↑       ↑↖←→  ↑↑↑↑↑↑↑↘↑  ↑   ↑↑   ↑   ↑↑↘→→→↘↑↗        
                        ↑  ↑ ↑  ↑→    ↑↑↑↑↗↓↑↑↑↑↑ ↖↑↑↑↓↙↑↑↑↑↑  ↙  ↑↑    ↙          ↗↑↑↗→↘→→↑        
            ↑↑↑↑↑↑↑↖          ↓↑↑↘↘↘↗←↘↑↑←↑↑↑↑↑↗↑↑↑↑↑↑↑↑↑↙↑↑↗↙↑→→→→↑↑↑↑          ↑↑↑  ↑↑→↙          
           ↑    ↙↑↑↑↑↑↖    ←↑↑↑↑↑↑↑→↑↑↑↑↙↙↙↙↑  ↑↙↘↓↗↑ ↑←↙↙↓↑↑↑↑↓↑↑↑↘  ↑↑↑↑   ↑↑↑↑↑↗↑↑↑ ↖↑           
              ↖     ↗↑↑↑↑↑↑↑↑↗   ↗↑↑↑→ ↑↑↓↘↘↑ ↖↑↙↘↙↑↑ ↑↘↘↘↑↑  ↑↑↑↑  → ↑  ↑↑↑↑↑↑→→→→→→↗↘             
                  ↙  ↑↑→↗→→↗↑←↖↙↑↑↓↑↙↑  ↑→↙↖↗  ↑↖↙↖→↑ ↑↓↓↙↑ ↑↑↑↑↑↑↑↑↑↑↑↑  ↑→→→→→→→→↘↘↗              
                  ↑  ↑↑→→→↘↑↑↑↑↑↗↗↑↑↑↑  →↑↑↑↑↑↑↑↑↑↑↑↑ ↑↖↖↓↑       ↑↑↑ ↙↑  ↑↑↑↑↑→→↘→↘                
                     ↓↑→→↑→↑↑  ↘↙↑        ↑↖↖↖↑↑↓↘→↑↑↑↑↑↑↑↑         ↑  ↑↑←    →↑↑↓                  
                     ↑↗→↑↑ ↑  ↑↑↑↙  ↖↗↑↑↑↑↑↙↙↑↑↘↙↙↙↙↙↙↖↖↖↙→↑↑↑↑↑↑↑↑↑↑  ↘↑↑↑↑↑↗                      
                        ↑ →↑  ↑↗↘↑↑↑↑↑↑↑↑↑↙↙→↑ ↙↑↑↑↑↑↑↑↑↗↘↓↓↓↙↙↙↓↘↗↑↑  ↗↑↑↓→                        
                           ↑   →↙↓↓↓↓↓↘↙↘↑↖↖↑↑          ↑↑↑↑↑↑↑↑↑↑↑↑   →↑                           
                               →↙↖↖↖↙↓→↑↑↑↑↓↗↑↑↑↑↑↑↑↑↑                                              
                                    →↓←    ↑↑↑↑↑↑↑→↘↙↘→↑↑↑↑↑↑↑↑↑                                    
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/Avatar/avatar-idle.txt
git commit -m "feat(web): add idle avatar raster asset"
```

---

## Task 2: useArtFit hook (tests first, then implementation)

**Files:**
- Create: `apps/web/src/components/Avatar/useArtFit.ts`
- Test:   `apps/web/src/components/Avatar/useArtFit.test.ts`

- [ ] **Step 1: Write failing tests**

Create `apps/web/src/components/Avatar/useArtFit.test.ts`:

```ts
import { createRoot } from 'solid-js';
import { describe, expect, it, vi } from 'vitest';
import { computeFit } from './useArtFit';

describe('computeFit', () => {
  it('returns null-ish when container has zero size', () => {
    expect(computeFit({ width: 0, height: 0, rows: 55, cols: 85, charAspect: 0.6, minPx: 6, maxPx: 16, hideBelowHeight: 300 })).toEqual({ fontSize: null, hidden: true });
  });

  it('chooses width-binding when width is the constraint', () => {
    // width=510 -> fsByWidth = 510/(85*0.6) = 10; height=800 -> fsByHeight = 800/55 ≈ 14.5
    const fit = computeFit({ width: 510, height: 800, rows: 55, cols: 85, charAspect: 0.6, minPx: 6, maxPx: 16, hideBelowHeight: 300 });
    expect(fit).toEqual({ fontSize: 10, hidden: false });
  });

  it('chooses height-binding when height is the constraint', () => {
    // width=900 -> fsByWidth = 900/51 ≈ 17.6; height=440 -> fsByHeight = 440/55 = 8
    const fit = computeFit({ width: 900, height: 440, rows: 55, cols: 85, charAspect: 0.6, minPx: 6, maxPx: 16, hideBelowHeight: 300 });
    expect(fit).toEqual({ fontSize: 8, hidden: false });
  });

  it('clamps to minPx', () => {
    const fit = computeFit({ width: 100, height: 400, rows: 55, cols: 85, charAspect: 0.6, minPx: 6, maxPx: 16, hideBelowHeight: 300 });
    expect(fit.fontSize).toBe(6);
    expect(fit.hidden).toBe(false);
  });

  it('clamps to maxPx', () => {
    const fit = computeFit({ width: 5000, height: 5000, rows: 55, cols: 85, charAspect: 0.6, minPx: 6, maxPx: 16, hideBelowHeight: 300 });
    expect(fit.fontSize).toBe(16);
  });

  it('hides when height is below threshold', () => {
    const fit = computeFit({ width: 900, height: 250, rows: 55, cols: 85, charAspect: 0.6, minPx: 6, maxPx: 16, hideBelowHeight: 300 });
    expect(fit.hidden).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun x vitest run apps/web/src/components/Avatar/useArtFit.test.ts`
Expected: FAIL — `computeFit` not defined / module not found.

- [ ] **Step 3: Implement the hook**

Create `apps/web/src/components/Avatar/useArtFit.ts`:

```ts
import { createSignal, onCleanup } from 'solid-js';

export type Fit = { fontSize: number | null; hidden: boolean };

export type ComputeFitInput = {
  width: number;
  height: number;
  rows: number;
  cols: number;
  charAspect: number;
  minPx: number;
  maxPx: number;
  hideBelowHeight: number;
};

export function computeFit(i: ComputeFitInput): Fit {
  if (i.width <= 0 || i.height <= 0) return { fontSize: null, hidden: true };
  if (i.height < i.hideBelowHeight) return { fontSize: null, hidden: true };
  const fsByWidth = i.width / (i.cols * i.charAspect);
  const fsByHeight = i.height / i.rows;
  const raw = Math.floor(Math.min(fsByWidth, fsByHeight));
  const fontSize = Math.max(i.minPx, Math.min(i.maxPx, raw));
  return { fontSize, hidden: false };
}

export type UseArtFitOpts = {
  container: () => HTMLElement | undefined;
  rows?: number;
  cols?: number;
  charAspect?: number;
  hideBelowHeight?: number;
  minPx?: number;
  maxPx?: number;
};

export function useArtFit(opts: UseArtFitOpts): () => Fit {
  const rows = opts.rows ?? 55;
  const cols = opts.cols ?? 85;
  const charAspect = opts.charAspect ?? 0.6;
  const hideBelowHeight = opts.hideBelowHeight ?? 300;
  const minPx = opts.minPx ?? 6;
  const maxPx = opts.maxPx ?? 16;
  const [fit, setFit] = createSignal<Fit>({ fontSize: null, hidden: false });

  const measure = () => {
    const el = opts.container();
    if (!el) return;
    setFit(
      computeFit({
        width: el.clientWidth,
        height: el.clientHeight,
        rows,
        cols,
        charAspect,
        minPx,
        maxPx,
        hideBelowHeight,
      }),
    );
  };

  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(() => measure());
    queueMicrotask(() => {
      const el = opts.container();
      if (el) ro.observe(el);
      measure();
    });
    onCleanup(() => ro.disconnect());
  }

  return fit;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun x vitest run apps/web/src/components/Avatar/useArtFit.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/Avatar/useArtFit.ts apps/web/src/components/Avatar/useArtFit.test.ts
git commit -m "feat(web): add useArtFit hook for avatar sizing"
```

---

## Task 3: Frames module (idle + wave poses, glasses segmentation)

**Files:**
- Create: `apps/web/src/components/Avatar/avatar-frames.ts`

- [ ] **Step 1: Write the frames module**

Create `apps/web/src/components/Avatar/avatar-frames.ts`:

```ts
import idleRaw from './avatar-idle.txt?raw';

export const ROWS = 55;
export const COLS = 85;
export const CHAR_ASPECT = 0.6;
export const HIDE_BELOW_HEIGHT = 300;

// Rows (0-indexed) that contain the glasses/visor band. Rendered with amber
// glow. Chosen from visual inspection of the raster.
const GLASSES_ROW_START = 19;
const GLASSES_ROW_END = 22; // inclusive

// Right-arm bounding box (0-indexed). The idle raster has the arms crossed.
// Wave frames replace only this row range with alternative content.
const ARM_ROW_START = 27;
const ARM_ROW_END = 34; // inclusive

export type FrameSegment = { text: string; kind: 'body' | 'glow' };

const idleRows = idleRaw.split('\n');

function segmentRows(rows: string[]): FrameSegment[] {
  const pre = rows.slice(0, GLASSES_ROW_START).join('\n');
  const glow = rows.slice(GLASSES_ROW_START, GLASSES_ROW_END + 1).join('\n');
  const post = rows.slice(GLASSES_ROW_END + 1).join('\n');
  return [
    { kind: 'body', text: `${pre}\n` },
    { kind: 'glow', text: `${glow}\n` },
    { kind: 'body', text: post },
  ];
}

function withArm(rows: string[], armRows: string[]): string[] {
  const out = [...rows];
  for (let i = 0; i < armRows.length; i++) {
    const target = ARM_ROW_START + i;
    if (target <= ARM_ROW_END && target < out.length) {
      out[target] = armRows[i] ?? out[target] ?? '';
    }
  }
  return out;
}

// Arm-region replacement strings. Each string is a full row (COLS chars) but
// only the right-arm area differs from FRAME_IDLE's corresponding row. All
// three poses raise the right arm progressively.
// Row indices map to ARM_ROW_START..ARM_ROW_END.

const WAVE_1_ARM_ROWS: string[] = [
  ' ↙↙↓↖ →↙↙↗↑↙↓→↙↗↑      ↑                    ↙↑        ↑→                    ↑↑     ↗↑→ ↖            ',
  ' ↙↙↓  ↘↙↙↗↑→↙    ↑      ↑↑                  ↑            ↑                  ↑↑      ↑↗→ ↗→↑→↓→↑↗↓↓→↑ ',
  ' ↙←↓↖ ↘↙↗↑→  →↘↘↙↑↑     ↑  ↑↑↑↑↖          ↑↑              ↑↑           →↑↑↑  ↑     →↑←↗ ↓            ',
  '↖↙↙↓↖ →↘↗↑↖↘↙↙←←←↑↑     ↑           ↓→→→                    →↑↗↘↖          ↑↗    ↑↑↓↖↗     ←    ↖↗↘ ',
  ' ↖↙↓↖ ←→↗↑↙↙↙↙↙←↖↑↑↑   ↑                                                  ↑   →↑↑   ↑ ↙↖←    ↙↖ ←  ',
  ' ↖↙↙→  →↗↑↓←↙↙←←←↖↖↑↑↑↑↑↑                                                ↑↑↑↑↑↑↘↙→→   ↑↓← ↓↓    ↖↖ ',
  '  ↙↙→  ↗↗↑↓↙↙↙↙↙↙↙↖↖↖  ↑↑                 ↑↑        ↑↑                  ↑  ←↖↙↙↙↙↓→↑     ←        ',
  ' ↑↙→↑↙ ↑↖↖↑↑↗↑→→→→→→→→↘↑→ ↑                      ↗↑↓                     ↑↑↗↑↘↓↓↓↓↓↓↙↑ ↖ ↗    ↙↓↖   ',
];

const WAVE_2_ARM_ROWS: string[] = [
  ' ↙↙↓↖ →↙↙↗→↖↓→↙↗↑      ↑                    ↙↑        ↑→                    ↑↑     ↗↑→ ↖            ',
  ' ↙↙↓  ↘↙↙↗→↖    ↑      ↑↑                  ↑            ↑                  ↑↑      ↑↗→ ↗→↑→↓→↑↗↓↓→↑ ',
  ' ↙←↓↖ ↘↙↗→↖  →↘↘↙↑↑     ↑  ↑↑↑↑↖          ↑↑              ↑↑           →↑↑↑  ↑     →↑←↗ ↓            ',
  '↖↙↙↓↖ →↘↗→↖↘↙↙←←←↑↑     ↑           ↓→→→                    →↑↗↘↖          ↑↗    ↑↑↓↖↗     ←    ↖↗↘ ',
  ' ↖↙↓↖ ←→↗→↖↙↙↙↙←↖↑↑↑   ↑                                                  ↑   →↑↑   ↑ ↙↖←    ↙↖ ←  ',
  ' ↖↙↙→  →↗→↖↓←↙↙←←←↖↖↑↑↑↑↑↑                                                ↑↑↑↑↑↑↘↙→→   ↑↓← ↓↓    ↖↖ ',
  '  ↙↙→  ↗↗↗↓↙↙↙↙↙↙↙↖↖↖  ↑↑                 ↑↑        ↑↑                  ↑  ←↖↙↙↙↙↓→↑     ←        ',
  ' ↑↙→↑↙ ↑↖↖↑↑↗↑→→→→→→→→↘↑→ ↑                      ↗↑↓                     ↑↑↗↑↘↓↓↓↓↓↓↙↑ ↖ ↗    ↙↓↖   ',
];

const WAVE_3_ARM_ROWS: string[] = [
  ' ↙↙↓↖ →↙↙↗↗↖↓→↙↗↑      ↑                    ↙↑        ↑→                    ↑↑     ↗↑→ ↖            ',
  ' ↙↙↓  ↘↙↙↗↗↖    ↑      ↑↑                  ↑            ↑                  ↑↑      ↑↗→ ↗→↑→↓→↑↗↓↓→↑ ',
  ' ↙←↓↖ ↘↙↗↗↖  →↘↘↙↑↑     ↑  ↑↑↑↑↖          ↑↑              ↑↑           →↑↑↑  ↑     →↑←↗ ↓            ',
  '↖↙↙↓↖ →↘↗↗↖↘↙↙←←←↑↑     ↑           ↓→→→                    →↑↗↘↖          ↑↗    ↑↑↓↖↗     ←    ↖↗↘ ',
  ' ↖↙↓↖ ←→↗↗↖↙↙↙↙←↖↑↑↑   ↑                                                  ↑   →↑↑   ↑ ↙↖←    ↙↖ ←  ',
  ' ↖↙↙→  →↗↗↖↓←↙↙←←←↖↖↑↑↑↑↑↑                                                ↑↑↑↑↑↑↘↙→→   ↑↓← ↓↓    ↖↖ ',
  '  ↙↙→  ↗↗↗↓↙↙↙↙↙↙↙↖↖↖  ↑↑                 ↑↑        ↑↑                  ↑  ←↖↙↙↙↙↓→↑     ←        ',
  ' ↑↙→↑↙ ↑↖↖↑↑↗↑→→→→→→→→↘↑→ ↑                      ↗↑↓                     ↑↑↗↑↘↓↓↓↓↓↓↙↑ ↖ ↗    ↙↓↖   ',
];

export const FRAME_IDLE: FrameSegment[] = segmentRows(idleRows);
export const FRAME_WAVE_1: FrameSegment[] = segmentRows(withArm(idleRows, WAVE_1_ARM_ROWS));
export const FRAME_WAVE_2: FrameSegment[] = segmentRows(withArm(idleRows, WAVE_2_ARM_ROWS));
export const FRAME_WAVE_3: FrameSegment[] = segmentRows(withArm(idleRows, WAVE_3_ARM_ROWS));

export const WAVE_SEQUENCE: FrameSegment[][] = [
  FRAME_WAVE_1,
  FRAME_WAVE_2,
  FRAME_WAVE_3,
  FRAME_WAVE_2,
  FRAME_WAVE_1,
  FRAME_IDLE,
];
export const WAVE_FRAME_MS = 250;
```

- [ ] **Step 2: Typecheck the module**

Run: `bun run typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/Avatar/avatar-frames.ts
git commit -m "feat(web): add avatar frame data (idle + 3 wave poses)"
```

---

## Task 4: Avatar component and styles (tests first, then implementation)

**Files:**
- Create: `apps/web/src/components/Avatar/Avatar.tsx`
- Create: `apps/web/src/components/Avatar/Avatar.module.css`
- Test:   `apps/web/src/components/Avatar/Avatar.test.tsx`

- [ ] **Step 1: Write the CSS module**

Create `apps/web/src/components/Avatar/Avatar.module.css`:

```css
.artSlot {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-code);
  color: var(--text-primary);
}

.art {
  margin: 0;
  padding: 0;
  white-space: pre;
  line-height: 1;
  font-size: var(--art-font-size, clamp(6px, 1.6vh, 14px));
  letter-spacing: 0;
  color: inherit;
}

.glow {
  color: var(--accent-primary);
  text-shadow: 0 0 12px rgba(255, 179, 71, 0.28);
}

@media (prefers-reduced-motion: reduce), (prefers-contrast: more) {
  .glow {
    text-shadow: none;
  }
}

.hidden {
  display: none;
}

.visuallyHidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

- [ ] **Step 2: Write failing tests**

Create `apps/web/src/components/Avatar/Avatar.test.tsx`:

```tsx
import { cleanup, fireEvent, render } from '@solidjs/testing-library';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Avatar } from './Avatar';

function mockMatchMedia(matches: (q: string) => boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (q: string) => ({
      matches: matches(q),
      media: q,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
      onchange: null,
    }),
  });
}

describe('Avatar', () => {
  afterEach(() => cleanup());

  it('renders the idle frame by default', () => {
    mockMatchMedia((q) => q.includes('reduce'));
    const { getByTestId } = render(() => <Avatar />);
    const el = getByTestId('avatar');
    expect(el.textContent?.length ?? 0).toBeGreaterThan(100);
  });

  it('stays on idle when prefers-reduced-motion is set', () => {
    vi.useFakeTimers();
    mockMatchMedia((q) => q.includes('reduce'));
    const { getByTestId } = render(() => <Avatar />);
    const el = getByTestId('avatar');
    const first = el.textContent ?? '';
    vi.advanceTimersByTime(5000);
    expect(el.textContent).toBe(first);
    vi.useRealTimers();
  });

  it('cycles through wave frames on mount without reduced motion', async () => {
    vi.useFakeTimers();
    mockMatchMedia(() => false);
    const { getByTestId } = render(() => <Avatar />);
    const el = getByTestId('avatar');
    const idle = el.textContent ?? '';
    await vi.advanceTimersByTimeAsync(250);
    expect(el.textContent).not.toBe(idle);
    // Run out the cycle (6 frames × 250ms)
    await vi.advanceTimersByTimeAsync(6 * 250 + 50);
    expect(el.textContent).toBe(idle);
    vi.useRealTimers();
  });

  it('replays the wave when clicked while idle', async () => {
    vi.useFakeTimers();
    mockMatchMedia(() => false);
    const { getByTestId } = render(() => <Avatar />);
    const el = getByTestId('avatar');
    // Let initial cycle finish.
    await vi.advanceTimersByTimeAsync(6 * 250 + 100);
    const idle = el.textContent ?? '';
    fireEvent.click(el);
    await vi.advanceTimersByTimeAsync(250);
    expect(el.textContent).not.toBe(idle);
    vi.useRealTimers();
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `bun x vitest run apps/web/src/components/Avatar/Avatar.test.tsx`
Expected: FAIL — `Avatar` not defined.

- [ ] **Step 4: Implement the component**

Create `apps/web/src/components/Avatar/Avatar.tsx`:

```tsx
import { createSignal, For, onCleanup, onMount, Show } from 'solid-js';
import {
  FRAME_IDLE,
  type FrameSegment,
  WAVE_FRAME_MS,
  WAVE_SEQUENCE,
} from './avatar-frames';
import { useArtFit } from './useArtFit';
import styles from './Avatar.module.css';

export function Avatar() {
  const [container, setContainer] = createSignal<HTMLDivElement | undefined>();
  const [frame, setFrame] = createSignal<FrameSegment[]>(FRAME_IDLE);
  const [playing, setPlaying] = createSignal(false);
  const fit = useArtFit({ container });

  let timer: ReturnType<typeof setTimeout> | undefined;
  const clearTimer = () => {
    if (timer) clearTimeout(timer);
    timer = undefined;
  };

  function reducedMotion(): boolean {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function playWave() {
    if (playing()) return;
    if (reducedMotion()) return;
    if (fit().hidden) return;
    setPlaying(true);
    let i = 0;
    const tick = () => {
      const next = WAVE_SEQUENCE[i];
      if (!next) {
        setFrame(FRAME_IDLE);
        setPlaying(false);
        timer = undefined;
        return;
      }
      setFrame(next);
      i++;
      timer = setTimeout(tick, WAVE_FRAME_MS);
    };
    tick();
  }

  onMount(() => {
    playWave();
  });

  onCleanup(() => clearTimer());

  const fontSizeStyle = () => {
    const f = fit();
    return f.fontSize ? { '--art-font-size': `${f.fontSize}px` } : {};
  };

  return (
    <Show when={!fit().hidden}>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: decorative avatar; keyboard users never need to "wave" it */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: decorative; no keyboard affordance required */}
      <div
        class={styles.artSlot}
        ref={setContainer}
        data-testid="avatar"
        onClick={playWave}
        onMouseEnter={playWave}
        style={fontSizeStyle()}
      >
        <span class={styles.visuallyHidden}>Avatar of Hoa</span>
        <pre class={styles.art} aria-hidden="true">
          <For each={frame()}>
            {(seg) => (
              <Show when={seg.kind === 'glow'} fallback={<span>{seg.text}</span>}>
                <span class={styles.glow}>{seg.text}</span>
              </Show>
            )}
          </For>
        </pre>
      </div>
    </Show>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `bun x vitest run apps/web/src/components/Avatar/Avatar.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/components/Avatar/Avatar.tsx apps/web/src/components/Avatar/Avatar.module.css apps/web/src/components/Avatar/Avatar.test.tsx
git commit -m "feat(web): add Avatar component with wave animation"
```

---

## Task 5: Insert Avatar slot into Motd

**Files:**
- Modify: `apps/web/src/components/Motd/Motd.tsx`
- Modify: `apps/web/src/components/Motd/Motd.module.css`

- [ ] **Step 1: Update Motd styles for flex layout**

Edit `apps/web/src/components/Motd/Motd.module.css`. Change the `.motd` rule
to make it a flex column that fills available space, and add a new `.artSlot`
style used by the Avatar's outer wrapper:

```css
.motd {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-top: var(--space-6);
  font-family: var(--font-code);
  flex: 1 1 auto;
  min-height: 0;
}

/* The CommandIndex + compactLine should anchor near the bottom; Avatar
   absorbs the flexible space above them. */
.motdSpacer {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
}
```

(Do not remove existing rules below; they remain as-is.)

- [ ] **Step 2: Update Motd.tsx to include Avatar**

Edit `apps/web/src/components/Motd/Motd.tsx`. Add the import:

```tsx
import { Avatar } from '@/components/Avatar/Avatar';
```

Then insert the Avatar between `role` and `CommandIndex` in all three render
branches (Compact, BootStatic, and the `done()` block of BootAnimated). The
insert, in each case, looks like:

```tsx
<p class={styles.role}>senior software engineer · vietnam</p>
<div class={styles.motdSpacer}>
  <Avatar />
</div>
<CommandIndex onSuggestion={props.onSuggestion} />
```

Do not modify the boot-animated streaming lines. The Avatar mounts only after
`done()` is true (it is inside the `<Show when={done()}>` block), so the
streaming animation finishes uninterrupted.

- [ ] **Step 3: Run unit tests**

Run: `bun run test:unit`
Expected: PASS (existing Motd tests still pass; new Avatar tests still pass).

- [ ] **Step 4: Visual smoke check (dev)**

Run: `bun run dev`
Open http://localhost:5173/ in a browser. Verify:
- The avatar renders between "senior software engineer · vietnam" and the
  command list.
- The command list sits just above the prompt bar at the bottom of the page.
- The avatar waves once on load.
- Clicking the avatar replays the wave.
- Resizing the window rescales the art without horizontal overflow.
- On a short viewport (< 300px height available), the avatar disappears.

Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/Motd/Motd.tsx apps/web/src/components/Motd/Motd.module.css
git commit -m "feat(web): embed Avatar in home splash"
```

---

## Task 6: Ensure TerminalPage scroll allows flex growth

**Files:**
- Modify: `apps/web/src/routes/TerminalPage.module.css`

- [ ] **Step 1: Inspect current .scroll rules**

Open `apps/web/src/routes/TerminalPage.module.css`. If `.scroll` is not
already a flex column with `flex: 1 1 auto`, update it so its child `section`
(the Motd) can grow. Minimal change example — ensure the rule set for
`.scroll` includes:

```css
.scroll {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  /* ...existing overflow/scroll rules remain... */
}
```

Do not remove unrelated rules. If `.scroll` is already a flex column, skip
this task.

- [ ] **Step 2: Confirm the page still lays out correctly**

Run: `bun run dev`
Open http://localhost:5173/. The session bar should still be at the top, the
prompt at the bottom, and the Motd content in between. The avatar fills the
gap.

- [ ] **Step 3: Commit if anything changed**

```bash
git add apps/web/src/routes/TerminalPage.module.css
git commit -m "style(web): let terminal scroll area flex-grow its children"
```

If no change was needed, skip this commit.

---

## Task 7: E2E smoke test

**Files:**
- Modify: the existing home-page e2e spec in `apps/web/tests/e2e/` (most
  likely `home.spec.ts` or `smoke.spec.ts`). If no home spec exists, create
  `apps/web/tests/e2e/home.spec.ts`.

- [ ] **Step 1: Inspect existing e2e specs**

Run: `ls apps/web/tests/e2e/`
Pick the file that currently covers the home page (`/`).

- [ ] **Step 2: Add avatar assertion**

Append a test case (or extend the existing one) with:

```ts
test('home page renders the avatar', async ({ page }) => {
  await page.goto('/');
  const avatar = page.getByTestId('avatar');
  await expect(avatar).toBeVisible();
  const text = await avatar.textContent();
  expect((text ?? '').length).toBeGreaterThan(100);
});
```

If the file already has a `test.describe` block for the home page, nest
inside it. Follow the file's existing import/setup style.

- [ ] **Step 3: Build + prerender + run e2e**

Run: `bun run build && bun run prerender && bun run e2e`
Expected: PASS (including the new avatar test).

- [ ] **Step 4: Commit**

```bash
git add apps/web/tests/e2e/
git commit -m "test(e2e): assert home-page avatar renders"
```

---

## Task 8: Full verification

- [ ] **Step 1: Run the full CI-equivalent sequence**

Run, in order:

```bash
bun run typecheck
bun run lint
bun run test
bun run build
bun run prerender
bun run e2e
```

Expected: every step PASSES. If any fail, fix the failure before proceeding.

- [ ] **Step 2: Visual regression check**

Run: `bun run preview`
Open the preview URL. Test three viewports manually:

- **Desktop (1440×900):** avatar large, visible wave on load, command list at
  bottom of visible area.
- **Tablet (820×1180):** avatar scales to fit, no horizontal overflow.
- **Short/wide (1440×360):** avatar hides (height < 300), command list shows
  cleanly above prompt.

Stop preview.

- [ ] **Step 3: Reduced-motion check**

In browser devtools, enable "Emulate prefers-reduced-motion: reduce". Reload
the home page. Confirm the avatar renders the idle frame, does not animate,
and does not glow (text-shadow removed by the media rule).

- [ ] **Step 4: Final commit if any polish was needed**

If Steps 2-3 surfaced issues you fixed, commit them. Otherwise skip.

---

## Self-Review Notes

- All spec sections map to tasks: layout restructure (T5, T6), Avatar
  component (T4), frames module (T3), useArtFit (T2), SSR-safe fallback (T4
  CSS `clamp()` on `.art`), animation state machine (T4 Avatar.tsx), glasses
  accent (T3 segmentation + T4 `.glow` style), tests (T2, T4, T7), files
  touched (all tasks).
- Types referenced across tasks are consistent: `FrameSegment`, `Fit`,
  `WAVE_SEQUENCE`, `FRAME_IDLE`, `ROWS`, `COLS`, `CHAR_ASPECT`,
  `HIDE_BELOW_HEIGHT` all declared in `avatar-frames.ts` or `useArtFit.ts`
  and imported where used.
- No placeholders or deferred decisions. The wave-arm replacement rows are
  hand-authored here to keep the plan executable without further judgment
  calls. If the visual result feels off, adjust the WAVE_*_ARM_ROWS strings
  in `avatar-frames.ts` post-hoc; the structure is fixed.
