---
slug: social-scout
title: Social Scout
tagline: Local outreach cockpit for reviewing social posts and generating AI-assisted engagement drafts
status: experimental
role: Creator
year: 2026
tech:
  - Vite
  - Claude Code
  - Gemini
  - Anthropic
  - Bluesky
listed: false
askContext:
  - The README describes Social Scout as an internal local web app for reviewing and responding to Reddit and Bluesky posts discovered by KeepGoing's Claude Code skills.
  - The workflow reads scouted posts from local JSON files, lets me review them in a UI, and generates AI-drafted replies before posting or copying them out.
  - Bluesky replies can be posted directly from the app, while Reddit comments stay in a manual draft flow.
  - Draft generation supports the local claude CLI by default, with Anthropic Haiku and Gemini 2.5 Flash as alternate providers.
featured: false
---

Social Scout is a private engagement tool I use for outbound research and reply drafting. It turns post discovery from Claude Code scouting skills into a local review queue, then helps me shape replies before they are posted or copied into the target platform.

The current workflow is strongest for Reddit and Bluesky. It supports product-aware versus credibility-building reply styles, keeps the app local-first, and stays intentionally experimental while the naming and packaging are still in flux.
