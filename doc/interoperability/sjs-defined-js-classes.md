---
layout: doc
title: Non-native JS types (aka Scala.js-defined JS types)
---

A non-native JS type, aka Scala.js-defined JS type, is a JavaScript type implemented in Scala.js code.
This is in contrast to native JS types, described in [the facade types reference](./facade-types.html), which represent APIs implemented in JavaScript code.

## About `@ScalaJSDefined`

In Scala.js 0.6.x, the `@ScalaJSDefined` is necessary to declare a non-native JS type, also called a Scala.js-defined JS type.
Starting from Scala.js 1.x however, the annotation is not necessary anymore.
Since Scala.js 0.6.17, you can opt-in for the new semantics of 1.x where `@ScalaJSDefined` is not necessary, by giving the option `-P:scalajs:sjsDefinedByDefault` to scalac.
In an sbt build, this is done with

{% highlight scala %}
scalacOptions += "-P:scalajs:sjsDefinedByDefault"
{% endhighlight %}

The present documentation assumes that you are using this option (or Scala.js 1.x).
Code snippets mention the necessary `@ScalaJSDefined` in comments as a reference for older versions.

## Defining a non-native JS type

Any class, trait or object that inherits from `js.Any` is a JS type.
Often, it will extend `js.Object` which itself extends `js.Any`:

{% highlight scala %}
import scala.scalajs.js
import scala.scalajs.js.annotation._

// @ScalaJSDefined
class Foo extends js.Object {
  val x: Int = 4
  def bar(x: Int): Int = x + 1
}
{% endhighlight %}

Such classes are called *non-native JS classes*, and are also known as Scala.js-defined JS classes (especially in 0.6.x).
All their members are automatically visible from JavaScript code.
The class itself (its constructor function) is not visible by default, but can be exported with `@JSExportTopLevel`.
Moreover, they can extend JavaScript classes (native or not), and, if exported, be extended by JavaScript classes.

Being JavaScript types, the Scala semantics do not apply to these classes.
Instead, JavaScript semantics apply.
For example, overloading is dispatched at run-time, instead of compile-time.


## Restrictions

Non-native JS types have the following restrictions:

* Private methods cannot be overloaded.
* Qualified private members, i.e., `private[EnclosingScope]`, must be `final`.
* Non-native JS classes, traits and objects cannot directly extend native JS traits (it is allowed to extend a native JS class).
* Non-native JS traits cannot declare concrete term members (i.e., they must all be abstract) unless their right-hand-side is exactly `= js.undefined`.
* Non-native JS classes and objects must extend a JS class, for example `js.Object` (they cannot directly extend `AnyRef with js.Any`).
* Declaring a method named `apply` without `@JSName` is illegal.
* Declaring a method with `@JSBracketSelect` or `@JSBracketCall` is illegal.
* Mixing fields, pairs of getter/setter, and/or methods with the same name is illegal. (For example `def foo: Int` and `def foo(x: Int): Int` cannot both exist in the same class.)


## Semantics


### What JavaScript sees

* `val`s and `var`s become actual JavaScript *fields* of the object, so JavaScript sees a field stored on the object.
* `def`s with `()` become JavaScript *methods* on the prototype.
* `def`s without `()` become JavaScript *getters* on the prototype.
* `def`s whose Scala name ends with `_=` become JavaScript *setters* on the prototype.

In other words, the following definition:

{% highlight scala %}
// @ScalaJSDefined
class Foo extends js.Object {
  val x: Int = 5
  var y: String = "hello"
  def z: Int = 42
  def z_=(v: Int): Unit = println("z = " + v)
  def foo(x: Int): Int = x + 1
}
{% endhighlight %}

can be understood as the following ECMAScript 6 class definition (or its desugaring in ES 5.1):

{% highlight javascript %}
class Foo extends global.Object {
  constructor() {
    super();
    this.x = 5;
    this.y = "hello";
  }
  get z() {
    return 42;
  }
  set z(v) {
    console.log("z = " + v);
  }
  foo(x) {
    return x + 1;
  }
}
{% endhighlight %}

The JavaScript names are the same as the field and method names in Scala by default.
You can override this with `@JSName("customName")`.

`private`, `private[this]` and `private[EnclosingScope]` methods, getters and setters are not visible at all from JavaScript.
Private fields, however, will exist on the object, with unpredictable names.
Trying to access them is undefined behavior.

All other members, including protected ones, are visible to JavaScript.


### `super` calls

`super` calls have the semantics of `super` references in ECMAScript 6.
For example:

{% highlight scala %}
// @ScalaJSDefined
class Foo extends js.Object {
  override def toString(): String = super.toString() + " in Foo"
}
{% endhighlight %}

has the same semantics as:

{% highlight javascript %}
class Foo extends global.Object {
  toString() {
    return super.toString() + " in Foo";
  }
}
{% endhighlight %}

which, in ES 5.1, gives something like

{% highlight javascript %}
Foo.prototype.toString = function() {
  return global.Object.prototype.toString.call(this) + " in Foo";
};
{% endhighlight %}

For fields, getters and setters, the ES 6 spec is a bit complicated, but it essentially "does the right thing".
In particular, calling a super getter or setter works as expected.


### Non-native JS object

A non-native JS `object` is a singleton instance of a non-native JS class.
There is nothing special about this, it's just like Scala objects.

Non-native JS objects are not automatically visible to JavaScript.
They can be exported with `@JSExportTopLevel`, just like Scala object: they will appear as a 0-argument function returning the instance of the object.


### Non-native JS traits

Traits and interfaces do not have any existence in JavaScript.
At best, they are documented contracts that certain classes must satisfy.
So what does it mean to have native and non-native JS traits?

Native JS traits can only be extended by native JS classes, objects and traits.
In other words, a non-native JS class/trait/object cannot extend a native JS trait.
They can only extend non-native JS traits.

Term members (`val`s, `var`s and `def`s) in non-native JS traits must:

* either be abstract,
* or have `= js.undefined` as right-hand-side (and not be a `def` with `()`).

{% highlight scala %}
// @ScalaJSDefined
trait Bar extends js.Object {
  val x: Int
  val y: Int = 5 // illegal
  val z: js.UndefOr[Int] = js.undefined

  def foo(x: Int): Int
  def bar(x: Int): Int = x + 1 // illegal
  def foobar(x: Int): js.UndefOr[Int] = js.undefined // illegal
  def babar: js.UndefOr[Int] = js.undefined
}
{% endhighlight %}

Unless overridden in a class or objects, concrete `val`s, `var`s and `def`s declared
in a JavaScript trait (necessarily with `= js.undefined`) are *not* exposed to JavaScript at all.
For example, implementing (the legal parts of) `Bar` in a subclass:

{% highlight scala %}
// @ScalaJSDefined
class Babar extends Bar {
  val x: Int = 42

  def foo(x: Int): Int = x + 1

  override def babar: js.UndefOr[Int] = 3
}
{% endhighlight %}

has the same semantics as the following ECMAScript 2015 class:

{% highlight javascript %}
class Babar extends global.Object { // `extends Bar` disappears
  constructor() {
    super();
    this.x = 42;
  }
  foo(x) {
    return x + 1;
  }
  get babar() {
    return 3;
  }
}
{% endhighlight %}

Note that `z` is not defined at all, not even as `this.z = undefined`.
The distinction is rarely relevant, because `babar.z` will return `undefined` in JavaScript
and in Scala.js if `babar` does not have a field `z`.


### Static members

When defining a non-native JS class (not a trait nor an object), it is also possible to define static members.
Static members must be defined in the companion object of the class, and annotated with `@JSExportStatic`.
For example:

{% highlight scala %}
// @ScalaJSDefined
class Foo extends js.Object

object Foo {
  @JSExportStatic
  val x: Int = 5

  @JSExportStatic
  var y: String = "hello"

  @JSExportStatic
  def z: Int = 42
  @JSExportStatic
  def z_=(v: Int): Unit = println("z = " + v)

  @JSExportStatic
  def foo(x: Int): Int = x + 1
}
{% endhighlight %}

defines a JavaScript class `Foo` with a variety of static members.
It can be understood as if defined in JavaScript as:

{% highlight javascript %}
class Foo extends global.Object {
  static get z() {
    return 42;
  }
  static set z(v) {
    console.log("z = " + v);
  }
  static foo(x) {
    return x + 1;
  }
}
Foo.x = 5;
Foo.y = "hello";
{% endhighlight %}

Note that JavaScript doesn't have any declarative syntax for static fields, hence the two imperative assignments at the end.

#### Restrictions

* The companion object must be a Scala object, i.e., it cannot extend `js.Any`.
* `lazy val`s cannot be marked with `@JSExportStatic`
* Static *fields* (`val`s and `var`s) must be defined before any other (non-static) field, as well as before any constructor statement.

As an example of the last bullet, the following snippet is illegal:

{% highlight scala %}
// @ScalaJSDefined
class Foo extends js.Object

object Foo {
  val x: Int = 5

  @JSExportStatic
  val y: String = "hello" // illegal, defined after `x` which is non-static
}
{% endhighlight %}

and so is the following:

{% highlight scala %}
// @ScalaJSDefined
class Foo extends js.Object

object Foo {
  println("Initializing Foo")

  @JSExportStatic
  val y: String = "hello" // illegal, defined after the `println` statement
}
{% endhighlight %}


### Anonymous classes

Anonymous JS classes are particularly useful to create typed object literals, in the presence of a non-native JS trait describing an interface.
For example:

{% highlight scala %}
// @ScalaJSDefined
trait Position extends js.Object {
  val x: Int
  val y: Int
}

val pos = new Position {
  val x = 5
  val y = 10
}
{% endhighlight %}

Note that anonymous classes extending `js.Any` are always non-native, even in 0.6.x without `-P:scalajs:sjsDefinedByDefault` nor `@ScalaJSDefined`.

#### Use case: configuration objects

For configuration objects that have fields with default values, concrete members with `= js.undefined` can be used in the trait.
For example:

{% highlight scala %}
// @ScalaJSDefined
trait JQueryAjaxSettings extends js.Object {
  val data: js.UndefOr[js.Object | String | js.Array[Any]] = js.undefined
  val contentType: js.UndefOr[Boolean | String] = js.undefined
  val crossDomain: js.UndefOr[Boolean] = js.undefined
  val success: js.UndefOr[js.Function3[Any, String, JQueryXHR, _]] = js.undefined
  ...
}
{% endhighlight %}

When calling `ajax()`, we can now give an anonymous object that overrides only the `val`s we care about:

{% highlight scala %}
jQuery.ajax(someURL, new JQueryAjaxSettings {
  override val crossDomain: js.UndefOr[Boolean] = true
  override val success: js.UndefOr[js.Function3[Any, String, JQueryXHR, _]] = {
    js.defined { (data: Any, textStatus: String, xhr: JQueryXHR) =>
      println("Status: " + textStatus)
    }
  }
})
{% endhighlight %}

Note that for functions, we use `js.defined { ... }` to drive Scala's type inference.
Otherwise, it needs to apply two implicit conversions, which is not allowed.

The explicit types are quite annoying, but they are only necessary in Scala 2.10 and 2.11.
If you use Scala 2.12, you can omit all the type annotations (but keep `js.defined`), thanks to improved type inference for `val`s and SAM conversions:

{% highlight scala %}
jQuery.ajax(someURL, new JQueryAjaxSettings {
  override val crossDomain = true
  override val success = js.defined { (data, textStatus, xhr) =>
    println("Status: " + textStatus)
  }
})
{% endhighlight %}

#### Caveat with reflective calls

It is possible to *define* an object literal with the anonymous class syntax without the support of a super class or trait defining the API, like this:

{% highlight scala %}
val pos = new js.Object {
  val x = 5
  val y = 10
}
{% endhighlight %}

However, it is thereafter impossible to access its members easily.
The following does not work:

{% highlight scala %}
println(pos.x)
{% endhighlight %}

This is because `pos` is a *structural type* in this case, and accessing `x` is known as a *reflective call* in Scala.
Reflective calls are not supported on values with JavaScript semantics, and will fail at runtime.
Fortunately, the compiler will warn you against reflective calls, unless you use the relevant language import.

Our advice: do not use the reflective calls language import.


### Run-time overloading

{% highlight scala %}
// @ScalaJSDefined
class Foo extends js.Object {
  def bar(x: String): String = "hello " + x
  def bar(x: Int): Int = x + 1
}

val foo = new Foo
println(foo.bar("world")) // choose at run-time which one to call
{% endhighlight %}

Even though typechecking will resolve to the first overload at compile-time to decide the result type of the function, the actual call will re-resolve at run-time, using the dynamic type of the parameter. Basically something like this is generated:

{% highlight scala %}
// @ScalaJSDefined
class Foo extends js.Object {
  def bar(x: Any): Any = {
    x match {
      case x: String => "hello " + x
      case x: Int    => x + 1
    }
  }
}
{% endhighlight %}

Besides the run-time overhead incurred by such a resolution, this can cause weird problems if overloads are not mutually exclusive.
For example:

{% highlight scala %}
// @ScalaJSDefined
class Foo extends js.Object {
  def bar(x: String): String = bar(x: Any)
  def bar(x: Any): String = "bar " + x
}

val foo = new Foo
println(foo.bar("world")) // infinite recursion
{% endhighlight %}

With compile-time overload resolution, the above would be fine, as the call to `bar(x: Any)` resolves to the second overload, due to the static type of `Any`.
With run-time overload resolution, however, the type tests are executed again, and the actual run-time type of the argument is still `String`, which causes an infinite recursion.


## Goodies


### `js.constructorOf[C]`

To obtain the JavaScript constructor function of a JS class (native or not) without instantiating it nor exporting it, you can use [`js.constructorOf[C]`]({{ site.production_url }}/api/scalajs-library/latest/#scala.scalajs.js.package@constructorOf[T<:scala.scalajs.js.Any]:scala.scalajs.js.Dynamic), whose signature is:

{% highlight scala %}
package object js {
  def constructorOf[C <: js.Any]: js.Dynamic = <stub>
}
{% endhighlight %}

`C` must be a class type (i.e., such that you can give it to `classOf[C]`) and refer to a JS *class* (not a trait nor an object).
The method returns the JavaScript constructor function (aka the class value) for `C`.

This can be useful to give to JavaScript libraries expecting constructor functions rather than instances of the classes.

### `js.ConstructorTag[C]`

[`js.ConstructorTag[C]`]({{ site.production_url }}/api/scalajs-library/latest/#scala.scalajs.js.ConstructorTag) is to [`js.constructorOf[C]`]({{ site.production_url }}/api/scalajs-library/latest/#scala.scalajs.js.package@constructorOf[T<:scala.scalajs.js.Any]:scala.scalajs.js.Dynamic) as `ClassTag[C]` is to `classOf[C]`, i.e., you can use an `implicit` parameter of type `js.ConstructorTag[C]` to implicitly get a `js.constructorOf[C]`.
For example:

{% highlight scala %}
def instantiate[C <: js.Any : js.ConstructorTag]: C =
  js.Dynamic.newInstance(js.constructorTag[C].constructor)().asInstanceOf[C]

val newEmptyJSArray = instantiate[js.Array[Int]]
{% endhighlight %}

Implicit expansion will desugar the above code into:

{% highlight scala %}
def instantiate[C <: js.Any](implicit tag: js.ConstructorTag[C]): C =
  js.Dynamic.newInstance(tag.constructor)().asInstanceOf[C]

val newEmptyJSArray = instantiate[js.Array[Int]](
    new js.ConstructorTag[C](js.constructorOf[js.Array[Int]]))
{% endhighlight %}

although you cannot write the desugared version in user code because the constructor of `js.ConstructorTag` is private.

This feature is particularly useful for Scala.js libraries wrapping JavaScript frameworks expecting to receive JavaScript constructors as parameters.
