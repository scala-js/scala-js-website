---
layout: post
title: Announcing Scala.js 1.0.1
category: news
tags: [releases]
permalink: /news/2020/03/10/announcing-scalajs-1.0.1/
---


We are pleased to announce the release of Scala.js 1.0.1!

This is mostly a bugfix release, including a fix for a regression affecting extensions of the JDK ([#3950](https://github.com/scala-js/scala-js/issues/3950)).

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to [the tutorial]({{ BASE_PATH }}/tutorial/).

If you need help with anything related to Scala.js, you may find our community [on Gitter](https://gitter.im/scala-js/scala-js) and [on Stack Overflow](https://stackoverflow.com/questions/tagged/scala.js).

Bug reports can be filed [on GitHub](https://github.com/scala-js/scala-js/issues).

## Release notes

If upgrading from Scala.js 0.6.x, make sure to read [the release notes of Scala.js 1.0.0`]({{ BASE_PATH }}/news/2020/02/25/announcing-scalajs-1.0.0/) first, as it contains a host of important information, including breaking changes.

As a patch release, 1.0.1 is backward and forward binary compatible with 1.0.0.
Libraries compiled with 1.0.0 can be used with 1.0.1 without change, and conversely.
As a reminder, libraries compiled with 0.6.x cannot be used with Scala.js 1.x; they must be republished with 1.x first.

## Miscellaneous

### Upgrade to GCC v20200101

The Google Closure Compiler used internally by Scala.js for `fullOptJS` has been upgraded to v20200101.

## Bug fixes

Among others, the following bugs have been fixed in 1.0.1:

* [#3950](https://github.com/scala-js/scala-js/issues/3950) Static forwarders are not generated for static nested objects
* [#3984](https://github.com/scala-js/scala-js/issues/3984) `(-0.0).getClass()` returns `classOf[Integer]` instead of `classOf[Float]`
* [#3983](https://github.com/scala-js/scala-js/issues/3983) With strict floats, `someDouble.getClass()` erroneously returns `Float`

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av1.0.1+is%3Aclosed).
