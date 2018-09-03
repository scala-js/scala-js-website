---
layout: post
title: Announcing Scala.js 0.6.25
category: news
tags: [releases]
permalink: /news/2018/09/03/announcing-scalajs-0.6.25/
---


We are pleased to announce the release of Scala.js 0.6.25!

This release brings support for Scala 2.13.0-M5, as well as jsdom v12.x.
It also fixes a number of issues.

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to
[the tutorial]({{ BASE_PATH }}/tutorial/).

## Release notes

If you use `.scala` build files in `project/` and are upgrading from Scala.js 0.6.22 or earlier, do read [the release notes of 0.6.23]({{ BASE_PATH }}/news/2018/05/22/announcing-scalajs-0.6.23/), which contain a source breaking change in that situation.

If upgrading from Scala.js 0.6.14 or earlier, make sure to read [the release notes of 0.6.15]({{ BASE_PATH }}/news/2017/03/21/announcing-scalajs-0.6.15/), which contain important migration information.

As a minor release, 0.6.25 is backward binary compatible with previous releases in the 0.6.x series.
Libraries compiled with earlier versions can be used with 0.6.25 without change.
0.6.25 is also forward binary compatible with 0.6.{17-24}, but not with earlier releases: libraries compiled with 0.6.25 cannot be used by projects using 0.6.{0-16}.

Please report any issues [on GitHub](https://github.com/scala-js/scala-js/issues).

## Bug fixes

Among others, the following bugs have been fixed in 0.6.25:

* [#3426](https://github.com/scala-js/scala-js/issues/3426) and [#3422](https://github.com/scala-js/scala-js/issues/3422) `lazy val`s within non-native JS classes are now supported
  - Caveat: `override lazy val`s do not behave correctly when they override another `lazy val`.
    This issue is not fixable in 0.6.x for binary compatibility reasons, but will be fixed in Scala.js 1.x.
* [#3433](https://github.com/scala-js/scala-js/issues/3433) UTF-8 `CharsetDecoder` doesn't handle incomplete character ranges correctly
* [#3417](https://github.com/scala-js/scala-js/issues/3417) Crash in `jsDependencies` resolution on Windows due to some path issue
* [#3415](https://github.com/scala-js/scala-js/issues/3415) Optimizer stack-overflows, inlining a method within a closure inside that method
* [#3408](https://github.com/scala-js/scala-js/issues/3408) Sporadic test failures in `org.scalajs.testcommon.RPCCore` (`NullPointerException`)
* [#3401](https://github.com/scala-js/scala-js/issues/3401) Groups are broken for regexes with in-line flags since 0.6.21

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av0.6.25+is%3Aclosed).
