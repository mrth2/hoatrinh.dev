# Home-page ASCII avatar - design spec

Date: 2026-04-19
Status: Draft

## Goal

Fill the empty vertical gap on the home page with an ASCII-art rendering of the
chibi avatar at `~/Workspace/Avatars/chibi-avatar-futuristic.png`. The art
should fit whatever vertical space is available between the name/role header
and the command list, scale to fit on hydrate, and animate a one-time wave on
first render. The rest of the terminal UX must remain untouched.

## Scope

In-scope:

- A new `Avatar` component rendering a single ASCII frame inside a `<pre>`.
- Four hand-authored frames (idle + three wave poses) stored as string
  constants in a sibling `avatar-frames.ts`.
- A `useArtFit` hook that observes the avatar container and sets
  `--art-font-size` so the art fills the container without overflowing.
- Insertion of the avatar into the `Motd` splash, restructured so the command
  list anchors near the prompt input.
- One-time wave on hydrate, re-trigger on hover/click, honors
  `prefers-reduced-motion`.
- SSR renders the static idle frame; hydration takes over sizing + animation.

Out-of-scope:

- Any new command (e.g. `avatar`, `whoami`).
- Any change to `TerminalPage` aside from CSS tweaks to let the Motd section
  grow to fill the scroll area.
- Colour drift outside the amber palette - the glasses band reuses
  `--accent-primary`, never a new hue.

## Layout restructure

The `Motd` component currently renders, in order:

1. `name`
2. `role`
3. `CommandIndex`
4. `ready` compact line

The restructured splash inserts the avatar slot between `role` and
`CommandIndex`:

1. `name`
2. `role`
3. **Avatar slot (flex-fills)**
4. `CommandIndex`
5. `ready` compact line

Effect: the command list is anchored near the bottom of the scroll area, just
above the `Prompt` input, and the avatar absorbs the remaining vertical space.
This applies to all three Motd modes (`compact`, `boot-static`,
`boot-animated`). In `boot-animated`, the avatar only mounts after `done()`
flips true so the streaming boot lines finish without competition.

### CSS changes

`Motd.module.css`:

- `.motd` becomes `display: flex; flex-direction: column; flex: 1 1 auto;
  min-height: 0;`
- A new `.artSlot` class: `flex: 1 1 auto; min-height: 0; overflow: hidden;
  display: flex; align-items: center; justify-content: center;`.

`TerminalPage.module.css`:

- Ensure `.scroll` is `display: flex; flex-direction: column;` and that the
  first-child `section` (Motd) can grow. If existing styles already permit
  this, no change.

## Avatar component

### Files

- `apps/web/src/components/Avatar/Avatar.tsx`
- `apps/web/src/components/Avatar/Avatar.module.css`
- `apps/web/src/components/Avatar/avatar-frames.ts`
- `apps/web/src/components/Avatar/useArtFit.ts`
- `apps/web/src/components/Avatar/Avatar.test.tsx`
- `apps/web/src/components/Avatar/useArtFit.test.ts`

### Props

```ts
type AvatarProps = {
  // optional for now; defaults are sensible
  // rows / cols / charAspect can be exported constants
};
```

No props in v1. The component is self-contained.

### Render shape

```tsx
<div class={styles.artSlot} ref={containerRef} data-testid="avatar">
  <span class="visuallyHidden">Avatar of Hoa</span>
  <pre
    class={styles.art}
    aria-hidden="true"
    style={{ 'font-size': fontSize() ? `${fontSize()}px` : undefined }}
  >
    {currentFrame()}
  </pre>
</div>
```

When `hidden()` returns true, the component renders `null` (or a wrapper with
`display: none`) so the space is reclaimed by flex siblings.

### Frames (`avatar-frames.ts`)

Exports:

- `FRAME_IDLE: string` - the 85-col × 55-row arrow raster the user provided.
- `FRAME_WAVE_1`, `FRAME_WAVE_2`, `FRAME_WAVE_3: string` - right-arm region
  (cols ~18-38, rows ~24-34) redrawn in three wave poses. Every other
  character is byte-for-byte identical to `FRAME_IDLE`, so only the arm region
  visibly changes between frames.
- `ROWS = 55`, `COLS = 85`, `CHAR_ASPECT = 0.6` constants.

The wave frames are hand-authored using the same arrow-glyph vocabulary as the
idle raster so the style is consistent.

### Glasses accent

In `avatar-frames.ts`, the idle raster is split at the glasses band (rows
~14-18). Instead of a single string, the frame is exported as an array of
segments:

```ts
export type FrameSegment = { text: string; kind: 'body' | 'glow' };
export const FRAME_IDLE: FrameSegment[] = [
  { kind: 'body', text: '...top of head...' },
  { kind: 'glow', text: '...visor rows...' },
  { kind: 'body', text: '...torso + background...' },
];
```

Render:

```tsx
<pre>
  <For each={currentFrame()}>
    {(seg) => (
      <span class={seg.kind === 'glow' ? styles.glow : undefined}>
        {seg.text}
      </span>
    )}
  </For>
</pre>
```

`styles.glow` uses:

```css
color: var(--accent-primary);
text-shadow: 0 0 12px rgba(255, 179, 71, 0.28);
```

Body segments inherit `var(--text-primary)` from the `<pre>`.

## useArtFit hook

```ts
type Fit = { fontSize: number | null; hidden: boolean };
function useArtFit(opts: {
  container: () => HTMLElement | undefined;
  rows?: number;    // default 55
  cols?: number;    // default 85
  charAspect?: number; // default 0.6
  hideBelowHeight?: number; // default 300
  minPx?: number;   // default 6
  maxPx?: number;   // default 16
}): () => Fit;
```

Behaviour:

- On mount, if container exists, measure `clientWidth` and `clientHeight`.
- `fsByWidth = width / (cols * charAspect)`
- `fsByHeight = height / rows`
- `fontSize = clamp(minPx, floor(min(fsByWidth, fsByHeight)), maxPx)`
- `hidden = height < hideBelowHeight`
- Subscribe to a `ResizeObserver` on the container; recompute on resize.
- Cleanup via `onCleanup`.

SSR + pre-hydration: the hook returns `{ fontSize: null, hidden: false }` so
CSS falls back to the `clamp()` default in `Avatar.module.css`.

## Animation state machine

Inside `Avatar.tsx`:

```ts
const [frameIdx, setFrameIdx] = createSignal(0); // 0=idle, 1-3=wave poses
const frames = () => [FRAME_IDLE, FRAME_WAVE_1, FRAME_WAVE_2, FRAME_WAVE_3];
const currentFrame = () => frames()[frameIdx()] ?? FRAME_IDLE;
```

Wave sequence: `[1, 2, 3, 2, 1, 0]` at 250ms per step (total ~1.5s).

On mount (after hydrate):

- If `matchMedia('(prefers-reduced-motion: reduce)').matches` → do nothing,
  stay on idle.
- If `fit().hidden` → do nothing.
- Otherwise play one wave cycle.

Hover/click on the `artSlot`:

- Only trigger if `frameIdx() === 0` (not already playing).
- Replay the cycle.
- On `pointer: coarse` devices hover is irrelevant; click still works.

Cleanup: clear any pending `setTimeout` in `onCleanup`.

## Accessibility

- `<pre aria-hidden="true">` because the art is decorative; name + role
  already announce identity to screen readers.
- A visually-hidden `"Avatar of Hoa"` span precedes the `<pre>` so assistive
  tech knows something is there.
- No focus-trap; the element is not interactive beyond the decorative
  hover/click replay.
- Reduced motion is respected; no hover-triggered replay is required, but the
  click handler still works (a user-initiated action, not auto-play).

## SSR

- The initial server-rendered markup contains the idle frame with the CSS
  fallback font-size (`clamp(6px, 1.6vh, 14px)`) so first paint is readable.
- `useArtFit` and the animation state both run in `onMount`, so the
  server-rendered HTML matches the client's first render and no hydration
  warning fires.
- The glasses accent is rendered as `<span class="glow">` on the server as
  well, so the amber colour is present pre-hydration.

## Tests

Unit:

- `useArtFit.test.ts`:
  - Given 800×400 container and default rows/cols/aspect, returns expected
    fontSize (whichever of width/height is the binding constraint).
  - Given height < 300, returns `hidden: true`.
  - Clamps to `minPx`/`maxPx`.
- `Avatar.test.tsx`:
  - Renders the idle frame on mount.
  - With `prefers-reduced-motion: reduce`, never changes frame.
  - Without reduced motion, advances through the wave sequence (fake timers)
    and returns to idle.
  - Click on the container replays the cycle when idle; ignored mid-cycle.

E2E smoke:

- `apps/web/tests/e2e/home.spec.ts` (or wherever the home-page smoke lives):
  assert `[data-testid=avatar]` exists on `/` and has non-empty
  `textContent`.

## Files touched

Added:

- `apps/web/src/components/Avatar/Avatar.tsx`
- `apps/web/src/components/Avatar/Avatar.module.css`
- `apps/web/src/components/Avatar/avatar-frames.ts`
- `apps/web/src/components/Avatar/useArtFit.ts`
- `apps/web/src/components/Avatar/Avatar.test.tsx`
- `apps/web/src/components/Avatar/useArtFit.test.ts`

Modified:

- `apps/web/src/components/Motd/Motd.tsx` - insert `<Avatar />` in all three
  render branches, only after boot completes in the animated branch.
- `apps/web/src/components/Motd/Motd.module.css` - flex column + art slot
  styles.
- `apps/web/src/routes/TerminalPage.module.css` - allow `.scroll` children to
  flex-grow if not already.
- `apps/web/tests/e2e/*.spec.ts` - add a smoke assertion for the avatar.

## Open questions

None at design time. The user confirmed: layout restructure, animation
trigger model (on-load + hover/click), 300px hide breakpoint, SSR, and amber
glasses accent. Wave frames will be hand-authored on top of the provided
idle raster.
