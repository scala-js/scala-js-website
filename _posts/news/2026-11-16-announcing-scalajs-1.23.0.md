---
layout: post
title: Announcing Scala.js 1.23.0
category: news
tags: [releases]
permalink: /news/2026/11/16/announcing-scalajs-1.23.0/
---


We are pleased to announce the release of Scala.js 1.23.0!

In a nutshell:

* Drop support for JDK < 17.
* `java.util.Date` always uses the Etc/GMT time zone.
* New support for emitting bare WebAssembly modules (`WasmModule`), which can run in non-JS hosts.
* Experimental support for the Wasm [Custom Descriptors](https://github.com/WebAssembly/custom-descriptors) Phase 3 proposal.
  Opting in to that proposal allows `@JSExport` to work when using the Wasm backend.
* Performance improvements and bug fixes.

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to [the tutorial]({{ BASE_PATH }}/tutorial/).

If you need help with anything related to Scala.js, you may find our community [in `#scala-js` on Discord](https://discord.com/invite/scala) and [on Scala Users](https://users.scala-lang.org/).

Bug reports can be filed [on GitHub](https://github.com/scala-js/scala-js/issues).

## Release notes

This is a **minor** release:

* It is backward binary compatible with all earlier versions in the 1.x series: libraries compiled with 1.0.x through 1.22.x can be used with 1.23.0 without change.
* It is *not* forward binary compatible with 1.22.x: libraries compiled with 1.23.0 cannot be used with 1.22.x or earlier.
* It is *not* entirely backward source compatible: it is not guaranteed that a codebase will compile *as is* when upgrading from 1.22.x (in particular in the presence of `-Xfatal-warnings`/`-Werror`).

## Changes with compatibility concerns

### Drop support for JDK < 17

In line with Scala 3.8+, we dropped support for JDK below 17.
It is unlikely that you are doing this at home, but your CI/CD pipelines may still test earlier JDKs.

Scala versions below 2.12.15 and 2.13.6 are de facto dropped as well, since they cannot build on JDK 17+.

### `java.util.Date` always uses the Etc/GMT time zone

Previously, `java.util.Date` inherited its time zone, as well as many implementation details, from `js.Date`.
It now always uses the Etc/GMT time zone, which is equivalent to UTC without daylight saving time.

Except for `toString()`, only deprecated APIs of `java.util.Date` depend on this choice, so it is unlikely your code is affected.

This choice is in line with other things that are normally environment-dependent on the JVM:

* The default locale is always `ROOT`.
* The default encoding is always UTF-8.
* The default line separator is always `\n`.
* And now the default timezone is always Etc/GMT.

Standardizing on Etc/GMT allowed us to align all the details of `java.util.Date` to be fully compliant with their JavaDoc specification.

### Test dispatching scheduling

To simplify support for Wasm, we have changed the way test dispatching is scheduled in the testing infrastructure used by build tools.
We do not expect this to have a negative performance impact, but if you see significant changes in your test execution times, please let us know.

## Enhancements

### Wasm modules without JS host

Scala.js 1.23.0 introduces a new kind of module: `ModuleKind.WasmModule`.
Unlike other module kinds, the public interface is not JavaScript; it is a bare Wasm module (a `.wasm` file).
This module kind is appropriate if you want to run in non-JavaScript hosts.
It is however up to you to set up the loading and running of the Wasm module, as there is no standard way to do this.

Use the following sbt setup.

{% highlight scala %}
// Emit a Wasm module
scalaJSLinkerConfig := {
  scalaJSLinkerConfig.value
    .withModuleKind(ModuleKind.WasmModule)
},
{% endhighlight %}

When emitting a `WasmModule`, all the JavaScript interoperability features are disabled.
They will fail to link.

Instead, you can import and export functions with simple parameter types.

{% highlight scala %}
import scala.scalajs.wasm
import scala.scalajs.wasm.annotation._

object Foo {
  @WasmImport("some-module", "bar")
  def bar(x: Int): Int = wasm.native

  @WasmExport("my-feature")
  def myFeature(x: Int): Int =
    bar(2 * x)
}
{% endhighlight %}

See the documentation on [emitting WebAssembly]({{ BASE_PATH }}/doc/project/webassembly.html) for more details.
Note that testing support is still experimental.

### Experimental support for the Custom Descriptors proposal

When targeting WebAssembly (either with an `ESModule` or a `WasmModule`), you may opt in to the [Custom Descriptors](https://github.com/WebAssembly/custom-descriptors) proposal.
Use the following sbt setting:

{% highlight scala %}
  scalaJSLinkerConfig.value
    ...
    .withWasmFeatures(_.withExperimentalUseCustomDescriptors(true))
{% endhighlight %}

Custom descriptors allow to reduce the memory footprint of your application.

More importantly, when targeting JS hosts with `ESModule`, they enable full support for `@JSExport` and `@JSExportAll` annotations.

Keep in mind that Custom Descriptors are only a Phase 3 proposal for now.
Consult the [WebAssembly Feature Status](https://webassembly.org/features/) page to know in which environments you may use it.

### Code size improvements

Calling collection methods on `Array`s used to produce a lot of code, which was in fact mostly dead code.
We improved the optimizer to get rid of the dead branches, significantly reducing code size.

### Performance improvements

Scala.js 1.23.0 brings various performance improvements, mostly for the WebAssembly backend.

## Miscellaneous

### Upgrade to Closure v20240317

This release is the last one that supports JDK 17.

As a reminder, using the Closure compiler is deprecated, and will eventually be removed.

## Bug fixes

The following bugs have been fixed in 1.23.0:

* [#5381](https://github.com/scala-js/scala-js/issues/5381) `java.math.BigDecimal(Double)` differs from JVM for negative large doubles
* [#5407](https://github.com/scala-js/scala-js/issues/5407) `jl.String.valueOf(s)` and `ju.Objects.toString(s)` throw for `s` a `js.Symbol`
* [#5416](https://github.com/scala-js/scala-js/issues/5416) Side effects of `toString()` interact badly with string concatenation
* [#5426](https://github.com/scala-js/scala-js/issues/5426) `String.replace("", r)` does not do the right thing.
* [#5436](https://github.com/scala-js/scala-js/issues/5436) Emitter drops the side effects of the operand of `isInstanceOf[C]` when `C` has no instances
* [#5439](https://github.com/scala-js/scala-js/issues/5439) `ArrayDeque` loses elements when growing while wrapped (e.g. 33 × `push`)
* [#5463](https://github.com/scala-js/scala-js/issues/5463) Calling `Throwable#initCause` multiple times doesn't throw an `IllegalStateException`

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av1.23.0+is%3Aclosed).
