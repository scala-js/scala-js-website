---
layout: doc
title: WebAssembly backend
---

# WebAssembly backend

Scala.js supports two modes of emitting WebAssembly (Wasm for short).

* An ECMAScript module with a WebAssembly implementation (`ModuleKind.ESModule`)
* A bare Wasm module, without any JavaScript interop nor any JS glue code (`ModuleKind.WasmModule`).

Since Scala.js 1.22.0, WebAssembly support is considered stable.
Support for *testing* bare Wasm modules is experimental for now.

## General requirements

The two modes have the following basic requirements:

* A Wasm engine with support for [Wasm 3.0](https://webassembly.org/news/2025-09-17-wasm-3.0/)
* Optionally: support for the [Custom Descriptors](https://github.com/WebAssembly/custom-descriptors) Phase 3 proposal.

## ECMAScript module with WebAssembly

This is designed to be a *drop-in* replacement for the usual JavaScript backend (under some conditions).
JavaScript interop is available, and the interface with the outside world is generally equivalent.

In addition to the general requirements, this mode has the following requirements:

* A JavaScript host supporting ECMAScript 2022+
* The `ESModule` module kind (see [emitting modules](./module.html))

Supported engines include Node.js 25, Chrome 137, Firefox 134 and Safari 26.

In order to use `js.async/js.await`, we also require [the JavaScript Promise Integration (JSPI) proposal](https://github.com/WebAssembly/js-promise-integration/tree/main).
It has reached Stage 4 (standardized) but is not part of Wasm 3.0.

### Minimal setup

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

You may opt in to the [Custom Descriptors](https://github.com/WebAssembly/custom-descriptors) proposal with the following config:

{% highlight scala %}
  scalaJSLinkerConfig.value
    ...
    .withWasmFeatures(_.withExperimentalUseCustomDescriptors(true))
{% endhighlight %}

### Language semantics

In this mode, the Wasm backend is nothing but an alternative backend for the Scala.js language.
Its semantics are the same as Scala.js-on-JS, including JavaScript interoperability features, with one big limitation.

### Limitation: no `@JSExport` support

Using the Custom Descriptors proposal lifts this limitation.
However, it is not standard yet.

Due to the feature set of Wasm 3.0, it is not possible to implement the semantics of `@JSExport`.
Therefore, the Wasm backend currently *silently ignores* all `@JSExport` and `@JSExportAll` annotations (the latter being sugar for many `@JSExport`s).

This limitation has the following consequences:

* JavaScript code cannot call `@JSExport`ed methods of Scala classes.
* Since that includes `toString()`, instances of Scala classes cannot be converted to string from JavaScript, including as part of string concatenation.

(String concatenation *in Scala.js code* is supported.)

### Limitation: no support for emitting multiple modules

The WebAssembly backend does not yet support emitting multiple modules.
The module split style must be set to `ModuleSplitStyle.FewestModules` (which is the default).
Moreover, the codebase must not contain any feature that require emitting multiple modules: `@JSExportToplevel` annotations with several module names, or `js.dynamicImport`.

We expect to lift that limitation in the future (with the same baseline of Wasm 3.0).

### Supported engines

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

### Performance

If the performance of your application depends a lot on JavaScript interop, the Wasm output may be (significantly) slower than the JS output.

For applications whose performance is dominated by computions inside Scala code, the Wasm output should be significantly faster than the JS output (geomean 30% lower run time across our benchmarks).

Further work on improving performance is ongoing.
Keep in mind that performance work on the Wasm backend is still young, compared to a decade of optimizations in the JS backend.

### Code size

The generated code size of the Wasm backend is currently about twice as big as the JS backend in `fullLink` mode.

We hope to significantly improve code size in the future by using [`wasm-opt`](https://github.com/WebAssembly/binaryen), a Wasm-to-Wasm optimizer.

## Wasm module without JavaScript

This is appropriate if you want to run in non-JavaScript hosts.
It is however up to you to set up the loading and running of the Wasm module, as there is no standard way to do this.

The following sbt setup enables this mode.

{% highlight scala %}
// Emit a Wasm module
scalaJSLinkerConfig := {
  scalaJSLinkerConfig.value
    .withModuleKind(ModuleKind.WasmModule)
},
{% endhighlight %}

You may also optionally enable the Custom Descriptors proposal for this mode.

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

Only numeric types and arrays of numeric types are supported at the interface.
For more details, see the documentation of [`@WasmImport`](https://javadoc.io/doc/org.scala-js/scalajs-library_2.12/latest/scala/scalajs/wasm/annotation/WasmImport.html) and [`@WasmExport`](https://javadoc.io/doc/org.scala-js/scalajs-library_2.12/latest/scala/scalajs/wasm/annotation/WasmExport.html).

### Running Wasm modules

The `NodeJSEnv`, which is set up by default in sbt, can *run* such modules in the usual way, inside Node.js.
In that case, `@WasmImport`s are resolved as if they were ECMAScript `import` statements.
This can be used to provide some essential functionality to your Wasm module, such as printing.

### Testing Wasm modules

Scala.js and the `NodeJSEnv` integrate *experimental* support for testing Wasm modules in the usual way, with Scala testing frameworks and the build tool infrastructure.
You may use the `test` command as usual, without specific setup.

### JDK support

Most of the JDK library supported by Scala.js is also supported for `WasmModule`.

The following features are *not* supported.
They will refuse to link if they are reachable in your codebase.

* `System.out`/`System.err`, and hence the standard `println`.
* `System.currentTimeMillis()` and `System.nanoTime()`.
* Creating a PRNG without seed.
  You must provide a seed to the constructors of `java.util.Random`, `SplittableRandom`, etc.
* Some functions in `Math.*`, notably `round`, `cbrt` and the transcendental functions.
* Regular expressions.
* `java.net.URI`.

The latter 3 will eventually be supported.

Standard outputs, external time and random seeds cannot be provided in the general case.
You must provide your Wasm modules with the capabilities that you want in ad hoc ways.

## Implementation details

Looking for some implementation details of how we compile Scala.js to WebAssembly?
Start with [the technical readme of the Wasm backend](https://github.com/scala-js/scala-js/tree/main/linker/shared/src/main/scala/org/scalajs/linker/backend/wasmemitter#readme).
