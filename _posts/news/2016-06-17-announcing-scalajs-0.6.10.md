---
layout: post
title: Announcing Scala.js 0.6.10
category: news
tags: [releases]
permalink: /news/2016/06/17/announcing-scalajs-0.6.10/
---


We are pleased to announce the release of Scala.js 0.6.10!

This release is mostly a bug-fix release.
It also contains further adaptations to support the upcoming Scala 2.12.0-M5.

The most important improvement is that the sbt plugin can now generate HTML pages to run your test suites in browsers (with any testing framework), so that you can use your browser's debugger to step through your tests.

<!--more-->

## Getting started

If you are new to Scala.js, head over to
[the tutorial]({{ BASE_PATH }}/tutorial/).

## Release notes

If upgrading from 0.6.5 or earlier, please also read the [release notes of 0.6.6]({{ BASE_PATH }}/news/2016/01/25/announcing-scalajs-0.6.6/), which contains some breaking changes.

As a minor release, 0.6.10 is backward source and binary compatible with previous releases in the 0.6.x series.
Libraries compiled with earlier versions can be used with 0.6.10 without change.
0.6.10 is also forward binary compatible with 0.6.8 and 0.6.9, but not with earlier releases: libraries compiled with 0.6.10 cannot be used by projects using 0.6.{0-7}.

Please report any issues [on GitHub](https://github.com/scala-js/scala-js/issues).

## HTML test runners

You already know that you can use the `test` task of sbt to run your unit tests in Rhino, Node.js, PhantomJS or even Selenium.
All these runners however lack friendly, graphical debbugers.
In Scala.js 0.6.10, we have enhanced the sbt plugin with two new tasks `testHtmlFastOpt` and `testHtmlFullOpt`.
These tasks generate an HTML file which, when opened in a web browser, will run your test suite within the browser.
From there, you can use your browser's debugger.

## Bug fixes

Among others, the following bugs have been fixed:

* [#2314](https://github.com/scala-js/scala-js/issues/2314) Infinite loop in `BigDecimal.isValidLong` (again)
* [#2376](https://github.com/scala-js/scala-js/issues/2376) PhantomJSEnv does not properly escape JS code in webpage (duplicate [#2279](https://github.com/scala-js/scala-js/issues/2279), [#2322](https://github.com/scala-js/scala-js/issues/2322))
* [#2368](https://github.com/scala-js/scala-js/issues/2368) RhinoJSEnv does not support setTimeout without second argument
* [#2333](https://github.com/scala-js/scala-js/issues/2333) The JUnit runner does not report failures as events, causing `sbt test` to erroneously succeed
* [#2392](https://github.com/scala-js/scala-js/issues/2392) java.util.Date should have method getTimezoneOffset
* [#2400](https://github.com/scala-js/scala-js/issues/2400) java.util.Arrays.sort is not stable
* [#2401](https://github.com/scala-js/scala-js/issues/2401) Allow native objects in package objects without @JSName
* A number of discrepancies with the way our implementation of JUnit was logging its output wrt. the JVM reference

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av0.6.10+is%3Aclosed).
