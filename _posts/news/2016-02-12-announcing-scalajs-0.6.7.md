---
layout: post
title: Announcing Scala.js 0.6.7
category: news
tags: [releases]
permalink: /news/2016/02/12/announcing-scalajs-0.6.7/
---


We are pleased to announce the release of Scala.js 0.6.7!

This release is almost exclusively a bugfix release, after some critical regressions regarding the sbt plugin in Scala.js 0.6.6.
In particular, it fixes:

* [#2195](https://github.com/scala-js/scala-js/issues/2195) Source maps to the Scala standard library are broken
* [#2198](https://github.com/scala-js/scala-js/issues/2198) "Illegal classpath entry: <non existent path>" after upgrading from 0.6.5 to 0.6.6
* [#2202](https://github.com/scala-js/scala-js/issues/2202) and [#2219](https://github.com/scala-js/scala-js/issues/2219) `NullPointerException` or `AssertionError` while linking in client/server projects
* [#2222](https://github.com/scala-js/scala-js/issues/2222) Huge performance regression of the optimizer

Besides bug fixes, this release brings a few improvements:

* [`js.Promise`]({{ site.production_url }}/api/scalajs-library/0.6.7/#scala.scalajs.js.Promise) and its conversions to/from `Future`
* Proper stack traces for `Throwable`s in Node.js
* Support for Scala cross-version source directories in `shared/`

<!--more-->

## Getting started

If you are new to Scala.js, head over to
[the tutorial]({{ BASE_PATH }}/tutorial/).

## Release notes

If upgrading from 0.6.5 or earlier, please also read the [release notes of 0.6.6]({{ BASE_PATH }}/news/2016/01/25/announcing-scalajs-0.6.6/), which contains some breaking changes.

As a minor release, 0.6.7 is backward source and binary compatible with previous releases in the 0.6.x series.
Libraries compiled with earlier versions can be used with 0.6.7 without change.
0.6.7 is also forward binary compatible with 0.6.6, but not with earlier releases: libraries compiled with 0.6.7 cannot be used by projects using 0.6.{0-5}.

Please report any issues [on GitHub](https://github.com/scala-js/scala-js/issues).

## Bug fixes

In addition to the important bug fixes mentioned above, the following bugs have been fixed:

* [#2228](https://github.com/scala-js/scala-js/issues/2228) `BigInt("+100000000")` crashes
* [#2220](https://github.com/scala-js/scala-js/issues/2220) Compiler crash in 2.12 with a lambda inside a Scala.js-defined JS class
* [#2217](https://github.com/scala-js/scala-js/issues/2217) `this["require"]()` and fastOptJS
* [#2197](https://github.com/scala-js/scala-js/issues/2197) `@JSName` fails for field in trait

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av0.6.7+is%3Aclosed).
