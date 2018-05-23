---
layout: doc
title: Write facade types for JavaScript APIs
---

When writing an application with Scala.js, it is expected that the main
application logic be written in Scala.js, and that existing JavaScript libraries
are leveraged. Calling JavaScript from Scala.js is therefore the most important
direction of interoperability.

Facade types are zero-overhead typed APIs for JavaScript libraries. They are
similar in spirit to
[TypeScript type definitions](http://www.typescriptlang.org/docs/handbook/modules.html#working-with-other-javascript-libraries).

## Defining JavaScript interfaces with native JS traits

Most JavaScript APIs work with interfaces that are defined structurally. In
Scala.js, the corresponding concept are traits. To mark a trait as being a
representative of a JavaScript API, it must inherit directly or indirectly
from {% scalajsdoc js.Any js.Any %} (usually from `js.Object`).

JS traits can be native or not.
The present page describes native JS traits, which must be annotated with `@js.native`.
There are also non-native JS traits (aka Scala.js-defined JS traits), documented in [the Scala.js-defined JS types guide](./sjs-defined-js-classes.html).
The latter have more restrictions, but can be *implemented* from Scala.js code.
Native JS traits as described here should only be used for interfaces that are exclusively implemented by the JavaScript library--not for interfaces/contracts meant to be implemented by the user of said library.

**Scala.js 0.6.x:** In Scala.js 0.6.x, unless using the `-P:scalajs:sjsDefinedByDefault` compiler option, the annotation `@js.native` is assumed by default, with a deprecation warning.
You might still find old code that does not yet use it to annotate native JS types.

In native JS types, all concrete definitions must have `= js.native` as body.
Any other body will be handled as if it were `= js.native`, and a warning will be emitted.
(In Scala.js 1.x, this is an error.)

Here is an example giving types to a small portion of the API of `Window`
objects in browsers.

{% highlight scala %}
@js.native
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

Fields, parameters, or result types that can have different, unrelated types, can be accurately typed with the
[pseudo-union type `A | B`]({{ site.production_url }}/api/scalajs-library/{{ site.versions.scalaJS }}/#scala.scalajs.js.$bar).

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
the `scala.scalajs.js.annotation.JSName` annotation to specify the JavaScript name to
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

## Members with a JavaScript `symbol` "name"

`@JSName` can also be given a reference to a `js.Symbol` instead of a constant
string. This is used for JavaScript members whose "name" is actually a `symbol`.
For example, JavaScript iterable objects must declare a method whose name is the
symbol `Symbol.iterator`:

{% highlight scala %}
@JSName(js.Symbol.iterator)
def iterator(): js.Iterator[Int] = js.native
{% endhighlight %}

The argument to `@JSName` must be a reference to a static, stable field. In
practice, this means a `val` in top-level `object`. `js.Symbol.iterator` is such
a `val`, declared in the top-level object `js.Symbol`.

## Scala methods representing bracket access (`obj[x]`)

The annotation `scala.scalajs.js.annotation.JSBracketAccess` can be used on methods to
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

## Native JavaScript classes

It is also possible to define native JavaScript *classes* as Scala classes inheriting,
directly or indirectly, from `js.Any` (like traits, usually from `js.Object`).
The main difference compared to traits is that classes have constructors, hence
they also provide instantiation of objects with the `new` keyword.

Unlike traits, classes actually exist in the JavaScript world, often as
top-level, global variables. They must therefore be annotated with the
`@JSGlobal` annotation. For example:

{% highlight scala %}
@js.native
@JSGlobal
class RegExp(pattern: String) extends js.Object {
  ...
}
{% endhighlight %}

**Pre 0.6.15 note**: Before Scala.js 0.6.15, the `@JSGlobal` annotation did not
exist, so you will find old code that does not yet use it to annotate native JS
classes.

The call `new RegExp("[ab]*")` will map to the obvious in JavaScript, i.e.,
`new RegExp("[ab]*")`, meaning that the identifier `RegExp` will be looked up
in the global scope.

If it is impractical or inconvenient to declare the Scala class with the
same name as the JavaScript class (e.g., because it is defined in a namespace,
like `THREE.Scene`), a constant string can be given as parameter to `@JGlobal`
to specify the JavaScript name:

{% highlight scala %}
@js.native
@JSGlobal("THREE.Scene")
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
As is the case with classes, they must be annotated with `@js.native` and
`@JSGlobal`.

{% highlight scala %}
@js.native
@JSGlobal
object JSON extends js.Object {
  def parse(text: String): js.Any = js.native

  def stringify(value: js.Any): String = js.native
}
{% endhighlight %}

An call like `JSON.parse(text)` will map in JavaScript to the obvious, i.e.,
`JSON.parse(text)`, meaning that the identifier `JSON` will be looked up in the
global scope.

Similarly to classes, the JavaScript name can be specified as an explicit
argument to `@JSGlobal`, e.g.,

{% highlight scala %}
@js.native
@JSGlobal("jQuery")
object JQuery extends js.Object {
  def apply(x: String): JQuery = js.native
}
{% endhighlight %}

Unlike classes and traits, native JS objects can have inner native JS classes, traits and objects.
Inner classes and objects will be looked up as fields of the enclosing JS object.

## Variables and functions in the global scope

Besides object-like top-level definitions, JavaScript also defines variables
and functions in the global scope. Scala does not have top-level variables and
functions. Instead, in Scala.js, top-level objects annotated with
`@JSGlobalScope` are considered to represent the global scope.

{% highlight scala %}
import js.annotation._

@js.native
@JSGlobalScope
object DOMGlobalScope extends js.Object {
  val document: HTMLDocument = js.native

  def alert(message: String): Unit = js.native
}
{% endhighlight %}

Prior to 0.6.13, `extends js.GlobalScope` was used instead of `@JSGlobalScope`.
`js.GlobalScope` is now deprecated.

**Scala.js 1.x:** Also read [access to the JavaScript global scope](./global-scope.html).

## <a name="import"></a> Imports from other JavaScript modules

**Important:** Importing from JavaScript modules requires that you [emit a module for the Scala.js code](../project/module.html).

The previous sections on native classes and objects all refer to *global variables*, i.e., variables declared in the JavaScript global scope.
In modern JavaScript ecosystems, we often want to load things from other *modules*.
This is what `@JSImport` is designed for.
You can annotate an `@js.native` class or object with `@JSImport` instead of `@JSGlobal` to signify that it is defined in a module.
For example, in the following snippet:

{% highlight scala %}
@js.native
@JSImport("bar.js", "Foo")
class Foobaz(val x: Int) extends js.Object

val f = new Foobaz(5)
{% endhighlight %}

the annotation specifies that `Foobaz` is a native JS class defined in the module `"bar.js"`, and exported under the name `"Foo"`.
Semantically, `@JSImport` corresponds to an [ECMAScript 2015 import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import), and the above code is therefore equivalent to this JavaScript code:

{% highlight javascript %}
import { Foo as Foobaz } from "bar.js";
var f = new Foobaz(5);
{% endhighlight %}

In CommonJS terms, this would be:

{% highlight javascript %}
var bar = require("bar.js");
var f = new bar.Foo(5);
{% endhighlight %}

The first argument to `@JSImport` is the name of the JavaScript module you wish to import.
The second argument denotes what member of the module you are importing.
It can be one of the following:

* A string indicating the name of member.
  The string can be a `.`-separated chain of selections (e.g., `"Foo.Babar"`).
* The constant `JSImport.Default`, to select the *default* export of the JavaScript module.
  This corresponds to `import Foobaz from "bar.js"`.
* The constant `JSImport.Namespace`, to select the module itself (with its exports as fields).
  This corresponds to `import * as Foobaz from "bar.js"`.

The latter is particularly useful if you want to import members of the modules that are neither classes nor objects (for example, functions):

{% highlight scala %}
@js.native
@JSImport("bar.js", JSImport.Namespace)
object Bar extends js.Object {
  def exportedFunction(x: Int): Int = js.native
}

val y = Bar.exportedFunction(5)
{% endhighlight %}

In CommonJS terms, this would be:

{% highlight javascript %}
var bar = require("bar.js");
var y = bar.exportedFunction(5);
{% endhighlight %}

If the previous example had used `JSImport.Default` instead of `JSImport.Namespace`, the *current* translation into CommonJS terms would be the following:

{% highlight javascript %}
function moduleDefault(m) {
  return (m && (typeof m === "object") && "default" in m) ? m["default"] : m;
}

var bar = require("bar.js");
var y = moduleDefault(bar).exportedFunction(5);
{% endhighlight %}

This is subject to change in future versions of Scala.js, to better reflect the evolution of specifications in ECMAScript itself, and its implementations.

**Important:** `@JSImport` is completely incompatible with [`jsDependencies`](./dependencies.html).
You should use a separate mechanism to manage your JavaScript dependencies.
Scala.js does not provide any facility to do so, at the moment.

### Default import or namespace import?

The *default* export accessible with `JSImport.Default`, specified in terms of ECMAScript 2015 modules, is somewhat underspecified when it comes to CommonJS, at the moment.
This is because it is not entirely clear yet what default exports are supposed to be with respect to "legacy" module systems (such as CommonJS).
It seems that the intention is that a legacy module (such as a CommonJS) would appear to an ECMAScript 2015 module as exporting a single member: the default export.
For a CommonJS module, the value of the default export would be the value of `exports`.
This intention is not clearly specified anywhere, though, and existing definitions are known to slightly conflict on the matter (e.g., what Rollup.js does compared to what Node.js would do in the future).
There seems to be an emergent behavior that members of a legacy module (e.g., fields of the `exports` object) will also be exposed as if they were top-level exports, so that they can be imported as `import { Foo } from "bar.js"`.

What does it all mean to you?
How to choose between `Namespace`, `Default` and named imports?
At present, we recommend to follow these rules of thumb:

1. Does the documentation of the module specify how to import it with ECMAScript 2015 syntax?
   If yes, translate the ES syntax into `@JSImport` as specified above.
2. Otherwise, is the `exports` value of a legacy module *not* an object (e.g., it is a class or a function)?
   If yes, use a *default* import with `JSImport.Default`.
3. Otherwise, use a named import with a string or a namespace import with `JSImport.Namespace`.

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
@js.native
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

Sometimes, it is more convenient to manipulate JavaScript values in a dynamically typed way.
Although it is not recommended to do so for APIs that are used repetitively, Scala.js lets you call JavaScript in a dynamically typed fashion if you want to.
The basic entry point is to grab a dynamically typed reference to the global scope, with `js.Dynamic.global`, which is of type `js.Dynamic`.

**Scala.js 1.x:** In Scala.js 1.x, `js.Dynamic.global` is a [global scope object](./global-scope.html) instead of an actual value of type `js.Dynamic`.

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
[js.DynamicImplicts]({{ site.production_url }}/api/scalajs-library/{{ site.versions.scalaJS }}/#scala.scalajs.js.DynamicImplicits$).
Use at your own risk!
