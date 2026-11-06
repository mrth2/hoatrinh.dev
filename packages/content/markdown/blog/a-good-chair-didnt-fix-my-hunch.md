---
slug: a-good-chair-didnt-fix-my-hunch
title: A good chair didn't fix my hunch. A pixel pet under a box might.
date: 2026-11-06
excerpt: Good desk, good chair, and my head still creeps toward the screen. My Mac app now notices with the camera, on device, and the pet bends under a box.
tag: tools
tags: [productivity, programming, discuss, showdev]
cover: /blog/keepgoing-den-posture-cover.png
---

I have a proper desk setup. The chair is adjusted, the screen sits at eye level, the keyboard is where it should be. None of that stops me.

It goes slowly. I get into something, my head creeps toward the screen, and an hour later my neck and shoulders tell me. By then it has been wrong for the whole hour. I never notice the moment it starts, only the bill at the end.

The second habit is worse: when I am deep in work, I forget to get up at all.

## why a reminder never worked for me

The usual fix is a timer. Every 30 minutes, sit up, stand up, stretch. I have tried those. They ring when I am sitting fine, so within a week I stop hearing them. A bell that rings whether or not anything is wrong is a bell I learn to ignore.

What I wanted was the opposite: say nothing while I sit well, and show me the moment I don't.

## what 0.6.0 does

[KeepGoing Den](https://keepgoing.dev/den) is my Mac menu bar app for one job at a time: a Pomodoro timer where each project gets its own desktop, and a small pixel pet in the corner of the screen. Version 0.6.0 adds Posture.

![KeepGoing Den Posture: you lean toward the screen, the pixel pet bends under a heavy box, sits back up with you, suggests standing after a long sit, and the cat opens the day's Posture record](/blog/keepgoing-den-posture.gif)

You turn it on in Settings, pick a camera, sit the way you mean to sit, and capture it. From then on the Den compares you against that.

When you hunch forward and stay there, the pet bends over under a heavy box. When you sit back up, it puts the box down. That is the whole signal. It does not grow, repeat, flash or scold. It is the same box the hundredth time as the first, and it only appears while you are actually hunched.

The first three times, a short line beside the pet says `Leaning forward`, so you learn what the box means. After that it is just the box, which I catch from the corner of my eye and straighten up without breaking what I am doing. Point at the bent pet and it says for how long.

When a Focus session ends and you have been sitting for an hour or more, the line beside the pet says something like `Seated for 1h 40m. A good moment to stand up.` Only at the end of a session, never in the middle of one.

## the camera part

I know how "an app that watches you through the camera" sounds, so here is exactly what happens:

- Posture is off by default. macOS asks for camera access the first time you turn it on.
- The camera is read by a separate small helper with no network access. It sends the Den only numbers about your posture.
- No image or video is stored or sent anywhere.
- By default the camera runs only while a Focus session is running. You can choose to watch posture whenever the Den is open, or turn it off and the camera stops completely.

It also tries hard to stay quiet when it is not sure. Poor light, out of frame, a camera it has not seen you on: all of those mean no box. A pet that bends while you sit straight is the one thing that would make me turn this off, so every doubt ends in silence.

Two things I needed for my own desk: if you raise a standing desk, it counts as standing and does not read hunching. If you move the laptop or the camera, it notices and learns your new seat by itself over the next two minutes.

## the record is free

Click the cat in the pet's room and you get the Posture record: each day as a strip of when you sat and when you hunched, with totals and a row for each time it happened.

This part, the camera, the detection and the full record, is free, with or without a licence. The live box on the pet and the stand-up line are part of the licence, next to the nudge that tells you when you wander off to another desktop mid-session. I wrote about where I drew that line in [the post about the price](/post/my-free-mac-app-now-has-a-price).

Every new install gets everything for 14 days, with no key and no email. A licence is USD 9.99 one time until 6 December 2026, then USD 14.99, on up to three Macs.

## where this came from

I built a posture app before, [Recto](/project/recto), as its own menu bar app. The Den already had a pet I glance at all day, so this time the posture signal went onto the pet instead of into another app.

## try it

Get the [KeepGoing Den](https://keepgoing.dev/den) DMG, signed and notarized. macOS 14 or later, Apple Silicon and Intel. If you already have the Den, it updates itself to 0.6.0.

Turn on Posture, capture how you sit, start one Focus session and forget about it. Then click the cat and see how much of that session you spent leaning in. If the number surprises you, I would like to hear it. And if something has kept you from hunching for longer than a week, whether a chair, a habit or a tool, tell me what it is.
