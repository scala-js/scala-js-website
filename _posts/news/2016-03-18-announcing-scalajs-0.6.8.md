---
layout: post
title: Announcing Scala.js 0.6.8
category: news
tags: [releases]
permalink: /news/2016/03/18/announcing-scalajs-0.6.8/
---


We are pleased to announce the release of Scala.js 0.6.8!

This release is mostly a bugfix release.
The most important changes are:

* Fixed [#2243](https://github.com/scala-js/scala-js/issues/2243): `-jsdeps.min.js` not produced anymore after upgrading from 0.6.5 to 0.6.6 and 0.6.7
* Upgrade the implementation of the standard library to Scala 2.11.8
* [#2238](https://github.com/scala-js/scala-js/issues/2238) Drop support for ES6 Strong Mode

This release also contains important although invisible changes to prepare for Scala 2.12.0-M4, which [will start using default methods](https://github.com/scala/scala/pull/5003) to encode traits.
This required substantial changes in Scala.js.
Although most of the work was done in earlier releases of Scala.js, 0.6.8 is the first version that should be able to support Scala 2.12.0-M4.

<!--more-->

## Getting started

If you are new to Scala.js, head over to
[the tutorial]({{ BASE_PATH }}/tutorial/).

## Release notes

If upgrading from 0.6.5 or earlier, please also read the [release notes of 0.6.6]({{ BASE_PATH }}/news/2016/01/25/announcing-scalajs-0.6.6/), which contains some breaking changes.

As a minor release, 0.6.8 is backward source and binary compatible with previous releases in the 0.6.x series.
Libraries compiled with earlier versions can be used with 0.6.8 without change.
However, it is not forward compatible: libraries compiled with 0.6.8 cannot be used by projects using 0.6.{0-7}.

Please report any issues [on GitHub](https://github.com/scala-js/scala-js/issues).

### Drop support for ES6 Strong Mode

In [Scala.js 0.6.3]({{ BASE_PATH }}/news/2015/05/12/announcing-scalajs-0.6.3/), we had introduced experimental support for [ES6 Strong Mode](https://developers.google.com/v8/experiments), a proposal of the V8 team.
Since the Strong Mode experiment [has been discontinued by V8](https://groups.google.com/forum/#!topic/strengthen-js/ojj3TDxbHpQ), we have removed the Strong Mode support from Scala.js 0.6.8.

The sbt setting

    scalaJSOutputMode := OutputMode.ECMAScript6StrongMode

is therefore deprecated, and has the same behavior as `ECMAScript6`.

### New Java libraries

* `java.util.Properties`
* `System.getProperties()` and friends, along with support for `-D` options in the sbt setting `javaOptions`

## Bug fixes

Among others, the following bugs have been fixed in this release:

* [#2226](https://github.com/scala-js/scala-js/issues/2226) JSEnv timeouts start too early
* [#2243](https://github.com/scala-js/scala-js/issues/2243): `-jsdeps.min.js` not produced anymore after upgrading from 0.6.5 to 0.6.6 and 0.6.7

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av0.6.8+is%3Aclosed).
