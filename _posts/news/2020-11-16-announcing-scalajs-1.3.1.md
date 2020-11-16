---
layout: post
title: Announcing Scala.js 1.3.1
category: news
tags: [releases]
permalink: /news/2020/11/16/announcing-scalajs-1.3.1/
---


We are pleased to announce the release of Scala.js 1.3.1!

This release fixes the performance issues of the ECMAScript 2015 mode (the default) on Firefox.
This fix **has a cost in terms of emitted code size**.
Read more below about the trade-offs.

In addition, this release fixes several other issues, including three regressions in 1.3.0 ([#4252](https://github.com/scala-js/scala-js/issues/4252), [#4268](https://github.com/scala-js/scala-js/issues/4268) and [#4271](https://github.com/scala-js/scala-js/issues/4271)).
It also contains some improvements to the JDK support.

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to [the tutorial]({{ BASE_PATH }}/tutorial/).

If you need help with anything related to Scala.js, you may find our community [on Gitter](https://gitter.im/scala-js/scala-js) and [on Stack Overflow](https://stackoverflow.com/questions/tagged/scala.js).

Bug reports can be filed [on GitHub](https://github.com/scala-js/scala-js/issues).

## Release notes

If upgrading from Scala.js 0.6.x, make sure to read [the release notes of Scala.js 1.0.0]({{ BASE_PATH }}/news/2020/02/25/announcing-scalajs-1.0.0/) first, as they contain a host of important information, including breaking changes.

This is a **patch** release:

* It is backward binary compatible with all earlier versions in the 1.x series: libraries compiled with 1.0.x through 1.3.0 can be used with 1.3.1 without change.
* It is forward binary compatible with 1.3.0: libraries compiled with 1.3.1 can be used with 1.3.0 without change.
* It is backward source compatible with 1.3.0: source code that used to compile with 1.3.0 should compile as is when upgrading to 1.3.1.

From Scala.js 1.3.0, which was a **minor** release:

* It is *not* forward binary compatible with 1.2.x: libraries compiled with 1.3.1 cannot be used with 1.2.x or earlier.
* It is *not* entirely backward source compatible: it is not guaranteed that a codebase will compile *as is* when upgrading from 1.2.x or earlier (in particular in the presence of `-Xfatal-warnings`).

As a reminder, libraries compiled with 0.6.x cannot be used with Scala.js 1.x; they must be republished with 1.x first.

## Performance fix on Firefox and code size increase

Scala.js code has been known for bad performance on Firefox with the default output mode of ECMAScript 2015.

**This release fixes this issue, but at the cost of increased emitted code size.**

If you have been using the following setting to avoid bad performance on Firefox, you can now remove it:

{% highlight scala %}
// This was necessary before 1.3.1 to avoid bad performance on Firefox
scalaJSLinkerConfig ~= { _.withESFeatures(_.withUseECMAScript2015(false)) }
{% endhighlight %}

If your codebase does not target the Web nor any SpiderMonkey-based environment, you may want to trade it away for the better code size from before.
You can tell Scala.js that avoiding `class`es is not necessary with the following setting:

{% highlight scala %}
// Trade away decent Firefox performance for a smaller output
scalaJSLinkerConfig ~= { _.withESFeatures(_.withAvoidClasses(false)) }
{% endhighlight %}

It turns out that SpiderMonkey, the JavaScript engine of Firefox, exhibits severe performance penalties for JavaScript `class`es.
This has caused slowdowns for Scala.js code of up to 10x compared to other browsers and compared to the ECMAScript 5.1 mode.
Starting from Scala.js 1.3.1, we restrict the usage of `class`es in the emitted JavaScript to the minimum required for correct semantics.
We fall back to `function`s and `prototype`s for the majority of the emitted code.

## Miscellaneous

### Better support of Scala 3 in sbt-scalajs

The sbt plugin now has better support for Scala 3 codebases.
In particular, the JUnit support works out of the box with `enablePlugins(ScalaJSJUnitPlugin)`.
It is also future-proof for when sbt will support Scala 3 out of the box, rather than requiring `sbt-dotty`.

These improvements are only available for Scala >= 3.0.0-M1.
The 0.x versions are not supported.

### New JDK APIs

This release contains some improvements in the JDK APIs that we support:

New classes:

* `java.lang.ClassValue`

New methods:

* `new java.util.HashMap(initialCapacity: Int, loadFactor: Float)`
* `java.util.Objects.requireNonNull(obj: T, message: Supplier[String])`

Methods with fixed or improved behavior:

* In `java.util.regex.Matcher`:
  * `lookingAt()` and `matches()` ([#4252](https://github.com/scala-js/scala-js/issues/4252))
  * `reset()` ([#4254](https://github.com/scala-js/scala-js/issues/4254))
* `java.util.Formatter` and derivatives (such as `String.format`) now support `java.math.BigInteger` arguments with the `%d`, `%x` and `%o` conversions

## Bug fixes

Among others, the following bugs have been fixed in 1.3.1:

* [#4252](https://github.com/scala-js/scala-js/issues/4252) `regex.Matcher.lookingAt()` and `matches()` incorrect in 1.3.0
* [#4268](https://github.com/scala-js/scala-js/issues/4268) Native superclass of a non-native JS class is not imported (1.3.0 regression)
* [#4271](https://github.com/scala-js/scala-js/issues/4271) Scala.js 1.3.0 fails to fastOptJS/fullOptJS when the project has no exports nor the module initializer
* [#4254](https://github.com/scala-js/scala-js/issues/4254) `Matcher.reset()` does not reset the region
* [#4281](https://github.com/scala-js/scala-js/issues/4281) Bad error message when trying to define `apply` in an anonymous class extending `js.Function`

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av1.3.1+is%3Aclosed).
