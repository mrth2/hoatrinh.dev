---
slug: i-made-it-too-small-to-over-engineer
title: I made it too small to over-engineer
date: 2026-08-29
excerpt: KeepGoing took months and died in the graveyard it was built to prevent. Its replacement reached the App Store in fifteen days, because I cut it to one thing.
tag: tools
---

In May I wrote about [the graveyard I keep adding to](/post/the-graveyard-i-keep-adding-to). Thirty four project folders, maybe six alive. KeepGoing was in there. I built it to stop myself abandoning side projects, spent months on it, over-engineered it, and then abandoned it.

[Momentum Mascot](https://apps.apple.com/app/momentum-mascot/id6804925509) is the second attempt. A pixel character living in a tiny room, in your menu bar and optionally as a 64x64 pet floating in the corner of your desktop. It watches the git repositories you point it at and shows you a mood instead of a number. Awake, under 24 hours since your last commit. Dozing, from 24 to 72. Asleep past that. And a comeback, when a real commit lands after a sleep.

It is free, on the Mac App Store and as a download from [keepgoing.dev](https://keepgoing.dev), and it is the first thing I have ever put on an Apple store. First commit was 12 August. Apple approved it on 27 August. Fifteen days.

![The four moods of Momentum Mascot: awake at the desk, dozing on the rug, asleep in bed, and the comeback](/blog/momentum-mascot-four-states.gif)

## the one thing it reads

Per repository it reads exactly one thing: when you last actually committed. Not commit messages, not diffs, not branch names, not line counts. Checking out a branch or pulling is not work and cannot trigger anything.

That is the whole input. Everything else the app does is a decision about what not to do with it.

## the mascot does not die

Every tool in this category punishes you for leaving. The streak breaks. The graph goes grey. The counter climbs.

This one goes to sleep and holds your place. Come back after two weeks of silence and the character leaps out of bed. There are no streaks, no scores, no notifications, and nothing anywhere in it will tell you how long it has been since your last commit.

That last one was the hardest to hold onto. The number is sitting right there in the state file. Showing it would have been two lines of code. It stays out because a number is how a companion turns into a scoreboard, and the scoreboard is the thing I was trying to get away from.

![The comeback share card: the character back on their feet in the pixel room, captioned YOU CAME BACK](/blog/momentum-mascot-comeback-card.png)

## the scope was the whole design

KeepGoing died of scope. Good bones, real users, and I still spent 80% of my energy on features and almost none on people. So this time I picked an idea small enough that I could not do that to it again.

No accounts. No settings panel. No network layer, and I mean that structurally: there is no HTTP client compiled into the binary, so "no telemetry" is not a promise I have to keep, it is something the build cannot do. Everything it knows lives in one local JSON file you can open and read.

The share card works the same way. It carries the room and the mood and nothing that could identify a project. No name, no path, no message, no hash, no timestamp. It is built so that there is no way to express one, instead of a rule about remembering not to.

## what small bought me

Because there was so little left to build, I spent the last week just watching the thing behave. That is how I found that a `.DS_Store` counted as working on a project. Open a dormant project folder in Finder, macOS writes that file, and the mascot woke up and spent the comeback on you looking at a directory. Build output inside a gitignored folder did the same.

Those are small bugs. I only found them because there was nothing bigger left to do. On KeepGoing they would have sat there quietly underneath whatever feature I was building instead.

The same smallness is why I filed the store listing under Developer Tools rather than Utilities. Guideline 4.2 says an app that is not "particularly useful, unique, or app-like" does not belong on the store, and an ambient desktop pet reads as a toy in one category and as a tool in the other. Small enough to finish and small enough to be mistaken for a toy turned out to be the same decision.

## the rule

In the graveyard post I said the last 20% is the only part anyone else ever sees. I still believe that. What I missed is that the size of the first 80% is a choice I make on day one.

But finishing fast is not the same as showing up. In June I wrote that promotion goes on a rail, a fixed weekly slot that is not optional, because building talks back and promoting goes quiet and I drift to whichever side rewards me. Shipping in fifteen days proves I can finish something small. It proves nothing about whether I am still talking about this in three months, and that is the part I have actually failed at before.

Fifteen days from first commit to approved, not because I worked harder than I did on KeepGoing. Because there was less of it to finish.

The graveyard did not get this one. The rail decides whether that holds.
