---
layout: post
title: Announcing Scala.js 1.18.2
category: news
tags: [releases]
permalink: /news/2025/01/23/announcing-scalajs-1.18.2/
---


We are pleased to announce the release of Scala.js 1.18.2!

This is mostly a hotfix release for a binary incompatibility present in 1.18.0 and 1.18.1 and affecting some libraries built with Scala.js < 1.11.
It also upgrades the Scala standard library to versions 2.12.20 and 2.13.16.

Note: Artifacts published with 1.18.0 and 1.18.1 are *not* polluted.
Using these versions is not dangerous for the ecosystem.
The binary compatibility issues that were fixed in 1.18.1 and 1.18.2 are only problematic if you run into them while upgrading.
If you have already successfully published libraries built with these versions, there is no need to panic and republish them with 1.18.2.

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to [the tutorial]({{ BASE_PATH }}/tutorial/).

If you need help with anything related to Scala.js, you may find our community [in `#scala-js` on Discord](https://discord.com/invite/scala) and [on Stack Overflow](https://stackoverflow.com/questions/tagged/scala.js).

Bug reports can be filed [on GitHub](https://github.com/scala-js/scala-js/issues).

## Release notes

If upgrading from Scala.js 0.6.x, make sure to read [the release notes of Scala.js 1.0.0]({{ BASE_PATH }}/news/2020/02/25/announcing-scalajs-1.0.0/) first, as they contain a host of important information, including breaking changes.

This is a **patch** release:

* It is backward binary compatible with all earlier versions in the 1.x series: libraries compiled with 1.0.x through 1.18.1 can be used with 1.18.2 without change.
* It is forward binary compatible with 1.18.0 and 1.18.1: libraries compiled with 1.18.2 can be used with previous 1.18.x versions without change.
* It is backward source compatible with 1.18.0 and 1.18.1: source code that used to compile with previous 1.18.x versions should compile as is when upgrading to 1.18.2.

In addition, like Scala.js 1.18.0 and 1.18.1:

* It is *not* forward binary compatible with 1.17.x: libraries compiled with 1.18.2 cannot be used with 1.17.x or earlier.
* It is *not* entirely backward source compatible with 1.17.x: it is not guaranteed that a codebase will compile *as is* when upgrading from 1.17.x or earlier (in particular in the presence of `-Xfatal-warnings`).

As a reminder, libraries compiled with 0.6.x cannot be used with Scala.js 1.x; they must be republished with 1.x first.

## Enhancements

### Optimize `js.Dynamic.literal()` in Scala 2.13

As described in [#5017](https://github.com/scala-js/scala-js/issues/5017), `js.Dynamic.literal(...)` produced good code when compiled with Scala 2.12, but not with Scala 2.13 or Scala 3.
Scala.js 1.18.2 solves the issue for Scala 2.13.
The issue remains for code compiled by Scala 3, at the moment.

## Bug fixes

The following bugs were fixed in 1.18.2:

* [#5115](https://github.com/scala-js/scala-js/issues/5115) fullLinkJS: Missing StoreModule right after the super constructor call
* [#5112](https://github.com/scala-js/scala-js/issues/5112) "Found unknown label apply" crash during compilation with Scala 2.13.16

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av1.18.2+is%3Aclosed).
