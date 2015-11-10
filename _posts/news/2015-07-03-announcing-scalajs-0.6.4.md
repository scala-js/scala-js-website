---
layout: post
title: Announcing Scala.js 0.6.4
category: news
tags: [releases]
---


We are excited to announce the release of Scala.js 0.6.4!

This release brings support for Scala 2.11.7 and 2.12.0-M1, as well as a significant part of the Java collections library in `java.util`, thanks to [@andreaTP](https://github.com/andreaTP) and [@nicolasstucki](https://github.com/nicolasstucki).
It also fixes numerous bugs.
<!--more-->

## Getting started

If you are new to Scala.js, head over to
[the tutorial]({{ BASE_PATH }}/doc/tutorial.html).

## Release notes

For changes in the 0.6.x series compared to 0.5.x, read [the announcement of 0.6.0]({{ BASE_PATH }}/news/2015/02/05/announcing-scalajs-0.6.0/).

As a minor release, 0.6.4 is backward source and binary compatible with previous releases in the 0.6.x series.
Libraries compiled with earlier versions can be used with 0.6.4 without change.
However, it is not forward compatible: libraries compiled with 0.6.4 cannot be used by projects using 0.6.{0-3}.

Please report any issues [on GitHub](https://github.com/scala-js/scala-js/issues).

## Potential breaking changes

The bug fix for [#1705](https://github.com/scala-js/scala-js/issues/1705) in this release is potentially a breaking change that might affect your code silently.
If you had something like this in a facade type:

{% highlight scala %}
object JS extends js.Object {
  @JSName("b_=")
  def a_=(x: Int): Unit = js.native
}

JS.a = 1
{% endhighlight %}

the last line would previously (erroneously) translate to

{% highlight javascript %}
JS["b"] = 1;
{% endhighlight %}

This releases fixes the compiler to instead translate to

{% highlight javascript %}
JS["b_="] = 1;
{% endhighlight %}

If you relied on the former code to be emitted, you should change the `@JSName` annotation as `@JSName("b")`.

There is no deprecation period because there was no way to, at the same time, warn against problems, and still allow correct new code to be warning-free, unfortunately.

## Improvements

### Java Collections API

Some Scala libraries use the collections of Java in some cases.
To help port these libraries to Scala.js, a number of collection types have been ported.
At the moment, the following data structures are supported:

* `List`: `ArrayList`, `LinkedList`, `CopyOnWriteArrayList`
* `Set`: `HashSet`, `LinkedHashSet`, `ConcurrentSkipListSet`
* `Map`: `HashMap`, `LinkedHashMap`, `ConcurrentHashMap`
* `Queue`: `LinkedList`, `ConcurrentLinkedQueue`

as well as the helper classes `Arrays` and `Collections`.

### Better and earlier diagnostics for illegal `@JSExport`s and facade types

There were a number of illegal usages of `@JSExport` and facade types that were not detected by the compiler.
Using those would previously result in crashes of the linker or production of completely wrong .js code.
See tickets [#1647](https://github.com/scala-js/scala-js/issues/1647), [#1664](https://github.com/scala-js/scala-js/issues/1664), [#1704](https://github.com/scala-js/scala-js/issues/1704), [#1706](https://github.com/scala-js/scala-js/issues/1706), [#1707](https://github.com/scala-js/scala-js/issues/1707) and [#1717](https://github.com/scala-js/scala-js/issues/1717) for details.

### Running with Rhino also reports linking errors

Until 0.6.3, running with Rhino (the default) would not truly link, and therefore would not report linking errors.
This caused confusions in several occasions, because code that appeared to work on Rhino refused to link and therefore `fastOptJS` would not work.
As of 0.6.4, even running with Rhino will report linking errors.

## Bug fixes

Among others, the following bugs have been fixed:

* [#1646](https://github.com/scala-js/scala-js/issues/1646) `Char#isUpper` behavior diverges between Scala.js/Scala-JVM
* [#1664](https://github.com/scala-js/scala-js/issues/1664) `@JSName(variable)` annotation does not fail on objects and classes
* [#1671](https://github.com/scala-js/scala-js/issues/1671) `Double.toInt` and `Float.toInt` are broken
* [#1718](https://github.com/scala-js/scala-js/issues/1718) `Pattern.compile` doesn't validate regex
* [#1722](https://github.com/scala-js/scala-js/issues/1722) Rhino crash with Scalatest
* [#1733](https://github.com/scala-js/scala-js/issues/1733) `@JSName` does not work for `val`s and `var`s
* [#1734](https://github.com/scala-js/scala-js/issues/1734) Charset decoding fails with read-only byte buffers
* [#1743](https://github.com/scala-js/scala-js/issues/1743) `js.Dynamic.literal.applyDynamic("apply")(map.toSeq: _*)` causes optimizer to crash
* [#1748](https://github.com/scala-js/scala-js/issues/1748) Source root not found for shared project error (`CrossProject` friendlier to Scoverage)
* [#1759](https://github.com/scala-js/scala-js/issues/1759) `new Int8Array(n).toArray` throws TypeError
* [#1764](https://github.com/scala-js/scala-js/issues/1764) `BigInteger.modInverse` always throws an exception
* [#1774](https://github.com/scala-js/scala-js/issues/1774) `ClassCastException`: `org.mozilla.javascript.UniqueTag` running Scala.js project
* [#1781](https://github.com/scala-js/scala-js/issues/1781) When the optimizer crashes, it is left in an inconsistent state

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av0.6.4+is%3Aclosed).
