---
layout: post
title: Announcing Scala.js 1.15.0
category: news
tags: [releases]
permalink: /news/2023/12/29/announcing-scalajs-1.15.0/
---

We are pleased to announce the release of Scala.js 1.15.0!

This release mainly brings a change in how the Scala 2 standard library is versioned in anticipation of [SIP 51][SIP-51].
There is no user visible impact expected from this change at this point.
Transition of the ecosystem will be handled as part of [SIP 51][SIP-51].

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to [the tutorial]({{ BASE_PATH }}/tutorial/).

If you need help with anything related to Scala.js, you may find our community [in `#scala-js` on Discord](https://discord.com/invite/scala) and [on Stack Overflow](https://stackoverflow.com/questions/tagged/scala.js).

Bug reports can be filed [on GitHub](https://github.com/scala-js/scala-js/issues).

## Release notes

If upgrading from Scala.js 0.6.x, make sure to read [the release notes of Scala.js 1.0.0]({{ BASE_PATH }}/news/2020/02/25/announcing-scalajs-1.0.0/) first, as they contain a host of important information, including breaking changes.

This is a **minor** release:

* It is backward binary compatible with all earlier versions in the 1.x series: libraries compiled with 1.0.x through 1.13.x can be used with 1.15.0 without change.
* Despite being a minor release, 1.15.0 is forward binary compatible with 1.13.x or later. It is *not* forward binary compatible with 1.12.x. Libraries compiled with 1.15.0 can be used with 1.13.x or later but not with 1.12.x or earlier.
* It is *not* entirely backward source compatible: it is not guaranteed that a codebase will compile *as is* when upgrading from 1.13.x (in particular in the presence of `-Xfatal-warnings`).

As a reminder, libraries compiled with 0.6.x cannot be used with Scala.js 1.x; they must be republished with 1.x first.

## Improvements

* Add `java.io.FilterReader` to the javalib (thanks to @ekrich).
* Reduce memory usage of the linker with more static string allocation.
* Split the scalalib into a separate artifact (for  [SIP 51][SIP-51]).

[SIP-51]: https://docs.scala-lang.org/sips/drop-stdlib-forwards-bin-compat.html
