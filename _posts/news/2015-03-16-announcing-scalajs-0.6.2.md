---
layout: post
title: Announcing Scala.js 0.6.2
category: news
tags: [releases]
---


We are excited to announce the release of Scala.js 0.6.2!

This release mostly contains bug fixes, among which the lack of support of `java.net.URI` for Unicode characters.
It also brings code size reduction and performance improvements to fastOpt code (although nothing changes in fullOpt).

We are also happy to share that Scala.js is now part of [Scala's community build](https://github.com/scala/community-builds).
<!--more-->

## Getting started

If you are new to Scala.js, head over to
[the tutorial]({{ BASE_PATH }}/doc/tutorial.html).

## Release notes

For changes in the 0.6.x series compared to 0.5.x, read [the announcement of 0.6.0]({{ BASE_PATH }}/news/2015/02/05/announcing-scalajs-0.6.0/).

As a minor release, 0.6.2 is backward source and binary compatible with previous releases in the 0.6.x series.
Libraries compiled with earlier versions can be used with 0.6.2 without change.

We would like to remind you that libraries compiled with 0.6.0 will suffer from [bug #1506](https://github.com/scala-js/scala-js/issues/1506), which will cause `fastOptJS` in dependent projects to perform more work than necessary.
It is therefore recommended for library authors to upgrade to Scala.js >= 0.6.1 and publish new versions of their libraries, if they haven't done so yet.
Scala.js 0.6.0 can read binaries compiled with 0.6.1 and 0.6.2, so you need not be afraid to force an upgrade of all the users of your libraries.

Please report any issues [on GitHub](https://github.com/scala-js/scala-js/issues).

## Improvements

* [A better translation to JavaScript](https://github.com/scala-js/scala-js/pull/1535) reduces the size of the `-fastopt.js` files by a few percent, and speeds up their execution.

## Bug fixes

* [#1520](https://github.com/scala-js/scala-js/issues/1520) `java.net.URI` does not support Unicode
* [#1521](https://github.com/scala-js/scala-js/issues/1521) `new java.net.URI("#foo").getSchemeSpecificPart()` should return the empty String
* [#1532](https://github.com/scala-js/scala-js/issues/1532) `TypedArrayByteBuffer.asDoubleBuffer` results in a "RangeError: Invalid typed array length"
* [#1546](https://github.com/scala-js/scala-js/issues/1546) Error "Node.js isn't connected" when running on Travis (tentative fix)
