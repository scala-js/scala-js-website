---
layout: post
title: Announcing Scala.js 0.6.27
category: news
tags: [releases]
permalink: /news/2019/04/08/announcing-scalajs-0.6.27/
---


We are pleased to announce the release of Scala.js 0.6.27!

The highlight of this release is the support for Scala 2.13.0-RC1.
It also fixes a few issues, and introduces a way to limit the number of concurrent linking operations in the sbt plugin.

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to
[the tutorial]({{ BASE_PATH }}/tutorial/).

## Release notes

If you use `.scala` build files in `project/` and are upgrading from Scala.js 0.6.22 or earlier, do read [the release notes of 0.6.23]({{ BASE_PATH }}/news/2018/05/22/announcing-scalajs-0.6.23/), which contain a source breaking change in that situation.

If upgrading from Scala.js 0.6.14 or earlier, make sure to read [the release notes of 0.6.15]({{ BASE_PATH }}/news/2017/03/21/announcing-scalajs-0.6.15/), which contain important migration information.

As a minor release, 0.6.27 is backward binary compatible with previous releases in the 0.6.x series.
Libraries compiled with earlier versions can be used with 0.6.27 without change.
0.6.27 is also forward binary compatible with 0.6.{17-26}, but not with earlier releases: libraries compiled with 0.6.27 cannot be used by projects using 0.6.{0-16}.

Please report any issues [on GitHub](https://github.com/scala-js/scala-js/issues).

## Limit how many Scala.js linker tasks can concurrently run in sbt

Linker tasks (`fastOptJS` and `fullOptJS`), which are transitively called by `run` and `test` tasks, use a lot of memory.
In some environments, and in particular on CI machines, this can lead to memory exhaustion and fail builds.
You can now use the following sbt setting to limit how many such tasks can concurrently run:

{% highlight scala %}
concurrentRestrictions in Global += Tags.limit(ScalaJSTags.Link, 2)
{% endhighlight %}

You may want to systematically enable that setting in your CI jobs.

## Bug fixes

Among others, the following bugs have been fixed in 0.6.27:

* [#3575](https://github.com/scala-js/scala-js/issues/3575) Wrong optimizations on floating point comparisons, e.g. `!(x <= 0)` ⟶ `x > 0`
* [#3538](https://github.com/scala-js/scala-js/issues/3538) Incorrect codegen for `@JSExport` on method with variable arguments in trait
* [#3528](https://github.com/scala-js/scala-js/issues/3528) `NodeJSEnv` does not propagate error output from Node.js

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av0.6.27+is%3Aclosed).
