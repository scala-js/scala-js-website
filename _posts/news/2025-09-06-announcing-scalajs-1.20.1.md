---
layout: post
title: Announcing Scala.js 1.20.1
category: news
tags: [releases]
permalink: /news/2025/09/06/announcing-scalajs-1.20.1/
---


We are pleased to announce the release of Scala.js 1.20.1!

This is technically a hotfix patch release for 1.20.0, which was discovered to be [severely broken](https://github.com/scala-js/scala-js/issues/5231), and was therefore never announced.
These release notes therefore present it as a "minor release" compared to 1.19.0.

This release mainly comes with many performance improvements to the WebAssembly and JavaScript backends alike.

As of this writing, the latest versions of Firefox (since v131), Safari (since v18.4) and Chrome (since v137) support all the WebAssembly features required to run Scala.js-on-Wasm.

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to [the tutorial]({{ BASE_PATH }}/tutorial/).

If you need help with anything related to Scala.js, you may find our community [in `#scala-js` on Discord](https://discord.com/invite/scala) and [on Stack Overflow](https://stackoverflow.com/questions/tagged/scala.js).

Bug reports can be filed [on GitHub](https://github.com/scala-js/scala-js/issues).

## Release notes

If upgrading from Scala.js 0.6.x, make sure to read [the release notes of Scala.js 1.0.0]({{ BASE_PATH }}/news/2020/02/25/announcing-scalajs-1.0.0/) first, as they contain a host of important information, including breaking changes.

This is a **minor** release, compared to 1.19.0:

* It is backward binary compatible with all earlier versions in the 1.x series: libraries compiled with 1.0.x through 1.19.x can be used with 1.20.x without change.
* It is *not* forward binary compatible with 1.19.x: libraries compiled with 1.20.x cannot be used with 1.19.x or earlier.
* It is *not* entirely backward source compatible: it is not guaranteed that a codebase will compile *as is* when upgrading from 1.19.x (in particular in the presence of `-Xfatal-warnings`).

As a reminder, libraries compiled with 0.6.x cannot be used with Scala.js 1.x; they must be republished with 1.x first.

## Changes with compatibility concerns

### Drop the `performance.webkitNow` fallback of `System.nanoTime()`

`System.nanoTime()` normally uses the JavaScript API `performance.now()` under the hood if it is available, and `Date.now()` otherwise.
Until Scala.js 1.19.0, it also used `performance.webkitNow()` as possible fallback.
Since browsers supporting `webkitNow()` have been supporting the official `performance.now()` method for more than 10 years now, we have dropped that fallback.

This changed allowed to improve the run-time performance of `System.nanoTime()`.
It may degrade its precision on the old browsers that supported `webkitNow()` but not `now()`.

## Enhancements

### Link-time conditional branching

Thanks to our optimizer's ability to inline, constant-fold, and then eliminate dead code, we have been able to write link-time conditional branches for a long time.
Typical examples include polyfills, as illustrated in the documentation of [`scala.scalajs.LinkingInfo`]({{ BASE_PATH }}/api/scalajs-library/1.20.1/scala/scalajs/LinkingInfo$.html#esVersion:Int):

{% highlight scala %}
if (esVersion >= ESVersion.ES2018 || featureTest())
  useES2018Feature()
else
  usePolyfill()
{% endhighlight %}

which gets folded away to nothing but

{% highlight scala %}
useES2018Feature()
{% endhighlight %}

when optimizing for ES2018+.

However, this only works because both branches can *link* during the initial reachability analysis. We cannot use the same technique when one of the branches would refuse to link in the first place.
The canonical example is the usage of the JS `**` operator, which does not link below ES2016. The following snippet produces good code when linking for ES2016+, but does not link at all for ES2015:

{% highlight scala %}
def pow(x: Double, y: Double): Double = {
  if (esVersion >= ESVersion.ES2016) {
    (x.asInstanceOf[js.Dynamic] ** y.asInstanceOf[js.Dynamic]) // does not link!
      .asInstanceOf[Double]
  } else {
    Math.pow(x, y)
  }
}
{% endhighlight %}

Scala.js 1.20.1 introduces `scala.scalajs.LinkingInfo.linkTimeIf`, a conditional branch that is *guaranteed* by spec to be resolved at link-time.
Using a `linkTimeIf` instead of the `if` in `def pow`, we can successfully link the fallback branch on ES2015, avoiding the linking issue in the then branch.

{% highlight scala %}
import scala.scalajs.LinkingInfo.linkTimeIf

def pow(x: Double, y: Double): Double = {
  linkTimeIf(esVersion >= ESVersion.ES2016) {
    // this branch is only *linked* if we are targeting ES2016+
    (x.asInstanceOf[js.Dynamic] ** y.asInstanceOf[js.Dynamic])
      .asInstanceOf[Double]
  } {
    Math.pow(x, y)
  }
}
{% endhighlight %}

The condition of `linkTimeIf` must be a link-time constant expression.
It can only contain:

* int and boolean literals and constants,
* boolean operators (`!`, `&&` and `||`),
* int comparison operators (such as `==` and `<`),
* link-time properties in the `LinkingInfo` object, notably `esVersion`, `productionMode` and `isWebAssembly`.

### Performance improvements

Scala.js 1.20.1 brings a number of performance improvements compared to 1.19.0.

For both JavaScript and WebAssembly:

* Many low-level methods in `java.lang.Integer`, `Long`, `Float`, `Double`, `Math` and `System` have been micro-optimized.
* Scala `Range`s have a faster initialization path (this particular enhancement is also coming in Scala 2.13.17 for the JVM).

For JavaScript:

* `Long` performance was significantly enhanced, notably additive operations, conversions to strings and conversions to floating-point numbers.

For WebAssembly, performance improvements in the following areas:

* Varargs, when compiled with Scala.js 1.20.0+ on Scala 2, and with the upcoming Scala 3.8.0+ on Scala 3
* `java.util.ArrayList`, `ArrayDeque`, `PriorityQueue` and `java.util.concurrent.CopyOnWriteArrayList`
* `java.util.RedBlackTree.fromOrdered`
* Startup time in the presence of large arrays of constants
* Generally, fewer hops across the Wasm-JS boundary

## Miscellaneous

### New JDK APIs

This release adds support for the following JDK methods:

* In `java.lang.Math`:
  * `multiplyFull`
  * `multiplyHigh`
  * `unsignedMultiplyHigh`
* In `java.lang.Double`:
  * `doubleToRawLongBits`
* In `java.lang.Float`:
  * `floatToRawIntBits`
* In `java.lang.Integer` and `java.lang.Long`:
  * `compress`
  * `expand`

### Improved debugging experience on Wasm

The Wasm backend now emits more debugging information: the names of types, object fields, local variables and global variables.
This improves the debugging experience when targeting WebAssembly.

## Bug fixes

The following bugs have been fixed in 1.20.0 and 1.20.1:

* [#5159](https://github.com/scala-js/scala-js/issues/5159) Regression in v1.19.0: `AssertionError` with module splitting on and optimizer off.
* [#5165](https://github.com/scala-js/scala-js/issues/5165) Wasm: `try..finally` with non-nullable reference type produces invalid code.
* [#5208](https://github.com/scala-js/scala-js/issues/5208) `doubleToLongBits` can observe non-canonical NaN bit patterns.
* [#5231](https://github.com/scala-js/scala-js/issues/5231) `AssertionError`: rolled-back RuntimeLong inlining (regression in 1.20.0).

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av1.20.0+is%3Aclosed).
