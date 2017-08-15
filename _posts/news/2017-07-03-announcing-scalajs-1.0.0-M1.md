---
layout: post
title: Announcing Scala.js 1.0.0-M1
category: news
tags: [releases]
permalink: /news/2017/07/03/announcing-scalajs-1.0.0-M1/
---


We are very excited to announce the first milestone of Scala.js 1.0.0, aka 1.0.0-M1!

This development release is mostly intended for testing purposes, and as a synchronization point with library authors so that they can start upgrading in preparation for the final release.

As the change in "major" version number witnesses, this release is *not* binary compatible with 0.6.x.
Libraries need to be recompiled and republished using this milestone to be compatible.

Moreover, this release is not entirely source compatible with 0.6.x either.
We expect, however, that further milestones for 1.0.0 will stay backward source compatible with this first milestone.

<!--more-->

Please report any issues [on GitHub](https://github.com/scala-js/scala-js/issues).

The following libraries and testing frameworks have already been upgraded and published for 1.0.0-M1:

* [scalajs-dom (static types for the DOM)](https://github.com/scala-js/scala-js-dom): 0.9.3
* [scalajs-java-time](https://github.com/scala-js/scala-js-java-time): 0.2.2
* [scalajs-java-logging](https://github.com/scala-js/scala-js-java-logging): 0.1.2
* [scalajs-jquery](https://github.com/scala-js/scala-js-jquery): 0.9.2

## Preparations before upgrading from 0.6.x

Before upgrading to 1.0.0-M1, **we strongly recommend that you upgrade to Scala.js 0.6.18**, and address all deprecation warnings.
Since Scala.js 1.0.0-M1 removes support for all the deprecated features in 0.6.x, it is easier to see the deprecation messages guiding you to the proper replacements.

Additionally to the explicitly deprecated things, make sure to use `scalaJSLinkerConfig` instead of the following sbt settings:

* `scalaJSSemantics`
* `scalaJSModuleKind`
* `scalaJSOutputMode`
* `emitSourceMaps`
* `relativeSourceMaps`
* `scalaJSOutputWrapper`
* `scalaJSOptimizerOptions`

## Upgrade to 1.0.0-M1 from 0.6.18

As a first approximation, all you need to do is to update the version number in `project/plugins.sbt`:

{% highlight scala %}
addSbtPlugin("org.scala-js" % "sbt-scalajs" % "1.0.0-M1")
{% endhighlight %}

In addition, if you use some of the components that have been moved to separate repositories, you will need to add some more dependencies in `project/plugins.sbt`:

If you use `jsDependencies` (or rely on the `jsDependencies` of your transitive dependencies):

* Add `addSbtPlugin("org.scala-js" % "sbt-jsdependencies" % "1.0.0-M1")` in `project/plugins.sbt`
* Add `.enablePlugins(JSDependenciesPlugin)` to Scala.js `project`s
* Add `.jsConfigure(_.enablePlugins(JSDependenciesPlugin))` to `crossProject`s

If you use the Node.js with jsdom environment:

* Add `libraryDependencies += "org.scala-js" %% "scalajs-env-nodejs" % "1.0.0-M1"` in `project/plugins.sbt`

If you relied on the automatic selection of the above environment due to `jsDependencies += RuntimeDOM`, you have to explicitly select it:

* Add `jsEnv := new org.scalajs.jsenv.jsdomnodejs.JSDOMNodeJSEnv()` to the relevant Scala.js project settings

If you use the PhantomJS environment:

* Add `addSbtPlugin("org.scala-js" % "sbt-scalajs-env-phantomjs" % "1.0.0-M1")` in `project/plugins.sbt`

This should get your build up to speed to Scala.js 1.0.0-M1.
From there, you should be able to test whether things go smoothly, or whether you are affected by the breaking changes detailed below.

## Breaking changes

This section discusses the backward incompatible changes, which might affect your project.

### Access to the global scope instead of the global object

This is the only major breaking change at the language level.
In Scala.js 1.x, `js.Dynamic.global` and `@JSGlobalScope` objects refer to the global *scope* of JavaScript, rather than the global *object*.
Concretely, this has three consequences, which we outline below.
Further information can be found in [the documentation about the global scope in Scala.js]({{ BASE_PATH }}/doc/interoperability/global-scope.html).

#### Members can only be accessed with a statically known name which is a valid JavaScript identifier

For example, the following is valid:

{% highlight scala %}
println(js.Dynamic.global.Math)
{% endhighlight %}

but the following variant, where the name `Math` is only known at run-time, is not valid anymore:

{% highlight scala %}
val mathName = "Math"
println(js.Dynamic.global.selectDynamic(mathName))
{% endhighlight %}

The latter will cause a compile error.
This is because it is not possible to perform dynamic lookups in the global scope.
Similarly, accessing a member whose name is statically known but not a valid JavaScript identifier is also prohibited:

{% highlight scala %}
println(js.Dynamic.global.`not-a-valid-JS-identifier`)
{% endhighlight %}

#### Global scope objects cannot be stored in a separate `val`

For example, the following is invalid and will cause a compile error:

{% highlight scala %}
val g = js.Dynamic.global
{% endhighlight %}

as well as:

{% highlight scala %}
def foo(x: Any): Unit = println(x)
foo(js.Dynamic.global)
{% endhighlight %}

This follows from the previous rule.
If the above two snippets were allowed, we could not check that we only access members with statically known names.

The first snippet can be advantageously replaced by a renaming import:

{% highlight scala %}
import js.Dynamic.{global => g}
{% endhighlight %}

#### Accessing a member that is not declared causes a `ReferenceError` to be thrown

This is a *run-time* behavior change, and in our experience the larger source of breakages in actual code.

Previously, reading a non-existent member of the global object, such as

{% highlight scala %}
println(js.Dynamic.global.globalVarThatDoesNotExist)
{% endhighlight %}

would evaluate to `undefined`.
In Scala.js 1.x, this throws a `ReferenceError`.
Similarly, writing to a non-existent member, such as

{% highlight scala %}
js.Dynamic.global.globalVarThatDoesNotExist = 42
{% endhighlight %}

would previously *create* said global variable.
In Scala.js 1.x, it also throws a `ReferenceError`.

A typical use case of the previous behavior was to *test* whether a global variable was defined or not, e.g.,

{% highlight scala %}
if (js.isUndefined(js.Dynamic.global.Promise)) {
  // Promises are not supported
} else {
  // Promises are supported
}
{% endhighlight %}

This idiom is broken in Scala.js 1.x, and needs to be replaced by an explicit use of `js.typeOf`:

{% highlight scala %}
if (js.typeOf(js.Dynamic.global.Promise) != "undefined")
{% endhighlight %}

The `js.typeOf` "method" is magical when its argument is member of a global scope object.

### `extends js.JSApp` does not export the object to JavaScript anymore

Consider the following object definition:

{% highlight scala %}
package bar

import scala.scalajs.js

object Foo extends js.JSApp {
  def main(): Unit = {
    println("Hello world")
  }
}
{% endhighlight %}

In 0.6.x, extending `js.JSApp` has *two* consequences:

* `Foo` is recognized by the sbt plugin as a main object, and it can be used by `scalaJSUseMainModuleInitializer := true` (as well as in deprecated launchers)
* `Foo` is exported to JavaScript as a 0-argument function `bar.Foo()`, and its `main()` method as well

In Scala.js 1.x, the second bullet is not true anymore, which constitutes a *run-time behavior change*.
If you need to preserve this behavior, you need to explicitly export `Foo` and its `main()` method as follows:

{% highlight scala %}
object Foo extends js.JSApp {
  @JSExport
  def main(): Unit = {
    println("Hello world")
  }

  @JSExportTopLevel("bar.Foo")
  def jsAccessor(): Foo.type = this
}
{% endhighlight %}

In addition, `js.JSApp` itself is deprecated, so you should use a `def main(args: Array[String]): Unit` method instead.
`js.JSApp` will be removed in Scala.js 1.0.0-RC1.

### `js.UndefOr[A]` is now an alias for `A | Unit`

Instead of defining `js.UndefOr[+A]` as its own type, it is now a simple type alias for `A | Unit`:

{% highlight scala %}
type UndefOr[+A] = A | Unit
{% endhighlight %}

The `Option`-like API is of course preserved.

We do not expect this to cause any significant issue, but it may impact type inference in subtle ways that can cause compile errors for previously valid code.
You may have to adjust some uses of `js.UndefOr` due to these changes, especially if using Scala 2.10.

### `testHtml` replaces both `testHtmlFastOpt` and `testHtmlFullOpt`

The separation of `testHtmlFastOpt` and `testHtmlFullOpt`, which were independent of the value of `scalaJSStage`, caused significant unfixable issues in 0.6.x.
In Scala.js 1.x, both are replaced by a single task, `testHtml`.
It is equivalent to the old `testHtmlFastOpt` if the value of `scalaJSStage` is `FastOptStage` (the default), and to `testHtmlFullOpt` if it is `FullOptStage`.
This makes it more consistent with other tasks such as `run` and `test`.

### `scalajs-javalib-ex` was removed

The artifact `scalajs-javalib-ex` is removed in 1.x.
It only contained a partial implementation of `java.util.ZipInputStream`.
If you were using it, we recommend that you integrate a copy of [its source code from Scala.js 0.6.x](https://github.com/scala-js/scala-js/tree/0.6.x/javalib-ex/src/main/scala/java/util/zip) into your project.

### `js.use(x).as[T]` was removed

The use cases for `js.use(x).as[T]` have been dramatically reduced by non-native JS classes (previously known as Scala.js-defined JS classes).
This API seems virtually unused on the visible Web.
Moreover, it was the only macro in the Scala.js standard library.

We have therefore removed it from the standard library, and it is not provided anymore.
On demand, we can republish it as a separate library, if you need it.

### Scala 2.12.0 is not supported anymore

A severe regression in Scala 2.12.0 upstream, affecting `js.UndefOr`, forced us to drop support for Scala 2.12.0.
Scala 2.12.1+ is supported.

## Enhancements

There are very few enhancements in Scala.js 1.0.0-M1.
Scala.js 1.0.0 is focused on simplifying Scala.js, not on adding new features.
Nevertheless, here are a few enhancements.

### Non-native JS classes by default (previously known as Scala.js-defined)

In Scala.js 0.6.x, we can declare a so-called *Scala.js-defined* JS class as follows:

{% highlight scala %}
@ScalaJSDefined
class Foo extends js.Object
{% endhighlight %}

In Scala.js 1.x, "Scala.js-defined" is the default, so the above snippet would be simply written as

{% highlight scala %}
class Foo extends js.Object
{% endhighlight %}

Consequently, we also introduce a shift of *terminology*.
Such a class is now called a *non-native JS class* (by opposition to a *native JS class* with `@js.native`).
Both native and non-native JS classes (resp. traits, objects) are called *JS classes* (resp. traits, objects).
All of them are called *JS types*.

Also note that the annotation `@ScalaJSDefined` is deprecated, and will be removed in Scala.js 1.0.0-RC1.

### Scala.js can access `require` and other magical "global" variables of special JS environments

The changes from global *object* to global *scope* mean that magical "global" variables provided by some JavaScript environments, such as `require` in Node.js, are now visible to Scala.js.
For example, it is possible to dynamically call `require` as follows in Scala.js 1.x:

{% highlight scala %}
val pathToSomeAsset = "assets/logo.png"
val someAsset = js.Dynamic.global.require(pathToSomeAsset)
{% endhighlight %}

We still recommend to use `@JSImport` and `CommonJSModule` for statically known imports.

### The sbt plugin builds on top of sbt-crossproject

Scala.js 0.6.x defined itself the notion of `crossProject` and the `%%%` operator for cross-platform dependencies.
In Scala.js 1.x, we standardize on [sbt-crossproject](https://github.com/scala-native/sbt-crossproject), which provides a unified API that can also be used by [Scala Native](https://scala-native.readthedocs.io/).

The changes are entirely backward source compatible, because `sbt-crossproject` was designed with that specific goal.
However, the traditional cross-project constructor:

{% highlight scala %}
lazy val foo = crossProject.in(...)...
{% endhighlight %}

is now deprecated, as it hard-codes the JVM × JS pair of platforms.
Instead, you should use

{% highlight scala %}
lazy val foo = crossProject(JVMPlatform, JSPlatform).in(...)...
{% endhighlight %}

## Bugfixes

Amongst others, the following bugs have been fixed since 0.6.18:

* [#2800](https://github.com/scala-js/scala-js/issues/2800) Global `let`s, `const`s and `class`es cannot be accessed by Scala.js
* [#2382](https://github.com/scala-js/scala-js/issues/2382) Name clash for `$outer` pointers of two different nesting levels (fixed for Scala 2.10 and 2.11; 2.12 did not suffer from the bug in 0.6.x)

See the [full list](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av1.0.0-M1+is%3Aclosed) on GitHub.

## Cross-building for Scala.js 0.6.x and 1.x

If you want to cross-compile your libraries for Scala.js 0.6.x and 1.x (which you definitely should), here are a couple tips.

### Dynamically load a custom version of Scala.js

Since the version of Scala.js is not decided by an sbt setting in `build.sbt`, but by the version of the sbt plugin in `project/plugins.sbt`, standard cross-building setups based on `++` cannot be applied.
We recommend that you load the version of Scala.js from an environment variable.
For example, you can do this in your `project/plugins.sbt` file:

{% highlight scala %}
val scalaJSVersion =
  Option(System.getenv("SCALAJS_VERSION")).getOrElse("0.6.18")

addSbtPlugin("org.scala-js" % "sbt-scalajs" % scalaJSVersion)
{% endhighlight %}

You can then launch

{% highlight bash %}
$ SCALAJS_VERSION=1.0.0-M1 sbt
{% endhighlight %}

from your command line to start up your build with Scala.js 1.0.0-M1.

### Extra dependencies for JS environments

You can further build on the above `val scalaJSVersion` to dynamically add dependencies on `scalajs-env-phantomjs` and/or `scalajs-env-jsdom-nodejs` if you use them:

{% highlight scala %}
// For Node.js with jsdom
libraryDependencies ++= {
  if (scalaJSVersion.startsWith("0.6.")) Nil
  else Seq("org.scala-js" %% "scalajs-env-jsdom-nodejs" % "1.0.0-M1")
}

// For PhantomJS
{
  if (scalaJSVersion.startsWith("0.6.")) Nil
  else Seq(addSbtPlugin("org.scala-js" % "sbt-scalajs-env-phantomjs" % "1.0.0-M1"))
}
{% endhighlight %}

In both cases, you can then use the source-compatible API in `build.sbt` to select your JS environment of choice.

### Extra dependencies for `jsDependencies`

The case of `sbt-jsdependencies` is trickier, because it defines an `AutoPlugin` that needs to be enabled on your projects.
This means that there is no source-compatible way to write your `build.sbt`.
The trick is to provide a fake `JSDependenciesPlugin` when compiling for 0.6.x.

First add the following to `project/plugins.sbt`:

{% highlight scala %}
// For jsDependencies
{
  if (scalaJSVersion.startsWith("0.6.")) Nil
  else Seq(addSbtPlugin("org.scala-js" % "sbt-jsdependencies" % "1.0.0-M1"))
}
{% endhighlight %}

Then create a file `project/JSDependenciesCompat.scala` with the following content:

{% highlight scala %}
package jsdependenciescompat

import sbt._

object FakeJSDependenciesPlugin extends AutoPlugin

object FakeJSDependenciesPluginProvider extends AutoPlugin {
  import Compat._

  object autoImport {
    import org.scalajs._

    val JSDependenciesPluginCompat = jsdependencies.sbtplugin.JSDependenciesPlugin
  }

  object Compat {
    object jsdependencies {
      object sbtplugin {
        val JSDependenciesPlugin = FakeJSDependenciesPlugin
      }
    }
  }
}
{% endhighlight %}

You can now write `enablePlugins(JSDependenciesCompat)` in your `build.sbt`, and otherwise use `jsDependencies` and other keys as usual.

Understanding how the trick works is left as an exercise for the reader.

### Warning-free cross-compilation of `@ScalaJSDefined`

In Scala.js 1.x, `@ScalaJSDefined` is deprecated because it is the default.
However, by default, in Scala.js 0.6.x, it is required.
Scala.js 0.6.17 introduced the compiler option `-P:scalajs:sjsDefinedByDefault` to allow warning-free cross-compilation.
Add the following setting to your `build.sbt`:

{% highlight scala %}
scalacOptions ++= {
  if (scalaJSVersion.startsWith("0.6.")) Seq("-P:scalajs:sjsDefinedByDefault")
  else Nil
}
{% endhighlight %}

And then remove all your `@ScalaJSDefined` annotations.
This will be source-compatible between both versions, and not produce any warnings.

### Enabling sbt-crossproject even with Scala.js 0.6.x

This should only be necessary if your codebase also cross-compiles with Scala Native, in which case you need your build to depend on [sbt-crossproject](https://github.com/scala-native/sbt-crossproject)'s `sbt-scalajs-crossproject` in the 0.6.x build.
However, you must not depend on it in the 1.x build, because it conflicts with the now built-in support of sbt-crossproject in Scala.js 1.x.
Therefore, here is what you should put in your `project/plugins.sbt`:

{% highlight scala %}
// For sbt-crossproject support even with Scala.js 0.6.x
{
  if (scalaJSVersion.startsWith("0.6."))
    Seq(addSbtPlugin("org.scala-native" % "sbt-scalajs-crossproject" % "0.2.0"))
  else
    Nil
}
{% endhighlight %}

In that case, you still need to apply the shadowing import described in [sbt-crossproject's readme](https://github.com/scala-native/sbt-crossproject#cross-compiling-scalajs-jvm-and-native), i.e., in your `build.sbt`:

{% highlight scala %}
// shadow sbt-scalajs' crossProject and CrossType from Scala.js 0.6.x (no-op with Scala.js 1.x)
import sbtcrossproject.{crossProject, CrossType}
{% endhighlight %}
