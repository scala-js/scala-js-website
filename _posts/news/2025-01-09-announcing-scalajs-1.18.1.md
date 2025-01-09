---
layout: post
title: Announcing Scala.js 1.18.1
category: news
tags: [releases]
permalink: /news/2025/01/09/announcing-scalajs-1.18.1/
---


We are pleased to announce the release of Scala.js 1.18.1!

This is technically a hotfix patch release for 1.18.0, which was discovered to be [severely broken](https://github.com/scala-js/scala-js/issues/5107), and was therefore never announced.
These release notes therefore present it as a "minor release" compared to 1.17.0.

This release drops support for Scala 2.12.{2-5} and 2.13.{0-2}.
Other than that, it is mostly a bugfix release.

It also contains a number of internal changes to the intermediate representation and linker.
These are not externally visible, except for users who directly manipulate the IR and/or linker.
They pave the way for upcoming changes that are still ongoing work.

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to [the tutorial]({{ BASE_PATH }}/tutorial/).

If you need help with anything related to Scala.js, you may find our community [in `#scala-js` on Discord](https://discord.com/invite/scala) and [on Stack Overflow](https://stackoverflow.com/questions/tagged/scala.js).

Bug reports can be filed [on GitHub](https://github.com/scala-js/scala-js/issues).

## Release notes

If upgrading from Scala.js 0.6.x, make sure to read [the release notes of Scala.js 1.0.0]({{ BASE_PATH }}/news/2020/02/25/announcing-scalajs-1.0.0/) first, as they contain a host of important information, including breaking changes.

This is a **minor** release, compared to 1.17.0:

* It is backward binary compatible with all earlier versions in the 1.x series: libraries compiled with 1.0.x through 1.17.x can be used with 1.18.0 without change.
* It is *not* forward binary compatible with 1.17.x: libraries compiled with 1.18.0 cannot be used with 1.17.x or earlier.
* It is *not* entirely backward source compatible: it is not guaranteed that a codebase will compile *as is* when upgrading from 1.17.x (in particular in the presence of `-Xfatal-warnings`).

Technically 1.18.1 is a patch release with respect to 1.18.0.
Our usual patch version guarantees do apply, despite the retraction of 1.18.0.

As a reminder, libraries compiled with 0.6.x cannot be used with Scala.js 1.x; they must be republished with 1.x first.

## Changes with compatibility concerns

### Enforce stricter rules on the use of `this` in the IR of constructors

Exceptionally, **this is theoretically a binary-breaking change**.
It is possible for previously valid IR (Intermediate Representation, as published in binaries on Maven Central) to be rejected by Scala.js 1.18.x.

We now enforce, during IR checking (by default, only enabled in `fullLink` builds), that constructors abide by stricter rules.
Before calling their `super` constructor (or delegate `this()` constructor), they may not refer to the `this` instance.
The only exception is to *assign* a field, as in `this.foo = bar`.
This restriction is in line with a similar rule in JVM bytecode.

Unfortunately, the Scala.js compiler for Scala 2.x was previously generating IR that is invalid according to the new rule in one corner case situation.
If there is a `try..catch` expression inside an argument to the `super` constructor, the compiler may lift it to a separate method.
We compiled that method as an *instance* method, using the `this` value, instead of compiling it as a *static* method.

Here is an example:

{% highlight scala %}
class Parent(val i: Int)

class Child extends Parent({
  val p = try Integer.parseInt("foo") catch { case _: NumberFormatException => 42 }
  p
})

object Test {
  def main(args: Array[String]): Unit =
    println(new Child().i)
}
{% endhighlight %}

If your application depends on a library that contained such a code shape, you may hit the following IR checking error at link time in Scala.js 1.18.0.

{% highlight none %}
[error] ...: Restricted use of `this` before the super constructor call
[error] There were 1 ClassDef checking errors.
{% endhighlight %}

If that is the case, the library needs to be recompiled with Scala.js 1.18.x or later to be usable again.
Make sure to [tell us on the relevant PR](https://github.com/scala-js/scala-js/pull/5019) if that happens.

In order to mitigate the impact of this change, we conducted an audit of (the latest version of) all Scala.js libraries published to Maven Central.
We did not find any library that violated the new rule.
You may still run into the issue if you depend on a private library.

As a temporary, stop-gap measure, you may silence the error with the following setting:

{% highlight scala %}
Compile/fullLinkJS/scalaJSLinkerConfig ~= { _.withCheckIR(false) }
{% endhighlight %}

However that will start causing real issues once we leverage the new restriction for better optimizations.

### Drop support for Scala 2.12.2 to 2.12.5 and 2.13.0 to 2.13.2

In order to reduce our maintenance burden and ease further development, Scala.js 1.18.1 drops support for Scala 2.12.2 to 2.12.5 and 2.13.0 to 2.13.2.
Scala 2.12.6+ and 2.13.3+ are still supported.

We still had a number of dedicated code paths, special cases and exceptions for these versions in our codebase.
Moreover, we occasionally hit compiler bugs in early 2.12.x versions, which imposed constraints on how we wrote our code.

### The Wasm backend now requires full support of `try_table` (notably Node.js 23)

If you are using the WebAssembly backend, you now need at least Node.js 23 to run and test.

In Scala.js 1.17.0, the WebAssembly backend worked around some issues in Wasm engines regarding the `try_table` instruction.
Our main blocker was the version of V8 shipped with Node.js 22.
Now that Node.js 23 has been released with the correct behavior, we removed the workaround.

### Improved internal checks after optimizations

We improved "IR checking", our internal consistency checks in the linker.
Previously, we only performed IR checking before optimizations.
Now, we also check the IR after the optimizer if one of the following conditions hold:

* you are using the Wasm backend, or
* you are using the `bigint` encoding of `Long`s, through the setting `withESFeatures(_.withAllowBigIntsForLongs(true))`.

This may surface internal bugs that we are unaware of.
If that happens, please report an issue, as prompted by the error message.

By default, IR checking is only performed during `fullLink`.
You may disable it with the following setting:

{% highlight scala %}
Compile/fullLinkJS/scalaJSLinkerConfig ~= { _.withCheckIR(false) }
{% endhighlight %}

### Changes to the IR and linker APIs

For tooling authors who directly manipulate the IR and linker APIs, there have been some breaking changes in that area.
This is in line with our versioning policy for the linker APIs.

The changes you are most likely to hit are:

* We renamed `NoType` to `VoidType`, which represents the IR type `void`.
  `void` is now generally handled more regularly.
* `VarRef` now directly contains a `LocalName`, rather than a `LocalIdent` itself containing a `LocalName`.
* `This` is not a separate IR node anymore; instead it is a `VarRef` with the special name `LocalName.This`.
* `ArrayLength`, `Throw`, and a number of more obscure IR nodes have been merged into `UnaryOp`.
* `JSLinkingInfo` was removed as a "bag of options"; it was replaced by `LinkTimeProperty` for individual properties.
* `Transformers` does not make the distinction between "statement" and "expression" anymore.
  This follows from handling `void` more uniformly.

## Miscellaneous

### New JDK APIs

This release adds shell definitions for the following JDK 21 interfaces, but without any method:

* `java.util.SequencedCollection`, `SequencedMap` and `SequencedSet`

## Bug fixes

Among others, the following bugs have been fixed since 1.17.0:

* [#5107](https://github.com/scala-js/scala-js/issues/5107) IR checking error for IR coming from Scala.js < 1.11 through deserialization hack
* [#5085](https://github.com/scala-js/scala-js/issues/5085) `java.math.BigDecimal.valueOf(0, 9).stripTrailingZeros.scale` returns 9 instead of 0.
* [#5069](https://github.com/scala-js/scala-js/issues/5069) Linking errors with `java.util.SequencedCollection` on JDK 21+ (considered a bug because they surfaced even in code that did not mention that new interface).
* [#5048](https://github.com/scala-js/scala-js/issues/5048) Wasm backend fails when no modules are defined.
* [#4947](https://github.com/scala-js/scala-js/issues/4947) Wrong optimization of `@inline` classes with several private fields of the same name in the class hierarchy.

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av1.18.0+is%3Aclosed).
