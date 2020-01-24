---
layout: post
title: Announcing Scala.js 0.6.32
category: news
tags: [releases]
permalink: /news/2020/01/24/announcing-scalajs-0.6.32/
---


We are pleased to announce the release of Scala.js 0.6.32!

This is mostly a bugfix release, including a fix for a regression in regular expressions that appeared in 0.6.31 ([#3901](https://github.com/scala-js/scala-js/issues/3901)).
This release also adds the definitions for some recent methods of `js.Object`, thanks to [@exoego](https://github.com/exoego), and the JDK interface `java.util.function.Consumer`, thanks to [mliarakos](https://github.com/mliarakos).

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to
[the tutorial]({{ BASE_PATH }}/tutorial/).

## Release notes

If you use `.scala` build files in `project/` and are upgrading from Scala.js 0.6.22 or earlier, do read [the release notes of 0.6.23]({{ BASE_PATH }}/news/2018/05/22/announcing-scalajs-0.6.23/), which contain a source breaking change in that situation.

If upgrading from Scala.js 0.6.14 or earlier, make sure to read [the release notes of 0.6.15]({{ BASE_PATH }}/news/2017/03/21/announcing-scalajs-0.6.15/), which contain important migration information.

As a minor release, 0.6.32 is backward binary compatible with previous releases in the 0.6.x series.
Libraries compiled with earlier versions can be used with 0.6.32 without change.
0.6.32 is also forward binary compatible with 0.6.{29-31}, but not with earlier releases: libraries compiled with 0.6.32 cannot be used by projects using 0.6.{0-28}.

Please report any issues [on GitHub](https://github.com/scala-js/scala-js/issues).

## Miscellaneous

### New JDK APIs

The interface `java.util.function.Consumer` is now available, thanks to a contribution by [mliarakos](https://github.com/mliarakos).

## Bug fixes

Among others, the following bugs have been fixed in 0.6.32:

* [#3901](https://github.com/scala-js/scala-js/issues/3901) `TypeError` in regular expressions (regression from Scala.js 0.6.29)
* [#3888](https://github.com/scala-js/scala-js/issues/3888) Linking errors on Scala 2.11 if an `object` is named `class`
* [#3913](https://github.com/scala-js/scala-js/issues/3913) `java.io.ByteArrayInputStream` behaves differently between JS and JVM
* [#3922](https://github.com/scala-js/scala-js/issues/3922) Wrong `maxBytesPerChar` for `CharsetEncoder`

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av0.6.32+is%3Aclosed).
