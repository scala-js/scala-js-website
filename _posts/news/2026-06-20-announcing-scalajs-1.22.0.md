---
layout: post
title: Announcing Scala.js 1.22.0
category: news
tags: [releases]
permalink: /news/2026/06/20/announcing-scalajs-1.22.0/
---


We are pleased to announce the release of Scala.js 1.22.0!

This release adds support for sbt 2.x, and officializes the support for WebAssembly as stable.

This release also comes with performance improvements and bug fixes.

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to [the tutorial]({{ BASE_PATH }}/tutorial/).

If you need help with anything related to Scala.js, you may find our community [in `#scala-js` on Discord](https://discord.com/invite/scala) and [on Scala Users](https://users.scala-lang.org/).

Bug reports can be filed [on GitHub](https://github.com/scala-js/scala-js/issues).

## Release notes

This is a **minor** release:

* It is backward binary compatible with all earlier versions in the 1.x series: libraries compiled with 1.0.x through 1.21.x can be used with 1.22.0 without change.
* It is *not* forward binary compatible with 1.21.x: libraries compiled with 1.22.0 cannot be used with 1.21.x or earlier.
* It is *not* entirely backward source compatible: it is not guaranteed that a codebase will compile *as is* when upgrading from 1.21.x (in particular in the presence of `-Xfatal-warnings`/`-Werror`).

## Changes with compatibility concerns

### Configuration for WebAssembly

The configuration for WebAssembly now requires to explicitly target ECMAScript 2022+.
Moreover, the method `.withExperimentalUseWebAssembly` of `StandardConfig` is deprecated in favor of `ESFeatures.withUseWebAssembly`.

The minimal configuration for WebAssembly is now:

{% highlight scala %}
// Emit ES modules with the Wasm backend
scalaJSLinkerConfig := {
  scalaJSLinkerConfig.value
    .withModuleKind(ModuleKind.ESModule)
    .withESFeatures(_.withESVersion(ESVersion.ES2022).withUseWebAssembly(true))
},
{% endhighlight %}

Using `js.async/js.await` requires the following additional config, which requires that the Wasm engine support JSPI:

{% highlight scala %}
  scalaJSLinkerConfig.value
    ...
    .withWasmFeatures(_.withUseJSPI(true))
{% endhighlight %}

We have also removed the polyfills for Wasm JS String Builtins.
The WebAssembly backend now expects the engine to support [Wasm 3.0](https://webassembly.org/news/2025-09-17-wasm-3.0/).

## Enhancements

### Support for sbt 2.x

The sbt plugin `sbt-scalajs` is now published for sbt 2.x in addition to sbt 1.x.

As part of that effort, the following artifacts are published for Scala 3: `scalajs-ir`, `scalajs-linker-interface`, `scalajs-linker` and `scalajs-test-adapter`.
Authors of non-sbt tooling may find those useful as well.

### The WebAssembly backend is now officially stable

Concretely, this means that we will keep supporting it as part of the core Scala.js repository.
There will be no more breaking changes during the lifetime of 1.x, similarly to the JS backend.

The Wasm backend emits code with the following requirements:

* A JavaScript host (i.e., we do not currently generate standalone Wasm), supporting ECMAScript 2022+
* A Wasm engine with support for [Wasm 3.0](https://webassembly.org/news/2025-09-17-wasm-3.0/)
* The `ESModule` module kind (see [emitting modules](./module.html))

Supported engines include Node.js 25, Chrome 137, Firefox 134 and Safari 26.
As part of our commitment to stability, this baseline for requirements will remain the default going forward.

In order to use `js.async/js.await`, we also require [the JavaScript Promise Integration (JSPI) proposal](https://github.com/WebAssembly/js-promise-integration/tree/main).
It has reached Stage 4 (standardized) but is not part of Wasm 3.0, which is why it requires an explicit opt-in.

See [the documentation on the WebAssembly backend]({{ BASE_PATH }}/doc/project/webassembly.html) for more details.

### Code size improvements

When you use methods of `Character` such as `getType`, `isLetter` or `isUnicodeIdentifierStart` (among many others), the library embeds information about the Unicode database into the generated bundle.
This embedded database is now smaller, thanks to a better internal encoding.

More generally, starting with v1.22.0, the JavaScript backend aggressively optimizes code size for *arrays of numeric literals*.
For example, if you have a big `Array[Int]` with literals in your codebase, its generated code will be smaller.

### Performance improvements

There were performance improvements in the following areas.

For both the JS and Wasm backends:

* Unicode database-related methods
* Bounds checks in the JDK collections

For the JS backend:

* Even faster `Long`s: addition, subtraction, division (with constant and variable divisors), `toString` and absolute value

## Miscellaneous

### Unicode database-related methods updated for Unicode v15.0

All Unicode-related methods have been updated to Unicode v15.0, which is in sync with JDK 21.
Previously, there were inconcistencies.

Moreover, some methods have been fixed to take so-called contributory properties into account.
For example, before v1.22.0, `isLowerCase` only returned `true` for characters with general category `Ll`.
Now, it also returns `true` for characters that have the `Other_Lowercase` contributory property.

So yes, the Unicode-related methods are smaller, faster, *and* more accurate in Scala.js 1.22.0!

## Bug fixes

The following bugs have been fixed in 1.22.0:

* [#5345](https://github.com/scala-js/scala-js/issues/5345) `java.math.BigInteger.xor` throws `ArrayIndexOutOfBoundsException` for mixed-sign inputs
* [#5347](https://github.com/scala-js/scala-js/issues/5347) Error with `m_sjsr_PrivateFieldsSymbolHolder` and `java.lang.ClassCastException`
* [#5354](https://github.com/scala-js/scala-js/issues/5354) Linker cache growing with `fullLinkJS` used repeatedly from sbt

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av1.22.0+is%3Aclosed).
