---
layout: post
title: Announcing Scala.js 1.16.0
category: news
tags: [releases]
permalink: /news/2024/03/19/announcing-scalajs-1.16.0/
---


We are excited to announce the release of Scala.js 1.16.0!

The biggest highlight of this release is that we added a Scala.js-specific minifier.
When combined with a general-purpose JavaScript minifier, our minifier should bring most of the code size benefits of the Google Closure Compiler when the latter cannot be enabled, notably when emitting ECMAScript modules.

Scala.js 1.16.0 also upgrades by default to the standard library of Scala 2.12.19 and 2.13.13.

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to [the tutorial]({{ BASE_PATH }}/tutorial/).

If you need help with anything related to Scala.js, you may find our community [in `#scala-js` on Discord](https://discord.com/invite/scala) and [on Stack Overflow](https://stackoverflow.com/questions/tagged/scala.js).

Bug reports can be filed [on GitHub](https://github.com/scala-js/scala-js/issues).

## Release notes

If upgrading from Scala.js 0.6.x, make sure to read [the release notes of Scala.js 1.0.0]({{ BASE_PATH }}/news/2020/02/25/announcing-scalajs-1.0.0/) first, as they contain a host of important information, including breaking changes.

This is a **minor** release:

* It is backward binary compatible with all earlier versions in the 1.x series: libraries compiled with 1.0.x through 1.15.x can be used with 1.16.0 without change.
* It is *not* forward binary compatible with 1.15.x: libraries compiled with 1.16.0 cannot be used with 1.15.x or earlier.
* It is *not* entirely backward source compatible: it is not guaranteed that a codebase will compile *as is* when upgrading from 1.15.x (in particular in the presence of `-Xfatal-warnings`).

As a reminder, libraries compiled with 0.6.x cannot be used with Scala.js 1.x; they must be republished with 1.x first.

## Enhancements with compatibility concerns

### Changes to the IR and linker APIs

For tooling authors who directly manipulate the IR and linker APIs, there have been some breaking changes in that area.
This is in line with our version policy for the linker APIs.

The most likely changes you may hit are:

* `FieldName` is now a composite of the defining `ClassName` and a `SimpleFieldName`.
* `StoreModule` has no parameter anymore; it implicitly applies to storing the `this` value of the enclosing module class.

## Enhancements

### Scala.js-specific minifier

In the `fullLink` mode, the Scala.js linker now includes dedicated code size optimizations.
They are mostly useful when the Google Closure Compiler is deactivated, which is the case by default when emitting ECMAScript modules.

The most important optimization is that it compresses all *property* names (fields and methods) of Scala classes.
It computes how frequently each one is used across the codebase, and assigns shorter names to the most frequent ones.

Renaming local and global variables and functions in this way is a standard feature of general-purpose JavaScript minifiers.
However, in general they cannot rename *properties* without breaking the semantics of JavaScript programs.
This is why Scala.js has leveraged Closure since the very first relase.
Closure's so-called "advanced optimizations" assume that the JavaScript program fits in a specific subset of semantics, which allows it to rename properties.

Unfortunately, the way Closure handles ES modules is incompatible with what we need.
Closure is therefore disabled when emitting ES modules from Scala.js.
This has resulted in large bundle sizes for users of ES modules.

Our minifier, which is aware of our types and of Scala.js semantics, fills that gap between Closure and general-purpose minifiers.
When combined with a general-purpose minifier such as the one bundled with Vite, the new optimizations bring code size around 15% bigger than Closure.
Contrast that with the previous status quo, which was several *times* bigger than the Closure output.

If, for some reason, the new optimizations cause issues in your case, you can disable them with

{% highlight scala %}
scalaJSLinkerConfig ~= { _.withMinify(false) }
{% endhighlight %}

Please let us know if you encounter any issue with this new mode.

### Other code size improvements

In addition to the minifier, Scala.js 1.16.0 generally produces smaller .js files.
This is the result of various code size optimizations that we apply in all configurations.

In particular, the optimizer now eagerly "dealiases" `val` fields of top-level objects if they are simple and if the object's initializer can be proven to be pure.

### Reduced memory consumption of the linker

The linker is generally optimized for *incremental* runs, which naturally requires to maintain a lot of caches in memory.
We have started work on reducing the memory consumption of the linker without compromising on speed.
This release already ships with the first installment of these improvements, reducing the memory footprint of the linker by 10%.
If interested, you can find out the details [in the relevant pull request #4917](https://github.com/scala-js/scala-js/pull/4917).

## Bug fixes

Among others, the following bugs have been fixed in 1.16.0:

* [#4929](https://github.com/scala-js/scala-js/issues/4929) Assertion failed: Trying to move a local VarDef after the super constructor call of a non-native JS class
* [#4949](https://github.com/scala-js/scala-js/issues/4949) Wrong pretty-printing of JS tree that *starts* with an object lit

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av1.16.0+is%3Aclosed).
