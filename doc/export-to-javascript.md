---
layout: page
title: Export Scala.js APIs to JavaScript
---
{% include JB/setup %}

**New in Scala.js v0.4**

By default, Scala.js classes, objects, methods and properties are not available
to JavaScript. Entities that have to be accessed from JavaScript must be
annotated explicitly as *exported*. The `@JSExport` annotation is the main way
to do this.

## A simple example

You have probably already seen two uses of `@JSExport` in the `Main` class of
the bootstrapping skeleton (or any other template of Scala.js application):

{% highlight scala %}
package example

import scala.scalajs.js
import js.annotation.JSExport

@JSExport
object HelloWorld {
  @JSExport
  def main(): Unit = {
    println("Hello world!")
  }
}
{% endhighlight %}

This allows to call the `main()` method of `HelloWorld` like this in JavaScript:

{% highlight javascript %}
HelloWorld().main();
{% endhighlight %}

Note the `()` when accessing the object, `HelloWorld` is a function.

This simple pair of `@JSExport` should be sufficient for most application, i.e.,
in cases you only want to get into the entry point of your app, and then live
in the Scala.js world.

## Exporting top-level objects

Put on a top-level object, the `@JSExport` annotation exports a zero-argument
function returning that object in JavaScript's global scope. By default, the
function has the same name as the object in Scala (unqualified).

{% highlight scala %}
@JSExport
object HelloWorld {
  ...
}
{% endhighlight %}

exports the `HelloWorld()` function in JavaScript.

`@JSExport` takes an optional string parameter to specify a non-default name
for JavaScript. For example,

{% highlight scala %}
@JSExport("MainObject")
object HelloWorld {
  ...
}
{% endhighlight %}

exports the `HelloWorld` object under the function `MainObject()` in JavaScript.

The name can contain dots, in which case the exported function is namespaced
in JavaScript.

{% highlight scala %}
@JSExport("myapp.foo.MainObject")
object HelloWorld {
  ...
}
{% endhighlight %}

will be accessible in JavaScript using `myapp.foo.MainObject()`.

## Exporting classes

The `@JSExport` annotation can also be used to export Scala.js classes to
JavaScript (but not traits), or, to be more precise, their constructors. This
allows JavaScript code to create instances of the class.

{% highlight scala %}
@JSExport
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

As is the case for top-level objects, classes can be exported under custom
names, including namespaced ones, by giving an explicit name to `@JSExport`.

## Exporting methods

Similarly to objects, methods of Scala classes, traits and objects can be
exported with `@JSExport`, with or without an explicit name.

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

## Automatically exporting descendent objects
Sometimes it is desirable to automatically export all descendent
objects of a given trait or class. You can use the
`@JSExportDescendentObjects` annotation. It will cause all descendent
objects to be exported to their fully qualified name.

This feature is especially useful in conjunction with exported
abstract methods and is used by the test libraries of Scala.js. The
following is just an example, how the feature can be used:

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
  def test(param: String) = {
    println(param)
  }
}
{% endhighlight %}
