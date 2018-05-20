---
layout: post
title: Announcing Scala.js 0.6.23
category: news
tags: [releases]
permalink: /news/2018/05/22/announcing-scalajs-0.6.23/
---


We are pleased to announce the release of Scala.js 0.6.23!

This release is almost exclusively a bug-fix release.
It also adds support for Scala 2.13.0-M4 and its new collections, thanks to the hard work of [**@julienrf**](https://github.com/julienrf).

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to
[the tutorial]({{ BASE_PATH }}/tutorial/).

## Release notes

If upgrading from Scala.js 0.6.14 or earlier, make sure to read [the release notes of 0.6.15]({{ BASE_PATH }}/news/2017/03/21/announcing-scalajs-0.6.15/), which contain important migration information.

As a minor release, 0.6.23 is backward binary compatible with previous releases in the 0.6.x series.
Libraries compiled with earlier versions can be used with 0.6.23 without change.
0.6.23 is also forward binary compatible with 0.6.{17-22}, but not with earlier releases: libraries compiled with 0.6.23 cannot be used by projects using 0.6.{0-16}.

There is one source breaking change if you use `.scala` files for your sbt build.

Please report any issues [on GitHub](https://github.com/scala-js/scala-js/issues).

## Breaking changes

Usages of `%%%` in `.scala` files of an sbt build (under `project/`) need a new import:

{% highlight scala %}
import org.portablescala.sbtplatformdeps.PlatformDepsPlugin.autoImport._
{% endhighlight %}

For `.sbt` files, this import is automatically added, so nothing changes.

## Deprecations

### Built-in `crossProject`

The built-in `crossProject` feature has been deprecated.
You should use [sbt-crossproject](https://github.com/portable-scala/sbt-crossproject) instead.
Please follow [the migration instructions](https://github.com/portable-scala/sbt-crossproject#migration-from-scalajs-default-crossproject) in its readme.

### `withOutputMode`

The notion of `OutputMode` has been replaced by that of `ESFeatures`.
Instead of

{% highlight scala %}
import org.scalajs.core.tools.linker.backend.OutputMode
scalaJSOutputMode := OutputMode.ECMAScript2015
{% endhighlight %}

or

{% highlight scala %}
import org.scalajs.core.tools.linker.standard._
scalaJSLinkerConfig ~= { _.withOutputMode(OutputMode.ECMAScript2015) }
{% endhighlight %}

you should now use

{% highlight scala %}
// no import needed
scalaJSLinkerConfig ~= { _.withESFeatures(_.withUseECMAScript2015(true)) }
{% endhighlight %}

## New features

### JDK APIs

The following JDK API methods have been added:

* `java.lang.Character.isSurrogate()`

## Bug fixes

Among others, the following bugs have been fixed in 0.6.23:

* [#3227](https://github.com/scala-js/scala-js/issues/3227) Linking error for an `@EnableReflectiveInstantiation` class inside a lambda in Scala 2.11 and 2.10
* [#3267](https://github.com/scala-js/scala-js/issues/3267) Linking error with `@tailrec` method inside a trait with a self-type, on Scala 2.12+
* [#3285](https://github.com/scala-js/scala-js/issues/3285) Run-time error in Scala.js-defined classes with multiple parameter lists and default args

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av0.6.23+is%3Aclosed).
