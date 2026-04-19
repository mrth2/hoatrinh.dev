# Design: Preserve Terminal History on Navigation

**Date:** 2026-04-19
**Status:** Approved

## Problem

Clicking a command link (e.g. "about" in the help list) navigates to `/about`, which causes Solid Router to unmount the current `TerminalPage` and mount a new one. The new instance creates a fresh empty store, wiping all previous terminal output.

## Goal

Terminal entries accumulate across client-side navigation. The URL still updates in the address bar (for shareability and back/forward support). Clicking a link feels like typing that command at the prompt - output appends to the existing session.

## Approach: Single Wildcard Route

Replace the per-route `<Route>` entries in `App.tsx` with one `<Route path="/*" component={TerminalPage} />`. Since Solid Router keeps the same component instance alive when the matched pattern doesn't change, `TerminalPage` never remounts on client navigation, and the store stays intact.

`TerminalPage` drops the `initialCommand` prop and instead derives the command to run from `useLocation().pathname`.

## Architecture

### Files Changed

- `apps/web/src/App.tsx` - single wildcard route, `NotFoundPage` route removed
- `apps/web/src/routes/TerminalPage.tsx` - add `useLocation`, `pathToCommand`, `createEffect`, `navigateAndTrack`

### URL to Command Mapping (`pathToCommand`)

```
/           -> null        (no command; Motd shows on empty entries)
/about      -> 'about'
/projects   -> 'projects'
/project/x  -> 'project x'
/foo        -> 'foo'       (unknown - execute produces "Command not found" entry)
```

Rule: strip leading `/`, replace interior `/` with space. General and requires no hardcoded route list.

### Execution Lifecycle

**Initial render (SSR and first client render):**
```
cmd = pathToCommand(location.pathname)
if (cmd) execute(cmd, ..., navigate: NOOP_NAVIGATE)  // synchronous, for SSR
```
Entries are rendered into the SSR HTML and hydrated on the client.

**Hydration skip:**
A `lastPath` ref is initialized to `location.pathname`. The `createEffect` on location fires immediately but sees `path === lastPath.current` and returns early, preventing double-execution of the initial command.

**Client navigation via link click:**
```
URL changes to /projects
-> createEffect fires
-> path (/projects) !== lastPath.current (/)
-> lastPath.current = '/projects'
-> execute('projects', ..., navigate: NOOP_NAVIGATE)  // appends to existing entries
```

**Typed command (double-run prevention):**
When the user types `about` at the prompt, `submit()` calls `execute()` with a `navigateAndTrack` wrapper instead of raw `navigate`:
```
navigateAndTrack(path) {
  lastPath.current = path   // update BEFORE navigate
  navigate(path)            // triggers URL change
}
```
When the effect then fires for the URL change, it sees `path === lastPath.current` and skips. No double-run.

## SSR / Prerender Compatibility

`entry-server.tsx` and `scripts/prerender.ts` are unchanged. `renderUrl(url)` renders `<App url={url} />` which passes the URL into the Router. `TerminalPage` picks up the location, derives the command, and runs it synchronously - identical behavior to today. `getRoutes()` in `entry-server.tsx` is also unchanged.

## Error Handling

Unknown paths (e.g. `/foo`) map to `'foo'` via `pathToCommand`. The existing `execute()` function handles unknown commands by appending an `ErrorEntry` with "Command not found" and nearest-match suggestions. No special handling needed.

## What Changes for the User

- Clicking a command link appends its output below existing entries (no page wipe)
- URL still updates in the address bar
- Browser back/forward work: each back step executes the command for that URL, appending the result
- Typing a command and pressing Enter is unchanged - it executes and updates URL as before

## What Does NOT Change

- SSR prerendering - all routes still prerender correctly
- Hydration - no mismatch, initial command still runs synchronously
- The `clear` command - still clears all entries; URL stays wherever it is
- Input history (sessionStorage) - unchanged
- All block components and handlers - no changes needed
