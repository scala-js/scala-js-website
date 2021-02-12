---
layout: post
title: Announcing Scala.js 1.5.0
category: news
tags: [releases]
permalink: /news/2021/02/12/announcing-scalajs-1.5.0/
---


We are excited to announce the release of Scala.js 1.5.0!

This is mostly a bugfix release, including fixes for some important bugs related to dynamic module loading, which was introduced in 1.4.0.

The main non-bug fix improvement is the introduction of custom JS function types.
It is now possible to declare custom subtraits of `js.Function` with arbitrary `apply` signatures.
Notably, this allows to declare types for JS functions with varargs.

Scala.js 1.5.0 adds support for the imminent Scala 2.13.5.
**Previous versions of Scala.js, including Scala.js 0.6.x, will not work with Scala 2.13.5+.**

Finally, due to [the announcement by JFrog to discontinue Bintray](https://jfrog.com/blog/into-the-sunset-bintray-jcenter-gocenter-and-chartcenter/), we are now publishing the `sbt-scalajs` sbt plugin to Maven Central, like all our other artifacts.
Discussions are in progress with key actors of the Scala ecosystem about how to preserve all the previously published sbt plugins (sbt-scalajs being just one of many).

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to [the tutorial]({{ BASE_PATH }}/tutorial/).

If you need help with anything related to Scala.js, you may find our community [on Gitter](https://gitter.im/scala-js/scala-js) and [on Stack Overflow](https://stackoverflow.com/questions/tagged/scala.js).

Bug reports can be filed [on GitHub](https://github.com/scala-js/scala-js/issues).

## Release notes

If upgrading from Scala.js 0.6.x, make sure to read [the release notes of Scala.js 1.0.0]({{ BASE_PATH }}/news/2020/02/25/announcing-scalajs-1.0.0/) first, as they contain a host of important information, including breaking changes.

This is a **minor** release:

* It is backward binary compatible with all earlier versions in the 1.x series: libraries compiled with 1.0.x through 1.4.x can be used with 1.5.0 without change.
* It is *not* forward binary compatible with 1.4.x: libraries compiled with 1.5.0 cannot be used with 1.4.x or earlier.
* It is *not* entirely backward source compatible: it is not guaranteed that a codebase will compile *as is* when upgrading from 1.4.x (in particular in the presence of `-Xfatal-warnings`).

As a reminder, libraries compiled with 0.6.x cannot be used with Scala.js 1.x; they must be republished with 1.x first.

## Fixes with compatibility concerns

### Inner classes and objects in non-native JS traits

Until Scala.js 1.4.x, the compiler allowed the declaration of inner classes and objects in non-native JS traits, as in

{% highlight scala %}
trait Outer extends js.Object {
  object InnerObject extends js.Object

  class InnerClass extends js.Object
}
{% endhighlight %}

While the above definition would be allowed by the compiler, any attempt to actually extend `Outer` would result in broken code.

Scala.js 1.5.0 will therefore reject this definition at compile-time.
This may cause code that compiled before to be rejected, which constitutes a backward source incompatible change.

If you have actual, working code using that pattern (for example, where you receive instances of `Outer` from JavaScript code, instead of extending it yourself), it is likely that you can fix the code by adding `@js.native` both to the outer trait and the inner classes and objects:

{% highlight scala %}
@js.native
trait Outer extends js.Object {
  @js.native
  object InnerObject extends js.Object

  @js.native
  class InnerClass extends js.Object
}
{% endhighlight %}

## Custom JS function types

**Scala 2.11 note:** With Scala 2.11, this feature requires the `-Xexperimental` flag, which adds SAM support to the Scala compiler.

For interoperability with JavaScript code that manipulates function values, Scala.js has always had a set of `js.FunctionN` and `js.ThisFunctionN` types.
Since they are SAM types, they can be created with anonymous functions, for example:

{% highlight scala %}
val jsFun: js.Function1[Int, String] = arg => arg.toString()
{% endhighlight %}

The built-in JS function types can accomodate any function with a fixed number of parameters, up to 22.
However, they are not enough for more specialized use cases:

* Function values with variadic arguments (varargs)
* Function values of more than 22 arguments

To address such advanced use cases, Scala.js 1.5.0 now allows to define custom JS function types with arbitrary `apply` signatures.
For example, if you need to represent a function value with one `Int` parameter and varargs of type `String`, you can define a custom JS function type for it:

{% highlight scala %}
trait SpecialJSFunction extends js.Function {
  def apply(first: Int, rest: String*): Any
}
{% endhighlight %}

and create values of that type as expected:

{% highlight scala %}
val specialJSFun: SpecialJSFunction = { (first, rest) =>
  s"$first, ${rest.size}"
}
{% endhighlight %}

A custom JS function type is any `trait` whose parent class is `js.Function`, and which has a single abstract method named `apply`.
If a custom JS function type extends the special trait `js.ThisFunction`, its first argument on the Scala.js side maps to the `this` value in JavaScript.

Note that the built-in `js.FunctionN` and `js.ThisFunctionN` types fit those definitions, and are therefore "custom" JS function types themselves, that happen to be defined in the Scala.js standard library.

## Miscellaneous

### New JDK APIs

The following JDK APIs were added:

* `java.util.concurrent.Semaphore` (except the methods that require blocking)

## Bug fixes

Among others, the following bugs have been fixed in 1.5.0:

* [#4386](https://github.com/scala-js/scala-js/issues/4386) `js.dynamicImport` and `ModuleSplitStyle.FewestModules` may cause public modules to be imported by Scala.js code
* [#4385](https://github.com/scala-js/scala-js/issues/4385) Desugaring for `ApplyImportDynamic` nodes captures variables too aggressively
* [#4416](https://github.com/scala-js/scala-js/issues/4416) Incremental runs lead to GCC reporting a JSC_UNDEFINED_VARIABLE
* [#4370](https://github.com/scala-js/scala-js/issues/4370) Scala.js 1.4.0 breaks linking of fields with type `Nothing`
* [#4375](https://github.com/scala-js/scala-js/issues/4375) Compiler crash with overriding type members in JS types
* [#4413](https://github.com/scala-js/scala-js/issues/4413) `hashCode()` and `identityHashCode()` don't work for JS `symbol`s and `bigint`s 
* [#4351](https://github.com/scala-js/scala-js/issues/4351) `j.u.Formatter` octal and hex conversion do not support `+ (` flags for BigIntegers
* [#4353](https://github.com/scala-js/scala-js/issues/4353) `j.u.Formatter` 'g' conversion is not JVM-compliant for 0.0
* [#4402](https://github.com/scala-js/scala-js/issues/4402) Extending a native inner class complains that it has no JS native load spec
* [#4401](https://github.com/scala-js/scala-js/issues/4401) Inner classes and objects wrongly allowed in non-native JS traits

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av1.5.0+is%3Aclosed).
