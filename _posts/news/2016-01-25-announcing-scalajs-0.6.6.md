---
layout: post
title: Announcing Scala.js 0.6.6
category: news
tags: [releases]
permalink: /news/2016/01/25/announcing-scalajs-0.6.6/
---


We are excited to announce the release of Scala.js 0.6.6!

It has been a long while since the last release, almost 5 months already.
That was too long, and we apologize.
In the future, we hope never to let more than 2 months elapse between consecutive releases.

Besides bug fixes, this release brings several major improvements:

* `js.TupleN`, a JS equivalent of Scala tuples
* Support for JUnit
* Better support of constructors of `@ScalaJSDefined` classes:
  they can now have overloads, default parameters and varargs
* A completely redesigned internal API for the linker, whose main visible impact should be reduced memory usage and improved speed
* `js.ConstructorTag[C]`, a `ClassTag` equivalent to `js.constructorOf[C]`

<!--more-->

## Getting started

If you are new to Scala.js, head over to
[the tutorial]({{ BASE_PATH }}/tutorial/).

## Release notes

As a minor release, 0.6.6 is (almost, see Breaking changes below) backward source and binary compatible with previous releases in the 0.6.x series.
Libraries compiled with earlier versions can be used with 0.6.6 without change.
However, it is not forward compatible: libraries compiled with 0.6.6 cannot be used by projects using 0.6.{0-5}.

Please report any issues [on GitHub](https://github.com/scala-js/scala-js/issues).

## Breaking changes

### Running in Node.js/PhantomJS

Until Scala.js 0.6.5, the following sbt setting would, as a side-effect, enable Node.js or PhantomJS:

    scalaJSStage in Global := FastOptStage

As of Scala.js 0.6.6, this setting is redundant, as it is the default, but `run` and `test` will still use Rhino by default!
To disable Rhino and use Node.js/PhantomJS in 0.6.6, use the following setting instead:

    scalaJSUseRhino in Global := false

### Tools API

The [Tools API]({{ site.production_url }}/api/scalajs-tools/0.6.6/#org.scalajs.core.tools.package),
(the API to the Scala.js linker and optimizer) have been completely redesigned.
Users of this API, such as [Scala.jsFiddle](http://www.scala-js-fiddle.com/), will experience breakages.
Contact us if you need help porting your code.

## Improvements

### JavaScript Tuple types

In the same spirit as `js.Function`s, `js.Array`, etc., we have added a series of types representing JavaScript "tuples": `js.Tuple2` to `js.Tuple22`.
The JavaScript representation of a tuple is, in fact, a heterogeneous array of fixed length.

For example, the value

    val t = js.Tuple2(45, "hello")

corresponds the JavaScript value

    [45, "hello"]

You should use `js.Tuple`s in facades to JavaScript libraries that take and return tuples as heterogeneous arrays.

JavaScript tuples are convertible back and forth to Scala tuples, and you can use deconstruction to extract all values of a JavaScript at the same time.
For example:

    val scalaT: (Int, String) = t
    val t2: js.Tuple2[Int, String] = scalaT
    val js.Tuple2(a, b) = t2

### Support for JUnit

It is now possible to write JUnit tests for Scala.js!
We have ported the JUnit API to Scala.js, so that it is now possible to write cross-compiling unit tests with JUnit.

To enable JUnit on your Scala.js project, add the appropriate sbt AutoPlugin using

    enablePlugins(ScalaJSJUnitPlugin)

(like you would with the basic `ScalaJSPlugin`).
For a `crossProject`, this must be enabled only on the JS variant.
For the JVM variant, use the usual `libraryDependencies` setting:

{% highlight scala %}
lazy val myCrossProject = crossProject.
  jsConfigure(_.enablePlugins(ScalaJSJUnitPlugin)).
  jvmSettings(
    libraryDependencies +=
      "com.novocode" % "junit-interface" % "0.9" % "test"
  )
{% endhighlight %}

### `js.ConstructorTag[C]`

[`js.ConstructorTag[C]`]({{ site.production_url }}/api/scalajs-library/0.6.6/#scala.scalajs.js.ConstructorTag) is to [`js.constructorOf[C]`]({{ site.production_url }}/api/scalajs-library/0.6.6/#scala.scalajs.js.package@constructorOf[T<:scala.scalajs.js.Any]:scala.scalajs.js.Dynamic) as `ClassTag[C]` is to `classOf[C]`, i.e., you can use an `implicit` parameter of type `js.ConstructorTag[C]` to implicitly get a `js.constructorOf[C]`.
For example:

{% highlight scala %}
def instantiate[C <: js.Any : js.ConstructorTag]: C =
  js.Dynamic.newInstance(js.constructorTag[C].constructor)().asInstanceOf[C]
  
val newEmptyJSArray = instantiate[js.Array[Int]]
{% endhighlight %}

Implicit expansion will desugar the above code into:

{% highlight scala %}
def instantiate[C <: js.Any](implicit tag: js.ConstructorTag[C]): C =
  js.Dynamic.newInstance(tag.constructor)().asInstanceOf[C]
  
val newEmptyJSArray = instantiate[js.Array[Int]](
    new js.ConstructorTag[C](js.constructorOf[js.Array[Int]]))
{% endhighlight %}

although you cannot write the desugared version in user code because the constructor of `js.ConstructorTag` is private.

This feature is particularly useful for Scala.js libraries wrapping JavaScript frameworks expecting to receive JavaScript constructors as parameters.

### Query for Development versus Production mode

The new methods `isDevelopmentMode` and `isProductionMode` allow you to query in your code whether you are running in a Development build or a Production build (for all practical purposes, aka `fastOptJS` and `fullOptJS`, resp.).
The methods are located in [`scala.scalajs.LinkingInfo`]({{ site.production_url }}/api/scalajs-library/0.6.6/#scala.scalajs.LinkingInfo$).
These methods can be used by libraries to provide domain-specific "optimizations" for production, e.g., eliminate expensive run-time checks useful for debugging.
Using these methods should be done with great care as, by definition, they will alter the behavior of your program between `fastOpt` and `fullOpt`.

### Java library additions

* Methods of `java.lang.Long` dealing with unsigned values
* Several JDK8 methods of `java.lang.Math`
* `java.util.Comparator.reversed`: the first of the *default* methods of JDK8
* `java.util.ArrayDeque`
* `java.net.URLDecoder`
* `java.util.concurrent.locks.ReentrantLock`
* `java.util.Objects`

## Bug fixes

Among others, the following bugs have been fixed:

* [#1635](https://github.com/scala-js/scala-js/issues/1635) Touching a file in `src/test/resources` triggers `test:fastOptJS`
* [#1891](https://github.com/scala-js/scala-js/issues/1891) Class with constructors with optional parameters can't be embedded in objects that extend `js.Object`
* [#1899](https://github.com/scala-js/scala-js/issues/1899) Some members of `new js.Object {...}` are not visible from JavaScript
* [#1975](https://github.com/scala-js/scala-js/issues/1975) Inner function in `@ScalaJSDefined` method doesn't get parameter
* [#1979](https://github.com/scala-js/scala-js/issues/1979) [#2042](https://github.com/scala-js/scala-js/issues/2042) Bugs in `java.math.BigDecimal.divideToIntegralValue`
* [#1984](https://github.com/scala-js/scala-js/issues/1984) `-8 % 8` evaluates to negative 0, which then blows up if cast to Integer (duplicate [#2068](https://github.com/scala-js/scala-js/issues/2068))
* [#2045](https://github.com/scala-js/scala-js/issues/2045) `BigInt.pow(31)` return the negative of the expected number
* [#2067](https://github.com/scala-js/scala-js/issues/2067) Better implicits for combinations of `js.|` and `js.UndefOr`
* [#2114](https://github.com/scala-js/scala-js/issues/2114) `CharBuffer.wrap(CharSequence,Int,Int)` interprets `end` as `length`
* [#2158](https://github.com/scala-js/scala-js/issues/2158) Parsing very large `Long` does not fail properly
* [#2159](https://github.com/scala-js/scala-js/issues/2159) `java.math.BigInteger` violate equals/hashCode law
* [#2178](https://github.com/scala-js/scala-js/issues/2178) sbt `test:run` on Scala.js projects runs it under the JVM
* [#2180](https://github.com/scala-js/scala-js/issues/2180) `Character.isWhitespace` discrepancies

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av0.6.6+is%3Aclosed).

## Known issues

The following issues were discovered too late to be fixed in v0.6.6:

* [#2195](https://github.com/scala-js/scala-js/issues/2195) Source maps to the Scala library are broken
