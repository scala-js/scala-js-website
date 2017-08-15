---
layout: post
title: Announcing Scala.js 0.6.17
category: news
tags: [releases]
permalink: /news/2017/06/04/announcing-scalajs-0.6.17/
---


We are excited to announce the release of Scala.js 0.6.17!

This release is mostly a bug-fix release, but it also brings a few new features.

One bug fix which we would like to highlight is [#2943](https://github.com/scala-js/scala-js/issues/2943)/[#2827](https://github.com/scala-js/scala-js/issues/2827).
The optimizer exposed a quadratic behavior which meant insanely long times of `fastOptJS` on some codebases, which we have now fixed.
This was particularly true in test suites using ScalaTest.

The main new feature of this release is the ability for facade libraries to support both the traditional `NoModule` style, where JS libraries are exposed as global variables and accessed through `@JSGlobal`, and the `CommonJSModule` style, where JS libraries are imported through `@JSImport`.

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to
[the tutorial]({{ BASE_PATH }}/tutorial/).

## Release notes

If upgrading from Scala.js 0.6.14 or earlier, make sure to read [the release notes of 0.6.15]({{ BASE_PATH }}/news/2017/03/21/announcing-scalajs-0.6.15/), which contain important migration information.

As a minor release, 0.6.17 is backward source and binary compatible with previous releases in the 0.6.x series.
Libraries compiled with earlier versions can be used with 0.6.17 without change.
However, it is not forward compatible: libraries compiled with 0.6.17 cannot be used by projects using 0.6.{0-16}.

Please report any issues [on GitHub](https://github.com/scala-js/scala-js/issues).

## New features

### Double support for global variables/imports in facade types

Since Scala.js 0.6.13, Scala.js codebases have had the option to [emit CommonJS modules]({{ BASE_PATH }}/doc/project/module.html), using the `CommonJSModule` module kind.
In that mode, JS libraries are imported through facade types with `@JSImport`.
For example, one might import jQuery as

{% highlight scala %}
@js.native
@JSImport("jquery.js", JSImport.Default)
object JQuery extends js.Object {
  def apply(selector: String): JQuery = js.native
}
{% endhighlight %}

However, if one uses the more traditional "script" style (with the `NoModule` module kind), where JS libraries are exposed as global variables, the facade would have to look like the following:

{% highlight scala %}
@js.native
@JSGlobal("$")
object JQuery extends js.Object {
  def apply(selector: String): JQuery = js.native
}
{% endhighlight %}

This means that there was no way to write a facade library that works both for applications using `NoModule` and `CommonJSModule`.

In Scala.js 0.6.17, the facade can now be declared as follows to support both module kinds:

{% highlight scala %}
@js.native
@JSImport("jquery.js", JSImport.Default, globalFallback = "$")
object JQuery extends js.Object {
  def apply(selector: String): JQuery = js.native
}
{% endhighlight %}

When linking with `scalaJSModuleKind := ModuleKind.CommonJSModule`, this will behave as in the first example.
When linking with `ModuleKind.NoModule`, the `globalFallback` is used, and the facade behaves as in the second example with `@JSGlobal("$")`.

### Opt-in `@ScalaJSDefined` by default

As a sneak peak of Scala.js 1.x, you can now opt-in for `@ScalaJSDefined` by default in your codebase.

As you might know, in Scala.js 1.x, classes, traits and objects extending `js.Any` will be "Scala.js-defined" by default.
In 0.6.x, the compiler forces you to choose between `@js.native` and `@ScalaJSDefined` with warnings.
In 1.x however, the `@ScalaJSDefined` annotation will be deprecated and have no effect.

In other words, when migrating from 0.6.x to 1.x, a class such as

{% highlight scala %}
@ScalaJSDefined
class Foo extends js.Object {
  def bar(x: Int): Int = x + 1
}
{% endhighlight %}

will have to lose its annotation and simply become

{% highlight scala %}
class Foo extends js.Object {
  def bar(x: Int): Int = x + 1
}
{% endhighlight %}

In Scala.js 0.6.17, you can opt-in to the new behavior of Scala.js 1.x.
To do so, give the option `-P:scalajs:sjsDefinedByDefault` to the Scala compiler.
In sbt, you can do so with:

{% highlight scala %}
// For a Scala.js-only project
lazy val foo = project.
  enablePlugins(ScalaJSPlugin).
  settings(
    ...
    scalacOptions += "-P:scalajs:sjsDefinedByDefault"
  )

// For a cross project:
lazy val bar = crossProject.
  settings(
    ...
  ).
  jsSettings(
    ...
    scalacOptions += "-P:scalajs:sjsDefinedByDefault"
  )
{% endhighlight %}

With this compiler option, you can safely remove all your `@ScalaJSDefined` annotations, and benefit from the cleaner syntax of Scala.js 1.x today!

Codebases with and without the option are still interoperable between each other.
Using the option does not prevent you from depending on libraries that do not use it, nor does it prevent codebases not using it from depending on your library.

## Bug fixes

Among others, the following bugs have been fixed in 0.6.17:

* [#2943](https://github.com/scala-js/scala-js/issues/2943) Performance regression in the optimiser
* [#2827](https://github.com/scala-js/scala-js/issues/2827) Slow incremental linking times for fastOptJS (with ScalaTest)
* [#2979](https://github.com/scala-js/scala-js/issues/2979) `%%%` does not work in JVM projects
* [#2953](https://github.com/scala-js/scala-js/issues/2953) Type-matching arbitrary things against `Byte`/`Short`/`Int` ends up calling `toString`
* [#2928](https://github.com/scala-js/scala-js/issues/2928) `return x match {...}` crashes the compiler
* [#2927](https://github.com/scala-js/scala-js/issues/2927) JUnit `assertEquals(_: Double, _: Double)` not failing for JS, only for JVM
* [#2845](https://github.com/scala-js/scala-js/issues/2845) Scala.js compiler doesn't pass through UTF-8 correctly for dependencies
* [#2798](https://github.com/scala-js/scala-js/issues/2798) Allow the sbt plugin to work if run on Java 9 (the optimizer will not be parallel)
* [#2786](https://github.com/scala-js/scala-js/issues/2786) Code which runs with fastOptJS but crashes with fullOptJS

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av0.6.17+is%3Aclosed).
