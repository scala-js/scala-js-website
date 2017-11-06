---
layout: post
title: Announcing Scala.js 0.6.21
category: news
tags: [releases]
permalink: /news/2017/11/06/announcing-scalajs-0.6.21/
---


We are pleased to announce the release of Scala.js 0.6.21!

This release is almost exclusively a bug-fix release.

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to
[the tutorial]({{ BASE_PATH }}/tutorial/).

## Release notes

If upgrading from Scala.js 0.6.14 or earlier, make sure to read [the release notes of 0.6.15]({{ BASE_PATH }}/news/2017/03/21/announcing-scalajs-0.6.15/), which contain important migration information.

As a minor release, 0.6.21 is backward source and binary compatible with previous releases in the 0.6.x series.
Libraries compiled with earlier versions can be used with 0.6.21 without change.
0.6.21 is also forward binary compatible with 0.6.{17-20}, but not with earlier releases: libraries compiled with 0.6.21 cannot be used by projects using 0.6.{0-16}.

Please report any issues [on GitHub](https://github.com/scala-js/scala-js/issues).

## New features

### JDK APIs

The following JDK API methods have been added:

* `java.lang.StringBuilder.delete`
* `java.lang.StringBuffer.delete`

## Bug fixes

The following bugs have been fixed in 0.6.21:

* [#3125](https://github.com/scala-js/scala-js/issues/3125) `println("\u0007")` renders as the character `"a"`
* [#3128](https://github.com/scala-js/scala-js/issues/3128) Scala.js 0.6.20 breaks Java 7 builds (`NoSuchMethodError: java.util.concurrent.ConcurrentHashMap.keySet`)
* [#3134](https://github.com/scala-js/scala-js/issues/3134) `regex.Matcher.start(group)` and friends report wrong positions
* [#3135](https://github.com/scala-js/scala-js/issues/3135) Relative path to source file in sourcemap is sometimes broken

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av0.6.21+is%3Aclosed).
