---
layout: post
title: Announcing Scala.js 0.6.0-M1
category: news
tags: [releases]
---


We are excited to announce the first milestone of Scala.js 0.6.0, aka 0.6.0-M1!

This development release is mostly intended for testing purposes, and as a synchronization point with library authors so that they can start upgrading in preparation for the final release.

As the change in "major" version number witnesses, this release is *not* binary compatible with 0.5.x.
Libraries need to be recompiled and republished using this milestone to be compatible.

More importantly, this release is not source compatible with 0.5.x either.
We expect, however, that further milestones and 0.6.x will stay source compatible with this first milestone.
<!--more-->

Please report any issues [on GitHub](https://github.com/scala-js/scala-js/issues).

The following libraries and testing frameworks have already been upgraded and published for 0.6.0-M1:

* [DOM types](https://github.com/scala-js/scala-js-dom): 0.7.0
* [Scala.rx](https://github.com/lihaoyi/scala.rx): 0.2.7-M1
* [ScalaTags](https://github.com/lihaoyi/scalatags): 0.4.3-M1
* [Autowire](https://github.com/lihaoyi/autowire): 0.2.4-M1
* [µTest](https://github.com/lihaoyi/utest): 0.2.5-M1
* [µPickle](https://github.com/lihaoyi/upickle): 0.2.6-M1

## Preparations before upgrading from 0.6.x

### Upgrade to 0.5.6 if not already done

Before upgrading to 0.6.0-M1, **we strongly recommend that you upgrade to Scala.js 0.5.6**, and address all deprecation warnings.
Scala.js 0.5.6 contains warnings for the most vicious breaking changes of 0.6.x.

### Migrate away from the Jasmine test framework

If you use the Jasmine test framework, migrate away from it to one of the other testing frameworks for Scala.js.
The Jasmine test framework is *not* a good testing framework for Scala.js code, and is being *removed* in 0.6.x.

Possible replacements:

* [uTest](https://github.com/lihaoyi/utest)
* [Little Spec](https://github.com/eecolor/little-spec)
* [otest](https://github.com/cgta/otest)

Note that these testing frameworks also need to upgrade to 0.6.0-M1 before you can use them.
You might need to disable your testing infrastructure in the meantime, if you want to start using 0.6.0-M1 before they are ready.

## Upgrade to 0.6.0-M1 from 0.5.6

Basically, you need to apply the same kind of changes to your build files as in [this commit](https://github.com/sjrd/scala-js-example-app/commit/09861f30793a35ff102fdb75f449a16fa849fde2), which mostly consists in:

* Upgrade to sbt >= 0.13.6 (the current version is 0.13.7).
* Adaptations to new groupId and artifact names for Scala.js packages.
* Adaptation to the new `AutoPlugin` infrastructure of the sbt plugin.
* Drop the prefix `ScalaJSKeys.` for Scala.js-specific sbt keys, as they are not needed anymore.
* Upgrade to 0.6.0-M1-enabled versions of your dependencies.
* (Temporarily) use `%%%!` instead of `%%%` because [the latter is broken](https://github.com/scala-js/scala-js/issues/1331)

On the sbt command line, not much changes, except the way you use the `fastOpt` and `fullOpt` mode.
In Scala 0.5.x, you could run in `fastOpt` mode with:

    > fastOptStage::run

In 0.6.x, the mode is regulated by the setting `scalaJSStage`, which is one of:

* `PreLinkStage` (default): uses Rhino
* `FastOptStage`: `fastOpt` mode, uses Node.js or PhantomJS
* `FullOptStage`: `fullOpt` mode, uses Node.js or PhantomJS

You can change it from the command line with

    > set scalaJSStage := FastOptStage
    > run # runs in fastOptMode

In a multi-project build, you'll want to change it for all projects, which can be done with `in Global`:

    > set scalaJSStage in Global := FastOptStage

## Major changes

This section discusses major changes affecting compatibility, which may or may not apply to your project.

### `ClassCastException` becomes an undefined behavior

The JVM, in its incommensurable magnanimity, throws nicely specified exceptions when you do something bad with your code.
For example, it will nicely throw a `ClassCastException` if you perform an invalid `.asInstanceOf`, or an `ArithmeticException` if you divide an integer by 0.

Since the beginning of time, Scala.js has handled most of these things as *undefined behavior*, i.e., *anything can happen* if these cases happen.
Until 0.5.x, `ClassCastException`s were properly reported, though.
We have found, however, that checking these buggy cases costs up to 100% overhead to the overall execution time of a Scala.js program.

In Scala.js 0.6.x, therefore, invalid casts become an undefined behavior as well.
However, the compiler will *still* be nice with you *in fastOpt mode*, by throwing an `UndefinedBehaviorError` if you perform an invalid cast (instead of a `ClassCastException`).
`UndefinedBehaviorError` is a *fatal* error, meaning it won't be caught by `case NonFatal(e)` handlers.
In fullOpt mode, the checks are removed for maximum efficiency.

You *must not catch* `UndefinedBehaviorError`, since that would cause your program to behave differently in fastOpt mode than in fullOpt.
The idea of `UndefinedBehaviorError` is that you can enjoy strict checks and stack traces while developing.

If you really want `ClassCastException`s to be thrown reliably (both in fastOpt and fullOpt modes), you can enable them in your application, at the expense of runtime performance, with the following sbt setting:

{% highlight scala %}
scalaJSSemantics ~= { _.withAsInstanceOfs(org.scalajs.core.tools.sem.CheckedBehavior.Compliant) }
{% endhighlight %}

This applies to the entire application, including dependencies.
There is no way to select parts of the application where this applies, because there is no way to make that sensical.

### `js.native` in facade types

When writing facade types, it was previously recommended to use `???` as a fake body for fields and methods.
You should now use `js.native` instead, as in:

{% highlight scala %}
trait Foo extends js.Object {
  var bar: Int = js.native
  def foobar(x: Int): String = js.native
}
{% endhighlight %}

The compiler will emit a warning if you use any other body.
The warning will become an error in 1.0.0.

### `@JSExport` exports to fully qualified names by default

As announced by deprecation warnings in the 0.5.6 compiler, putting `@JSExport` without an explicit name on an `object` or `class` changes meaning between 0.5.x and 0.6.x.
Consider this code:

{% highlight scala %}
package babar

@JSExport
class Foo
{% endhighlight %}

In 0.5.x, `Foo` is exported as `Foo`.
In 0.6.x, it is exported as `babar.Foo` instead.

### Testing frameworks adaptations

If you are not a testing framework implementor, this section does not apply to you.
Please follow the migration guidelines of any testing framework you may use.

Until 0.5.x, Scala.js had a custom, ad-hoc substitute for the sbt testing interface, which allows testing frameworks to integrate with sbt.
Although quite good in its own right, it suffered from several limitations, including the inability for one project to use more than one testing framework at the same time.
Scala.js 0.6.x now supports its JS version of the original sbt testing interface, with all its power, API, and usability features.
We also offer tools to make your testing framework fully source-compatible with the JVM and JS variants of the testing interface, without a single line of platform-specific source code.

An existing barebone cross-compiling testing framework can be found [in our tests](https://github.com/scala-js/scala-js/tree/v0.6.0-M1/sbt-plugin-test).
Some highlights:

* [Build definition for the cross-compiling framework](https://github.com/scala-js/scala-js/blob/v0.6.0-M1/sbt-plugin-test/build.sbt#L47-L70)
* [(Cross-compiling) source code of the testing framework](https://github.com/scala-js/scala-js/tree/v0.6.0-M1/sbt-plugin-test/testFramework/src/main/scala/sbttest/framework)
* [Build definition for a cross-compiling project using the framework](https://github.com/scala-js/scala-js/blob/v0.6.0-M1/sbt-plugin-test/build.sbt#L72-L97)
* [Source code of the project using the framework](https://github.com/scala-js/scala-js/tree/v0.6.0-M1/sbt-plugin-test/multiTest)

Adapting your testing framework to follow this structure is likely to be the easiest path of migration.
You may also want to take a look at [the PR we made to uTest](https://github.com/lihaoyi/utest/pull/45) to migrate to Scala.js 0.6.x.

Should you run into trouble, don't hesitate to ask on the mailing list!

## Enhancements

### Faster!

Scala.js 0.6.x benefits from many performance improvements, most notably:

* `asInstanceOf`s are unchecked (see above), giving `fullOpt` code up to twice as fast as before
* `Range.foreach`, aka the `for (i <- 0 until n)` kind of loops, is inlined away, giving the same performance as an explicit `while` loop.
* Higher-order operations on `js.Array`s (such as `foreach`, `map`, etc.) are inlined away as `while` loops.
* Various improvements to the optimizer.

### Scala collection API for `js.Array[A]` and `js.Dictionary[A]`

The title says it all: `js.Array[A]` and `js.Dictionary[A]` receive the entire Scala collection API, respectively of `mutable.Buffer[A]` and `mutable.Map[String, A]`.

`js.Array` becomes the default implementation of `mutable.Buffer`, i.e., `mutable.Buffer.empty` returns a `js.Array` wrapped in a `js.WrappedArray`.

### On-demand strict floats

Scala.js under-specifies `Float` operations by default, saying that they can sometimes behave as if they were `Double`s.
In 0.6.x, you can configure your application to use *strict-float semantics*, guaranteeing that all `Float` operations behave as on the JVM, with the appropriate truncation of precision (with the notable exception of `.toString()`).
The following sbt setting enables this:

{% highlight scala %}
scalaJSSemantics ~= { _.withStrictFloats(true) }
{% endhighlight %}

Beware that this can have a major impact on performance on VMs that do not support the [`Math.fround`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/fround) function.

### We publish to Maven Central

This should probably not affect sbt users, but it now becomes possible to imagine a Maven plugin for Scala.js.
To this effect, the sbt plugin codebase has also been refactored, and all parts that are not strictly bound to sbt as a build tool have been extracted in Mavenized artifacts.
An enthusiast Maven user could therefore build a Maven plugin with relatively few lines of code.
As a measurable figure, the code specific to sbt contains only 1,211 lines of code.

## Bugfixes

Amongst others, the following bugs have been fixed since 0.5.6:

* [#1324](https://github.com/scala-js/scala-js/issues/1324) Date.parse should return a Double, not an Int
* [#1192](https://github.com/scala-js/scala-js/issues/1192) hashCode for floating points has a very bad distribution

See the [full list](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av0.6.0-M1+is%3Aclosed) on GitHub.

## Known issues

* [#1331](https://github.com/scala-js/scala-js/issues/1331) `%%%` seems broken with "illegal dynamic reference" (workaround available in the issue)
* [#1335](https://github.com/scala-js/scala-js/issues/1335) Source maps to Scala library are broken
