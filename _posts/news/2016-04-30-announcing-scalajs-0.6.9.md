---
layout: post
title: Announcing Scala.js 0.6.9
category: news
tags: [releases]
permalink: /news/2016/04/30/announcing-scalajs-0.6.9/
---


We are pleased to announce the release of Scala.js 0.6.9!

This release was mostly focused on ironing out the support of Scala 2.12.0-M4 and the upcoming M5.
All users of 2.12.0-M4 are highly encouraged to upgrade to Scala.js 0.6.9.
The release also contains a few bug fixes, as well as the following improvements:

* [#2009](https://github.com/scala-js/scala-js/issues/2009) No own class for anonymous Scala.js-defined JS classes (see below)
* [#2350](https://github.com/scala-js/scala-js/issues/2350) A read-only sbt setting `isScalaJSProject` which is `true` iff the current project is a Scala.js project

<!--more-->

## Getting started

If you are new to Scala.js, head over to
[the tutorial]({{ BASE_PATH }}/tutorial/).

## Release notes

If upgrading from 0.6.5 or earlier, please also read the [release notes of 0.6.6]({{ BASE_PATH }}/news/2016/01/25/announcing-scalajs-0.6.6/), which contains some breaking changes.

As a minor release, 0.6.9 is backward source and binary compatible with previous releases in the 0.6.x series.
Libraries compiled with earlier versions can be used with 0.6.9 without change.
0.6.9 is also forward binary compatible with 0.6.8, but not with earlier releases: libraries compiled with 0.6.9 cannot be used by projects using 0.6.{0-7}.

Please report any issues [on GitHub](https://github.com/scala-js/scala-js/issues).

## No own class for anonymous Scala.js-defined JS classes

The language proposal [#2009](https://github.com/scala-js/scala-js/issues/2009) was implemented in this release.
In a nutshell, consider this snippet:

{% highlight scala %}
@ScalaJSDefined
trait Point extends js.Object {
  def x: Int
  def y: Int
}

val p = new Point {
  val x = 5
  val y = 10
}
{% endhighlight %}

The previous language specification and implementation would create an anonymous *class* for the `new Point {...}`, and `p` would be an instance of that class.
This has two major disadvantages:

- It consumes a lot of code to define the class
- Some libraries can refuse to treat `p` as a "plain old JavaScript object" because its class is not `Object` itself, but a subclass (see [#2006](https://github.com/scala-js/scala-js/issues/2006))

The new specification guarantees that `new Point {...}` will not create a new class.
Instead, it will intuitively correspond to the following JavaScript code:

{% highlight javascript %}
const p = new Object(); // the superclass js.Object of Point
p.x = 5;
p.y = 10;
{% endhighlight %}

In other words, fields (and methods) of the anonymous class are directly assigned on the created object.

For the complete semantic reference, [read the proposal](https://github.com/scala-js/scala-js/issues/2009).

## Bug fixes

Among others, the following bugs have been fixed:

* [#2320](https://github.com/scala-js/scala-js/issues/2320) Objects extending `js.GlobalScope` should not allow `@JSName` (potentially breaking change if you have `-Xfatal-warnings`)
* [#2319](https://github.com/scala-js/scala-js/issues/2319) Objects extending `js.GlobalScope` inside objects are allowed but require `@JSName` annotation
* [#2314](https://github.com/scala-js/scala-js/issues/2314) Infinite loop in `BigDecimal.isValidLong`
* [#2333](https://github.com/scala-js/scala-js/issues/2333) The JUnit runner does not report failures as events, causing `sbt test` to erroneously succeed
* [#2345](https://github.com/scala-js/scala-js/issues/2345) Different `hashCode` in JS and JVM for case class with big `Long`
* [#2358](https://github.com/scala-js/scala-js/issues/2358) `ProvidedJS` requires OS dependent path separator

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av0.6.9+is%3Aclosed).
