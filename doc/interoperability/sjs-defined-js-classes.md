---
layout: doc
title: Scala.js-defined JS classes
---

As explained in detail in the [guide to write facade types](./calling-javascript.html), classes, traits and objects inheriting from `js.Any` are native by default.
To implement a JavaScript class in Scala.js, it should be annotated with `@ScalaJSDefined`:

{% highlight scala %}
import scala.scalajs.js
import js.annotation._

@ScalaJSDefined
class Foo extends js.Object {
  val x: Int = 4
  def bar(x: Int): Int = x + 1
}
{% endhighlight %}

Such classes are called Scala.js-defined JS classes.
All their members are automatically visible from JavaScript code.
The class itself (its constructor function) is not visible by default, but can be exported with `@JSExport`.
Moreover, they can extend JavaScript classes (native or Scala.js-defined), and, if exported, be extended by JavaScript classes.

Being JavaScript types, the Scala semantics do not apply to these classes.
Instead, JavaScript semantics apply.
For example, overloading is dispatched at run-time, instead of compile-time.


## Restrictions

Scala.js-defined JS types have the following restrictions:

* Private methods cannot be overloaded.
* Qualified private members, i.e., `private[EnclosingScope]`, must be `final`.
* Scala.js-defined JS classes, traits and objects cannot directly extend native JS traits (it is allowed to extend a native JS class).
* Scala.js-defined JS traits cannot declare concrete term members, i.e., they must all be abstract.
* Scala.js-defined JS classes and objects must extend a JS class, for example `js.Object` (they cannot directly extend `AnyRef with js.Any`).
* Declaring a method named `apply` without `@JSName` is illegal.
* Declaring a method with `@JSBracketSelect` or `@JSBracketCall` is illegal.
* Mixing fields, pairs of getter/setter, and/or methods with the same name is illegal. (For example `def foo: Int` and `def foo(x: Int): Int` cannot both exist in the same class.)

There is also one implementation restriction, which will be lifted in a future version:

* A Scala.js-defined JS class cannot have secondary constructors, and its primary constructor cannot have default parameters nor repeated parameters (varargs).


## Semantics


### What JavaScript sees

* `val`s and `var`s become actual JavaScript *fields* of the object, so JavaScript sees a field stored on the object.
* `def`s with `()` become JavaScript *methods* on the prototype.
* `def`s without `()` become JavaScript *getters* on the prototype.
* `def`s whose Scala name ends with `_=` become JavaScript *setters* on the prototype.

In other words, the following definition:

{% highlight scala %}
@ScalaJSDefined
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
@ScalaJSDefined
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


### Scala.js-defined JS object

A Scala.js-defined JS `object` is a singleton instance of Scala.js-defined JS class.
There is nothing special about this, it's just like Scala objects.

Scala.js-defined JS objects are not automatically visible to JavaScript.
They can be `@JSExport`ed just like Scala object: they will appear as a 0-argument function returning the instance of the object.


### Scala.js-defined JS traits

Traits and interfaces do not have any existence in JavaScript.
At best, they are documented contracts that certain classes must satisfy.
So what does it mean to have native JS traits and Scala.js-defined JS traits?

Native JS traits can only be extended by native JS classes, objects and traits.
In other words, a Scala.js-defined JS class/trait/object cannot extend a native JS trait.
They can only extend Scala.js-defined JS traits.

At the moment, Scala.js-defined JS traits cannot declare any concrete term members, i.e., all its `val`s, `var`s and `def`s must be abstract.
So it is not possible to *mix in* traits into Scala.js-defined JS classes.
You can only implement interfaces.

{% highlight scala %}
@ScalaJSDefined
trait Bar extends js.Object {
  val x: Int
  val y: Int = 5 // illegal
  
  def foo(x: Int): Int
  def bar(x: Int): Int = x + 1 // illegal
}
{% endhighlight %}


### Anonymous classes

An anonymous class extending `js.Any` is automatically Scala.js-defined.
This is particularly useful to create typed object literals, in the presence of a Scala.js-defined JS trait describing an interface.
For example:

{% highlight scala %}
@ScalaJSDefined
trait Position extends js.Object {
  val x: Int
  val y: Int
}

val pos = new Position {
  val x = 5
  val y = 10
}
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
@ScalaJSDefined
class Foo extends js.Object {
  def bar(x: String): String = "hello " + x
  def bar(x: Int): Int = x + 1
}

val foo = new Foo
println(foo.bar("world")) // choose at run-time which one to call
{% endhighlight %}

Even though typechecking will resolve to the first overload at compile-time to decide the result type of the function, the actual call will re-resolve at run-time, using the dynamic type of the parameter. Basically something like this is generated:

{% highlight scala %}
@ScalaJSDefined
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
@ScalaJSDefined
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

To obtain the JavaScript constructor function of a Scala.js-defined JS class without instantiating it nor exporting it, you can use [`js.constructorOf[C]`]({{ site.production_url }}/api/scalajs-library/{{ site.scalaJSVersion }}/#scala.scalajs.js.package@constructorOf[T<:scala.scalajs.js.Any]:scala.scalajs.js.Dynamic), whose signature is:

{% highlight scala %}
package object js {
  def constructorOf[C <: js.Any]: js.Dynamic = <stub>
}
{% endhighlight %}

`C` must be a class type (i.e., such that you can give it to `classOf[C]`) and refer to a JS *class* (not a trait nor an object).
It can be a native JS class or a Scala.js-defined JS class.
The method returns the JavaScript constructor function (aka the class value) for `C`.

This can be useful to give to JavaScript libraries expecting constructor functions rather than instances of the classes.
