---
slug: i-went-quiet-this-is-the-comeback
title: I went quiet. The mascot would call this a comeback.
date: 2026-10-16
excerpt: Seven weeks without a post. I talked myself out of one app, built a different one, and shipped it today. KeepGoing Hub is out.
tag: tools
tags: [showdev, productivity, tools, sideprojects]
cover: /blog/keepgoing-hub-cover.png
---

My last post ended on this line: "The rail decides whether that holds."

It did not hold. That was 29 August. Today is 16 October. Seven weeks without a post, on a blog where I once promised one every Friday.

When I [missed a single Friday](/post/i-missed-my-friday-post) back in June, I wrote that the story I tell myself about a miss does more damage than the miss itself. So I am not going to count the weeks again, and I am not announcing a fresh start. I built something that has an opinion about exactly this situation, and I am going to take its advice.

## the mascot does not count either

[Momentum Mascot](/post/i-made-it-too-small-to-over-engineer) has four moods: awake, dozing, asleep, and comeback. When a project goes quiet, the character goes to bed. It does not die, nothing breaks, and nothing tells you how long it has been. When real work lands again, it leaps out of bed.

By that rule the blog has been asleep. This post is the commit that wakes it up.

## the building did not stop

The blog went quiet. The repositories did not.

In early September I sat down with a much bigger idea: a four-module app for freelancers and small agencies. Client reports, retainer health, profitability, a lifetime licence and an agency tier. Before writing any code I wrote a decision memo about whether to build it, with real numbers from my own projects and a scan of the market.

The first draft said build one module and hold the other three behind ten paying customers. A day later I threw that out too. Anyone with `git log` and an AI assistant can already write a client report, the free tools are good, and the people who actually pay for reporting are marketing agencies that are already well served. The final answer was short: do not build it. No modules, no smaller wedge, no MVP.

That would normally have been the post. "I killed my own idea before writing a line of code." It was the right call. But I did not write it, because a week later I was building something else.

## what I built instead

[KeepGoing Hub](https://keepgoing.dev/hub) is a Pomodoro timer in your Mac's menu bar, and v0.1.0 shipped today.

![The KeepGoing Hub room turning from afternoon to night: books on the shelf, the desk lamp, and a plant for each stretch of work](/blog/keepgoing-hub-room-day-night.gif)

Each project gets its own macOS desktop. Start a session and the wall clock in the room shades a wedge up to the minute it ends: 25 minutes on, 5 off, four rounds by default. If you wander off the project's desktop mid-session, the pet in the corner of your screen gives you one quiet nudge. Once. It never takes focus and it never sends a notification.

Time per project is logged for you, with idle time left out. Each project is a book on the shelf, and its spine shows how recently you worked on it, or where you stand against an optional daily or weekly budget. The desk lamp reaches further the more of that budget you have used. Every stretch of work today grows a plant, and a plant blooms at 90 minutes.

If you already run Momentum Mascot, the Hub picks up your character and your corner and can replace it, so you run one app instead of two. If you use Claude Code, there is an opt-in statusline, and Claude Code activity in a project's folder counts toward that project.

## what it will not do

Same rules as the mascot. No streaks, no scores, no account, no notifications. No network requests at all. Everything it stores lives in `~/.keepgoing/hub/`, which you can read or delete.

It is not on the Mac App Store, and it will not be. Knowing which desktop you are on needs the app to run outside the store's sandbox. So it is a signed, notarized DMG from [the releases page](https://github.com/keepgoing-dev/keepgoing-hub-releases/releases/latest). Free, macOS 14 or later, Apple Silicon and Intel.

It is also a 0.1.0, and I mean that. There is no auto-updater yet, so a new version means downloading the DMG again. Expect rough edges, and [tell me what you hit](https://github.com/keepgoing-dev/keepgoing-hub-releases/issues).

## about keeping it small

In August I wrote that I made the mascot too small to over-engineer. The Hub is not small. Its plan started at 77 stories, which is exactly the kind of number that post was warning me about.

I know. Whether that was a mistake is something the next few months will answer, not this post.

## the rule

A quiet stretch is not a broken streak. It is the mascot asleep. The only thing that counts is the next real commit.

This post is mine. The Hub is [here](https://keepgoing.dev/hub) if you want to try it for one session.
