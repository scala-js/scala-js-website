---
layout: post
title: Announcing Scala.js 1.11.0
category: news
tags: [releases]
permalink: /news/2022/09/15/announcing-scalajs-1.11.0/
---


We are excited to announce the release of Scala.js 1.11.0!

This release brings a number of bug fixes and enhancements.
The highlights are:

* Dead code elimination of unused fields, bringing code size improvements, and perhaps small performance improvements.
* Checked exceptions for `StringIndexOutOfBoundsException`s: `String.charAt()`, `substring()`, and all their derivatives now report better errors in development mode.

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to [the tutorial]({{ BASE_PATH }}/tutorial/).

If you need help with anything related to Scala.js, you may find our community [on Gitter](https://gitter.im/scala-js/scala-js) and [on Stack Overflow](https://stackoverflow.com/questions/tagged/scala.js).

Bug reports can be filed [on GitHub](https://github.com/scala-js/scala-js/issues).

## Release notes

If upgrading from Scala.js 0.6.x, make sure to read [the release notes of Scala.js 1.0.0]({{ BASE_PATH }}/news/2020/02/25/announcing-scalajs-1.0.0/) first, as they contain a host of important information, including breaking changes.

This is a **minor** release:

* It is backward binary compatible with all earlier versions in the 1.x series: libraries compiled with 1.0.x through 1.10.x can be used with 1.11.0 without change.
* It is *not* forward binary compatible with 1.10.x: libraries compiled with 1.11.0 cannot be used with 1.10.x or earlier.
* It is *not* entirely backward source compatible: it is not guaranteed that a codebase will compile *as is* when upgrading from 1.10.x (in particular in the presence of `-Xfatal-warnings`).

As a reminder, libraries compiled with 0.6.x cannot be used with Scala.js 1.x; they must be republished with 1.x first.

## Enhancements with compatibility concerns

### Checked exceptions for `StringIndexOutOfBoundsException`

As documented in [the semantics of Scala.js]({{ BASE_PATH }}/doc/semantics.html#undefined-behaviors), `StringIndexOutOfBoundsException`s are Undefined Behavior in Scala.js,
similarly to `ClassCastException`s and `ArrayIndexOutOfBoundsException`s.
Prior to Scala.js 1.11.0, we made no effort internally to provide decent error messages, or any other kind of checks.

Starting with this release, erroneous conditions leading to a `StringIndexOutOfBoundsException` are checked in development (fastLink) mode.
They will be reported as `UndefinedBehaviorError`s in fastLink mode, and unchecked in fullLink mode.

For `String.charAt`, this strictly improves the error message.

For `String.substring`, this throws in situations that previously would, by chance, succeed.
**This may cause issues** in your codebase if your code unknowingly relied on the undefined behavior.
For code cross-compiling on the JVM, this is unlikely to happen, as the JVM would have already thrown exceptions in those cases.

Like other checked behaviors, it is now possible to configure the linker so that `StringIndexOutOfBoundsException`s are *compliant*.
In that case, they will be thrown as specified for the JVM, in both fastLink and fullLink.
You may enable them with the following sbt setting:

{% highlight scala %}
scalaJSLinkerConfig ~= {
  _.withSemantics(_.withStringIndexOutOfBounds(
      org.scalajs.linker.interface.CheckedBehavior.Compliant))
}
{% endhighlight %}

This may have significant performance impact in fullLink, like other compliant behaviors.

### The sbt setting `envVars` is taken into account

In sbt, the `envVars` setting of type `Map[String, String]` defines environment variables to set when running and testing an application.
Until now, it was ignored by Scala.js.

When using `run` or `test`, the Scala.js sbt plugin will now forward the defined variables to the configured `jsEnv`.
Not all `JSEnv` implementations support environment variables.
If the configured `jsEnv` does not support them, and `envVars` is non-empty, an error will be reported.

In some cases, this may cause issues with builds that relied on `envVars` being ignored by sbt-scalajs.

## Improvements

### Unused fields are dead-code-eliminated

Fields of Scala classes that are never read are now dead-code-eliminated.
This can bring substantial code size improvements, although the extent of which will vary with the codebases.

As all other optimizations performed by Scala.js, this is a semantics-preserving transformation.
The initial value of the field, as well as any other assignments to it, are still evaluated for their side effects.
That code can only be removed if the optimizer can prove that it is pure.

## Miscellaneous

### New JDK APIs

* The method `java.net.URLDecoder(String, Charset)` was added, to complement the existing overloads.
* The class `java.net.URLEncoder` was added.

### Independent `scalajs-javalib.jar`

Prior to Scala.js 1.11.0, the implementation of the `java.*` classes supported by the core were bundled inside the `scalajs-library_2.x.jar` artifact.
This was necessary because they internally referred to features of the Scala- and Scala.js standard libraries.

Starting with Scala.js 1.11.0, our implementation of the `java.*` classes is self-contained.
Therefore, they are extracted in a unique new artifact `scalajs-javalib.jar`.
The various `scalajs-library_2.x.jar`s depend on `scalajs-javalib.jar`, so this change should be transparent for most users.

If you have a special use case where you directly look inside `scalajs-library_2.x.jar` and expect to find the `java.*` classes there, you may have to adjust your code.

The new `scalajs-javalib.jar` is completely Scala-agnostic, and the Scala.js IR (stored in `.sjsir` files) as well.
Therefore, this jar could be used by other languages targeting JavaScript from a JVM-like language without depending on Scala, if they compile to the Scala.js IR.

## Bug fixes

The following bugs have been fixed in 1.11.0:

* [#4726](https://github.com/scala-js/scala-js/issues/4726) `BigDecimal.floatValue()` may be 1 ULP away from the best approximation
* [#4716](https://github.com/scala-js/scala-js/issues/4716) Duplicate argument name in generated JavaScript code
* [#4705](https://github.com/scala-js/scala-js/issues/4705) Variable named `await` emitted in ESModule mode

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av1.11.0+is%3Aclosed).
