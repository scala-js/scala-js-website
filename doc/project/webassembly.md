---
layout: doc
title: WebAssembly backend
---

# WebAssembly backend

Since Scala.js 1.22.0, the WebAssembly backend is considered stable (Wasm for short).
Under some conditions, it is designed to be a *drop-in* replacement for the usual JavaScript backend.

## Requirements

The Wasm backend emits code with the following requirements:

* A JavaScript host (i.e., we do not currently generate standalone Wasm), supporting ECMAScript 2022+
* A Wasm engine with support for [Wasm 3.0](https://webassembly.org/news/2025-09-17-wasm-3.0/)
* The `ESModule` module kind (see [emitting modules](./module.html))

Supported engines include Node.js 25, Chrome 137, Firefox 134 and Safari 26.

In order to use `js.async/js.await`, we also require [the JavaScript Promise Integration (JSPI) proposal](https://github.com/WebAssembly/js-promise-integration/tree/main).
It has reached Stage 4 (standardized) but is not part of Wasm 3.0.

## Minimal setup

The following sbt setup enables the Wasm backend.

{% highlight scala %}
// Emit ES modules with the Wasm backend
scalaJSLinkerConfig := {
  scalaJSLinkerConfig.value
    .withModuleKind(ModuleKind.ESModule)
    .withESFeatures(_.withESVersion(ESVersion.ES2022).withUseWebAssembly(true))
},
{% endhighlight %}

Compared to a setup with ES modules with the JS backend, the above setup should be a drop-in replacement (except for the two limitations mentioned below).
The backend emits ES modules with the same layout and interface as those produced by the JS backend.

Using `js.async/js.await` requires the following additional config, which requires that the Wasm engine support JSPI:

{% highlight scala %}
  scalaJSLinkerConfig.value
    ...
    .withWasmFeatures(_.withUseJSPI(true))
{% endhighlight %}

## Language semantics

The Wasm backend is nothing but an alternative backend for the Scala.js language.
Its semantics are the same as Scala.js-on-JS, including JavaScript interoperability features, with one big limitation.

### Limitation: no `@JSExport` support

Due to the feature set of Wasm 3.0, it is not possible to implement the semantics of `@JSExport`.
Therefore, the Wasm backend currently *silently ignores* all `@JSExport` and `@JSExportAll` annotations (the latter being sugar for many `@JSExport`s).

This limitation has the following consequences:

* JavaScript code cannot call `@JSExport`ed methods of Scala classes.
* Since that includes `toString()`, instances of Scala classes cannot be converted to string from JavaScript, including as part of string concatenation.

(String concatenation *in Scala.js code* is supported.)

This limitation will be lifted in the future by opting in to [the Custom Descriptors proposal](https://github.com/WebAssembly/custom-descriptors) (at Stage 3 as of this writing).

### Limitation: no support for emitting multiple modules

The WebAssembly backend does not yet support emitting multiple modules.
The module split style must be set to `ModuleSplitStyle.FewestModules` (which is the default).
Moreover, the codebase must not contain any feature that require emitting multiple modules: `@JSExportToplevel` annotations with several module names, or `js.dynamicImport`.

We expect to lift that limitation in the future (with the same baseline of Wasm 3.0).

## Supported engines

Here are some engines known to support enough Wasm features:

* Node.js 25
* Firefox 134
* Chrome 137
* Safari 26

The JSPI extension, for `js.async/js.await`, requires:

* Node.js 25
* Firefox 143 (in Nightly as of this writing)
* Chrome 137
* Safari Technical Preview 238

## Performance

If the performance of your application depends a lot on JavaScript interop, the Wasm output may be (significantly) slower than the JS output.

For applications whose performance is dominated by computions inside Scala code, the Wasm output should be significantly faster than the JS output (geomean 30% lower run time across our benchmarks).

Further work on improving performance is ongoing.
Keep in mind that performance work on the Wasm backend is still young, compared to a decade of optimizations in the JS backend.

## Code size

The generated code size of the Wasm backend is currently about twice as big as the JS backend in `fullLink` mode.

We hope to significantly improve code size in the future by using [`wasm-opt`](https://github.com/WebAssembly/binaryen), a Wasm-to-Wasm optimizer.

## Implementation details

Looking for some implementation details of how we compile Scala.js to WebAssembly?
Start with [the technical readme of the Wasm backend](https://github.com/scala-js/scala-js/tree/main/linker/shared/src/main/scala/org/scalajs/linker/backend/wasmemitter#readme).
