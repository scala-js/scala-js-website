---
layout: post
title: Announcing Scala.js 1.17.0
category: news
tags: [releases]
permalink: /news/2024/09/28/announcing-scalajs-1.17.0/
---


We are excited to announce the release of Scala.js 1.17.0!

This release comes with a brand new, shiny, experimental WebAssembly backend.
You can now, under certain conditions, take your existing Scala.js application and compile it to WebAssembly instead.

There were also some bug fixes.
Despite the abnormally long release cycle (v1.16.0 was released 6 months ago), the only external bug report came in 3 weeks ago.
As far as we can tell, nobody was blocked waiting for a bugfix for this long.

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to [the tutorial]({{ BASE_PATH }}/tutorial/).

If you need help with anything related to Scala.js, you may find our community [in `#scala-js` on Discord](https://discord.com/invite/scala) and [on Stack Overflow](https://stackoverflow.com/questions/tagged/scala.js).

Bug reports can be filed [on GitHub](https://github.com/scala-js/scala-js/issues).

## Release notes

If upgrading from Scala.js 0.6.x, make sure to read [the release notes of Scala.js 1.0.0]({{ BASE_PATH }}/news/2020/02/25/announcing-scalajs-1.0.0/) first, as they contain a host of important information, including breaking changes.

This is a **minor** release:

* It is backward binary compatible with all earlier versions in the 1.x series: libraries compiled with 1.0.x through 1.16.x can be used with 1.17.0 without change.
* It is *not* forward binary compatible with 1.16.x: libraries compiled with 1.17.0 cannot be used with 1.16.x or earlier.
* It is *not* entirely backward source compatible: it is not guaranteed that a codebase will compile *as is* when upgrading from 1.16.x (in particular in the presence of `-Xfatal-warnings`).

As a reminder, libraries compiled with 0.6.x cannot be used with Scala.js 1.x; they must be republished with 1.x first.

## Enhancements with compatibility concerns

### Changes to the IR and linker APIs

For tooling authors who directly manipulate the IR and linker APIs, there have been some breaking changes in that area.
This is in line with our version policy for the linker APIs.

The most likely changes you may hit are:

* The reference types in the IR, such as `ClassType` and `ArrayType`, now have a `nullable: Boolean` flag.
  There is also a new type `AnyNotNullType`.
* The `NewArray` node does not accept multiple dimensions anymore.
  If you want to emit a multi-dimensional array creation, emit a call to `java.lang.reflect.Array.newInstance` instead.

## Enhancements

### Experimental WebAssembly backend

Starting with this release, Scala.js ships with an *experimental* WebAssembly backend.
Under some conditions, you may use it as a drop-in replacement for the usual JavaScript backend.

#### Minimal setup

You can set it up as follows:

{% highlight scala %}
// Emit ES modules with the Wasm backend
scalaJSLinkerConfig := {
  scalaJSLinkerConfig.value
    .withExperimentalUseWebAssembly(true) // use the Wasm backend
    .withModuleKind(ModuleKind.ESModule)  // required by the Wasm backend
},

// Configure Node.js (at least v22) to support the required Wasm features
jsEnv := {
  val config = NodeJSEnv.Config()
    .withArgs(List(
      "--experimental-wasm-exnref", // required
      "--experimental-wasm-imported-strings", // optional (good for performance)
      "--turboshaft-wasm", // optional, but significantly increases stability
    ))
  new NodeJSEnv(config)
},
{% endhighlight %}

Make sure `node -v` reports at least v22.0.0.
If not, install a newer version.

You are then set up to `run` and `test` your codebase with the WebAssembly backend from sbt.

#### Limitations

Note that the WebAssembly backend *silently ignores* all the `@JSExport` and `@JSExportAll` annotations.
It is never possible to call methods of Scala classes from JavaScript, which includes `toString()`, even through string concatenation.
JavaScript code may still call all public members of JavaScript classes (classes that inherit from `js.Any`).
Moreover, `@JSExportTopLevel` is supported, as well as all the other `@JS...` annotations.

The WebAssembly backend does not yet support emitting multiple modules.
The module split style must be set to `ModuleSplitStyle.FewestModules` (which is the default).
Moreover, the codebase must not contain any feature that require emitting multiple modules: `@JSExportToplevel` annotations with several module names, or `js.dynamicImport`.
We expect to lift that limitation in the future.

Other than that, we expect the WebAssembly backend to support all Scala.js semantics.
Please report any issues you may find.

Stack traces are currently suboptimal.

#### Use in browsers

If you want to use it in browsers, you will need:

* For Firefox: in `about:config`, enable `javascript.options.wasm_exnref`.
  Also make sure to *disable* `javascript.options.wasm_js_string_builtins`: Firefox has two issues with it that break Scala.js ([1919901](https://bugzilla.mozilla.org/show_bug.cgi?id=1919901) and [1920337](https://bugzilla.mozilla.org/show_bug.cgi?id=1920337))
* For Chrome: in `chrome://flags/`, enable ["Experimental WebAssembly"](chrome://flags/#enable-experimental-webassembly-features).

#### More information

Read more detailed information about [the WebAssembly backend in the docs]({{ BASE_PATH }}/doc/project/webassembly.html).

## Miscellaneous

### New JDK APIs

This release adds support for the following JDK methods:

* In `java.lang.Character`: `codePointAt`, `codePointBefore`, `codePointCount` and `offsetByCodePoints`
* In `java.util.concurrent.ConcurrentHashMap`: `forEach`, `forEachKey` and `forEachValue`

### Unicode version

The Unicode database used by the methods of `java.lang.Character` was updated to Unicode v15.0.

## Bug fixes

Among others, the following bugs have been fixed in 1.17.0:

* [#5026](https://github.com/scala-js/scala-js/issues/5026) Output .js file names can be too long on Windows, esp. for non-ASCII class names.
* [#5044](https://github.com/scala-js/scala-js/issues/5044) `jl.reflect.Array.newInstance()` does not throw the `IllegalArgumentException`s it is supposed to.

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av1.17.0+is%3Aclosed).
