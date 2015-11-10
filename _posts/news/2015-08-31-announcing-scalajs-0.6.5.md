---
layout: post
title: Announcing Scala.js 0.6.5
category: news
tags: [releases]
---


We are thrilled to announce the release of Scala.js 0.6.5!

This is probably *the most important release since Scala.js 0.5.0*!
It brings significant advances to interoperability with JavaScript:

* You can now implement subclasses of JavaScript classes and traits in Scala.js!
* Using the same semantics, you can now define object literals with `new js.Object { val x = 5 }`
* There is a new unboxed pseudo-union type `A | B` to more accurately type your JavaScript facades
* You can statically typecheck that the `@JSExport`s of a Scala class comply with a JavaScript facade trait with `js.use(x).as[T]`
<!--more-->

## Getting started

If you are new to Scala.js, head over to
[the tutorial]({{ BASE_PATH }}/doc/tutorial.html).

## Release notes

For changes in the 0.6.x series compared to 0.5.x, read [the announcement of 0.6.0]({{ BASE_PATH }}/news/2015/02/05/announcing-scalajs-0.6.0/).

As a minor release, 0.6.5 is backward source and binary compatible with previous releases in the 0.6.x series.
Libraries compiled with earlier versions can be used with 0.6.5 without change.
However, it is not forward compatible: libraries compiled with 0.6.5 cannot be used by projects using 0.6.{0-4}.

Please report any issues [on GitHub](https://github.com/scala-js/scala-js/issues).

## Important new warnings

When upgrading from 0.6.{0-4}, you will get new warnings on the declarations of your facade types, i.e., traits, classes and objects extending `js.Any`.
For example:

{% highlight scala %}
import scala.scalajs.js

class Foo extends js.Object {
  def bar(x: Int): Int = js.native
}
{% endhighlight %}

will have the following warning:

    Foo.scala:3: warning: Classes, traits and objects inheriting from js.Any should be annotated
      with @js.native, unless they have @ScalaJSDefined.
      The default will switch to Scala.js-defined in the next major version of Scala.js.
    class Foo extends js.Object
          ^

As the text says, you should simply add the `@js.native` annotation to the declaration of `Foo` to silence the warning:

{% highlight scala %}
import scala.scalajs.js

@js.native
class Foo extends js.Object {
  def bar(x: Int): Int = js.native
}
{% endhighlight %}

Addressing these warnings is important to make your source code forward compatible with the next major version of Scala.js.
An unannotated declaration extending `js.Any` will by default be Scala.js-defined (see next section) in the next version.

## Improvements

### Scala.js-defined JS classes, objects, and traits

Scala.js 0.6.5 introduces a major language improvement: the ability to define, in Scala.js, a subclass of a native JavaScript class (or implementing a JavaScript trait/interface).
We call such classes *Scala.js-defined JS classes*, because they are effectively JavaScript classes, but written in Scala.js; whereas classes that you typically write are Scala classes, not JavaScript classes.

{% highlight scala %}
import scala.scalajs.js
import scala.scalajs.js.annotation._

@ScalaJSDefined
class Foo extends js.Object {
  def bar(x: Int): Int = x + 1
}
{% endhighlight %}

Note that the body of `bar()` is implemented in Scala.js, instead of being `= js.native`.

A Scala.js-defined JS class is not a facade type to a JavaScript library.
Instead, it is fully implemented in Scala.js.
Unlike Scala classes, which require exports, all members of Scala.js-defined JS classes are automatically visible from JavaScript code.
The class itself is not automatically visible; if you want it to be, you can `@JSExport` it.
You can also use [`js.constructorOf[C]`]({{ site.production_url }}/api/scalajs-library/0.6.5/#scala.scalajs.js.package@constructorOf[T<:scala.scalajs.js.Any]:scala.scalajs.js.Dynamic) to obtain the JS constructor function and pass it to a JavaScript library.

Scala.js-defined JS classes have JavaScript semantics instead of Scala semantics.
You can read more about that in [the documentation]({{ BASE_PATH }}/doc/sjs-defined-js-classes.html).
Most importantly, that means overloading dispatch is done at run-time instead of compile-time.

You can also declare Scala.js-defined JS `object`s as singletons, just like `object`s in Scala.

#### Traits

Scala.js-defined JS traits are restricted: they cannot declare any concrete term member, i.e., all their `val`s, `var`s and `def`s must be abstract.

{% highlight scala %}
import scala.scalajs.js
import scala.scalajs.js.annotation._

@ScalaJSDefined
trait Foo extends js.Object {
  val x: Int     // ok
  val y: Int = 5 // illegal

  def foo(x: Int): Int         // ok
  def bar(x: Int): Int = x + 1 // illegal
}
{% endhighlight %}

Scala.js-defined JS classes, objects and traits cannot directly extend native JS traits (i.e., non-Scala.js-defined JS traits).

#### Anonymous classes and object literals

Anonymous classes extending a JS class and/or trait are automatically Scala.js-defined.
Combined with Scala.js-defined JS traits, this is very useful to write typechecked object literals with Scala syntax:

{% highlight scala %}
import scala.scalajs.js
import scala.scalajs.js.annotation._

@ScalaJSDefined
trait Position extends js.Object {
  val x: Int
  val y: Int
}

val obj = new Position {
  val x = 5
  val y = 10
}
{% endhighlight %}

In previous versions, `obj` would have been written with a non-typechecked `js.Dynamic.literal`:

{% highlight scala %}
import scala.scalajs.js

val obj = js.Dynamic.literal(
    x = 5,
    y = 10
).asInstanceOf[Position]
{% endhighlight %}

### Pseudo-union type `A | B`

Many JavaScript libraries have APIs with parameters or values that accept different types of values.
To be able to accurately type those libraries, Scala.js 0.6.5 features an unboxed, facade-friendly pseudo-union type [`A | B`]({{ site.production_url }}/api/scalajs-library/0.6.5/#scala.scalajs.js.$bar).
Here are a couple of examples of what it can do:

{% highlight scala %}
import scala.scalajs.js.|

val a: Int | String = 5
val b: Int | String = "hello"
val c: String | Int = a
val d: Int | Boolean | String = true
val e: Int | Boolean | String = c
val f: AnyVal | String = e
val g: Any = f.merge

// the following examples do not compile
val x: Int | String = 3.4
val y: Int | Boolean = d
{% endhighlight %}

See [the complete test cases](https://github.com/scala-js/scala-js/tree/v0.6.5/test-suite/src/test/scala/org/scalajs/testsuite/library/UnionTypeTest.scala) to get the complete picture.

### `js.use(x).as[T]`: statically typecheck your exports

Sometimes, you `@JSExport` members of your Scala classes so that they comply with some JavaScript interface, for example to pass it to a JavaScript library expecting some fields and methods on your object.
In 0.6.4 and before, you needed to take care yourself of exporting everything that was required, and then probably do a hard-cast:

{% highlight scala %}
import scala.scalajs.js

trait SomeInterface extends js.Object {
  val x: Int = js.native
  def foo(x: Int): Int = js.native
}

object SomeLibrary extends js.Object {
  def doSomething(obj: SomeInterface): Unit = js.native
}

class InterfaceImpl {
  @JSExport val x: Int = 4
  @JSExport def foo(x: Int): Int = x + 1
}

SomeLibrary.doSomething(new InterfaceImpl().asInstanceOf[SomeInterface])
{% endhighlight %}

If you mess up your exports, you will have trouble at run-time.

In 0.6.5, you can write the following instead:

{% highlight scala %}
SomeLibrary.doSomething(js.use(new InterfaceImpl()).as[SomeInterface])
{% endhighlight %}

Unlike `x.asInstanceOf[T]`, the `js.use(x).as[T]` idiom *statically typechecks* that you have all the exports required to comply to the JavaScript interface.

### Java library additions

* The complete set of `Character.isXYZ` methods (to test Unicode properties of characters)
* `java.lang.Math.rint(Double)`
* `java.util.concurrent.ThreadLocalRandom`
* `java.util.TreeSet` and `java.util.NavigableSet`

## Bug fixes

Among others, the following bugs have been fixed:

* [#1818](https://github.com/scala-js/scala-js/issues/1818) Performance bottleneck in one of the steps of the linker (fast- and fullOptJS)
* [#1759](https://github.com/scala-js/scala-js/issues/1759) `new Int8Array(n).toArray` throws `TypeError` (second run)
* [#1790](https://github.com/scala-js/scala-js/issues/1790) Compiler crash with a dash in a parameter of a lambda
* [#1799](https://github.com/scala-js/scala-js/issues/1799) `java.lang.Iterable` is incorrectly in `java.util`
* [#1819](https://github.com/scala-js/scala-js/issues/1819) `Double` doesn't match `Float` even with non-strict floats
* [#1836](https://github.com/scala-js/scala-js/issues/1836) `BigInteger.ONE.gcd(x)` loops forever
* [#1857](https://github.com/scala-js/scala-js/issues/1857) `j.l.Math.{abs,min,max}` do not handle correctly `-0.0`
* [#1777](https://github.com/scala-js/scala-js/issues/1777) Bug with `java.util.LinkedList.size` when larger than `Int.MaxValue`.

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av0.6.5+is%3Aclosed).
