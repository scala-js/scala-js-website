---
layout: post
title: Announcing Scala.js 0.6.11
category: news
tags: [releases]
permalink: /news/2016/07/27/announcing-scalajs-0.6.11/
---


We are pleased to announce the release of Scala.js 0.6.11!

This release was mainly focused on optimizations.
In particular, `Long`s have been dramatically improved, with up to 15x speedups ([#1488](https://github.com/scala-js/scala-js/pull/2488)).
Some operations on `BigInteger`s benefit a lot from this, with up to 8x speedups.

We have also finally upgraded the version of the Google Closure Compiler that is used for `fullOptJS`, which brings speed improvements to the production applications of up to 2x, although mostly in the 10-15% range ([#2490](https://github.com/scala-js/scala-js/pull/2490#issuecomment-234492628)).

<!--more-->

## Getting started

If you are new to Scala.js, head over to
[the tutorial]({{ BASE_PATH }}/tutorial/).

## Release notes

If upgrading from 0.6.5 or earlier, please also read the [release notes of 0.6.6]({{ BASE_PATH }}/news/2016/01/25/announcing-scalajs-0.6.6/), which contains some breaking changes.

As a minor release, 0.6.11 is backward source and binary compatible with previous releases in the 0.6.x series.
Libraries compiled with earlier versions can be used with 0.6.11 without change.
0.6.11 is also forward binary compatible with 0.6.8 through 0.6.10, but not with earlier releases: libraries compiled with 0.6.11 cannot be used by projects using 0.6.{0-7}.

Please report any issues [on GitHub](https://github.com/scala-js/scala-js/issues).

## Potentially breaking change

This release fixes [#2445](https://github.com/scala-js/scala-js/issues/2445), which potentially constitutes a breaking change, if you relied on the previously buggy behavior.
Recall that, in JavaScript types and exports, `def`s without parentheses are JavaScript *getters*.
For example,

{% highlight scala %}
@js.native
class Foo extends js.Object {
  def makeArray: js.Array[Int] = js.native
}

val foo = new Foo
val a = foo.makeArray // in JavaScript, this is foo.makeArray, *not* foo.makeArray()
{% endhighlight %}

The bug [#2445](https://github.com/scala-js/scala-js/issues/2445) was that, if `makeArray` was defined with type parameters, it would erroneously translate to a *method call* in JavaScript, rather than a *field access/getter call*.

{% highlight scala %}
@js.native
class Foo extends js.Object {
  def makeArray[A]: js.Array[A] = js.native
}

val foo = new Foo
val a = foo.makeArray[Int] // gave foo.makeArray() because of #2445
{% endhighlight %}

Now that [#2445](https://github.com/scala-js/scala-js/issues/2445) is fixed, the last instruction correctly calls `foo.makeArray` without parentheses.

If you were relying on the previously buggy behavior (i.e., it was correct in your case to have `foo.makeArray()`), your code will break in this release.
The solution in that case is to add `()` at the definition site of `makeArray`, like this:

{% highlight scala %}
def makeArray[A](): js.Array[A] = js.native
{% endhighlight %}

## Deprecating `@JSExportNamed`

The annotation `@JSExportNamed` was deprecated, per [#2442](https://github.com/scala-js/scala-js/issues/2442).
Refer [to its Scaladoc]({{ site.production_url }}/api/scalajs-library/0.6.11/#scala.scalajs.js.annotation.JSExportNamed) for migration tips.

## Improvements to the HTML test runners

In 0.6.10, [we introduced HTML test runners]({{ BASE_PATH }}/news/2016/06/17/announcing-scalajs-0.6.10/).
This release brings a few improvements to them:

* [#2476](https://github.com/scala-js/scala-js/pull/2476) The outputs are grouped by test suite, in collapsible boxes
* [#2481](https://github.com/scala-js/scala-js/issues/2481) Failed tests are moved to the top of the UI
* [#2475](https://github.com/scala-js/scala-js/issues/2475) It is possible to filter the set of tests to run, for a quicker turnaround when debugging a few issues

## Clean way to find the `.map` file associated to `fastOptJS`/`fullOptJS`

Previously, to find the source map file (`.map`) associated to the `.js` file produced by `fastOptJS` or `fullOptJS`, it was necessary to compute it by hand, by adding `.map` to the file name.
This was not very clean.

We have improved this in [#2494](https://github.com/scala-js/scala-js/issues/2494).
Now, you can access the source map file to an attribute of the result of `fastOptJS` and `fullOptJS`.
For example,

{% highlight scala %}
val fastOptAttrFile = fastOptJS.value
val fastOptFile = fastOptAttrFile.data // the .js file
val fastOptSourceMapFile = fastOptAttrFile.get(scalaJSSourceMap).get // the .map file
{% endhighlight %}

## New JDK APIs

* [#2507](https://github.com/scala-js/scala-js/pull/2507) `java.util.Optional`
* [#2533](https://github.com/scala-js/scala-js/pull/2533) `java.util.EventObject`

## Bug fixes

Among others, the following bugs have been fixed:

* [#2471](https://github.com/scala-js/scala-js/issues/2471) The `BufferedReader` implementation does not close its underlying `Reader`
* [#2474](https://github.com/scala-js/scala-js/issues/2474) 2+ top-level exports with the same name cause trouble at run-time
* [#2491](https://github.com/scala-js/scala-js/issues/2491) Name clash in some cases after renaming by the Closure Compiler in `fullOpt`
* [#2512](https://github.com/scala-js/scala-js/issues/2512) `java.util.Arrays.asList()` cannot be called
* [#2513](https://github.com/scala-js/scala-js/issues/2513) `@JSExport` does not work for abstract `val`s and `var`s
* [#2539](https://github.com/scala-js/scala-js/issues/2539) `java.util.ConcurrentHashMap.putIfAbsent()` is wrong
* [#2445](https://github.com/scala-js/scala-js/issues/2445) Paren-free `def`'s with type-parameters are handled as a function in `js.native` traits

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av0.6.11+is%3Aclosed).
