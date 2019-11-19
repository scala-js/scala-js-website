---
layout: post
title: Announcing Scala.js 0.6.30
category: news
tags: [releases]
permalink: /news/2019/11/20/announcing-scalajs-0.6.30/
---


We are pleased to announce the release of Scala.js 0.6.30!

This release upgrades the version of the Scala standard library to 2.12.10 and 2.13.1.
The upgrade to 2.13.1 notably fixed a number of issues.
The release also contains the definitions for `BigInt` and its typed arrays `BigInt64Array` and `BigUint64Array`, thanks to [@exoego](https://github.com/exoego), as well as the implementation of `java.util.IdentityHashMap`, thanks to [@ekrich](https://github.com/ekrich).

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to
[the tutorial]({{ BASE_PATH }}/tutorial/).

## Release notes

If you use `.scala` build files in `project/` and are upgrading from Scala.js 0.6.22 or earlier, do read [the release notes of 0.6.23]({{ BASE_PATH }}/news/2018/05/22/announcing-scalajs-0.6.23/), which contain a source breaking change in that situation.

If upgrading from Scala.js 0.6.14 or earlier, make sure to read [the release notes of 0.6.15]({{ BASE_PATH }}/news/2017/03/21/announcing-scalajs-0.6.15/), which contain important migration information.

As a minor release, 0.6.30 is backward binary compatible with previous releases in the 0.6.x series.
Libraries compiled with earlier versions can be used with 0.6.30 without change.
0.6.30 is also forward binary compatible with 0.6.29, but not with earlier releases: libraries compiled with 0.6.30 cannot be used by projects using 0.6.{0-28}.

Please report any issues [on GitHub](https://github.com/scala-js/scala-js/issues).

## Add `js.BigInt` and its typed arrays

`BigInt`s have made it to Stage 4 of the ECMAScript language evolution process, which means that they are now standard, and will be part of ECMAScript 2020.
[@exoego](https://github.com/exoego) contributed type definitions in the Scala.js standard library to be able to manipulate them.
As a simple example:

{% highlight scala %}
import scala.scalajs.js

def fact(n: js.BigInt): js.BigInt =
  if (n == js.BigInt(0)) js.BigInt(1)
  else n * fact(n - js.BigInt(1))

println(fact(js.BigInt(30)))
// prints: 265252859812191058636308480000000
{% endhighlight %}

Successfully running this program will require a recent version of Node.js.

The definitions for `BigInt64Array` and `BigUint64Array` are also available, in the package `scala.scalajs.js.typedarray`.

## Miscellaneous

### New JDK APIs

The class `java.util.IdentityHashMap` is now available, thanks to a contribution by [@ekrich](https://github.com/ekrich).

### Add `js.special.strictEquals` to perform JavaScript's `===`

You can now use `js.special.strictEquals(x, y)` to perform exactly the same operation as JavaScript's `x === y`, known as *strict equality*.
In Scala.js 0.6.x, `x eq y` is equivalent, but in Scala.js 1.x, `x eq y` will be stricter to better match Scala/JVM: it will consider `+0` and `-0` as different, but `NaN` equal to itself.

Using `js.special.strictEquals` should be rare.
Usually `eq` does the right thing.

## Bug fixes

Among others, the following bugs have been fixed in 0.6.29:

* [#3778](https://github.com/scala-js/scala-js/issues/3778) Using `ListBuffer.clone()` breaks `Vector` with Scala 2.13
* [#3808](https://github.com/scala-js/scala-js/issues/3808) `Seq.unapplySeq(LazyList.from(0)).drop(1)` causes infinite loop (upstream bug fixed in 2.13.1)
* [#3848](https://github.com/scala-js/scala-js/issues/3848) `FunctionEmitter` incorrectly classifies `ArraySelect` as side-effect free

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av0.6.30+is%3Aclosed).
