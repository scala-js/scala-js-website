---
layout: post
title: Announcing Scala.js 1.7.0
category: news
tags: [releases]
permalink: /news/2021/08/04/announcing-scalajs-1.7.0/
---


We are excited to announce the release of Scala.js 1.7.0!

This release fixes a number of bugs.
In particular, regular expressions, available through `java.util.regex.Pattern` or Scala's `Regex` and `.r` method, now behave in the same way as on the JVM.
This change has compatibility implications, which we discuss below.

Moreover, this release fixes *all* the known bugs that were left.
As of this writing, Scala.js 1.7.0 has zero known bugs!

The Scala standard library was upgraded to versions 2.12.14 and 2.13.6.

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to [the tutorial]({{ BASE_PATH }}/tutorial/).

If you need help with anything related to Scala.js, you may find our community [on Gitter](https://gitter.im/scala-js/scala-js) and [on Stack Overflow](https://stackoverflow.com/questions/tagged/scala.js).

Bug reports can be filed [on GitHub](https://github.com/scala-js/scala-js/issues).

## Release notes

If upgrading from Scala.js 0.6.x, make sure to read [the release notes of Scala.js 1.0.0]({{ BASE_PATH }}/news/2020/02/25/announcing-scalajs-1.0.0/) first, as they contain a host of important information, including breaking changes.

This is a **minor** release:

* It is backward binary compatible with all earlier versions in the 1.x series: libraries compiled with 1.0.x through 1.6.x can be used with 1.7.0 without change.
* It is *not* forward binary compatible with 1.6.x: libraries compiled with 1.7.0 cannot be used with 1.6.x or earlier.
* It is *not* entirely backward source compatible: it is not guaranteed that a codebase will compile *as is* when upgrading from 1.6.x (in particular in the presence of `-Xfatal-warnings`).

As a reminder, libraries compiled with 0.6.x cannot be used with Scala.js 1.x; they must be republished with 1.x first.

## Fixes with compatibility concerns

### Regular expressions have been fixed to match the JVM behavior

Until Scala.js 1.6.x, the regular expressions provided by `java.util.regex.Pattern`, and used by `scala.util.matching.Regex` and the `.r` method, were implemented directly in terms of JavaScript's `RegExp`.
That meant that they used the feature set and the semantics of [JavaScript regular expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions), which are different from [Java regular expressions](https://docs.oracle.com/en/java/javase/15/docs/api/java.base/java/util/regex/Pattern.html).
Scala.js 1.7.0 finally fixes this issue, and now correctly implements the semantics of Java regular expressions, although some features are not supported.

Since the old implementation has been there for 7 years, and documented as such, it is possible that this fix will actually break some code in the wild.
During the implementation of this feature, we have analyzed the corpus of all Scala.js-only libraries (without JVM support) and extracted all the regexes that they use.
We have verified that none of those use cases are impacted by this change.
It is still possible that applications are impacted.

It is also possible for some cross-platform libraries to face issues, as we have not covered those.
Unlike Scala.js-only libraries, we consider it unlikely that they will have issues with the *change of semantics* per se, as they already worked on the JVM, with the new semantics.

The biggest danger would be a cross-library that uses the `MULTILINE` flag (aka `(?m)`).
Indeed, that feature kind of worked before, but is now rejected at `Pattern.compile()`-time with a `PatternSyntaxException` by default.
The reason is that to correctly implement the semantics of that flag, we need support for look-behind assertions (`(?<=𝑋)`) in JavaScript's `RegExp`.
That support was only added in ECMAScript 2018, whereas Scala.js targets ES 2015 by default.

It is possible to change that target with the following setting:

{% highlight scala %}
scalaJSLinkerConfig ~= (_.withESFeatures(_.withESVersion(ESVersion.ES2018)))
{% endhighlight %}

**Attention!** While this enables support for the `MULTILINE` flag (among others), it restricts your application to environments that support recent JavaScript features.
If you maintain a library, this restriction applies to all downstream libraries and applications.

We therefore recommend to try and *avoid* the need for that flag instead.
We give several strategies on how to do so [on the Regular expressions documentation page]({{ BASE_PATH }}/doc/regular-expressions.html).
That page also contains many more details on the new support of regular expressions.

## New features

### Add a configurable header comment in generated .js files

Sometimes, it is desirable to add a header comment in the generated .js files.
This is typically used for license information or any other metadata.
While it has always been possible to post-process the generated .js files in the build, doing so came at the cost of destroying the source maps.

Scala.js 1.7.0 introduces a new linker configuration, `jsHeader`, to specify a comment to insert at the top of .js files:

{% highlight scala %}
scalaJSLinkerConfig ~= {
  _.withJSHeader(
    """
      |/* This is the header, which source maps
      | * take into account.
      | */
    """.stripMargin.trim() + "\n"
  )
}
{% endhighlight %}

The `jsHeader` must be a combination of valid JavaScript whitespace and/or comments, and must not contain any newline character other than `\n` (the UNIX newline).
If non-empty, it must end with a new line.
These restrictions ensure that this feature is not abused to inject arbitrary JavaScript code in the .js file generated by the compiler, potentially compromising the compiler abstractions.

## Miscellaneous

### Allow delegating JS class constructor calls with default params

Until Scala.js 1.6.x, in a JS class, a secondary constructor calling another constructor with default parameters had to specify actual values for all parameters.
For example, the following code was rejected:

{% highlight scala %}
class A(x: Int, y: String = "default") extends js.Object {
  def this() = this(12)
}
{% endhighlight %}

That restriction has been lifted in Scala.js 1.7.0, so that the above code is now valid.

### New JDK APIs

The following JDK classes have been added

* `java.util.concurrent.atomic.LongAdder`

### Set up the `versionScheme` of library artifacts

This release configures the sbt `versionScheme` setting for the library artifacts of Scala.js (with `"semver-spec"` for the public ones).
This will reduce spurious eviction warnings in downstream projects.

### Upgrade to GCC v20210601

We upgraded to the Google Closure Compiler v20210601.

## Bug fixes

Among others, the following bugs have been fixed in 1.7.0:

* [#4507](https://github.com/scala-js/scala-js/issues/4507) 1.6.0 regression: `new mutable.WrappedArrayBuilder(classTag[Unit]).result()` throws a CCE
* [#3953](https://github.com/scala-js/scala-js/issues/3953) fastOptJS error in scalaz 7.3 with Scala.js 1.0.0
* [#3918](https://github.com/scala-js/scala-js/issues/3918) Mixed-in field in class inside lazy val rhs is erroneously immutable in the IR -> IR checking error
* [#4511](https://github.com/scala-js/scala-js/issues/4511) Nested JS Class in JS Class with Scala companion crashes compiler
* [#4465](https://github.com/scala-js/scala-js/issues/4465) Default parameters in constructors of nested JS classes cause invalid IR
* [#4526](https://github.com/scala-js/scala-js/issues/4526) Compiler crashes on nested JS class with default constructor params with private companion
* [#4469](https://github.com/scala-js/scala-js/issues/4469) Better error message when executing tests with Node missing
* [#4336](https://github.com/scala-js/scala-js/issues/4336) Failing `<project>/run` can `close()` subsequent runs too early
* [#105](https://github.com/scala-js/scala-js/issues/105) `String.split(x: Array[Char])` produces bad regexes

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av1.7.0+is%3Aclosed).
