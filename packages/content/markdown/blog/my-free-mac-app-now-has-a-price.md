---
slug: my-free-mac-app-now-has-a-price
title: My free Mac app now has a price. Here is the line I drew.
date: 2026-10-25
excerpt: My free Mac menu bar timer got a new name and a price. One quiet nudge is paid, everything else is free. Here is where I drew the line.
tag: tools
tags: [showdev, macos, sideprojects, productivity]
cover: /blog/keepgoing-den-cover.png
---

Nine days ago I [shipped KeepGoing Hub](/post/i-went-quiet-this-is-the-comeback), a Pomodoro timer for the Mac menu bar that gives each project its own desktop. I wrote two things about it: it is free, and it makes no network requests at all.

Today it ships as 0.3.0, under a new name, KeepGoing Den. Part of it now costs money, and it now sends two things over the network. Both of those sentences contradict the last post, so this one is about where I drew the line and why I think it is the right one.

## what changed in nine days

The release that matters here is 0.2.0, which taught the app to update itself. That is the first of the two things it sends: a request to GitHub for one file, with nothing about you in it, and you can turn it off.

0.3.0 renames the app to KeepGoing Den. An installed Hub updates in place and keeps your projects, your history and your settings. It also adds a notch panel: hover the top centre of a display to see what you are working on and that display's desktops as tiles you can click.

## the line

Here is what stays free, for good, on every Mac:

- Focus sessions, the room and the pet.
- Time per project, budgets, history and a TSV export.
- The Claude Code statusline.
- Two desktops bound to projects.
- Drift, leaving a project's desktop mid-session, is always recorded, licensed or not.

Here is what a licence adds:

- The nudge, and the pet's Drift expression.
- Switching desktops from the notch.
- More than two bound desktops.

The whole app exists to keep me on one job at a time. Everything that measures where your time went is free. What you pay for is the one thing that acts on it in the moment: one quiet nudge from the pet when you wander off. The other two paid parts are for people juggling many projects at once; the nudge is the reason the licence exists. If the nudge does not earn its price for you, the record of every drift is still there, and you can read it yourself.

## the price

A licence is USD 14.99, one time, no subscription, updates included, on up to three Macs. Until 6 December 2026 it is USD 9.99.

Every new install gets all of it for 14 days first. No key, no email, no sign-up. When the trial ends, the app says so once, and any desktops you bound during the trial stay bound and keep recording.

You buy it from the Licence tab in Settings, whenever you like. Anything locked in the app has one line, See the licence, that takes you there. There is no count-down, no pop-up and no reminder.

## if you already had the Hub

You are licensed, for good, with no key to enter. Settings will say `Licensed. You had the Den before it was sold.`

I said the Hub was free. For anyone who took me at my word, it stays free, all of it.

## the second thing it sends

The other thing the app now sends is your licence key, and nothing about you, to Lemon Squeezy, the store that sells it. That happens when you activate a key, at most once a month to re-check it, and when you deactivate a Mac. Without a key, nothing goes to Lemon Squeezy.

Everything else is unchanged. No account, no streaks, no notifications. What it stores lives in `~/.keepgoing/hub/`, which you can read or delete.

## try it

[KeepGoing Den](https://keepgoing.dev/den) is a signed, notarized DMG from [the releases page](https://github.com/keepgoing-dev/keepgoing-hub-releases/releases/latest). macOS 14 or later, Apple Silicon and Intel.

Run one session and drift to another desktop on purpose. The nudge you get is the part I am charging for.
