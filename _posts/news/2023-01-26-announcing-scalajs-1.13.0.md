---
layout: post
title: Announcing Scala.js 1.13.0
category: news
tags: [releases]
permalink: /news/2023/01/26/announcing-scalajs-1.13.0/
---


We are excited to announce the release of Scala.js 1.13.0!

**This release drops support for Scala 2.11.**
Finally, 5 years after Scala 2.11 was declared end-of-life, we decided to drop support for it in Scala.js.
We also dropped support for Scala 2.12.1 (Scala 2.12.2+ is still supported, of course).

Other than that, this release brings a number of bug fixes and enhancements.
Notably:

* Ability to export inner `object`s and `class`es in Scala classes
* Checked exceptions for `NullPointerExceptions`s
* Better optimizations for exported methods and methods in JavaScript classes

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to [the tutorial]({{ BASE_PATH }}/tutorial/).

If you need help with anything related to Scala.js, you may find our community [in `#scala-js` on Discord](https://discord.com/invite/scala) and [on Stack Overflow](https://stackoverflow.com/questions/tagged/scala.js).

Bug reports can be filed [on GitHub](https://github.com/scala-js/scala-js/issues).

## Release notes

If upgrading from Scala.js 0.6.x, make sure to read [the release notes of Scala.js 1.0.0]({{ BASE_PATH }}/news/2020/02/25/announcing-scalajs-1.0.0/) first, as they contain a host of important information, including breaking changes.

This is a **minor** release:

* It is backward binary compatible with all earlier versions in the 1.x series: libraries compiled with 1.0.x through 1.12.x can be used with 1.13.0 without change.
* It is *not* forward binary compatible with 1.12.x: libraries compiled with 1.13.0 cannot be used with 1.12.x or earlier.
* It is *not* entirely backward source compatible: it is not guaranteed that a codebase will compile *as is* when upgrading from 1.12.x (in particular in the presence of `-Xfatal-warnings`).

As a reminder, libraries compiled with 0.6.x cannot be used with Scala.js 1.x; they must be republished with 1.x first.

## Breaking changes

### Drop support for Scala 2.11 and 2.12.1

5 years after the end-of-life of Scala 2.11, Scala.js 1.13.0 drops its support.
Support for Scala 2.11 has slowly but steadily increased in cost over the year, and we arrived at the issue that broke the proverbial camel's back.

We announced a [request for comments issue](https://github.com/scala-js/scala-js/issues/4759) through all our usual communication channels.
It gathered by far the highest number of upvotes any Scala.js issue ever received.

Along with it, we dropped support for Scala 2.12.1, as it then remained the only version that does not support trailing commas.

## Enhancements with compatibility concerns

### Checked exceptions for `NullPointerException`

As documented in [the semantics of Scala.js]({{ BASE_PATH }}/doc/semantics.html#undefined-behaviors), `NullPointerExceptions`s are Undefined Behavior in Scala.js, similarly to `ClassCastException`s and `ArrayIndexOutOfBoundsException`s.
Since Scala.js 1.12.0 added checks for `ArrayStoreException`s and `NegativeArraySizeException`s, the `NullPointerException`s were the only remaining language-mandated exceptions that did not receive checks.

Scala.js 1.13.0 fills that gap, and now checks `NullPointerException`s in development (fastLink) mode.
As other undefined behavior errors, they will be reported as `UndefinedBehaviorError`s in fastLink mode, and unchecked in fullLink mode.

In some rare situations, this may turn code that appeared to work into actively throwing an exception.

Further, these additional checks can and will slow down fastLink-generated code.
Benchmarks show slowdowns of anywhere between 0% and 17%.
As a reminder, we expect production code to be generated with `fullLinkJS`.
fullLink-generated code is not affected by the checks and therefore not subject to this performance hit.

If the performance hit in `fastLinkJS` is too much to bear in your particular case, you can disable the checks even in fastLink with the following sbt setting:

{% highlight scala %}
scalaJSLinkerConfig ~= {
  import org.scalajs.linker.interface.CheckedBehavior
  _.withSemantics(_
    .withNullPointers(CheckedBehavior.Unchecked)
  )
}
{% endhighlight %}

Like other checked behaviors, it is now possible to configure the linker so that these exceptions are *compliant*.
In that case, they will be thrown as specified for the JVM, in both fastLink and fullLink.
You may enable them with the following sbt settings:

{% highlight scala %}
scalaJSLinkerConfig ~= {
  import org.scalajs.linker.interface.CheckedBehavior
  _.withSemantics(_
    .withNullPointers(CheckedBehavior.Compliant)
  )
}
{% endhighlight %}

This may have significant performance impact in fullLink, like other compliant behaviors.

### Changes to the IR and linker APIs

For tooling authors who directly manipulate the IR and linker APIs, there have been some breaking changes in that area.
This is in line with our version policy for the linker APIs.

The most likely changes you may hit are:

* `ClassDef` has several distinct lists of members instead of a single `memberDefs` field.
* Member defs are versioned using a dedicated `version: org.scalajs.ir.Version` instead of a `hash: Option[Hash]`.

## Improvements

### Export inner `object`s and `class`es in Scala classes

Scala.js 1.13.0 allows to use `@JSExport` on `object`s and `class`es that are members of Scala classes.
For example:

{% highlight scala %}
class Container {
  @JSExport
  object MemberObject

  @JSExport
  class MemberClass
}
{% endhighlight %}

`@JSExportAll` on the container class now exports its `object` members, like other term members, but does not automatically export `class` members.
Class members must be individually exported with `@JSExport`.

### New JDK APIs

This release adds support for the following JDK classes and methods:

* `java.util.TreeMap`
* `java.nio.charset.Charset.availableCharsets()`
* Default and static methods of `java.util.Comparator`
* `java.util.concurrent.Flow`
* `java.math.BigInteger.intValueExact()` and `longValueExact()`
* Missing methods of `java.io.InputStream` and `java.io.OutputStream`

### Optimizations for exported methods and methods of JavaScript classes

Before Scala.js 1.13.0, `@JSExport`ed methods and methods within JavaScript classes (that extend `js.Any`) were not processed by our optimizer.
This is now the case.

## Bug fixes

The following bugs have been fixed in 1.13.0:

* [#4784](https://github.com/scala-js/scala-js/issues/4784) SyntaxError on regex with an optional negative lookahead (only on JS)
* [#4794](https://github.com/scala-js/scala-js/issues/4794) The output of the compiler/linker is not stable

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av1.13.0+is%3Aclosed).
