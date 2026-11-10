---
slug: i-fixed-my-hunch-then-i-leaned-sideways
title: I fixed my hunch. Then I started leaning sideways.
date: 2026-11-13
excerpt: My Mac app learned to spot me hunching. Then I caught myself slumped onto one armrest instead. Version 0.7.0 notices that too, and the pixel pet leans with me.
tag: tools
tags: [productivity, programming, discuss, showdev]
cover: /blog/keepgoing-den-side-lean-cover.png
---

A week ago I wrote about [a pixel pet that carries a heavy box while I hunch](/post/a-good-chair-didnt-fix-my-hunch). It works. I see the box from the corner of my eye and I sit back up.

So my body found another way to sit badly. I hunched less and leaned to one side more: slumped onto an armrest, one leg crossed under me, half turned toward the second window. The box never showed up for any of that, because none of it is leaning forward.

## crooked is not forward

The first version compared one thing against the good posture you capture: how far your head has come toward the screen. Sitting crooked barely moves your head forward. It drops one shoulder and tilts the line of your eyes. So the Den saw a straight back while my neck saw the opposite.

Version 0.7.0 also reads your shoulders and the tilt of your eyes against that captured posture. When you lean to one side and stay there, it counts that as a side lean.

Getting this wrong is worse than missing it, so it ignores the things I do all day that are not leaning. Turning your head to read the edge of a wide screen does not count. Neither does sliding your chair over and sitting up straight in the new spot. When it is not sure, it says nothing.

## the pet leans with you

[KeepGoing Den](https://keepgoing.dev/den) is my Mac menu bar app for one job at a time: a Pomodoro timer where each project gets its own desktop, and a small pixel pet in the corner of the screen.

![KeepGoing Den 0.7.0: you hunch and the pixel pet holds a heavy box, you lean to one side and it leans the same way, then the Posture record lists the side leans](/blog/keepgoing-den-side-lean.gif)

While you lean to one side, the pet leans the same way. Lean the other way and it follows. That is the whole signal again: no sound, no banner, nothing that grows. A pet standing crooked in the corner is enough for me to notice I am sitting crooked too. Point at it and it says for how long, like `Leaning to the left for about 3 minutes`.

The hunch changed a little too. The pet now holds the box in front of it instead of bending under it, which reads better at its small size.

## what you need to do

Side lean needs your shoulders in the good posture you capture. The setup window now asks for both shoulders in view and tells you whether it sees them. If you captured your posture on 0.6.0, the Den keeps reading hunches only until you click `Retake good posture` in Settings. Settings says so, and it also shows when you captured it and on which camera.

The camera works the same way as before. A separate small helper with no network access reads it and sends the Den only numbers about your posture. No image or video is stored or sent anywhere.

## the record shows both

Click the cat in the pet's room for the Posture record. Side leans now sit next to hunches: as rows marked `Leaning left` or `Leaning right`, on each day's strip, and in a `Leaning to the side` total. That record, and the detection behind it, stay free with or without a licence. The pet's box and its lean are part of the licence.

## the smaller things in 0.7.0

- When you step away, the running Focus session pauses from the moment you left, after five idle minutes or as soon as Posture sees you go. A session left paused for 15 minutes or more ends instead of waiting for you.
- With a licence, when you wander off to another desktop mid-session, clicking the pet takes you straight back to the one you left.
- ⌃⌥⌘F starts a session from any app, and ⌘1 to ⌘5 open the Room and the records while the menu is open.

A licence is USD 9.99 one time until 6 December 2026, then USD 14.99, on up to three Macs. Every new install gets everything for 14 days, with no key and no email.

## try it

Get the [KeepGoing Den](https://keepgoing.dev/den) DMG, signed and notarized, for macOS 14 or later on Apple Silicon or Intel. If you already have the Den, it updates itself to 0.7.0. Then retake your good posture with both shoulders in view.

Fixing one habit only showed me the next one. If you have caught yourself trading one bad way of sitting for another, I would like to hear which ones.
