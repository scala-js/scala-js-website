---
layout: post
title: Announcing Scala.js 0.6.16
category: news
tags: [releases]
permalink: /news/2017/04/29/announcing-scalajs-0.6.16/
---


We are excited to announce the release of Scala.js 0.6.16!

This release is mostly a bug-fix release.
It also adds support for jsdom v10.x (which contains breaking changes wrt. jsdom v9.x) and Scala 2.13.0-M1.

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to
[the tutorial]({{ BASE_PATH }}/tutorial/).

## Release notes

If upgrading from Scala.js 0.6.14 or earlier, make sure to read [the release notes of 0.6.15]({{ BASE_PATH }}/news/2017/03/21/announcing-scalajs-0.6.15/), which contain important migration information.

As a minor release, 0.6.16 is backward source and binary compatible with previous releases in the 0.6.x series.
Libraries compiled with earlier versions can be used with 0.6.16 without change.
It is also forward binary compatible with 0.6.15, but not with earlier releases: libraries compiled with 0.6.16 cannot be used by projects using 0.6.{0-14}.

Please report any issues [on GitHub](https://github.com/scala-js/scala-js/issues).

## New JDK parts

* [#2906](https://github.com/scala-js/scala-js/issues/2906) `java.lang.Math.next{Up,Down,After}` for `Float`s, as well as `nextDown` for `Double`

## Bug fixes

Among others, the following bugs have been fixed in 0.6.16:

* [#2821](https://github.com/scala-js/scala-js/issues/2821) Source Maps bug - wrong column in the generated file (thanks to [@Gralfim](https://github.com/Gralfim))
* [#2902](https://github.com/scala-js/scala-js/issues/2902) JSDOM API change breaks virtual console in tests

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av0.6.16+is%3Aclosed).
