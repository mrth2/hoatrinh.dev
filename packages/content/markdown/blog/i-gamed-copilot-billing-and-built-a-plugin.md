---
slug: i-gamed-copilot-billing-and-built-a-plugin
title: I gamed Copilot's billing model and built a plugin to do it properly
date: 2026-05-08
excerpt: I upgraded to Copilot Pro+, found a subagent loophole, and built an agent pack that lets me ship a lot while spending almost nothing on premium requests.
tag: ai
---

I have been running agentic workflows daily for over a year. Jobs, side projects, experiments. The stack keeps changing. The habits around it slowly solidify.

I started with GitHub Copilot, used Claude Code for work for more than eight months, and eventually moved to OpenCode. Each switch taught me something. None of them felt final.

![Developer at a dark desk with a terminal open](https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1600&q=80)

## The upgrade that made me pay attention

A few weeks ago I upgraded from Copilot Pro to Pro+. Not for any specific reason. I wanted to try the newer models through OpenCode, and Pro+ unlocks more of them.

While I was testing the setup, I noticed something. When a primary agent spawns a subagent, the subagent calls do not count against your Copilot premium request quota. The main orchestrator eats a request. The subagents work for free.

That is a big deal if your workflow is built around delegation.

Right around the same time, Copilot announced the new usage-based billing kicking in June 1, 2026. Premium requests will be billed at $0.04 each once you exceed your monthly included quota. So the loophole I found just became a lot more valuable.

## Spec-driven development already solved the hard part

I had been using the [Superpowers](https://github.com/obra/superpowers) plugin pack for a while. The core idea is Spec Driven Development: before any code gets written, you brainstorm, write a spec, write a plan, then implement task by task with review at each step. It sounds slow. It is actually faster because you stop mid-implementation a lot less.

The problem was that Superpowers was built for Claude Code. I was on OpenCode.

So I built [opencode-superpowers](https://github.com/mrth2/opencode-superpowers): an agent pack that brings the same SDD workflow to OpenCode, with one key addition. Each agent in the pipeline is assigned a model tuned for its job, and the whole thing is wired to exploit the subagent billing gap.

## how the model assignment works

The pack installs six agents. Here is how the `copilot` profile assigns models:

| Agent | Model | Role |
|---|---|---|
| `superpowers` (orchestrator) | GPT-5.4 mini | Brainstorm, delegate, coordinate |
| `superpowers-spec-writer` | GPT-5.5 | Write and self-audit the design spec |
| `superpowers-plan-writer` | Claude Opus 4.7 | Turn spec into executable plan |
| `superpowers-implementer` | Claude Sonnet 4.6 | Execute plan task by task |
| `superpowers-code-reviewer` | GPT-5.4 | Review each task before finalizing |

The orchestrator runs on GPT-5.4 mini. It is cheap, fast, and good enough for routing and coordination. The heavy thinking happens in subagents where the premium request cost does not apply. So you get Opus-quality planning and Sonnet-quality implementation essentially for free under the current billing rules.

## What the numbers actually look like

Eight days of real work, May 1 to May 8. Here is the full usage breakdown:

| Model | Included requests | Billed requests | Gross amount | Billed amount |
|---|---|---|---|---|
| GPT-5.4 mini | 129.69 | 0 | $5.19 | **$0.00** |
| Claude Sonnet 4.6 | 48 | 0 | $1.92 | **$0.00** |
| GPT-5.4 | 31 | 0 | $1.24 | **$0.00** |
| GPT-5.3-Codex | 27 | 0 | $1.08 | **$0.00** |
| Gemini 3.1 Pro | 13 | 0 | $0.52 | **$0.00** |
| GPT-5.5 | 7.50 | 0 | $0.30 | **$0.00** |
| Claude Haiku 4.5 | 2.97 | 0 | $0.12 | **$0.00** |
| Gemini 2.5 Pro | 1 | 0 | $0.04 | **$0.00** |
| Grok Code Fast 1 | 0.50 | 0 | $0.02 | **$0.00** |

Total gross value: ~$10.43. Billed: $0.00. That is 260 premium request equivalents consumed, all inside the included quota. My 1500 monthly premium requests are at 17% used after 8 days of active shipping.

In those 8 days: a full project release, a batch of bug fixes across two repos, and an MVP for a new macOS app. Not bad.

![Warm light over a keyboard late at night](https://images.unsplash.com/photo-1484788984921-03950022c9ef?auto=format&fit=crop&w=1600&q=80)

## The part that will not last

Copilot will close this gap eventually. Billing rules change, quotas tighten, subagent calls will probably count at some point.

But the workflow itself, SDD with a specialized agent per step, stays useful regardless of billing. The cost optimization is a nice bonus for now. The real value is the structure: you stop hacking at code before you understand the problem, and the review gates catch things before they compound.

I am running it hard through May. After that, the Pro+ subscription goes. The agent pack stays.

If you are on OpenCode and want to try it: `npx opencode-superpowers`. It auto-detects your provider and installs everything.
