---
layout: doc
title: Experimental WebAssembly backend
---

# Experimental WebAssembly backend

Since Scala.js 1.17.0, there is an *experimental* WebAssembly backend (Wasm for short).
Under some conditions, it is designed to be a *drop-in* replacement for the usual JavaScript backend.

## Experimental status

Being experimental means that:

* The Wasm backend may be removed in a future *minor* version of Scala.js (or moved to a separate plugin).
* Future versions of Scala.js may emit Wasm that requires *newer* versions of Wasm engines, dropping support for older engines.

However, we do *not* expect the the Wasm backend to be any less *correct* than the JS backend, modulo the limitations listed below.
Feel free to report any issue you may experience with the same expectations as for the JS backend.

Non-functional aspects, notably performance and size of the generated code, may not be as good as the JS backend for now.
The backend is also not incremental yet, which means a slower `fastLinkJS` in the development cycle.

## Requirements

The Wasm backend emits code with the following requirements:

* A JavaScript host (i.e., we do not currently generate standalone Wasm)
* A Wasm engine with support for:
  * Wasm 3.0
  * Wasm GC
  * Exception handling, including the latest `exnref`-based variant
* The `ESModule` module kind (see [emitting modules](./module.html))

Supported engines include Node.js 23, Chrome, Firefox and Safari.
Node.js and Chrome currently require using some experimental flags (see below).

## Language semantics

The Wasm backend is nothing but an alternative backend for the Scala.js language.
Its semantics are the same as Scala.js-on-JS, including JavaScript interoperability features, with one big limitation.

### Limitation: no `@JSExport` support

Due to the current feature set of Wasm, it is not possible to implement the semantics of `@JSExport`.
Therefore, the Wasm backend currently *silently ignores* all `@JSExport` and `@JSExportAll` annotations (the latter being sugar for many `@JSExport`s).

This limitation has the following consequences:

* JavaScript code cannot call `@JSExport`ed methods of Scala classes.
* Since that includes `toString()`, instances of Scala classes cannot be converted to string from JavaScript, including as part of string concatenation.

(String concatenation *in Scala.js code* is supported.)

### Limitation: no support for emitting multiple modules

The WebAssembly backend does not yet support emitting multiple modules.
The module split style must be set to `ModuleSplitStyle.FewestModules` (which is the default).
Moreover, the codebase must not contain any feature that require emitting multiple modules: `@JSExportToplevel` annotations with several module names, or `js.dynamicImport`.
We expect to lift that limitation in the future.

## Minimal setup

The following sbt setup enables the Wasm backend and configures flags for Node.js 23.

{% highlight scala %}
// Emit ES modules with the Wasm backend
scalaJSLinkerConfig := {
  scalaJSLinkerConfig.value
    .withExperimentalUseWebAssembly(true) // use the Wasm backend
    .withModuleKind(ModuleKind.ESModule)  // required by the Wasm backend
},

// Configure Node.js (at least v23) to support the required Wasm features
jsEnv := {
  val config = NodeJSEnv.Config()
    .withArgs(List(
      "--experimental-wasm-exnref", // always required
      "--experimental-wasm-jspi", // required for js.async/js.await
      "--experimental-wasm-imported-strings", // optional (good for performance)
      "--turboshaft-wasm", // optional, but significantly increases stability
    ))
  new NodeJSEnv(config)
},
{% endhighlight %}

Compared to a setup with ES modules with the JS backend, the above setup should be a drop-in replacement.
The backend emits ES modules with the same layout and interface as those produced by the JS backend.

## Supported engines

Here are some engines known to support enough Wasm features.

### Node.js 23

As mentioned above, Node.js 23 and above requires the following flags:

* `--experimental-wasm-exnref`: always required
* `--experimental-wasm-jspi`: required to use `js.async`/`js.await`
* `--experimental-wasm-imported-strings`: optional (good for performance)
* `--turboshaft-wasm`: optional, bug significantly increases stability

### Chrome

In `chrome://flags/`, enable ["Experimental WebAssembly"](chrome://flags/#enable-experimental-webassembly-features).

For `js.async`/`js.await` support, also enable ["Experimental WebAssembly JavaScript Promise Integration (JSPI)"](chrome://flags/#enable-experimental-webassembly-jspi).

### Firefox

Firefox supports all the "always required" features since v131, with enhanced performance since v134.

For `js.async/js.await` support, go to `about:config`, enable `javascript.options.wasm_js_promise_integration`.
This may require a Firefox Nightly build when you read these lines, although it should be available by default soon.

### Safari

Safari supports all the "always required" features since v18.4.

`js.async/js.await` is not supported yet, however.

## Performance

If the performance of your application depends a lot on JavaScript interop, the Wasm output may be (significantly) slower than the JS output.

For applications whose performance is dominated by computions inside Scala code, the Wasm output should be significantly faster than the JS output (geomean 15% lower run time across our benchmarks).

Further work on improving performance is ongoing.
Keep in mind that performance work on the Wasm backend is a few months old, compared to a decade of optimizations in the JS backend.

## Code size

The generated code size of the Wasm backend is currently about twice as big as the JS backend in `fullLink` mode.

We hope to significantly improve code size in the future by using [`wasm-opt`](https://github.com/WebAssembly/binaryen), a Wasm-to-Wasm optimizer.

## Implementation details

Looking for some implementation details of how we compile Scala.js to WebAssembly?
Start with [the technical readme of the Wasm backend](https://github.com/scala-js/scala-js/tree/main/linker/shared/src/main/scala/org/scalajs/linker/backend/wasmemitter#readme).
