---
layout: page
title: Calling JavaScript from Scala.js
---
{% include JB/setup %}

When writing an application with Scala.js, it is expected that the main
application logic be written in Scala.js, and that existing JavaScript libraries
are leveraged. Calling JavaScript from Scala.js is therefore the most important
direction of interoperability.

Because JavaScript is dynamically typed, it is possible to call JS libraries in
a dynamically typed way. However, it is also possible to interop with static
types, for better leveraging of Scala.

## Pre-defined JavaScript types

Primitive JavaScript types (`number`, `boolean`, `string`, `null` and
`undefined`) are represented by their natural equivalent in Scala, as shown
in the [type equivalence table](./js-interoperability.html#type-correspondance).

For other pre-defined JavaScript types, such as arrays and functions, the
package `scala.scalajs.js`
([ScalaDoc]({{ site.production_url }}/api/scalajs-library/{{ site.scalaJSVersion }}/#scala.scalajs.js.package))
provides dedicated definitions.

The class hierarchy for these standard types is as follows:

    js.Any
     +- js.Object
     |   +- js.Date
     |   +- js.RegExp
     |   +- js.Array[A]
     |   +- js.Function
     |       +- js.Function0[+R]
     |       +- js.Function1[-T1, +R]
     |       +- ...
     |       +- js.Function22[-T1, ..., -T22, +R]
     |       +- js.ThisFunction
     |           +- js.ThisFunction0[-T0, +R]
     |           +- js.ThisFunction1[-T0, -T1, +R]
     |           +- ...
     |           +- js.ThisFunction21[-T0, ..., -T21, +R]
     +- js.Dictionary[A]

Note that most of these types are similar to standard Scala types. For example,
`js.Array[A]` is similar to `scala.Array[A]`, and `js.FunctionN` is similar to
`scala.FunctionN`.
However, they are not completely equivalent, and must not be confused.

With the exception of `js.Array[A]` and `js.Dictionary[A]`, these types have
all the fields and methods available in the JavaScript API.
The collection types feature the standard Scala collection API instead, so that
they can be used idiomatically in Scala code.

**0.5.x note**: In Scala.js 0.5.x, `js.Array[A]` and `js.Dictionary[A]` did not
really have the collection API. The methods defined in JavaScript took
precedence. This was changed in 0.6.x to avoid pitfalls when confusing the
APIs, avoiding common JavaScript warts, and improving performance.

## Function types

### `js.Function` and its subtypes

`js.FunctionN[T1, ..., TN, R]` is, as expected, the type of a JavaScript
function taking N parameters of types `T1` to `TN`, and returning a value of
type `R`.

There are implicit conversions from `scala.FunctionN` to `js.FunctionN` and
back, with the obvious meaning.
These conversions are the only way to create a `js.FunctionN` in Scala.js.
For example:

{% highlight scala %}
val f: js.Function1[Double, Double] = { (x: Double) => x*x }
{% endhighlight %}

defines a JavaScript `function` object which squares its argument.
This corresponds to the following JavaScript code:

{% highlight javascript %}
var f = function(x) {
  return x*x;
};
{% endhighlight %}

You can call a `js.FunctionN` in Scala.js with the usual syntax:

{% highlight scala %}
val y = f(5)
{% endhighlight %}

### `js.ThisFunction` and its subtypes

The series of `js.ThisFunctionN` solve the problem of modeling the `this`
value of JavaScript in Scala. Consider the following call to the `each` method
of a jQuery object:

{% highlight javascript %}
var lis = jQuery("ol > li");
lis.each(function() {
  jQuery(this).text(jQuery(this).text() + " - transformed")
});
{% endhighlight %}

Inside the closure, the value of `this` is the DOM element currently being
enumerated. This usage of `this`, which is nonsense from a Scala point of view,
is standard in JavaScript. `this` can actually be thought of as an additional
parameter to the closure.

In Scala.js, the `this` keyword always follows the same rules as in Scala,
i.e., it binds to the enclosing class, trait or object. It will never bind to
the equivalent of the JavaScript `this` in an anonymous function.

To access the JavaScript `this` in Scala.js, it can be made explicit using
`js.ThisFunctionN`. A `js.ThisFunctionN[T0, T1, ..., TN, R]` is the type of a
JavaScript function taking a `this` parameter of type `T0`, as well as N
normal parameters of types `T1` to `TN`, and returning a value of type `R`.
From Scala.js, the `this` parameter appears as any other parameter: it has a
non-keyword name, a type, and is listed first in the parameter list. Hence,
a `scala.FunctionN` is convertible to/from a `js.ThisFunction{N-1}`.

The previous example would be written as follows in Scala.js:

{% highlight scala %}
val lis = jQuery("ol > li")
lis.each({ (li: dom.HTMLElement) =>
  jQuery(li).text(jQuery(li).text() + " - transformed")
}: js.ThisFunction)
{% endhighlight %}

Skipping over the irrelevant details, note that the parameter `li` completely
corresponds to the JavaScript `this`. Note also that we have ascribed the
lambda with `: js.ThisFunction` explicitly to make sure that the right implicit
conversion is being used (by default it would convert it to a `js.Function1`).
If you call a statically typed API which expects a `js.ThisFunction0`, this is
not needed.

The mapping between JS `this` and first parameter of a `js.ThisFunction` also
works in the other direction, i.e., if calling the `apply` method of a
`js.ThisFunction`, the first actual argument is transferred to the called
function as its `this`. For example, the following snippet:

{% highlight scala %}
val f: js.ThisFunction1[js.Object, js.Number, js.Number] = ???
val o = new js.Object
val x = f(o, 4)
{% endhighlight %}

will map to

{% highlight javascript %}
var f = ...;
var o = new Object();
var x = f.call(o, 4);
{% endhighlight %}

## Literal object construction

Scala.js provides two syntaxes for creating JavaScript objects in a literal
way. The following JavaScript object

{% highlight javascript %}
{foo: 42, bar: "foobar"}
{% endhighlight %}

can be written in Scala.js either as

{% highlight scala %}
js.Dynamic.literal(foo = 42, bar = "foobar")
{% endhighlight %}

or as

{% highlight scala %}
js.Dynamic.literal("foo" -> 42, "bar" -> "foobar")
{% endhighlight %}

## Defining JavaScript interfaces with traits

Most JavaScript APIs work with interfaces that are defined structurally. In
Scala.js, the corresponding concept are traits. To mark a trait as being a
representative of a JavaScript API, it must inherit directly or indirectly
from `js.Any` (usually from `js.Object`).

JS traits can contain `val`, `var` and `def` definitions, and the latter can
be overloaded.

All definitions must have `js.native` as body.
Any other body (including omitting the `=` altogether) will be handled as if
it were `js.native`, and a warning will be emitted.
(In Scala.js 1.0.0, this will become an error.)

**0.5.x note**: In Scala.js 0.5.x, `js.native` did not exist. The recommended
best practice was to put `???` as body, but this was not enforced by the
compiler. This has been changed to improve intuition and remove warts.

Here is an example giving types to a small portion of the API of `Window`
objects in browsers.

{% highlight scala %}
trait Window extends js.Object {
  val document: HTMLDocument = js.native
  var location: String = js.native

  def innerWidth: Int = js.native
  def innerHeight: Int = js.native

  def alert(message: String): Unit = js.native

  def open(url: String, target: String,
      features: String = ""): Window = js.native
  def close(): Unit = js.native
}
{% endhighlight %}

### Remarks

`var`, `val` and `def` definitions without parentheses all map to field access
in JavaScript, whereas `def` definitions with parentheses (even empty) map
to method calls in JavaScript.

The difference between a `val` and a `def` without parentheses is that the
result of the former is *stable* (in Scala semantics). Pragmatically, use `val`
if the result will always be the same (e.g., `document`), and `def` when
subsequent accesses to the field might return a different value (e.g.,
`innerWidth`).

Calls to the `apply` method of an object `x` map to calling `x`, i.e., `x(...)`
instead of `x.apply(...)`.

Methods can have parameters with default values, to mark them as optional.
However, the actual value is irrelevant and never used. Instead, the parameter
is omitted entirely (or set to `undefined`). The value is only indicative, as
implicit documentation.

Methods can be overloaded. This is useful to type accurately some APIs that
behave differently depending on the number or types of arguments.

JS traits and their methods can have type parameters, abstract type members
and type aliases, without restriction compared to Scala's type system.

However, inner traits, classes and objects don't make sense and are forbidden.
It is however allowed to declare a JS trait in a top-level object.

Methods can have varargs, denoted by `*` like in regular Scala. They map to
JavaScript varargs, i.e., the method is called with more arguments.

`isInstanceOf[T]` is not supported for any trait `T` inheriting from `js.Any`.
Consequently, pattern matching for such types is not supported either.

`asInstanceOf[T]` is completely erased for any `T` inheriting from `js.Any`,
meaning that it does not perform any runtime check.
It is always valid to cast anything to such a trait.

## JavaScript field/method names and their Scala counterpart

Sometimes, a JavaScript API defines fields and/or methods with names that do
not feel right in Scala. For example, jQuery objects feature a method named
`val()`, which, obviously, is a keyword in Scala.

They can be defined in Scala in two ways. The trivial one is simply to use
backquotes to escape them in Scala:

{% highlight scala %}
def `val`(): String = js.native
def `val`(v: String): this.type = js.native
{% endhighlight %}

However, it becomes annoying very quickly. An often better solution is to use
the `scala.js.annotation.JSName` annotation to specify the JavaScript name to
use, which can be different from the Scala name:

{% highlight scala %}
@JSName("val")
def value(): String = js.native
@JSName("val")
def value(v: String): this.type = js.native
{% endhighlight %}

If necessary, several overloads of a method with the same name can have different
`@JSName`'s. Conversely, several methods with different names in Scala can have
the same `@JSName`.

## Scala methods representing bracket access (`obj[x]`)

The annotation `scala.js.annotation.JSBracketAccess` can be used on methods to
mark them as representing bracket access on an object. The target method must
either have one parameter and a non-Unit result type (in which case it
represents read access) or two parameters and a Unit result type (in which case
it represents write access).

A typical example can be found in the `js.Array[A]` class itself, of course:

{% highlight scala %}
@JSBracketAccess
def apply(index: Int): A = js.native
@JSBracketAccess
def update(index: Int, v: A): Unit = js.native
{% endhighlight %}

The Scala method names are irrelevant for the translation to JavaScript. The
duo `apply`/`update` is often a sensible choice, because it gives array-like
access on Scala's side as well, but it is not required to use these names.

## JavaScript classes

It is also possible to define JavaScript *classes* as Scala classes inheriting,
directly or indirectly, from `js.Any` (like traits, usually from `js.Object`).
The main difference compared to traits is that classes have constructors, hence
they also provide instantiation of objects with the `new` keyword.

The call `new js.RegExp("[ab]*")` will map to the obvious in JavaScript, i.e.,
`new RegExp("[ab]*")`, meaning that the identifier `RegExp` will be looked up
in the global scope.

If it is impractical or inconvenient to declare the Scala class with the
same name as the JavaScript class (e.g., because it is defined in a namespace,
like `THREE.Scene`), the annotation `scala.js.annotation.JSName` can be used
to specify the JavaScript name:

{% highlight scala %}
@JSName("THREE.Scene")
class Scene extends js.Object
{% endhighlight %}

### Remarks

If the class does not have any constructor without argument, and it has to be
subclassed, you may either decide to add a fake protected no-arg constructor,
or call an inherited constructor with `???`s as parameters.

`isInstanceOf[C]` is supported for classes inheriting from `js.Any`.
It is implemented with an `instanceof` test.
Pattern matching, including `ClassTag`-based matching, work accordingly.

As is the case for traits, `asInstanceOf[C]` is completely erased for any class
`C` inheriting from `js.Any`, meaning that it does not perform any runtime
check.
It is always valid to cast anything to such a class.

## Top-level JavaScript objects

JavaScript APIs often expose top-level objects with methods and fields.
For example, the `JSON` object provides methods for parsing and emitting JSON
strings.
These can be declared in Scala.js with `object`'s inheriting directly or
indirectly from `js.Any` (again, often `js.Object`).

{% highlight scala %}
object JSON extends js.Object {
  def parse(text: String): js.Any = js.native

  def stringify(value: js.Any): String = js.native
}
{% endhighlight %}

An call like `JSON.parse(text)` will map in JavaScript to the obvious, i.e.,
`JSON.parse(text)`, meaning that the identifier `JSON` will be looked up in the
global scope.

Similarly to classes, the JavaScript name can be specified with `@JSName`, e.g.,

{% highlight scala %}
@JSName("jQuery")
object JQuery extends js.Object {
  def apply(x: String): JQuery = js.native
}
{% endhighlight %}

## Variables and functions in the global scope

Besides object-like top-level definitions, JavaScript also defines variables
and functions in the global scope. Scala does not have top-level variables and
functions. Instead, in Scala.js, top-level objects inheriting directly or
indirectly from `js.GlobalScope` (which itself extends `js.Object`) are
considered to represent the global scope.

{% highlight scala %}
object DOMGlobalScope extends js.GlobalScope {
  val document: HTMLDocument = js.native

  def alert(message: String): Unit = js.native
}
{% endhighlight %}

Note that this rule applies to package objects as well. It is often sensible
to use package objects for this purpose, e.g.,

{% highlight scala %}
package org.scalajs

package object dom extends js.GlobalScope {
  val document: HTMLDocument = js.native

  def alert(message: String): Unit = js.native
}
{% endhighlight %}

## Monkey patching

In JavaScript, monkey patching is a common pattern, where some top-level
object or class' prototype is meant to be extended by third-party code. This
pattern is easily encoded in Scala.js' type system with `implicit` conversions.

For example, in jQuery, `$.fn` can be extended with new methods that will be
available to so-called jQuery objects, of type `JQuery`. Such a plugin can be
declared in Scala.js with a separate trait, say `JQueryGreenify`, and an
implicit conversions from `JQuery` to `JQueryGreenify`.
The implicit conversion is implemented with a hard cast, since in effect we
just want to extend the API, not actually change the value.

{% highlight scala %}
trait JQueryGreenify extends JQuery {
  def greenify(): this.type = ???
}

object JQueryGreenify {
  implicit def jq2greenify(jq: JQuery): JQueryGreenify =
    jq.asInstanceOf[JQueryGreenify]
}
{% endhighlight %}

Recall that `jq.asInstanceOf[JQueryGreenify]` will be erased when mapping to
JavaScript because `JQueryGreenify` is a JS trait.
The implicit conversion is therefore a no-op and can be inlined away, which
means that this pattern does not have any runtime overhead.

## Reflective calls

Scala.js does not support reflective calls on any subtype of
`js.Any`. This is mainly due to the `@JSName` annotation. Since we
cannot statically enforce this restriction, reflective calls on
subtypes of `js.Any` *will fail at runtime*. Therefore, we recommend
to avoid reflective calls altogether.

### What is a reflective call?

Calling a method on a structural type in Scala creates a so-called
reflective call. A reflective call is a type-safe method call that
uses Java reflection at runtime. The following is an example of a
reflective call:

{% highlight scala %}
// A structural type
type T = { def foo(x: Int): String }
def print(obj: T) = obj.foo(100)
//                      ^ this is a reflective call
{% endhighlight %}

Any object conforming structurally to `T` can now be passed to
`print`:

{% highlight scala %}
class A { def foo(x: Int) = s"Input: $x" }
print(new A())
{% endhighlight %}
Note that `A` does *not* extend `T` but only conforms structurally
(i.e., it has a method `foo` with a matching signature).

The Scala compiler issues a warning for every reflective call, unless
the `scala.language.reflectiveCalls` is imported.

### Why do reflective calls not work on `js.Any`?

Since JavaScript is dynamic by nature, a reflective method lookup as
in Java is not required for reflective calls. However, in order to
generate the right method call, the call-site needs to know the exact
function name in JavaScript. The Scala.js compiler generates proxy
methods for that specific purpose.

However, we are unable to generate these forwarder methods on `js.Any`
types without leaking prototype members on non-Scala.js objects. This
is something which -- in our opinion -- we must avoid at all
cost. Lack of forwarder methods combined with the fact that a
JavaScript method can be arbitrarily renamed using `@JSName`, makes it
impossible to know the method name to be called at the call-site. The
reflective call can therefore not be generated.

# Calling JavaScript from Scala.js with dynamic types

Because JavaScript is dynamically typed, it is not often practical, sometimes
impossible, to give sensible type definitions for JavaScript APIs.

Scala.js lets you call JavaScript in a dynamically typed fashion if you
want to. The basic entry point is to grab a dynamically typed reference to the
global scope, with `js.Dynamic.global`, which is of type `js.Dynamic`.

You can read and write any field of a `js.Dynamic`, as well as call any method
with any number of arguments. All input types are assumed to be of type
`js.Any`, and all output types are assumed to be of type `js.Dynamic`. This
means that you can assign a `js.Array[A]` (or even an `Int`, through implicit
conversion) to a field of a `js.Dynamic`. And when you receive something, you
can chain any kind of call and/or field access.

For example, this snippet taken from the Hello World example uses the
dynamically typed interface to manipulate the DOM model.

{% highlight scala %}
val document = js.Dynamic.global.document
val playground = document.getElementById("playground")

val newP = document.createElement("p")
newP.innerHTML = "Hello world! <i>-- DOM</i>"
playground.appendChild(newP)
{% endhighlight %}

In this example, `document`, `playground` and `newP` are all inferred to be of
type `js.Dynamic`. When calling `getElementById` or assigning to the field
`innerHTML`, the `String` is implicitly converted to `js.Any`.

And since `js.Dynamic` inherits from `js.Any`, it is also valid to pass `newP`
as a parameter to `appendChild`.

## Remarks

Calling a `js.Dynamic`, like in `x(a)` will be treated as calling `x` in
JavaScript, just like calling the `apply` method with the statically typed
interface. Parameters are assumed to be of type `js.Any` and the result type
is `js.Dynamic`, as for any other method.

All the JavaScript operators can be applied to `js.Dynamic` values.

To instantiate an object of a class with the dynamic interface, you need to
obtain a `js.Dynamic` reference to the class value, and call the
`js.Dynamic.newInstance` method like this:

{% highlight scala %}
val today = js.Dynamic.newInstance(js.Dynamic.global.Date)()
{% endhighlight %}

If you use the dynamic interface a lot, it is convenient to import
`js.Dynamic.global` and/or `newInstance` under simple names, e.g.,

{% highlight scala %}
import js.Dynamic.{ global => g, newInstance => jsnew }

val today = jsnew(g.Date)()
{% endhighlight %}

When using `js.Dynamic`, you are very close to writing raw JavaScript within
Scala.js, with all the warts of the language coming to haunt you.
However, to get the full extent of JavaScriptish code, you can import the
implicit conversions in
[js.DynamicImplicts]({{ BASE_PATH }}/api/scalajs-library/{{ site.scalaJSVersion }}/#scala.scalajs.js.DynamicImplicits$).
Use at your own risk!
