---
layout: post
title: Announcing Scala.js 0.6.1
category: news
tags: [releases]
---


We are excited to announce the release of Scala.js 0.6.1!

This release mostly contains bug fixes, including inefficiencies in the incremental `fastOptJS`.
It also brings the entire `java.nio.Buffer`s API, with interoperability with the JavaScript [Typed Arrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) API.
<!--more-->

## Getting started

If you are new to Scala.js, head over to
[the tutorial]({{ BASE_PATH }}/doc/tutorial.html).

## Release notes

For changes in the 0.6.x series compared to 0.5.x, read [the announcement of 0.6.0]({{ BASE_PATH }}/news/2015/02/05/announcing-scalajs-0.6.0/).

As a minor release, 0.6.1 is backward source and binary compatible with 0.6.0.
Libraries compiled with 0.6.0 can be used with 0.6.1 without change.
However, they will suffer from [bug #1506](https://github.com/scala-js/scala-js/issues/1506), which will cause your `fastOptJS` to perform more work than necessary.
It is therefore recommended for library authors to upgrade to 0.6.1 and publish new versions of their libraries.
Scala.js 0.6.0 can read binaries compiled with 0.6.1, so you need not be afraid to force an upgrade of all the users of your libraries.

Please report any issues [on GitHub](https://github.com/scala-js/scala-js/issues).

## java.nio.Buffer and Typed Arrays

Scala.js 0.6.1 brings a complete implementation of the `java.nio.Buffer` API, with the exception of `MappedByteBuffer`.
The non-[direct](http://docs.oracle.com/javase/7/docs/api/java/nio/ByteBuffer.html#direct) buffers work on any JS engine supported by Scala.js, i.e., supporting ECMAScript 5.1.

Direct buffers are implemented with JavaScript [Typed Arrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray), and therefore require the JS VM to support them.
Two additional APIs of the Scala.js standard library provide interoperability with Typed Arrays:

* [TypedArrayBufferOps]({{ site.production_url }}/api/scalajs-library/0.6.1/#scala.scalajs.js.typedarray.TypedArrayBufferOps) allows to retrieve the underlying `ArrayBuffer`, `DataView`, and optionally `TypedArray` of a direct buffer (if it is not read-only)
* [TypedArrayBuffer]({{ site.production_url }}/api/scalajs-library/0.6.1/#scala.scalajs.js.typedarray.TypedArrayBuffer$) allows to construct direct buffers wrapping existing Typed Arrays.

## Improvements

* [Better dce](https://github.com/scala-js/scala-js/pull/1488) reduces the size of the generated .js files by a few percents.
* [java.util.Random](https://github.com/scala-js/scala-js/pull/1508) and [j.l.Math.random()](https://github.com/scala-js/scala-js/pull/1511) have been optimized. The latter is now an (inlined) direct forwarder to `js.Math.random()`.
* Running tests should be faster thanks to [launching JS VMs in advance](https://github.com/scala-js/scala-js/issues/1299).
* [#1496](https://github.com/scala-js/scala-js/issues/1496) Partial relative paths can now be used in `jsDependencies`.

## Bug fixes

* [#1478](https://github.com/scala-js/scala-js/issues/1478) Wrong optimization of Float/Double * -1
* [#1491](https://github.com/scala-js/scala-js/issues/1491) `~fastOptJS` runs non-stop (also reported as [#1513](https://github.com/scala-js/scala-js/issues/1513))
* [#1506](https://github.com/scala-js/scala-js/issues/1506)/[#1514](https://github.com/scala-js/scala-js/issues/1514) `fastOptJS` performs unnecessary work (requires libraries to be recompiled with 0.6.1)
* [#1497](https://github.com/scala-js/scala-js/issues/1497) A better error message when trying to `@JSExport` an abstract class
* [#1499](https://github.com/scala-js/scala-js/issues/1499) `fullOptJS` doesn't generate the `-launcher.js` script
* [#1515](https://github.com/scala-js/scala-js/issues/1515) Hidden crasher bug of the optimizer in obscure cases
