---
layout: post
title: Announcing Scala.js 1.9.0
category: news
tags: [releases]
permalink: /news/2022/02/14/announcing-scalajs-1.9.0/
---


We are excited to announce the release of Scala.js 1.9.0!

Starting with this release, Scala.js will use its strict-floats mode by default (what previously required `withStrictFloats(true)`).
`Float` values are now always guaranteed to fit in 32-bit floating point data, and all `Float` operations strictly follow IEEE-754 float32 semantics.

This release also brings support for `java.util.BitSet`, and fixes some bugs.
It also updates the version of the Scala standard library to 2.13.8 for 2.13.x versions.

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to [the tutorial]({{ BASE_PATH }}/tutorial/).

If you need help with anything related to Scala.js, you may find our community [in `#scala-js` on Discord](https://discord.com/invite/scala) and [on Stack Overflow](https://stackoverflow.com/questions/tagged/scala.js).

Bug reports can be filed [on GitHub](https://github.com/scala-js/scala-js/issues).

## Release notes

If upgrading from Scala.js 0.6.x, make sure to read [the release notes of Scala.js 1.0.0]({{ BASE_PATH }}/news/2020/02/25/announcing-scalajs-1.0.0/) first, as they contain a host of important information, including breaking changes.

This is a **minor** release:

* It is backward binary compatible with all earlier versions in the 1.x series: libraries compiled with 1.0.x through 1.8.x can be used with 1.9.0 without change.
* Despite being a minor release, 1.9.0 is forward binary compatible with 1.8.x. It is *not* forward binary compatible with 1.7.x. Libraries compiled with 1.9.0 can be used with 1.8.x but not with 1.7.x or earlier.
* It is *not* entirely backward source compatible: it is not guaranteed that a codebase will compile *as is* when upgrading from 1.8.x (in particular in the presence of `-Xfatal-warnings`).

As a reminder, libraries compiled with 0.6.x cannot be used with Scala.js 1.x; they must be republished with 1.x first.

## Strict floats by default

### Background

Until 1.8.0, Scala.js used non-strict floats by default.
This meant that `Float` values and their operations were allowed to behave like `Double`s; either always, sometimes or never, in unpredictable ways.
This was done in the name of run-time performance, because correctly implementing 32-bit float operations requires the built-in function [`Math.fround`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/fround).
It was considered acceptable because there are few use cases for demanding the reduced precision of `Float`s, and even the JDK did not mandate strict floating point operations by default.

It was always possible to require the Scala.js linker to use strict float semantics using the following setting:

{% highlight scala %}
scalaJSLinkerConfig ~= { _.withSemantics(_.withStrictFloats(true)) }
{% endhighlight scala %}

### What changes

Starting with 1.9.0, Scala.js uses strict float semantics by default.
The rationale for this change is that several conditions have changed since Scala.js was first designed:

* We emit ECMAScript 2015 by default, which requires that `Math.fround` be available
* Even when targeting ES 5.1, `Math.fround` has been widely available in browsers and other JS engines for years
* [Java 17 restored strict floating point operations everywhere](https://openjdk.java.net/jeps/306)

Using strict floats means that `Float` values will always be representable with 32 bits, and that `Float` operations will always follow the IEEE-754 specification for the `float32` format.
This should not have any impact except in the following case:

* `x.isInstanceOf[Float]` used to return `true` when `x` was any `number`. It will now return `false` if it cannot be represented with a 32-bit float.

This change of semantics can in theory break some code, although we do not expect that to happen on any non-contrived example.

Since using strict float semantics is a link-time decision, it applies to the whole program.
Therefore, the changes are also applied to the code in libraries that you may use.

### Performance impact

The switch to strict floats may have a slight performance impact on the `isInstanceOf[Float]` operation, although benchmarks suggest that it is negligible.

There *will* be a performance impact if you are targeting a JS engine that does *not* support `Math.fround` (such as Internet Explorer), which implies emitting ES 5.1 code.
On such engines, Scala.js uses its own version of `fround` in user land (a so-called *polyfill*).
We have optimized our `fround` polyfill to the greatest extent possible, but benchmarks still suggest that `Float`-intensive applications can experience up to a 4x performance hit.

### Reverting to non-strict float semantics

If you really want to, you can switch back to non-strict float semantics with the following linker setting:

{% highlight scala %}
scalaJSLinkerConfig ~= { _.withSemantics(_.withStrictFloats(false)) }
{% endhighlight scala %}

This is however *deprecated*, and will eventually *cease to have any effect* in a later major or minor version of Scala.js.

## Miscellaneous

### New JDK APIs

The following class was added (thanks to [@er1c](https://github.com/er1c)):

* `java.util.BitSet`

The following methods were added (thanks to [@armanbilge](https://github.com/armanbilge)):

* `java.lang.Byte.toUnsignedInt`
* `java.lang.Byte.toUnsignedLong`
* `java.lang.Short.toUnsignedInt`
* `java.lang.Short.toUnsignedLong`

### New ECMAScript APIs

The following methods of `js.BigInt` were added (thanks to [@catap](https://github.com/catap)):

* `toString(radix: Int)`
* the `/` operator

### Upgrade to GCC v20220202

We upgraded to the Google Closure Compiler v20220202.

## Bug fixes

Among others, the following bugs have been fixed in 1.9.0:

* [#4616](https://github.com/scala-js/scala-js/issues/4616) Calling `getClass` with `SmallestModules` module split style causes reference error
* [#4621](https://github.com/scala-js/scala-js/issues/4621) The side effects of JS binary (and unary) operators can be lost
* [#4627](https://github.com/scala-js/scala-js/issues/4627) `ArrayBuilder.length` and `.knownSize` always return 0.

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av1.9.0+is%3Aclosed).
