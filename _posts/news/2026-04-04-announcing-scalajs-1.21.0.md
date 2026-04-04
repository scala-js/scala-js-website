---
layout: post
title: Announcing Scala.js 1.21.0
category: news
tags: [releases]
permalink: /news/2026/04/04/announcing-scalajs-1.21.0/
---


We are pleased to announce the release of Scala.js 1.21.0!

This release introduces several changes with compatibility concerns.
We encourage you to pay particular attention to these release notes.

In particular, it deprecates JDK < 17 and support for the Google Closure Compiler (GCC).
GCC is now disabled by default in all configurations.

This release also comes with performance improvements and bug fixes.

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to [the tutorial]({{ BASE_PATH }}/tutorial/).

If you need help with anything related to Scala.js, you may find our community [in `#scala-js` on Discord](https://discord.com/invite/scala) and [on Stack Overflow](https://stackoverflow.com/questions/tagged/scala.js).

Bug reports can be filed [on GitHub](https://github.com/scala-js/scala-js/issues).

## Release notes

If upgrading from Scala.js 0.6.x, make sure to read [the release notes of Scala.js 1.0.0]({{ BASE_PATH }}/news/2020/02/25/announcing-scalajs-1.0.0/) first, as they contain a host of important information, including breaking changes.

This is a **minor** release:

* It is backward binary compatible with all earlier versions in the 1.x series: libraries compiled with 1.0.x through 1.20.x can be used with 1.21.0 without change.
* It is *not* forward binary compatible with 1.20.x: libraries compiled with 1.21.0 cannot be used with 1.20.x or earlier.
* It is *not* entirely backward source compatible: it is not guaranteed that a codebase will compile *as is* when upgrading from 1.20.x (in particular in the presence of `-Xfatal-warnings`).

## Changes with compatibility concerns

### Exceptions subject to UB coming from the javalib are now consistently UB

The [Scala.js semantics]({{ BASE_PATH }}/doc/semantics.html) defines several exceptions are being subject to Undefined Behavior.
These include `NullPointerException`, `StringIndexOutOfBoundsException` and `NegativeArraySizeException`.

In `fastLinkJS`, they are configured in "Fatal" mode by default.
If a language feature *would* throw that exception, it wraps it with an `UndefinedBehaviorError` instead, which is a fatal error that you should never catch (unless you are a testing framework).
In `fullLinkJS`, these error conditions are "Unchecked", and may behave arbitrarily: they are Undefined Behavior or UB for short.

This treatment is consistently applied to all language features, for example, a method call on a `null` value.
However, it was inconsistently applied by methods in the javalib of Scala.js.

This release now *consistently applies the checked/unchecked behaviors* for those exceptions if they come from the javalib of Scala.js.
Where the JVM would throw one of the exception classes subject to UB, Scala.js will throw an `UndefinedBehaviorError` in `fastLinkJS`, and run into UB in `fullLinkJS`.

A noteworthy example is `java.util.Objects.requireNonNull`, which can be used to actively rule out `null` values in methods:

{% highlight scala %}
def format(x: String): String = {
  java.util.Objects.requireNonNull(x)
  s"formatted $x"
}
{% endhighlight %}

Before Scala.js 1.21.0, calling `format(null)` would throw a `NullPointerException`.
It will now run into checked/unchecked UB.

If you have tests that assert that such code throws a `NullPointerException`, you may need to adapt them or disable them on Scala.js.

### Disable the Closure Compiler by default

After [a request for comment](https://github.com/scala-js/scala-js/issues/5244), we have decided to disable the Google Closure Compiler (GCC) by default in all configurations, and deprecate it.
It was already disabled by default when emitting ECMAScript modules, since it never supported them the way we need.

If you are not emitting ES modules, this release will cause an increase in code size in `fullLinkJS`.
We encourage you to follow the Scala.js `fullLinkJS` task with a JavaScript minifier.
If you use [Vite](https://vite.dev/), in particular, it applies Rolldown by default.

For now, you may still reapply GCC to your codebase with

{% highlight scala %}
Compile / fullLinkJS / scalaJSLinkerConfig ~= (_.withClosureCompiler(true))
{% endhighlight %}

although that is deprecated, and will eventually be removed.

### Deprecate support for JDK < 17

Following the decision of Scala 3.8.0 to drop JDK < 17, we are deprecating support for JDK < 17 in the Scala.js linker and sbt plugin.
The sbt plugin and linker will display run-time warnings to their respective loggers when used on an older JDK.

Eventually, we will also drop support for those older JDKs.

### `java.nio.Buffer`s can be direct without Typed Arrays support

When targeting ECMAScript 5.1, it is now possible to allocate a [direct `java.nio.ByteBuffer`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/ByteBuffer.html#direct-vs-non-direct-buffers-heading) even when JavaScript Typed Arrays are not supported.
Previously, this would lead to a JavaScript `ReferenceError` or `TypeError`.

We made this change as a preparation for targeting WebAssembly environments without a JS host.

As a consequence, the contract of [`TypedArrayBufferOps.hasArrayBuffer()`](https://javadoc.io/static/org.scala-js/scalajs-library_2.12/1.21.0/scala/scalajs/js/typedarray/TypedArrayBufferOps.html#hasArrayBuffer():Boolean) and [`TypedArrayBufferOps.hasTypedArray()`](https://javadoc.io/static/org.scala-js/scalajs-library_2.12/1.21.0/scala/scalajs/js/typedarray/TypedArrayBufferOps.html#hasTypedArray():Boolean) is changing in a not strictly backwards compatible manner.

The following code may now throw an `UnsupportedOperationException` depending on the specific target platform:

{% highlight scala %}
if (buffer.isDirect())
  TypedArrayBuffer.arrayBuffer(buffer)
{% endhighlight %}

Use `hasArrayBuffer()` instead of `isDirect()`.

We unfortunately caught this issue too late in the release process to update the Scaladoc.
We will update it for the next version.
In the meantime, you can find the updated documentation on [#5344](https://github.com/scala-js/scala-js/pull/5344).

### Changes to the IR and linker APIs

For tooling authors who directly manipulate the IR and linker APIs, there have been some breaking changes in that area.
This is in line with our version policy for the linker APIs.

* The `ir.Types.ClassType` and `ir.Types.ArrayType` nodes have one additional field: `exact: Boolean`.

## Enhancements

### Add `LinkingInfo.moduleKind` as a link-time property.

This can be used for code that must adapt to the module kind in a way that would not link otherwise.

Use it as

{% highlight scala %}
import scala.scalajs.LinkingInfo._

linkTimeIf(moduleKind == ModuleKind.ESModule) {
  // code using ES module capabilities, like js.`import`(...)
} {
  // fallback using something else
}
{% endhighlight %}

### The Scala.js codebase is now formatted with scalafmt

Thanks to the hard work of several people, spanning several years, our codebase is now entirely formatted with scalafmt.

We would like to thank, in order of "appearance", [@MaximeKjaer](https://github.com/MaximeKjaer), [@ekrich](https://github.com/ekrich) and [@kitbellew](https://github.com/kitbellew) for their relentless work, which eventually made this possible.

## Miscellaneous

### New JDK APIs

This release adds support for the following JDK constants and methods:

* In `java.lang.Math`: `TAU`, `copySign`, `getExponent`, `clamp`

We adjusted the semantics of comparison methods ignoring case in `java.lang.String` to match the behavior newly specified in JDK 16.
Namely, case folding is performed by code point rather than by individual `Char`.
Be aware that even the new behavior is not equivalent to the recommended Unicode case folding algorithms.
If you want to ignore case when comparing strings, you should use an appropriate Unicode-aware library.

## Bug fixes

The following bugs have been fixed in 1.21.0:

* [#5297](https://github.com/scala-js/scala-js/issues/5297) Incorrect implementation of `base.modPow` for large numbers
* [#5331](https://github.com/scala-js/scala-js/issues/5331) Optimizer assertion error on Cats Effect tests in 1.20.2
* [#5143](https://github.com/scala-js/scala-js/issues/5143) Output code stability issue with reflective proxies (for reflective calls)
* `CharArrayReader(_, _, 0)` was returning `-1` instead of `0` when past the end ([commit](https://github.com/scala-js/scala-js/commit/0cce77cce4e334837e68241af5d7f80ff99eb22d))
* `InputStream.read{N,All}Bytes` was allocating too much memory when reading more than 1024 bytes ([commit](https://github.com/scala-js/scala-js/commit/9dd12daa0b32ebba742d88b66a981e927df33d83))
* Various exceptional edge cases throughout the javalib

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av1.21.0+is%3Aclosed).
