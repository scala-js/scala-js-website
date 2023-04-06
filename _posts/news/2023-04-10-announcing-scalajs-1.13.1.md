---
layout: post
title: Announcing Scala.js 1.13.1
category: news
tags: [releases]
permalink: /news/2023/04/10/announcing-scalajs-1.13.1/
---


We are pleased to announce the release of Scala.js 1.13.1!

This release mostly contains bug fixes and optimizations.

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to [the tutorial]({{ BASE_PATH }}/tutorial/).

If you need help with anything related to Scala.js, you may find our community [in `#scala-js` on Discord](https://discord.com/invite/scala) and [on Stack Overflow](https://stackoverflow.com/questions/tagged/scala.js).

Bug reports can be filed [on GitHub](https://github.com/scala-js/scala-js/issues).

## Release notes

If upgrading from Scala.js 0.6.x, make sure to read [the release notes of Scala.js 1.0.0]({{ BASE_PATH }}/news/2020/02/25/announcing-scalajs-1.0.0/) first, as they contain a host of important information, including breaking changes.

This is a **patch** release:

* It is backward binary compatible with all earlier versions in the 1.x series: libraries compiled with 1.0.x through 1.13.0 can be used with 1.13.1 without change.
* It is forward binary compatible with 1.13.0: libraries compiled with 1.13.1 can be used with 1.13.0 without change.
* It is backward source compatible with 1.13.0: source code that used to compile with 1.13.0 should compile as is when upgrading to 1.13.1.

In addition, like Scala.js 1.13.0:

* It is *not* forward binary compatible with 1.12.x: libraries compiled with 1.13.1 cannot be used with 1.12.x or earlier.
* It is *not* entirely backward source compatible with 1.12.x: it is not guaranteed that a codebase will compile *as is* when upgrading from 1.12.x or earlier (in particular in the presence of `-Xfatal-warnings`).

As a reminder, libraries compiled with 0.6.x cannot be used with Scala.js 1.x; they must be republished with 1.x first.

## Miscellaneous

### New JDK APIs

This release adds support for the following JDK methods:

* In the classes `java.util.concurrent.atomic.Atomic{Integer,Long,Reference}`, the methods `getAndUpdate`, `updateAndGet`, `getAndAccumulate` and `accumulateAndGet`.

### Optimizations

Scala.js 1.13.1 brings significant improvements to the performance of the linker (the `fastLinkJS` task).
Most of these improvements apply to incremental scenarios, starting from the second invocation of `fastLinkJS` for a given project in the same build tool session.
As a result, repeated invocations of `fastLinkJS` (possibly in watch mode, like `~fastLinkJS` in sbt) should feel much snappier than with previous versions.

## Bug fixes

Among others, the following bugs have been fixed in 1.13.1:

* [#4801](https://github.com/scala-js/scala-js/issues/4801) Delegating to the implementation of a calculated super class causes Internal error
* [#4841](https://github.com/scala-js/scala-js/issues/4841) Repeat calls of `fastLinkJS` sometimes cause `IllegalStateException` on Windows and JDK 17+
* [#4833](https://github.com/scala-js/scala-js/issues/4833) High memory consumption during linking when using `ModuleSplitStyle.SmallModulesFor(...)`
* [#4835](https://github.com/scala-js/scala-js/issues/4835) `SmallModulesFor` splitting style can cause circular dependencies between emitted modules

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av1.13.1+is%3Aclosed).
