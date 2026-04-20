---
slug: win95-fun
title: Win95.fun
tagline: Browser arcade wrapped in Windows 95 nostalgia, with challenges, leaderboards, and unlockable themes
status: active
role: Creator
year: 2025
tech:
  - Astro
  - SvelteKit
  - Phaser
  - Tailwind CSS
  - Cloudflare Pages
  - Cloudflare D1
  - Turborepo
links:
  live: https://win95.fun
askContext:
  - The README describes a Turborepo monorepo with the hub in Astro 5 plus SvelteKit 5 and separate Phaser-based game apps for Snake, Solitaire, Minesweeper, Pinball, and more.
  - Shared packages cover progress tracking, WXP user levels, asset loading, game registration, a retro design system, and game debugging workflows.
  - The stack runs on Cloudflare Pages and D1, with Better Auth handling player identity and progress.
featured: true
---

Win95.fun is a retro game hub and playground for browser-native nostalgia. I use it to combine Astro, SvelteKit, and Phaser into a desktop-inspired experience that feels familiar as soon as it loads.

The platform bundles games like Snake, Solitaire, Minesweeper, and Pinball with WXP points, daily and all-time leaderboards, monthly challenges, and theme unlocks. Under the hood it runs on Cloudflare Pages plus D1 with Better Auth for player identity.
