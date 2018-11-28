---
layout: doc
title: Export Scala.js APIs to JavaScript
---

By default, Scala.js classes, objects, methods and properties are not available
to JavaScript. Entities that have to be accessed from JavaScript must be
annotated explicitly as *exported*, using `@JSExportTopLevel` and `@JSExport`.

## A simple example

{% highlight scala %}
package example

import scala.scalajs.js.annotation._

@JSExportTopLevel("HelloWorld")
object HelloWorld {
  @JSExport
  def sayHello(): Unit = {
    println("Hello world!")
  }
}
{% endhighlight %}

This allows to call the `sayHello()` method of `HelloWorld` like this in
JavaScript:

{% highlight javascript %}
HelloWorld.sayHello();
{% endhighlight %}

The `@JSExportTopLevel` on `HelloWorld` exports the object `HelloWorld` itself
in the JavaScript global scope. It is however not sufficient to allow JavaScript
to call *methods* of `HelloWorld`. This is why we also have to export the
method `sayHello()` with `@JSExport`.

In general, things that should be exported on the top-level, such as top-level
objects and classes, are exported with `@JSExportTopLevel`, while things that
should be exported as *properties* or *methods* in JavaScript are exported with
`@JSExport`.

## Exporting top-level objects

Put on a top-level object, the `@JSExportTopLevel` annotation exports that
object to the JavaScript global scope. The name under which it is to be exported
must be specified as an argument to `@JSExportTopLevel`.

{% highlight scala %}
@JSExportTopLevel("HelloWorld")
object HelloWorld {
  ...
}
{% endhighlight %}

exports the `HelloWorld` object in JavaScript.

**Pre 0.6.15 note**: Before Scala.js 0.6.15, objects were exported as 0-argument
functions using `@JSExport`, rather than directly with `@JSExportTopLevel`. This
is deprecated in 0.6.x, and not supported anymore in Scala.js 1.x.

### Exporting under a namespace (deprecated)

**Note:** Deprecated since Scala.js 0.6.26, and not supported anymore in Scala.js 1.x.

The export name can contain dots, in which case the exported object is namespaced in JavaScript.
For example,

{% highlight scala %}
@JSExportTopLevel("myapp.foo.MainObject")
object HelloWorld {
  ...
}
{% endhighlight %}

will be accessible in JavaScript using `myapp.foo.MainObject`.

## Exporting classes

The `@JSExportTopLevel` annotation can also be used to export Scala.js classes
to JavaScript (but not traits), or, to be more precise, their constructors. This
allows JavaScript code to create instances of the class.

{% highlight scala %}
@JSExportTopLevel("Foo")
class Foo(val x: Int) {
  override def toString(): String = s"Foo($x)"
}
{% endhighlight %}

exposes `Foo` as a constructor function to JavaScript:

{% highlight javascript %}
var foo = new Foo(3);
console.log(foo.toString());
{% endhighlight %}

will log the string `"Foo(3)"` to the console. This particular example works
because it calls `toString()`, which is always exported to JavaScript. Other
methods must be exported explicitly as shown in the next section.

**Pre 0.6.15 note**: Before Scala.js 0.6.15, classes were exported using
`@JSExport` instead of `@JSExportTopLevel`, with the same meaning. This is
deprecated in 0.6.x, and not supported anymore in Scala.js 1.x.

## Exports with modules

When [emitting a module for Scala.js code](../project/module.html), top-level exports are not sent to the JavaScript global scope.
Instead, they are genuinely exported from the module.
In that case, an `@JSExportTopLevel` annotation has the semantics of an [ECMAScript 2015 export](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export).
For example:

{% highlight scala %}
@JSExportTopLevel("Bar")
class Foo(val x: Int)
{% endhighlight %}

is semantically equivalent to this JavaScript export:

{% highlight javascript %}
export { Foo as Bar };
{% endhighlight %}

## Exporting methods

Similarly to objects, methods of Scala classes, traits and objects can be
exported with `@JSExport`. Unlike for `@JSExportTopLevel`, the name argument is
optional for `@JSExport`, and defaults to the Scala name of the method.

{% highlight scala %}
class Foo(val x: Int) {
  @JSExport
  def square(): Int = x*x // note the (), omitting them has a different behavior
  @JSExport("foobar")
  def add(y: Int): Int = x+y
}
{% endhighlight %}

Given this definition, and some variable `foo` holding an instance of `Foo`,
you can call:

{% highlight javascript %}
console.log(foo.square());
console.log(foo.foobar(5));
// console.log(foo.add(3)); // TypeError, add is not a member of foo
{% endhighlight %}

### Overloading

Several methods can be exported with the same JavaScript name (either because
they have the same name in Scala, or because they have the same explicit
JavaScript name as parameter of `@JSExport`). In that case, run-time overload
resolution will decide which method to call depending on the number and run-time
types of arguments passed to the the method.

For example, given these definitions:

{% highlight scala %}
class Foo(val x: Int) {
  @JSExport
  def foobar(): Int = x
  @JSExport
  def foobar(y: Int): Int = x+y
  @JSExport("foobar")
  def bar(b: Boolean): Int = if (b) 0 else x
}
{% endhighlight %}

the following calls will dispatch to each of the three methods:

{% highlight javascript %}
console.log(foo.foobar());
console.log(foo.foobar(5));
console.log(foo.foobar(false));
{% endhighlight %}

If the Scala.js compiler cannot produce a dispatching code capable of reliably
disambiguating overloads, it will issue a compile error (with a somewhat cryptic
message):

{% highlight scala %}
class Foo(val x: Int) {
  @JSExport
  def foobar(): Int = x
  @JSExport
  def foobar(y: Int): Int = x+y
  @JSExport("foobar")
  def bar(i: Int): Int = if (i == 0) 0 else x
}
{% endhighlight %}

gives:

    [error] HelloWorld.scala:16: double definition:
    [error] method $js$exported$meth$foobar:(i: Int)Any and
    [error] method $js$exported$meth$foobar:(y: Int)Any at line 14
    [error] have same type
    [error]   @JSExport("foobar")
    [error]    ^
    [error] one error found

Hint to recognize this error: the methods are named `$js$exported$meth$`
followed by the JavaScript export name.

### <a name="JSExportNamed"></a> Exporting for call with named parameters (deprecated)

**Note:** Since Scala.js 0.6.11, `@JSExportNamed` is deprecated, and is not supported anymore in Scala.js 1.x.
Refer to [the Scaladoc]({{ site.production_url }}/api/scalajs-library/0.6.18/#scala.scalajs.js.annotation.JSExportNamed) for migration tips.

It is customary in Scala to call methods with named parameters if this eases understanding of the code or if many arguments with default values are present:

{% highlight scala %}
def foo(x: Int = 1, y: Int = 2, z: Int = 3) = ???

foo(y = 3, x = 2)
{% endhighlight %}

A rough equivalent in JavaScript is to pass an object with the respective properties:
{% highlight javascript %}
foo({
  y: 3,
  x: 2
});
{% endhighlight %}

The `@JSExportNamed` annotation allows to export Scala methods for use in JavaScript with named parameters:

{% highlight scala %}
class A {
  @JSExportNamed
  def foo(x: Int, y: Int = 2, z: Int = 3) = ???
}
{% endhighlight %}

Note that default parameters are not required. `foo` can then be called like this:
{% highlight javascript %}
var a = // ...
a.foo({
  y: 3,
  x: 2
});
{% endhighlight %}

Not specifying `x` in this case will fail at runtime (since it does not have a default value).

Just like `@JSExport`, `@JSExportNamed` takes the name of the exported method as an optional argument.

## Exporting top-level methods

While an `@JSExport`ed method inside an `@JSExportTopLevel` object allows JavaScript code to call a "static" method,
it does not feel like a top-level function from JavaScript's point of view.
`@JSExportTopLevel` can also be used directory on a method of a top-level
object, which exports the method as a truly top-level function:

{% highlight scala %}
object A {
  @JSExportTopLevel("foo")
  def foo(x: Int): Int = x + 1
}
{% endhighlight %}

can be called from JavaScript as:

{% highlight javascript %}
const y = foo(5);
{% endhighlight %}

## Exporting properties

`val`s, `var`s and `def`s without parentheses, as well as `def`s whose name
ends with `_=`, have a single argument and `Unit` result type, are
exported to JavaScript as properties with getters and/or setters
using, again, the `@JSExport` annotation.

Given this weird definition of a halfway mutable point:

{% highlight scala %}
@JSExport
class Point(_x: Double, _y: Double) {
  @JSExport
  val x: Double = _x
  @JSExport
  var y: Double = _y
  @JSExport
  def abs: Double = Math.sqrt(x*x + y*y)
  @JSExport
  def sum: Double = x + y
  @JSExport
  def sum_=(v: Double): Unit = y = v - x
}
{% endhighlight %}

JavaScript code can use the properties as follows:

{% highlight javascript %}
var point = new Point(4, 10)
console.log(point.x);   // 4
console.log(point.y);   // 10
point.y = 20;
console.log(point.y);   // 20
point.x = 1;            // does nothing, thanks JS semantics
console.log(point.x);   // still 4
console.log(point.abs); // 20.396078054371138
console.log(point.sum); // 24
point.sum = 30;
console.log(point.sum); // 30
console.log(point.y);   // 26
{% endhighlight %}

As usual, explicit names can be given to `@JSExport`. For `def` setters, the
JS name must be specified *without* the trailing `_=`.

`def` setters must have a result type of `Unit` and exactly one parameter. Note
that several `def` setters with different types for their argument can be
exported under a single, overloaded JavaScript name.

In case you overload properties in a way the compiler cannot
disambiguate, the methods in the error messages will be prefixed by
`$js$exported$prop$`.

### <a name="constructor-params"></a> Export fields directly declared in constructors
If you want to export fields that are directly declared in a class constructor, you'll have to use the `@field` meta annotation to avoid annotating the constructor arguments (exporting an argument is nonsensical and will fail):

{% highlight scala %}
import scala.annotation.meta.field

class Point(
    @(JSExport @field) val x: Double,
    @(JSExport @field) val y: Double)

// Also applies to case classes
case class Point(
    @(JSExport @field) x: Double,
    @(JSExport @field) y: Double)
{% endhighlight %}

## Export fields to the top level

Similarly to methods, fields (`val`s and `var`s) of top-level objects can be
exported as top-level variables using `@JSExportTopLevel`:

{% highlight scala %}
object Foo {
  @JSExportTopLevel("bar")
  val bar = 42

  @JSExportTopLevel("foobar")
  var foobar = "hello"
}
{% endhighlight %}

exports `bar` and `foobar` to the top-level, so that they can be used from
JavaScript as

{% highlight javascript %}
console.log(bar);    // 42
console.log(foobar); // "hello"
{% endhighlight %}

Note that for `var`s, the JavaScript binding is *read-only*, i.e., JavaScript
code cannot assign a new value to an exported `var`. However, if Scala.js code
sets `Foo.foobar`, the new value will be visible from JavaScript. This is
consistent with exporting a `let` binding in ECMAScript 2015 modules.

## <a name="JSExportAll"></a> Automatically export all members
Instead of writing `@JSExport` on every member of a class or object, you may use the `@JSExportAll` annotation. It is equivalent to adding `@JSExport` on every public (term) member directly declared in the class/object:

{% highlight scala %}
class A {
  def mul(x: Int, y: Int): Int = x * y
}

@JSExportAll
class B(val a: Int) extends A {
  def sum(x: Int, y: Int): Int = x + y
}
{% endhighlight %}

This is strictly equivalent to writing:

{% highlight scala %}
class A {
  def mul(x: Int, y: Int): Int = x * y
}

class B(@(JSExport @field) val a: Int) extends A {
  @JSExport
  def sum(x: Int, y: Int): Int = x + y
}
{% endhighlight %}

It is important to note that this does **not** export inherited members. If you wish to do so, you'll have to override them explicitly:

{% highlight scala %}
class A {
  def mul(x: Int, y: Int): Int = x * y
}

@JSExportAll
class B(val a: Int) extends A {
  override def mul(x: Int, y: Int): Int = super.mul(x,y)
  def sum(x: Int, y: Int): Int = x + y
}
{% endhighlight %}

## Deprecated: Automatically exporting descendent objects or classes

**Pre 0.6.15 note**: Before Scala.js 0.6.15, this deprecated feature used to be
often used to "reflectively" instantiate classes and load objects. This use case
has been replaced by the
[`scala.scalajs.reflect.Reflect`]({{ site.production_url }}/api/scalajs-library/latest/#scala.scalajs.reflect.Reflect$)
API.
This feature is not supported anymore in Scala.js 1.x.

When applied to a class or trait, `@JSExportDescendentObjects` causes all
objects extending it to be automatically exported as 0-arg functions, under
their fully qualified name. For example:

{% highlight scala %}
package foo.test

@JSExportDescendentObjects
trait Test {
  @JSExport
  def test(param: String): Unit
}

// automatically exported as foo.test.Test1
object Test1 extends Test {
  // exported through inheritance
  def test(param: String): Unit = {
    println(param)
  }
}
{% endhighlight %}

can be used from JavaScript as:

{% highlight javascript %}
foo.test.Test1().test("hello"); // note the () in Test1()
{% endhighlight %}

Similarly, `@JSExportDescendentClasses` causes all non-abstract classes
the annotated class or trait to be exported under their fully qualified name.
