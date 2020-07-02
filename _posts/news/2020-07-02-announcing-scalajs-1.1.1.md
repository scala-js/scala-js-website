---
layout: post
title: Announcing Scala.js 1.1.1
category: news
tags: [releases]
permalink: /news/2020/07/02/announcing-scalajs-1.1.1/
---


We are pleased to announce the release of Scala.js 1.1.1!

This is mostly a bugfix release.
In addition, it adds support for the new `-Xasync` flag of Scala 2.13.3 and 2.12.12 (see [the release notes of Scala 2.13.3](https://github.com/scala/scala/releases/tag/v2.13.3)).

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to [the tutorial]({{ BASE_PATH }}/tutorial/).

If you need help with anything related to Scala.js, you may find our community [on Gitter](https://gitter.im/scala-js/scala-js) and [on Stack Overflow](https://stackoverflow.com/questions/tagged/scala.js).

Bug reports can be filed [on GitHub](https://github.com/scala-js/scala-js/issues).

## Release notes

If upgrading from Scala.js 0.6.x, make sure to read [the release notes of Scala.js 1.0.0]({{ BASE_PATH }}/news/2020/02/25/announcing-scalajs-1.0.0/) first, as they contain a host of important information, including breaking changes.

This is a **patch** release:

* It is backward binary compatible with all earlier versions in the 1.x series: libraries compiled with 1.0.x and 1.1.0 can be used with 1.1.1 without change.
* It is forward binary compatible with 1.1.0: libraries compiled with 1.1.1 can be used with 1.1.0 without change.
* It is backward source compatible with 1.1.0: source code that used to compile with 1.1.0 should compile as is when upgrading to 1.1.1.

From Scala.js 1.1.0, which was a **minor** release:

* It is *not* forward binary compatible with 1.0.x: libraries compiled with 1.1.1 cannot be used with 1.0.x.
* It is *not* entirely backward source compatible with 1.0.x: it is not guaranteed that a codebase will compile *as is* when upgrading from 1.0.x (in particular in the presence of `-Xfatal-warnings`).

As a reminder, libraries compiled with 0.6.x cannot be used with Scala.js 1.x; they must be republished with 1.x first.

## Miscellaneous

### Upgrade to GCC v20200614

The Google Closure Compiler used internally by Scala.js for `fullOptJS` has been upgraded to v20200614.

### Tools API reorganization

Some artifacts in the "Tools API", i.e., the libraries used by build tools and other projects to programmatically link and run Scala.js code, have been reorganized:

* `scalajs-logging`, `scalajs-js-envs`, `scalajs-js-envs-test-kit` and `scalajs-env-nodejs` have been extracted in separate repositories, with their own versioning.
  They have all been published as version 1.1.1, but will evolve independently of Scala.js in the future.
* The Scala.js artifact for `scalajs-logging` has been discontinued, and its content absorbed by the Scala.js artifact for `scalajs-linker`.

If you depend on `scalajs-js-envs` or `scalajs-env-nodejs`, you should hard-code their version as 1.1.1 instead of deriving it from the version of Scala.js (e.g., using the `scalaJSVersion` constant).

## Bug fixes

Among others, the following bugs have been fixed in 1.1.1:

* [#4052](https://github.com/scala-js/scala-js/issues/4052) `@JSExportTopLevel` of `def` with default parameter causes IR checking error
* [#4054](https://github.com/scala-js/scala-js/issues/4054) Empty `jsEnvInput` causes freeze (now eagerly reports an error instead)
* [#4061](https://github.com/scala-js/scala-js/issues/4061) `@JSExportTopLevel("default")` generates invalid JS code on Scala.js 1.x (also see duplicate [#4099](https://github.com/scala-js/scala-js/issues/4099))
* [#4085](https://github.com/scala-js/scala-js/issues/4085) Failure to deserialize sjsir files in large projects
* [#4086](https://github.com/scala-js/scala-js/issues/4086) Nested object within a top-level JS `object` not included in generated JavaScript
* [#4088](https://github.com/scala-js/scala-js/issues/4088) `BigDecimal(1, -2147483648).toString` returns `"1E-2147483648"`
* [#4089](https://github.com/scala-js/scala-js/issues/4089) Scala.js adds the `ExposedJSMember` annotation to `NoSymbol` (causing spurious recompilations in the incremental compiler)
* [#4098](https://github.com/scala-js/scala-js/issues/4098) GCC crash in `fullOptJS` with `ju.HashSet.remove`
* [#4105](https://github.com/scala-js/scala-js/issues/4105) Wrong codegen for switch with guards in statement position gives IR checking error

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av1.1.1+is%3Aclosed).
