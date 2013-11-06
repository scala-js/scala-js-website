---
layout: page
title: JavaScript interoperability
---
{% include JB/setup %}

A key feature of Scala.js is its interoperability with JavaScript code, which
far exceeds that of many other languages targeting JavaScript. Except of course
for languages that translate almost litterally to JavaScript (e.g.,
[TypeScript](http://www.typescriptlang.org/) and
[CoffeeScript](http://coffeescript.org/)).

Scala.js exhibits both means to call JavaScript APIs from Scala.js, and to be
called from JavaScript code.

## Calling JavaScript from Scala.js with static types

When writing an application with Scala.js, it is expected that the main
application logic be written in Scala.js, and that existing JavaScript libraries
are leveraged. Calling JavaScript from Scala.js is therefore the most important
direction of interoperability.

Because JavaScript is dynamically typed, it is possible to call JS libraries in
a dynamically typed way. However, it is also possible to interop with static
types, for better leveraging of Scala. The former actually builds on top of the
latter.

### Primitive JavaScript types

The package `scala.js`
([code on GitHub](https://github.com/lampepfl/scala-js/tree/master/library/src/main/scala/scala/js))
contains static type definitions for all the types, functions and variables
that are part of the ECMAScript 5 standard library, including the primitive
types.

The core type hierarchy is as follows:

    js.Any
     +- js.Number
     +- js.Boolean
     +- js.String
     +- js.Undefined
     +- js.Object
         +- js.Date
         +- js.RegExp
         +- js.Array[A]
         +- js.Function
             +- js.Function0[+R]
             +- js.Function1[-T1, +R]
             +- ...
             +- js.Function5[-T1, ..., -T5, +R]

A value of any of these types is encoded as is in JavaScript, without boxing.
Even when such a value is assigned to a `val` of type `scala.Any` or of a
generic type, there is no boxing. E.g., a `js.Array[js.Number]` is a JavaScript
`Array` which contains JavaScript `number`'s at runtime (not some boxing of
`number`'s).

These types have all the fields and methods available in the JavaScript API.

There are implicit conversions from corresponding Scala types and back:

<table class="table table-bordered">
  <thead>
    <tr><th>Scala type</th><th>JavaScript type</th></tr>
  </thead>
  <tbody>
    <tr><td>Byte<br/>Short<br/>Int<br/>Long<br/>Float<br/>Double</td><td>js.Number</td></tr>
    <tr><td colspan="2">(from js.Number to Double only)</td></tr>
    <tr><td>Boolean</td><td>js.Boolean</td></tr>
    <tr><td>java.lang.String</td><td>js.String</td></tr>
    <tr><td>Unit</td><td>js.Undefined</td></tr>
    <tr><td>Array[A]</td><td>js.Array[A]</td></tr>
    <tr><td>FunctionN[T1, ..., TN, R]</td><td>js.FunctionN[T1, ..., TN, R]</td></tr>
  </tbody>
</table>

#### Remarks

There is no type `js.Null`, because `scala.Null` can be used in its stead with
the appropriate semantics.

`isInstanceOf[T]` for `T` being `js.Number`, `js.Boolean`, `js.String`, or
`js.Undefined`, is supported and is implemented with a `typeof` test.

`isInstanceOf[T]` is supported for _classes_ inheriting from `js.Object`, e.g.,
`js.Date`, `js.Array[_]`, `js.Object` itself, and is implemented with an
`instanceof` test.

`isInstanceOf[T]` is not supported for any other `T` (i.e., traits) inheriting
from `js.Any`.
Consequently, pattern matching for such types is not supported either.

`asInstanceOf[T]` is completely erased for any `T` inheriting from `js.Any`,
meaning that it does not perform any runtime check.

The conversions between Scala and JS numbers, booleans, and strings has no
overhead at runtime, since they have exactly the same encoding in JavaScript.
So yes, `java.lang.String` "instances" are actually stored as primitive
strings in JavaScript. It also means that `asInstanceOf` between these types
is valid, although we recommend using the implicit conversions.

The previous remark is however *not true* about function types and arrays.

### Defining JavaScript interfaces with traits

Most JavaScript APIs work with interfaces, that are defined structurally. In
Scala.js, the corresponding concept are traits. To mark a trait as being a
representative of a JavaScript API, it must inherit directly or indirectly
from `js.Object`.

JS traits can contain `val`, `var` and `def` definitions, and the latter can
be overloaded. All definitions should have `???` as body, to soothe the
compiler's soul. E.g.,

    trait Window extends js.Object {
      val document: DOMDocument = ???
      var location: js.String = ???

      def innerWidth: js.Number = ???
      def innerHeight: js.Number = ???

      def alert(message: js.String): Unit = ???

      def open(url: js.String, target: js.String, features: js.String): Window = ???
      def open(url: js.String, target: js.String): Window = ???
      def close(): Unit = ???
    }

#### Remarks

`var`, `val` and `def` definitions without parentheses all map to field access
in JavaScript, whereas `def` definitions with parentheses (even empty) map
to method calls in JavaScript.

The difference between a `val` and a `def` without parentheses is that the
result of the former is *stable* (in Scala semantics). Pragmatically, use `val`
if the result will always be the same (e.g., `document`), and `def` when
subsequent accesses to the field might return a different value (e.g.,
`innerWidth`).

Use `Unit` instead of `js.Undefined` as result type of methods that do not
return any value.

Calls to the `apply` method of an object `x` map to calling `x`, i.e., `x(...)`
instead of `x.apply(...)`.

Methods cannot have default parameters. You must use overloads instead.

JS traits and their methods can have type parameters, abstract type members
and type aliases, without restriction compared to Scala's type system.

However, inner traits, classes and objects don't make sense, although currently
they will not cause a compiler error.

Methods can have varargs, denoted by `*` like in regular Scala. They map to
JavaScript varargs, i.e., the method is called with more arguments.

### JavaScript field/method names and their Scala counterpart

Sometimes, a JavaScript API defines fields and/or methods with names that do
not fell right in Scala. For example, jQuery objects feature a method named
`val()`, which, obviously, is a keyword in Scala.

They can be defined in Scala in two ways. The trivial one is simply to use
backquotes to escape them in Scala:

    def `val`(): js.String
    def `val`(v: js.String): this.type

However, it becomes annoying very quickly. An often better solution is to use
the `scala.js.annotation.JSName` annotation to specify the JavaScript name to
use, which can be different from the Scala name:

    @JSName("val")
    def value(): js.String
    @JSName("val")
    def value(v: js.String): this.type

### Scala methods representing bracket access (`obj[x]`)

The annotation `scala.js.annotation.JSBracketAccess` can be used on methods to
mark them as representing bracket access on an object. The target method must
either have one parameter and a non-Unit result type (in which case it
represents read access) or two parameters and a Unit result type (in which case
it represents write access).

A typical example can be found in the `js.Array[A]` class itself, of course:

    @JSBracketAccess
    def apply(index: js.Number): A
    @JSBracketAccess
    def update(index: js.Number, v: A): Unit

The Scala method names are irrelevant for the translation to JavaScript. The
duo `apply`/`update` is often a sensible choice, because it gives array-like
access on Scala's side as well, but it is not required to use these names.

### JavaScript classes

It is also possible to define JavaScript *classes* as Scala classes inheriting,
directly or indirectly, from `js.Object`. The only difference compared to
traits is that classes have constructors, hence they also provide instantiation
of objects with the `new` keyword.

For practical reasons (e.g., definition of subclasses), the primary constructor
should always have no parameter. If that is not a legal constructor in the
underlying JavaScript API, it should still exist but be made `protected`. E.g.,

    class RegExp protected () extends js.Object {
      def this(pattern: js.String, flags: js.String) = this()
      def this(pattern: js.String) = this()
      ...
    }

The call `new RegExp("[ab]*")` will map to exactly the same thing in JavaScript,
meaning that the identifier `RegExp` will be looked up in the global scope.
If it is impractical or inconvenient to declare the Scala class with the
same name as the JavaScript class (e.g., because it is defined in a namespace,
like `THREE.Scene`), the annotation `scala.js.annotation.JSName` can be used
to specify the JavaScript name:

    @JSName("THREE.Scene")
    class Scene extends js.Object

### Top-level JavaScript objects

JavaScript APIs often expose top-level objects with methods and fields. E.g.,
the `Math` object provides methods for standard mathematical functions. These
can be declared in Scala.js with `object`'s inheriting directly or indirectly
from `js.Object`.

    object Math extends js.Object {
      val E: js.Number = ???
      val PI: js.Number = ???

      def sin(x: js.Number): js.Number = ???
      def min(values: js.Number*): js.Number = ???

      ...
    }

An access like `Math.sin(a)` will map in JavaScript to the same code, meaning
that the identifier `Math` will be looked up in the global scope. Similarly to
classes, the JavaScript name can be specified with `@JSName`, e.g.,

    @JSName("jQuery")
    object JQuery extends js.Object {
      def apply(x: js.Any): JQuery
    }

### Variables and functions in the global scope

Besides object-like top-level definitions, JavaScript also defines variables
and functions in the global scope. Scala does not have top-level variables and
functions. Instead, in Scala.js, top-level objects inheriting directly or
indirectly from `js.GlobalScope` (which itself extends `js.Object`) are
considered to represent the global scope.

    object StdGlobalScope extends js.GlobalScope {
      val NaN: js.Number = ???

      def parseInt(s: js.String, radix: js.Number): js.Number = ???
      def parseInt(s: js.String): js.Number = ???
    }

Note that this rule applies to package objects as well. It is often sensible
to use package objects for this purpose, e.g.,

    package scala

    package object js extends js.GlobalScope {
      val NaN: js.Number = ???

      def parseInt(s: js.String, radix: js.Number): js.Number = ???
      def parseInt(s: js.String): js.Number = ???
    }

### Pimp-my-library pattern

In JavaScript, the pimp-my-library pattern is common, where some top-level
object, or class' prototype, is meant to be extended by third-party code. This
pattern is easily encoded in Scala.js' type system with `implicit` conversions.

E.g., in jQuery, `$.fn` can be extended with new methods, that will be
available to so-called jQuery objects, of type `JQuery`. Such a plugin can be
declared in Scala.js with a separate trait, say `JQueryGreenify`, and an
implicit conversions from `JQuery` to `JQueryGreenify`.

    trait JQueryGreenify extends JQuery {
      def greenify(): this.type = ???
    }

    object JQueryGreenify {
      implicit def jq2greenify(jq: JQuery): JQueryGreenify =
        jq.asInstanceOf[JQueryGreenify]
    }

Recall that `asInstanceOf[JQueryGreenify]` will be erased when mapping to
JavaScript.

## Calling JavaScript from Scala.js with dynamic types

Because JavaScript is dynamically typed, it is not often practical, sometimes
impossible, to give sensible type definitions for JavaScript APIs.

Scala.js lets you call JavaScript call in a dynamically typed fashion if you
want to. The basic entry point is to grab a dynamically typed reference to the
global scope, with `js.Dynamic.global`, which is of type `js.Dynamic`.

You can read and write any field of a `js.Dynamic`, as well as call any method
with any number of arguments. All input types are assumed to be of type
`js.Any`, and all output types are assumed to be of type `js.Dynamic`. This
means that you can assign a `js.Number` (or even an `Int`, through implicit
conversion) to a field of a `js.Dynamic`. And when you receive something, you
can chain any kind of call of field access.

For example, this snippet taken from the Hello World example uses the
dynamically typed interface to manipulate the DOM model.

    val document = js.Dynamic.global.document
    val playground = document.getElementById("playground")

    val newP = document.createElement("p")
    newP.innerHTML = "Hello world! <i>-- DOM</i>"
    playground.appendChild(newP)

In this example, `document`, `playground` and `newP` are all inferred to be of
type `js.Dynamic`. When calling `getElementById` of assigning to the field
`innerHTML`, the String is implicitly converted to a `js.String` to conform to
`js.Any`.

And since `js.Dynamic` inherits from `js.Any`, it is also valid to pass `newP`
as a parameter to `appendChild`.

### Remarks

Calling a `js.Dynamic`, like in `x(a)` will be treated as calling `x` in
JavaScript, just like calling the `apply` method with the statically typed
interface. Parameters are assumed to be of type `js.Any` and the result type
is `js.Dynamic`, as for any other method.

All the JavaScript operators can be applied to `js.Dynamic` values.

To instantiate an object of a class with the dynamic interface, you need to
obtain a `js.Dynamic` reference to the class value, and call the
`js.Dynamic.newInstance` method like this:

    val today = js.Dynamic.newInstance(js.Dynamic.global.Date)()

If you use the dynamic interface a lot, it is convenient to import
`js.Dynamic.global` and/or `newInstance` under simple names, e.g.,

    import js.Dynamic.{ global => g, newInstance => jsnew }

    val today = jsnew(g.Date)()

## Calling Scala.js from JavaScript

TODO Improve this section.

The recommanded entry point from JavaScript to Scala.js is to use a top-level
object in Scala.js with some methods:

    package my.application
    object EntryPoint {
      def main(): Unit = { ... }
      def foo(x: Int) = ...
      def foo(x: String) = ...
    }

A reference to `my.application.EntryPoint` can be obtained in JavaScript with

    var entryPoint = ScalaJS.modules.my_application_EntryPoint();

Note the use of `_` instead of `.`, and the parentheses at the end.

You can then call methods trivially:

    entryPoint.main();
    entryPoint.foo(42);
    entryPoint.foo("hello");

Note that overloading works. It is resolved dynamically with type tests.

You can create a new instance of a class `my.application.SomeClass` with

    var obj = new ScalaJS.classes.my_application_SomeClass(someArg);

You can of course alias the class to a simpler name if you use it multiple
times.
