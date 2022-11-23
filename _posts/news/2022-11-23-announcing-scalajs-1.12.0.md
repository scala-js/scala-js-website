---
layout: post
title: Announcing Scala.js 1.12.0
category: news
tags: [releases]
permalink: /news/2022/09/15/announcing-scalajs-1.12.0/
---


We are excited to announce the release of Scala.js 1.12.0!

This release brings a number of bug fixes and enhancements.
The highlights are:

* Support for the JavaScript operator `**`, introduced in ECMAScript 2016.
* Checked exceptions for `ArrayStoreExceptions`s and `NegativeArraySizeException`s

The Scala standard library was upgraded to version 2.12.17 and 2.13.10.

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to [the tutorial]({{ BASE_PATH }}/tutorial/).

If you need help with anything related to Scala.js, you may find our community [in `#scala-js` on Discord](https://discord.com/invite/scala) and [on Stack Overflow](https://stackoverflow.com/questions/tagged/scala.js).

Bug reports can be filed [on GitHub](https://github.com/scala-js/scala-js/issues).

## Release notes

If upgrading from Scala.js 0.6.x, make sure to read [the release notes of Scala.js 1.0.0]({{ BASE_PATH }}/news/2020/02/25/announcing-scalajs-1.0.0/) first, as they contain a host of important information, including breaking changes.

This is a **minor** release:

* It is backward binary compatible with all earlier versions in the 1.x series: libraries compiled with 1.0.x through 1.11.x can be used with 1.12.0 without change.
* It is *not* forward binary compatible with 1.11.x: libraries compiled with 1.12.0 cannot be used with 1.11.x or earlier.
* It is *not* entirely backward source compatible: it is not guaranteed that a codebase will compile *as is* when upgrading from 1.11.x (in particular in the presence of `-Xfatal-warnings`).

As a reminder, libraries compiled with 0.6.x cannot be used with Scala.js 1.x; they must be republished with 1.x first.

## Enhancements with compatibility concerns

### Checked exceptions for `ArrayStoreException` and `NegativeArraySizeException`

As documented in [the semantics of Scala.js]({{ BASE_PATH }}/doc/semantics.html#undefined-behaviors), `ArrayStoreException`s and `NegativeArraySizeException`s are Undefined Behavior in Scala.js, similarly to `ClassCastException`s and `ArrayIndexOutOfBoundsException`s.
Prior to Scala.js 1.12.0, we made no effort internally to provide decent error messages, or any other kind of checks.

Starting with this release, erroneous conditions leading to one of these two exceptions are checked in development (fastLink) mode.
They will be reported as `UndefinedBehaviorError`s in fastLink mode, and unchecked in fullLink mode.

In some rare situations, this may turn code that appeared to work into actively throwing an exception.

Like other checked behaviors, it is now possible to configure the linker so that these exceptions are *compliant*.
In that case, they will be thrown as specified for the JVM, in both fastLink and fullLink.
You may enable them with the following sbt settings:

{% highlight scala %}
scalaJSLinkerConfig ~= {
  import org.scalajs.linker.interface.CheckedBehavior
  _.withSemantics(_
    .withArrayStores(CheckedBehavior.Compliant)
    .withNegativeArraySizes(CheckedBehavior.Compliant)
  )
}
{% endhighlight %}

This may have significant performance impact in fullLink, like other compliant behaviors.

### `js.Dynamic.**` now refers to the JavaScript `**` operator

Previously, `dynamic1 ** dynamic2` would be equivalent to the JavaScript expression `dynamic1["**"](dynamic2)`.
When recompiled, `**` will now resolve the JavaScript `**` operator (see below for details).

If calling a method named `"**"` was intended, the above should be rewritten to `dynamic1.applyDynamic("**")(dynamic2)`.

## New deprecations

### `@JSOperator` is expected on JavaScript operator methods

When defining a facade type, we can model JavaScript operators using methods with specific names.
For example, the facade for `js.BigInt` contains:

{% highlight scala %}
import scala.scalajs.js
import scala.scalajs.js.annotation._

@js.native @JSGlobal
final class BigInt extends js.Object {
  def +(other: BigInt): BigInt = js.native
  ...
}
{% endhighlight %}

Starting from Scala.js 1.12.0, such operator methods should be annotated with `@JSOperator`, as follows:

{% highlight scala %}
  @JSOperator def +(other: BigInt): BigInt = js.native
{% endhighlight %}

A compiler warning will be emitted if the annotation is missing.

## Improvements

### Support for the JavaScript operator `**`

ECMAScript 2016 introduced the `**` operator in JavaScript.
`a ** b` computes `a` raised to the power `b`, and is applicable to `number`s and `bigint`s.

Before Scala.js 1.12.0, it was not possible to write Scala.js code calling that operator.
Scala.js 1.12.0 now supports it, through the definition of an `@JSOperator def **`, as follows:

{% highlight scala %}
import scala.scalajs.js
import scala.scalajs.js.annotation._

@js.native @JSGlobal
final class BigInt extends js.Object {
  @JSOperator def **(other: BigInt): BigInt = js.native
  ...
}
{% endhighlight %}

Without the annotation, a compiler warning will be emitted, and the definition will behave as a call to a method named `"**"` instead, for backward compatibility.
If that is actually the intended semantics, the warning can be silenced with an explicit `@JSName("**")`.

## Bug fixes

The following bugs have been fixed in 1.12.0:

* [#4739](https://github.com/scala-js/scala-js/issues/4739) Incorrect codegen for singleton case from Scala 3 enum in Scala 2.13 codebase
* [#4734](https://github.com/scala-js/scala-js/issues/4734) `j.u.ArrayDeque#pollFirst` is O(n)
* [#4731](https://github.com/scala-js/scala-js/issues/4731) `j.u.Arrays.equals(Array[AnyRef])` doe not handle `null` values.
* [#4753](https://github.com/scala-js/scala-js/issues/4753) The optimizer thinks that `x.getClass()` is non-nullable.
* [#4755](https://github.com/scala-js/scala-js/issues/4755) The optimizer does not respect eval order of generic array get/set with nulls

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av1.12.0+is%3Aclosed).
