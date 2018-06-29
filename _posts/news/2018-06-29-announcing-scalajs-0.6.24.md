---
layout: post
title: Announcing Scala.js 0.6.24
category: news
tags: [releases]
permalink: /news/2018/06/29/announcing-scalajs-0.6.24/
---


We are pleased to announce the release of Scala.js 0.6.24!

This release contains a number of fixes for small bugs that have been lingering in our issue tracker for ages.
The version of the Scala standard library for 2.12 has also been upgraded to 2.12.6.

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to
[the tutorial]({{ BASE_PATH }}/tutorial/).

## Release notes

If you use `.scala` build files in `project/` and are upgrading from Scala.js 0.6.22 or earlier, do read [the release notes of 0.6.23]({{ BASE_PATH }}/news/2018/05/22/announcing-scalajs-0.6.23/), which contain a source breaking change in that situation.

If upgrading from Scala.js 0.6.14 or earlier, make sure to read [the release notes of 0.6.15]({{ BASE_PATH }}/news/2017/03/21/announcing-scalajs-0.6.15/), which contain important migration information.

As a minor release, 0.6.24 is backward binary compatible with previous releases in the 0.6.x series.
Libraries compiled with earlier versions can be used with 0.6.24 without change.
0.6.24 is also forward binary compatible with 0.6.{17-23}, but not with earlier releases: libraries compiled with 0.6.24 cannot be used by projects using 0.6.{0-16}.

Please report any issues [on GitHub](https://github.com/scala-js/scala-js/issues).

## Changes with compatibility concerns

Following a breaking dependency change on Rhino in recent versions of sbt-web and sbt-js-engine which [caused some issues when combined with Scala.js](https://github.com/sbt/sbt-less/issues/95), we have upgraded our own dependency on Rhino to

{% highlight scala %}
"org.mozilla" % "rhino" % "1.7.6"
{% endhighlight %}

Although we do not foresee any issue in practice, there exists a possibility that this will break your build if another sbt plugin relies on apigee's fork of Rhino.
If this causes an issue for you, you can fall back on the old dependency by adding the following to `project/plugins.sbt`:

{% highlight scala %}
excludeDependencies += "org.mozilla" % "rhino"
libraryDependencies += "io.apigee" % "rhino" % "1.7R5pre4"
{% endhighlight %}

## Bug fixes

Among others, the following bugs have been fixed in 0.6.24:

* [#3393](https://github.com/scala-js/scala-js/issues/3393) When a JSEnv fails on startup (e.g., due to a lack of `jsdom`), sbt reports success
* [#1619](https://github.com/scala-js/scala-js/issues/1619) `String.format` does not support thousands grouping
* [#2935](https://github.com/scala-js/scala-js/issues/2935) `Integer.parseInt` and similar don't support non-ASCII scripts
* [#3348](https://github.com/scala-js/scala-js/issues/3348) Doubles in hex notation fail to parse
* [#3368](https://github.com/scala-js/scala-js/issues/3368) Scala.js' JUnit emits weird comparison for strings that fail `assertEquals`

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av0.6.24+is%3Aclosed).
