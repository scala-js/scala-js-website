---
layout: post
title: Announcing Scala.js 0.6.19
category: news
tags: [releases]
permalink: /news/2017/07/29/announcing-scalajs-0.6.19/
---


We are pleased to announce the release of Scala.js 0.6.19!

This release brings support for [sbt 1.0.0-RC2](http://www.scala-sbt.org/1.0/docs/sbt-1.0-Release-Notes.html#sbt+1.0.0-RC2) and following.
In addition, it fixes a few compiler issues.

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to
[the tutorial]({{ BASE_PATH }}/tutorial/).

## Release notes

If upgrading from Scala.js 0.6.14 or earlier, make sure to read [the release notes of 0.6.15]({{ BASE_PATH }}/news/2017/03/21/announcing-scalajs-0.6.15/), which contain important migration information.

As a minor release, 0.6.19 is backward source and binary compatible with previous releases in the 0.6.x series.
Libraries compiled with earlier versions can be used with 0.6.19 without change.
0.6.19 is also forward binary compatible with 0.6.{17-18}, but not with earlier releases: libraries compiled with 0.6.19 cannot be used by projects using 0.6.{0-16}.

Please report any issues [on GitHub](https://github.com/scala-js/scala-js/issues).

## New features

### Support for sbt 1.0.0-RC2 and following

You can now use Scala.js 0.6.19 with [sbt 1.0.0-RC2](http://www.scala-sbt.org/1.0/docs/sbt-1.0-Release-Notes.html#sbt+1.0.0-RC2), and following releases of sbt.
Nothing changes in sbt-scalajs between sbt 0.13.x and sbt 1.x.

## Bug fixes

Among others, the following bugs have been fixed in 0.6.19:

* [#3053](https://github.com/scala-js/scala-js/issues/3053) "`java.util.NoSuchElementException`: key not found: null" while optimizing (root cause: [#3055](https://github.com/scala-js/scala-js/issues/3055))
* [#3050](https://github.com/scala-js/scala-js/issues/3050) No linking error reported for conflicting export names with `@JSExportTopLevel object`.
* [#3047](https://github.com/scala-js/scala-js/issues/3047) Two methods with the same JS name must not compile

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av0.6.19+is%3Aclosed).
