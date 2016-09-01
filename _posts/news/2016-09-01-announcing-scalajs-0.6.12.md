---
layout: post
title: Announcing Scala.js 0.6.12
category: news
tags: [releases]
permalink: /news/2016/09/01/announcing-scalajs-0.6.12/
---


We are pleased to announce the release of Scala.js 0.6.12!

This release exclusively contains bug fixes, and a few internal changes to support the upcoming Scala 2.12.0-RC1.

<!--more-->

## Getting started

If you are new to Scala.js, head over to
[the tutorial]({{ BASE_PATH }}/tutorial/).

## Release notes

If upgrading from 0.6.5 or earlier, please also read the [release notes of 0.6.6]({{ BASE_PATH }}/news/2016/01/25/announcing-scalajs-0.6.6/), which contains some breaking changes.

As a minor release, 0.6.12 is backward source and binary compatible with previous releases in the 0.6.x series.
Libraries compiled with earlier versions can be used with 0.6.12 without change.
0.6.12 is also forward binary compatible with 0.6.8 through 0.6.11, but not with earlier releases: libraries compiled with 0.6.12 cannot be used by projects using 0.6.{0-7}.

Please report any issues [on GitHub](https://github.com/scala-js/scala-js/issues).

## Potentially breaking change

This release fixes [#2573](https://github.com/scala-js/scala-js/issues/2573), which potentially constitutes a breaking change, if you relied on the previously buggy behavior.
Until Scala.js 0.6.11, the behavior of `java.util.regex.Pattern.split()` (and consequently `String.split()`) was aligned with the behavior of the JDK 7.
The fix for [#2573](https://github.com/scala-js/scala-js/issues/2573) changes this behavior to align with the JDK 8.
This will change the result of `split()` when a zero-width separator is matched at the beginning of the string.

## Bug fixes

The following bugs have been fixed in 0.6.12:

* [#2547](https://github.com/scala-js/scala-js/issues/2547) Overriding a JS native method with default parameters leads to `AssertionError` in the compiler
* [#2553](https://github.com/scala-js/scala-js/issues/2553) Constructing a `String` from a large byte array throws "Maximum call stack size exceeded"
* [#2554](https://github.com/scala-js/scala-js/issues/2554) Wrong codegen in the presence of pattern match + boxed value class
* [#2559](https://github.com/scala-js/scala-js/issues/2559) `Throwable` constructor with cause should use the cause's message
* [#2565](https://github.com/scala-js/scala-js/issues/2565) `java.util.Date.toString()` result is missing dd part
* [#2573](https://github.com/scala-js/scala-js/issues/2573) `split("")` is not identical to JVM split

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av0.6.12+is%3Aclosed).
