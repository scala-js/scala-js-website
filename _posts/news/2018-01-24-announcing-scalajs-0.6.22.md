---
layout: post
title: Announcing Scala.js 0.6.22
category: news
tags: [releases]
permalink: /news/2018/01/24/announcing-scalajs-0.6.22/
---


We are pleased to announce the release of Scala.js 0.6.22!

This release is almost exclusively a bug-fix release.
It also features an improvement in terms of memory consumption and execution performance while running tests.

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to
[the tutorial]({{ BASE_PATH }}/tutorial/).

## Release notes

If upgrading from Scala.js 0.6.14 or earlier, make sure to read [the release notes of 0.6.15]({{ BASE_PATH }}/news/2017/03/21/announcing-scalajs-0.6.15/), which contain important migration information.

As a minor release, 0.6.22 is backward source and binary compatible with previous releases in the 0.6.x series.
Libraries compiled with earlier versions can be used with 0.6.22 without change.
0.6.22 is also forward binary compatible with 0.6.{17-21}, but not with earlier releases: libraries compiled with 0.6.22 cannot be used by projects using 0.6.{0-16}.

Please report any issues [on GitHub](https://github.com/scala-js/scala-js/issues).

## New features

### JDK APIs

The following JDK API methods have been added:

* `java.nio.Charset.aliases()`

## Bug fixes

Among others, the following bugs have been fixed in 0.6.22:

* [#3206](https://github.com/scala-js/scala-js/issues/3206) Standard error of Scala.js is erroneously sent to `logger.error`, instead of to stderr
* [#3218](https://github.com/scala-js/scala-js/issues/3218) main() in test scope is executed twice when using test framework and a main module initializer in Test
* [#3219](https://github.com/scala-js/scala-js/issues/3219) Methods exported under a scalac name starting with `$` are not exported
* [#3264](https://github.com/scala-js/scala-js/issues/3264) NPE while compiling an LMF-capable SAM inside an anonymous JS class

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av0.6.22+is%3Aclosed).
