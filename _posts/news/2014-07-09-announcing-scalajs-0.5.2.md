---
layout: post
title: Announcing Scala.js 0.5.2
category: news
tags: [releases]
---


We are excited to announce the release of Scala.js 0.5.2!
<!--more-->

Scala.js 0.5.2 is backward binary compatible with older versions of the 0.5.x branch. However, it is *not* forward binary compatible. This means:

- You don't need to re-publish libraries
- You must upgrade to Scala.js 0.5.2 if any library you depend on uses Scala.js 0.5.2

If you choose to re-publish a library, make sure to bump its version.

Please report any issues [on GitHub](https://github.com/scala-js/scala-js/issues).

## Improvements in the 0.5.2 release

For changes introduced in 0.5.0, how to upgrade, getting started etc. have a look at the [0.5.0 announcement]({{ BASE_PATH }}/news/2014/06/13/announcing-scalajs-0.5.0/) (and maybe the [0.5.1 announcement]({{ BASE_PATH }}/news/2014/06/30/announcing-scalajs-0.5.1/)).

#### TypedArrays

The new package `scala.scalajs.js.typedarray` contains facade types
for JavaScript TypedArrays. It introduces compiler support to convert
`scala.Array`s to their TypedArray equivalent and vice versa.

Note that TypedArrays are **not** part of the ECMAScript 5
specification. You need to make sure your target platform supports
TypedArrays in addition to ECMAScript 5, if you decide to use them. Scala.js'
[TypedArray test suite](https://github.com/scala-js/scala-js/tree/v0.5.2/test-suite/src/test/scala/scala/scalajs/test/typedarray)
covers the full typed API and should be sufficient to verify whether a
given JavaScript runtime supports TypedArrays.

#### Bugfixes

The following bugs have been fixed in 0.5.2:

- [#789](https://github.com/scala-js/scala-js/issues/789) `fastOptStage::run` fails with Node.js
- [#791](https://github.com/scala-js/scala-js/issues/791) Default arguments in the constructor of facade classes fail if the companion object doesn't extend `js.Any`
- [#796](https://github.com/scala-js/scala-js/issues/796) Extending `js.Any` directly gives strange error messages

#### Changes to the IR

Some minor changes have been made to the IR to better accommodate the incremental optimizer in the pipeline for 0.5.3. This is the reason for the lack of forward binary compatibility.
