---
slug: i-built-a-tool-because-i-was-too-lazy-to-do-the-research
title: I built a tool because I was too lazy to do the research
date: 2026-05-29
excerpt: I was building side projects but skipping the Reddit validation step. So I automated it, then open-sourced it.
tag: dev
---

Every side project starts with an idea. Every idea needs validation. And every validation guide tells you the same thing: go to Reddit, find the communities, read the threads, see if people are actually complaining about the thing you want to solve.

I knew this. I just never did it properly.

Not because I thought it was useless. Because sitting down and reading through hundreds of posts, comparing them to my product idea in my head, keeping a mental tally of pain signals, felt exhausting before I even started. I would open a subreddit, scroll for ten minutes, convince myself I had a good enough feel for the space, and move on to building.

That is not research. That is confirmation bias with extra steps.

![Person working late at a dimly lit desk with a monitor](https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1600&q=80)

## the real problem with manual research

The issue is not reading one post. It is pattern recognition across hundreds of them.

A single complaint on Reddit is noise. The same complaint phrased five different ways across three subreddits over two weeks is a signal. But holding all of that in your head while also evaluating it against your specific product idea is genuinely hard. It is the kind of slow, parallel reasoning that humans are not great at and LLMs actually are.

So I stopped trying to do it myself. I built a tool to do it for me.

## what ThreadLens does

[ThreadLens](https://threadlens.dev) scouts Reddit, Bluesky, and Google Search based on queries you define per project. It pulls posts and results, scores them for pain signals and relevance to your product angle, deduplicates the noise, and generates a report that clusters findings into themes and suggests possible product directions.

The part I care about most is the scoring. I do not want to read 200 posts. I want an LLM to read 200 posts, compare each one against my product idea, and hand me the 15 that actually matter with a reason for each. That is what it does.

You set up a project, add some queries, run a scout pass, and within a few minutes you have a ranked list of real conversations from real people describing real problems. Then you generate a report and you get clustered pain themes, product angles, risks, and suggested next steps. It took me from "I should probably validate this" to actually validating things.

I kept iterating on it. Added scheduled runs so I could track how conversations around a topic shifted over time. Added Google Search as a source. Tightened the scoring prompts. At some point it stopped being a quick script and became a proper tool.

![Dark terminal screen with code](https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1600&q=80)

## why I open-sourced it

There are SaaS tools that do parts of this. None of them are open source, as far as I could find.

That felt like a gap worth filling. Not because I wanted to undercut the paid tools, but because indie devs running on tight budgets should have a self-hostable option they can inspect, modify, and trust. Your API keys stay on your machine. Your research data stays in local SQLite. You control the prompts.

More than that: I can only take this so far alone. There are pipeline improvements, new sources, smarter deduplication strategies, and prompt tuning work that I will not get to quickly enough by myself. If the code is out there, someone else might.

So I restructured the app, added Docker Compose for self-hosting, wrote the setup docs, and published it.

## getting started

The fastest path is the installer:

```bash
npx create-threadlens-app@latest
```

That sets up a local Docker environment, walks you through the wizard, and gets you to your first scout run in about 15 minutes. Full docs are at [docs.threadlens.dev](https://docs.threadlens.dev).

You need an Anthropic or Gemini API key to get the AI scoring working. Everything else is optional.

If you have been skipping the validation step because it felt like too much work, this is for you. The lazy path and the rigorous path are the same path now.
