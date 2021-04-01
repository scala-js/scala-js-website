---
layout: post
title: Announcing Scala.js 1.5.1
category: news
tags: [releases]
permalink: /news/2020/11/16/announcing-scalajs-1.5.1/
---


We are pleased to announce the release of Scala.js 1.5.1!

This release mostly contains additions and improvements in the JDK libraries.
In particular, several APIs involving floating point numbers have been fixed, from parsing to bit manipulation to formatting.

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to [the tutorial]({{ BASE_PATH }}/tutorial/).

If you need help with anything related to Scala.js, you may find our community [on Gitter](https://gitter.im/scala-js/scala-js) and [on Stack Overflow](https://stackoverflow.com/questions/tagged/scala.js).

Bug reports can be filed [on GitHub](https://github.com/scala-js/scala-js/issues).

## Release notes

If upgrading from Scala.js 0.6.x, make sure to read [the release notes of Scala.js 1.0.0]({{ BASE_PATH }}/news/2020/02/25/announcing-scalajs-1.0.0/) first, as they contain a host of important information, including breaking changes.

This is a **patch** release:

* It is backward binary compatible with all earlier versions in the 1.x series: libraries compiled with 1.0.x through 1.5.0 can be used with 1.5.1 without change.
* It is forward binary compatible with 1.5.0: libraries compiled with 1.5.1 can be used with 1.5.0 without change.
* It is backward source compatible with 1.5.0: source code that used to compile with 1.5.0 should compile as is when upgrading to 1.5.1.

In addition, like Scala.js 1.5.0:

* It is *not* forward binary compatible with 1.4.x: libraries compiled with 1.5.1 cannot be used with 1.4.x or earlier.
* It is *not* entirely backward source compatible with 1.4.x: it is not guaranteed that a codebase will compile *as is* when upgrading from 1.4.x or earlier (in particular in the presence of `-Xfatal-warnings`).

As a reminder, libraries compiled with 0.6.x cannot be used with Scala.js 1.x; they must be republished with 1.x first.

## Fixes with compatibility concerns

The `%e`, `%f` and `%g` conversions in `java.util.Formatter`---also used by `String.format` and the `f"..."` interpolator---have been fixed to match their specification on the JVM.

This may break tests that rely on the specific string output of formatting numbers.

## Miscellaneous

### New JDK APIs

This release contains some improvements in the JDK APIs that we support:

New interfaces:

* All the remaining functional interfaces in `java.util.function.*`

New methods:

* `java.util.concurrent.ConcurrentHashMap.keySet(mappedValue: V)`
* `java.util.concurrent.ConcurrentHashMap.newKeySet()` and `newKeySet(initialCapacity: Int)`

Methods with fixed or improved behavior:

* `java.util.Formatter` and derivatives (such as `String.format`) now support:
  * `java.math.BigDecimal` arguments with the `%e`, `%f` and `%g` conversions (in addition to fixing `Float`s and `Double`s, as mentioned above)
  * The `%a` conversion
* `parseFloat` and `parseDouble` are now accurate to 0.5 ULP, as specified

## Bug fixes

Among others, the following bugs have been fixed in 1.5.0:

* [#4434](https://github.com/scala-js/scala-js/issues/4434) `java.lang.Class.getSimpleName()` returns bad results for local classes
* [#4452](https://github.com/scala-js/scala-js/issues/4452) Overloading in JS classes incorrectly forwards vararg parameters
* [#3706](https://github.com/scala-js/scala-js/issues/3706) `j.m.BigDecimal.divideToIntegralValue(bi, MathContext)` returns value with bogus internal `_precision`
* [#4035](https://github.com/scala-js/scala-js/issues/4035) `j.l.Float.parseFloat`'s result is 1 ULP off of the best approximation in some cases
* [#4431](https://github.com/scala-js/scala-js/issues/4431) `j.l.Double.parseDouble` can be 1 ULP off for hexadecimal parsing
* [#4432](https://github.com/scala-js/scala-js/issues/4432) `j.l.Math.ulp()` returns wrong results for negative values
* [#4433](https://github.com/scala-js/scala-js/issues/4433) `doubleToLongBitsPolyfill(4.450147717014403e-308)` is incorrect
* [#4395](https://github.com/scala-js/scala-js/issues/4395) `ConcurrentHashMap.KeySetView.toString` should print elements

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av1.5.1+is%3Aclosed).
