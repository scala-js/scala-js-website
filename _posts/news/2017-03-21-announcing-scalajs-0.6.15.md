---
layout: post
title: Announcing Scala.js 0.6.15
category: news
tags: [releases]
permalink: /news/2017/03/21/announcing-scalajs-0.6.15/
---


We are excited to announce the release of Scala.js 0.6.15!

This release was focused on preparations for Scala.js 1.0.0.
It notably contains better replacements for some features that we were not 100% happy with, which are now deprecated and will be dropped in 1.0.0.

Thanks to [@olafurpg](https://github.com/olafurpg) and his great tool [scalafix](https://scalacenter.github.io/scalafix/), you can automatically migrate your codebase for the first and most intrusive of those deprecations.
See below for details.

Scala.js 0.6.15 also comes with a set of exciting new features, including several awesome JavaScript interoperability features:

* Use `@JSExportStatic` to define static members on Scala.js-defined JS classes.
* `@JSExportTopLevel` is not restricted to methods anymore: it can be used on fields and top-level classes/objects.
* The standard library now contains the API for ECMAScript 2015 symbols (as [`js.Symbol`]({{ site.production_url }}/api/scalajs-library/latest/#scala.scalajs.js.Symbol)) and iterables/iterators (as [`js.Iterable`]({{ site.production_url }}/api/scalajs-library/latest/#scala.scalajs.js.Iterable) and [`js.Iterator`]({{ site.production_url }}/api/scalajs-library/latest/#scala.scalajs.js.Iterator)).
* In JS types (both native and non-native), `@JSName` can be given a reference to a `js.Symbol` (instead of a constant string) to declare members whose "name" is a JavaScript symbol.

Finally, the sbt plugin also features a replacement for the "launcher" files, so that the call to the main method of your program can be included directly inside the main `-fastopt.js`.

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to
[the tutorial]({{ BASE_PATH }}/tutorial/).

## Release notes

If upgrading from Scala.js 0.6.12 or earlier, make sure to read [the release notes of 0.6.13]({{ BASE_PATH }}/news/2016/10/17/announcing-scalajs-0.6.13/), which contain some breaking changes in sbt build definitions.

As a minor release, 0.6.15 is backward source and binary compatible with previous releases in the 0.6.x series.
Libraries compiled with earlier versions can be used with 0.6.15 without change.
However, it is not forward compatible: libraries compiled with 0.6.15 cannot be used by projects using 0.6.{0-14}.

Please report any issues [on GitHub](https://github.com/scala-js/scala-js/issues).

## Main deprecations

### `@js.native` classes and objects need to have `@JSGlobal`

Previously, one would declare facade types for native classes and objects as follows:

{% highlight scala %}
@js.native
object Foo extends js.Object

@js.native
@JSName("Foobar")
class Bar extends js.Object
{% endhighlight %}

This is now deprecated: `@js.native` objects and classes should now explicitly use the annotation `@JSGlobal` as follows:

{% highlight scala %}
import scala.scalajs.js.annotation._

@js.native
@JSGlobal // implied name "Foo"
object Foo extends js.Object

@js.native
@JSGlobal("Foobar")
class Bar extends js.Object
{% endhighlight %}

Note that `@JSGlobal` *replaces* `@JSName` if it is present, and is otherwise added.

#### Migration tips

You can temporarily disable the deprecation warnings with the following sbt setting:

{% highlight scala %}
scalacOptions += "-P:scalajs:suppressMissingJSGlobalDeprecations"
{% endhighlight %}

This will keep working in the 0.6.x cycle.
You can use that to ease your migration and delay dealing with these deprecations until you have some time to allocate to that.

#### Automatically migrate your codebase with scalafix

Thanks to [@olafurpg](https://github.com/olafurpg), we have a [scalafix](https://scalacenter.github.io/scalafix/) rewrite for you.
You can use it to automatically migrate your codebase!

Here is a how-to:

* Make sure you use sbt 0.13.13 or later (in `project/build.properties`)
* Add the following sbt plugin to `project/plugins.sbt`:

      addSbtPlugin("ch.epfl.scala" % "sbt-scalafix" % "0.3.2")

* Create a file `.scalafix.conf` at the root of your project, and fill it with:

      rewrites = ["https://gist.githubusercontent.com/sjrd/ef8bb7c52be1451b3a3b9bab6a187549/raw/0b1d451d266bce20921bbff3a74722610d604509/ScalaJSRewrites.scala"]
      imports.organize = false
      imports.removeUnused = false

The first line specifies that we want to apply the `@JSGlobal` rewrite available [in this gist](https://gist.github.com/sjrd/ef8bb7c52be1451b3a3b9bab6a187549), written by @olafurpg.

The last two lines are optional, but provide minimal diffs, at the cost of some manual intervention on imports.
Consult [the scalafix documentation](https://scalacenter.github.io/scalafix/) for further details on those.

Once that is done, simply run

    $ sbt scalafix

and enjoy the magic.
If you use `-Xfatal-warnings`, you may have to disable it to run `sbt scalafix`, and re-enable it afterwards.
Unless you do not use `imports.organize = false`, you will then have to manually adjust your imports to your liking so that `scala.scalajs.js.annotation.JSGlobal` is imported.

If you want a working example of this process, look at [the PR on scalajs-dom](https://github.com/scala-js/scala-js-dom/pull/277), where we have successfully applied scalafix to the entire codebase.
The commits of the PR provide explanations of the steps we performed, so it's good to look at them (not just the PR diff).

### `@JSExport` on objects and classes becomes `@JSExportTopLevel`

To make a top-level class or object accessible to JavaScript, we previously used the `@JSExport` annotation, like this:

{% highlight scala %}
package foo

@JSExport
object Foo

@JSExport("Bar")
class Bar
{% endhighlight %}

so that they can be accessed from JavaScript as:

{% highlight javascript %}
var fooObject = foo.Foo(); // note the ()
var barObject = new Bar();
{% endhighlight %}

Starting with 0.6.15, `@JSExportTopLevel` should be used instead.
On *classes*, it has exactly the same behavior as `@JSExport`.
On *objects* however, it directly exports the object, rather than a 0-arg function.
Moreover, at least for now, `@JSExportTopLevel` always demands an explicit string argument.

We would therefore update the previous example as follows:

{% highlight scala %}
package foo

@JSExportTopLevel("foo.Foo")
object Foo

@JSExportTopLevel("Bar")
class Bar
{% endhighlight %}

and use it from JavaScript as:

{% highlight javascript %}
var fooObject = foo.Foo; // note the absence of ()
var barObject = new Bar();
{% endhighlight %}

If retaining the 0-arg function is desirable in your use case (so that you do not need to update the JavaScript code), you can do the following instead:

{% highlight scala %}
package foo

object Foo {
  @JSExportTopLevel("foo.Foo")
  protected def jsAccessor(): this.type = this
}
{% endhighlight %}

#### Migration tips

You can temporarily disable the deprecation warnings with the following sbt setting:

{% highlight scala %}
scalacOptions += "-P:scalajs:suppressExportDeprecations"
{% endhighlight %}

This will keep working in 0.6.x.

#### About `js.JSApp`

If you use `js.JSApp`, you need not change anything.
We have seen people do the following (both `extends js.JSApp` *and* `@JSExport`):

{% highlight scala %}
@JSExport
object Foo extends js.JSApp {
  @JSExport
  def main(): Unit = { ... }
}
{% endhighlight %}

This is redundant.
You can safely remove the two `@JSExport`s while leaving the behavior unchanged:

{% highlight scala %}
object Foo extends js.JSApp {
  def main(): Unit = { ... }
}
{% endhighlight %}

### `@JSExportDescendentClasses` and `@JSExportDescendentObjects` are deprecated without (direct) replacement

Those two annotations were basically only used by testing frameworks, to "reflectively" instantiate test classes and objects.
For this use case (and similar ones), read further below about the introduction of the Reflective Instantiation API.

#### Migration tips

**Are you maintaining a testing framework?**
If you use our `TestUtils.newInstance` and/or `TestUtils.loadModule` methods to perform reflective instantiation of `@JSExportDescendent...` things, all you need to do is:

* replace `@JSExportDescendentClasses` and/or `@JSExportDescendentObjects` by `@scala.scalajs.reflect.annotation.EnableReflectiveInstantiation`
* use the new overload of `TestUtils.newInstance`, which uses an explicit list of formal parameters (`TestUtils.loadModule` stays as it was)

You can also temporarily disable the deprecation warnings with the following sbt setting:

{% highlight scala %}
scalacOptions += "-P:scalajs:suppressExportDeprecations"
{% endhighlight %}

This will keep working in 0.6.x.

### `persistLauncher` is deprecated in favor of `scalaJSUseMainModuleInitializer`

The sbt plugin of Scala.js has been providing the `persistLauncher` setting, to enable the automatic creation of a `-launcher.js` file, which calls the main method of your application.
This convenient setting is being deprecated in favor of an even more convenient feature:

{% highlight scala %}
scalaJSUseMainModuleInitializer := true
{% endhighlight %}

will include the call to the `main` method (of a `js.JSApp` object) directly inside the `-fastopt.js` and `-opt.js` files produced by Scala.js.
No need for a `-launcher.js` file at all anymore!

## New features

### `@JSExportStatic`

A long awaited feature was to be able to declare static methods and fields in Scala.js-defined JS classes.
This is now possible, with `@JSExportStatic`.
When defining a Scala.js-defined JS class, this annotation can be used on members *of its companion object*:

{% highlight scala %}
@JSExportTopLevel("Foo")
@ScalaJSDefined
class Foo extends js.Object

object Foo {
  @JSExportStatic
  val a: Int = 42

  @JSExportStatic
  def b(x: Int): Int = x + 1
}
{% endhighlight %}

The members will be available as static members of `Foo`.
Assuming that `Foo` itself is exported to JavaScript (with `@JSExportTopLevel`), then we can access these members as follows:

{% highlight javascript %}
console.log(Foo.a);    // 42
console.log(Foo.b(5)); // 6
{% endhighlight %}

`var`s, getters and setters can also be similarly exported as static.

### `js.Symbol`, `js.Iterable[+A]` and `js.Iterator[+A]`

The standard library now includes definitions for some new ECMAScript 2015 types:

* [`js.Symbol`]({{ site.production_url }}/api/scalajs-library/latest/#scala.scalajs.js.Symbol) represents a JavaScript primitive `symbol`.
* [`js.Iterable[+A]`]({{ site.production_url }}/api/scalajs-library/latest/#scala.scalajs.js.Iterable) is an abstract type for JavaScript objects that can be iterated with `for..of`.
  In Scala.js, they can be iterated using a normal `for` comprehension, as expected.
* [`js.Iterator[+A]`]({{ site.production_url }}/api/scalajs-library/latest/#scala.scalajs.js.Iterator) is a JavaScript iterator, which is the result of the method `[Symbol.iterator]` of iterables.

### `@JSName` accepts JavaScript symbols

In JavaScript types (extending `js.Any`, both native and non-native), members can be annotated with `@JSName("someName")` to specify their JavaScript name, if it needs to be different than the Scala name.
With this release, `@JSName` has been augmented to also accept a reference to a `js.Symbol`.
This is useful/necessary to declare members whose "name" are JavaScript symbols.

For example, one can define a custom JavaScript iterable (which needs to implement a method `[Symbol.iterator]`) as follows:

{% highlight scala %}
@ScalaJSDefined
class SingletonIterable[+A](onlyItem: A) extends js.Iterable[A] {
  @JSName(js.Symbol.iterator)
  def jsIterator(): js.Iterator[A] = new js.Iterator[A] {
    private var done: Boolean = false

    def next(): js.Iterator.Entry[A] = {
      if (done) {
        new js.Iterator.Entry[A] {
          val done: Boolean = true
          def value: Nothing = ???
        }
      } else {
        done = true
        new js.Iterator.Entry[A] {
          val done: Boolean = false
          val value: A = onlyItem
        }
      }
    }
  }
}
{% endhighlight %}

An object of that class can be iterated in JavaScript with a `for..of` loop:

{% highlight javascript %}
for (const item of someSingletonIterable) {
  console.log(item); // displays once the `onlyItem`
}
{% endhighlight %}

### `@JSExportTopLevel` for fields

In addition to being able to use `@JSExportTopLevel` on methods, which was introduced in 0.6.14, as well as on `object`s and `class`es as described above, `@JSExportTopLevel` can also be used on fields (`val`s and `var`s) to export top-level variables to JavaScript.
For example:

{% highlight scala %}
object Foo {
  @JSExportTopLevel("bar")
  val bar = 42

  @JSExportTopLevel("foobar")
  var foobar = "hello"
}
{% endhighlight %}

exports `bar` and `foobar` to the top-level, so that they can be used from JavaScript as

{% highlight javascript %}
console.log(bar);    // 42
console.log(foobar); // "hello"
{% endhighlight %}

If you emit a CommonJS module, the variables are fields of the module instance:

{% highlight javascript %}
const ScalaJSModule = require('foo-fastopt.js');
console.log(ScalaJSModule.bar);    // 42
console.log(ScalaJSModule.foobar); // "hello"
{% endhighlight %}

Note that for `var`s, the JavaScript binding is *read-only*, i.e., JavaScript code cannot assign a new value to an exported `var`.
However, if Scala.js code sets `Foo.foobar`, the new value will be visible from JavaScript.
This is consistent with exporting a `let` binding in ECMAScript 2015 modules, which guided our design.

### Reflective Instantiation API

When we examined the uses of `@JSExportDescendentClasses` and `@JSExportDescendentObjects` found in the wild, we noticed that every time, they were used as a hack to "reflectively" instantiate classes or load objects.
No wonder, since we, the core team, showed the world how to do this for testing frameworks!

In this release, we have added an official, principled API to do so.
The new API is more reliable and powerful, especially for classes inside objects, as well as classes with overloaded constructors.

Reflective instantiation is still not enabled by default for all classes in the world (as that would completely inhibit dead code elimination).
Used on a trait, class or object, the annotation `@EnableReflectiveInstantiation` enables reflective instantiation for all the non-abstract classes and all the objects inheriting from the annotated entity.
Afterwards, it is possible to use the API in [`scala.scalajs.reflect.Reflect`]({{ site.production_url }}/api/scalajs-library/latest/#scala.scalajs.reflect.Reflect$) to instantiate those classes and/or load those objects.

For example:

{% highlight scala %}
package foo

import scala.scalajs.reflect.annotation.EnableReflectiveInstantiation
import scala.scalajs.reflect.Reflect

@EnableReflectiveInstantiation
trait WithReflInstantiation

class Foobar extends WithReflInstantiation

object Foo {
  def doSomeReflInstantiation(): WithReflInstantiation = {
    val className = "foo.Foobar"
    val instantiatableClass = Reflect.lookupInstantiatableClass(className).get
    val instance = instantiatableClass.newInstance()
    instance.asInstanceOf[WithReflInstantiation]
  }
}
{% endhighlight %}

## New JDK parts

* [#2739](https://github.com/scala-js/scala-js/issues/2739) Some methods of `java.lang.{Float,Double}` from JDK 8
* [#2764](https://github.com/scala-js/scala-js/issues/2764) `java.io.DataOutputStream`

## Bug fixes

Among others, the following bugs have been fixed in 0.6.15:

* [#2708](https://github.com/scala-js/scala-js/issues/2708) fastOptJS code not working in JavaScriptCore (JSC)
* [#2712](https://github.com/scala-js/scala-js/issues/2712) `ScalaRunTime.isArray` is buggy for instances of JavaScript classes
* [#2737](https://github.com/scala-js/scala-js/issues/2737) Failure when accessing protected buf in `ByteArrayOutputStream`
* [#2755](https://github.com/scala-js/scala-js/issues/2755) `java.math.BigDecimal.divide` fails when used with a scale and rounding mode

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av0.6.15+is%3Aclosed).
