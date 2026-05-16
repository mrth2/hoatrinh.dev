---
slug: the-editor-i-cant-quit
title: iTerm took 95% of my work, but I still can't quit VSCode
date: 2026-05-16
excerpt: iTerm replaced VSCode for almost all of my work, but AI still falls apart on the last mile of pixel-perfect frontend detail.
tag: tools
---

A year ago I was a daily VSCode user. Extensions, split panes, GitLens, Copilot side chat docked on the right. That was the setup, and I assumed that was just what modern coding looked like.

Now about 95% of my working time happens in iTerm. Claude Code, OpenCode, prompts, reviews, decisions. VSCode still exists on my machine, but it is no longer the place where the real work begins.

![Dark terminal setup on a developer's desk](https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=1600&q=80)

## How the drift happened

It started with Copilot side chat. I was already leaning on it heavily, not for autocomplete but for conversations. Asking questions, brainstorming approaches, talking through a design before touching a file. The chat was becoming more valuable than the editor wrapped around it.

When I tried Claude Code inside the VSCode terminal, something shifted. The model was better at holding context and making decisions across files. I was reviewing diffs in GitLens, approving them, and moving on. My hands were on the keyboard less. My attention moved up a level.

A few months of that and the habit changed completely. I open iTerm first. I run OpenCode or Claude Code depending on the job. I describe what I want, review what comes back, and keep steering. At some point VSCode stopped being the center of the workflow and became a fallback tool.

## What my job actually became

The honest version: I barely write code by hand anymore.

That sounds dramatic, but it is just what the job looks like now. Less time in files, more time thinking about systems, architecture, tradeoffs, and product behavior. What should this do. How should these pieces connect. Is this the right call or just the fast one. The typing moved down the stack. The decision-making moved up.

The pace is faster, but the risk is higher too. AI does not remove responsibility. It concentrates it. I use simpler skills, auto-review passes, and guardrails in the agentic workflow because bad output arrives faster than ever. AI can compress a week of coding. It can also compress a week of mistakes.

Reading code still matters. I still read what gets produced. I just spend far less time manually producing the first draft.

## The thing that pulled me back

Then I had to remake a marketing website. Lots of detail. Specific spacing, custom animations, pixel-level alignment. The kind of work where one awkward gap can cheapen the whole page.

I gave it to Claude Opus. Then Sonnet. Then I tried rephrasing the prompt. The logic was fine. The structure was fine. The pixels were wrong.

AI is very good at code logic, refactoring, overall design direction, and architecture decisions. It is still mediocre at the last five percent of UI work, which is exactly the part users actually see. Minor CSS adjustments, getting a hover state to feel right, nudging a layout until it actually matches the design. Every iteration costs a round-trip. Every round-trip breaks flow. After the third attempt at a tiny spacing fix, I stopped pretending this was efficient, opened VSCode, and fixed it myself in thirty seconds.

That is when I realized what VSCode had become: not my main workspace, but my precision tool.

![Keyboard and screen with code at night](https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1600&q=80)

## The rule I landed on

Terminal for everything logic-shaped. VSCode for everything pixel-shaped.

If the problem is about what the code does, I stay in the terminal. If the problem is about what something looks like at 1px resolution, I open VSCode and do it by hand. No prompt iteration. No conversational loop. Just me, the file, and the browser.

This is my current view of the stack. iTerm is where software gets designed, delegated, and shipped. VSCode is where I take back control when taste, detail, and speed matter more than orchestration. AI took over most of the workflow. It still has not earned the last five percent. Until it does, I am not quitting VSCode.
