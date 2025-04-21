---
layout: post
title: Announcing Scala.js 1.19.0
category: news
tags: [releases]
permalink: /news/2025/04/21/announcing-scalajs-1.19.0/
---


We are pleased to announce the release of Scala.js 1.19.0!

This release comes with significant performance improvements to the WebAssembly backend.
For codebase where performance is dominated by computations (rather than JS interop), you can now expect the Wasm output to be faster than the JS output.

Moreover, as of this writing, the latest versions of Firefox (since v131) and Safari (since v18.4) support all the WebAssembly features required to run Scala.js-on-Wasm.
Chrome still requires a flag to enable exception handling.

If you haven't tried the WebAssembly target yet, now is a good time to do so!

Other highlights:

* Native support for JavaScript `async/await`, through `js.async { ... }` and `js.await(...)`.
* Small code size improvements for the JavaScript target when using SAM lambdas.
* For Wasm only: support for the JavaScript Promise Integration feature (JSPI).

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to [the tutorial]({{ BASE_PATH }}/tutorial/).

If you need help with anything related to Scala.js, you may find our community [in `#scala-js` on Discord](https://discord.com/invite/scala) and [on Stack Overflow](https://stackoverflow.com/questions/tagged/scala.js).

Bug reports can be filed [on GitHub](https://github.com/scala-js/scala-js/issues).

## Release notes

If upgrading from Scala.js 0.6.x, make sure to read [the release notes of Scala.js 1.0.0]({{ BASE_PATH }}/news/2020/02/25/announcing-scalajs-1.0.0/) first, as they contain a host of important information, including breaking changes.

This is a **minor** release:

* It is backward binary compatible with all earlier versions in the 1.x series: libraries compiled with 1.0.x through 1.18.x can be used with 1.19.0 without change.
* It is *not* forward binary compatible with 1.18.x: libraries compiled with 1.19.0 cannot be used with 1.18.x or earlier.
* It is *not* entirely backward source compatible: it is not guaranteed that a codebase will compile *as is* when upgrading from 1.18.x (in particular in the presence of `-Xfatal-warnings`).

As a reminder, libraries compiled with 0.6.x cannot be used with Scala.js 1.x; they must be republished with 1.x first.

## Enhancements with compatibility concerns

### Drop support for non-strict floats

Support for non-strict `Float`s was deprecated 3 years ago in Scala.js 1.9.0.
We now removed that support.
Builds configured to use non-strict floats (with `withStrictFloats(false)`) will refuse to compile.
If that setting is used through an indirect dependency, it will be silently ignored.

Strict floats are almost entirely backward compatible with non-strict floats.
In general, strict floats mandate behavior which non-strict floats leave unspecified (so non-strict floats were always permitted to behave like strict floats).
The only exception is that tests of the form `x.isInstanceOf[Float]` (or `case x: Float =>`) will answer `false` for number values that cannot exactly be represented in a 32-bit `Float`.

We are not aware of any codebase that was ever adversely affected by strict float semantics.

### Deprecate support for targeting ECMAScript 5.1

The support for targeting ECMAScript 5.1 is currently the biggest source of alternative code paths and polyfills in our codebase.
Moreover, the ES 5.1 output does not even have exactly the same semantics as later versions:

* JS classes are not true classes. Notably, that means they cannot extend native ES classes, and they do not inherit static members.
* Top-level exports are declared as vars instead of lets.

10 years after the introduction of ECMAScript 2015, we believe it is time to deprecate the support for targeting ES 5.1, so that we can eventually remove it.
The removal will happen in a future major or minor release of Scala.js.

### Changes to the IR and linker APIs

For tooling authors who directly manipulate the IR and linker APIs, there have been some breaking changes in that area.
This is in line with our version policy for the linker APIs.

The most likely changes you may hit are:

* The `ir.Trees.Closure` node has two additional fields: `flags` and `resultType`.
* All the "well-known" names that were previously in `ir.Names` have been moved to a new object `ir.WellKnownNames`.
* `ir.Types.PrimRef` is not a case class anymore.

## Enhancements

### Native support for JS `async/await`

Note 1: Scala 3 users will have to wait for a future release of Scala 3---likely 3.8.0---to be able to use this new feature.

Note 2: when targeting WebAssembly, this feature requires support for JSPI (JavaScript Promise Integration).
You can [check support for JSPI in various browsers here](https://webassembly.org/features/#table-row-jspi).
On Node.js v23+, this requires the flag `--experimental-wasm-jspi`.

This release adds a pair of primitives, `js.async` and `js.await`, which correspond to the `async/await` feature of JavaScript.
In order to use these functions, you must configure Scala.js to target ECMAScript 2017 or later.
In an sbt build, use the following setting:

{% highlight scala %}
// Target ES 2017 to enable async/await
scalaJSLinkerConfig := {
  scalaJSLinkerConfig.value
    .withESFeatures(_.withESVersion(ESVersion.ES2017)) // enable async/await
},
{% endhighlight %}

You can then use `js.async { ... }` blocks containing `js.await` calls.
For example:

{% highlight scala %}
val p: js.Promise[String] = downloadSomething()
val result: js.Promise[Int] = js.async {
  val text: String = js.await(p)
  text.toInt
}
{% endhighlight %}

`js.async { ... }` executes a block of code under a JavaScript `async` context.
The block of code can await `js.Promise`s using `js.await`.
Doing so will continue the execution after the call to `js.await` when the given `Promise` is resolved.
If the `Promise` is rejected, the exception gets rethrown at the call site.

A block such as `js.async { body }` is equivalent to an immediately-applied JavaScript `async` function:

{% highlight javascript %}
(async () => body)()
{% endhighlight %}

`js.async` returns a `js.Promise` that will be resolved with the result of the code block.
If the block throws an exception, the `Promise` will be rejected.

Calls to `js.await` can only appear within a `js.async` block.
They must not be nested in any local method, class, by-name argument or closure.
The latter includes `for` comprehensions.
They may appear within conditional branches, `while` loops and `try/catch/finally` blocks.

### Orphan `await`s in WebAssembly

When compiling for Scala.js-on-Wasm only, you can allow calls to `js.await` anywhere, by adding the following import:

{% highlight scala %}
import scala.scalajs.js.wasm.JSPI.allowOrphanJSAwait
{% endhighlight %}

Calls to orphan `js.await`s are validated at run-time.
There must exist a dynamically enclosing `js.async { ... }` block on the call stack.
Moreover, there cannot be any JavaScript frame (JavaScript function invocation) in the call stack between the `js.async { ... }` block and the call to `js.await`.
If those conditions are not met, a JavaScript exception of type `WebAssembly.SuspendError` gets thrown.

The ability to detach `js.await` calls from their corresponding `js.async` block is a new superpower offered by JSPI.
It means that, as long as you enter into a `js.async` block somewhere, you can *synchronously await* `Promise`s in any arbitrary function!
This is a power of the same sort as Loom on the JVM.
We are looking forward to seeing new libraries built on these primitives to offer efficient and straightforward APIs.

### Performance improvements for WebAssembly

Scala.js 1.19.0 brings significant performance improvements to the WebAssembly output.
Starting with this release, the WebAssembly output is faster than the JavaScript output on our benchmarks (geomean of the running time is 15% lower).

Note that our benchmarks do not measure JavaScript interop in any significant way.
If your application's performance depends mostly on JS interop, the JavaScript output is probably still faster (and will remain so for the foreseeable future).
However, if your bottleneck is in computations inside Scala code, compiling to WebAssembly should now give you a free performance boost.

The WebAssembly target also received additional improvements in terms of code size and run-time memory consumption.

As a reminder, you may read detailed information about [the WebAssembly backend in the docs]({{ BASE_PATH }}/doc/project/webassembly.html).

## Miscellaneous

### New JDK APIs

This release adds support for the following JDK methods:

* Most of `java.util.random.RandomGenerator`

### Improvements to the JUnit interface

Thanks to [`@dubinsky`](https://github.com/dubinsky) for contributing two improvements to the integration of our JUnit implementation with external tooling (in particular Gradle):

* populate `sbt.testing.Event.throwable` on test failure, and
* populate `sbt.testing.Event.duration`.

## Bug fixes

The following bugs have been fixed in 1.19.0:

* [#5131](https://github.com/scala-js/scala-js/issues/5131) Linker not noticing instance test changes
* [#5135](https://github.com/scala-js/scala-js/issues/5135) Deadlock in concurrent initialization of `ir.Names` and `ir.Types`.

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av1.19.0+is%3Aclosed).
