---
layout: doc
title: Access to the JavaScript global scope in Scala.js
---

**This page applies to Scala.js 1.x only.**

Unlike Scala, JavaScript has a *global scope*, where global variables are defined.
For example, one can define a variable `foo` at the top-level of a script:

{% highlight javascript %}
var foo = 42;
{% endhighlight %}

which then makes it available in the global scope, so that another script can read or write it:

{% highlight scala %}
console.log(foo);
foo = 24;
{% endhighlight %}

The [facade types reference](./facade-types.html) explains how we can define facades for global variables.
Here is a recap of the different ways:

{% highlight scala %}
@js.native
@JSGlobalScope
object Globals extends js.Object {
  var foo: Int = js.native
}

@js.native
@JSGlobal
class Bar extends js.Object

@js.native
@JSGlobal
object Bar extends js.Object
{% endhighlight %}

* `@JSGlobal` specifies that the annotated entity (class or object) represents a *global variable*, in the JavaScript global scope.
* `@JSGlobalScope` specifies that the annotated object represents the global scope itself, which means its *members* are global variables.

With the above definitions, the snippet

{% highlight scala %}
val x = Globals.foo
Global.foo = 24

val y = new Bar
val z = Bar
{% endhighlight %}

would "translate" to

{% highlight javascript %}
var x = foo;
foo = 24;

var y = new Bar();
var z = Bar;
{% endhighlight %}

There are two "consequences" to that.

First, in any of the 4 above statements, if the referenced variable is not declared as a global variable, a `ReferenceError` will be thrown at run-time.
This is also what would happen in JavaScript when accessing a non-existent global variable.

Second, whereas `val x = Globals.foo` translates to `var x = foo`, `val g = Globals` has no valid translation in JavaScript, and is a compile-time error.
Indeed, *since ECMAScript 2015*, there is no JavaScript value that `g` could assume, such that `g.foo` would evaluate to the global variable `foo` (until ECMAScript 5.1, `g` could have been the *global object*, and this is what Scala.js 0.6.x did).
In general, any "dynamic" reference to a global-scope object is a compile-time error in Scala.js 1.x.

## Global-scope restrictions

After the above introduction, here is a reference of the compile-time restrictions of global-scope objects.

Assuming that `Globals` is an `@JSGlobalScope object`, then any use of `Globals` must satisfy *all* of the following requirements:

* It is used as the left-hand-side of a dot-selection, i.e., in `Globals.foobar` or `Globals.foobar(...)`
* Either of the 3 alternatives:
  * If `foobar` refers to a method annotated with `@JSBracketAccess` or `@JSBracketCall`, then the first actual argument must be a constant string which is a valid JavaScript identifier (e.g., `Global.foobar("ident")` is valid but `Global.foobar(someVal)` isn't)
  * Otherwise, if `foobar` has an `@JSName(jsName)` then `jsName` must be a constant string which is a valid JavaScript identifier
  * Otherwise, `foobar` must be a valid JavaScript identifier different than `apply`

For the purposes of this test, the special identifier `arguments` is not considered as a valid JavaScript identifier.

Here are some concrete examples.
Given the following definitions:

{% highlight scala %}
import scala.scalajs.js
import scala.scalajs.js.annotation._

object Symbols {
  val sym: js.Symbol = js.Symbol()
}

@js.native
@JSGlobalScope
object Globals extends js.Any {
  var validVar: Int = js.native
  def validDef(): Int = js.native

  var `not-a-valid-identifier-var`: Int = js.native
  def `not-a-valid-identifier-def`(): Int = js.native

  def +(that: Int): Int = js.native

  def apply(x: Int): Int = js.native

  @JSBracketAccess
  def bracketSelect(name: String): Int = js.native
  @JSBracketAccess
  def bracketUpdate(name: String, v: Int): Unit = js.native

  @JSBracketCall
  def bracketCall(name: String)(arg: Int): Int = js.native

  @JSName(Symbols.sym)
  var symbolVar: Int = js.native
  @JSName(Symbols.sym)
  def symbolDef(): Int = js.native

  var arguments: js.Array[Any] = js.native
  @JSName("arguments") def arguments2(x: Int): Int = js.native
}
{% endhighlight %}

Only the following uses of `Globals` would be valid:

{% highlight scala %}
Globals.validVar
Globals.validDef()

Globals.bracketSelect("someConstantIdent")
Globals.bracketUpdate("someConstantIdent", anyExpression)

Globals.bracketCall("someConstantIdent")(anyExpression)
{% endhighlight %}

All of the following uses are compile-time errors:

{% highlight scala %}
// Not used as the left-hand-side of a dot-selection
val x = Globals
someMethod(Globals)

// Accessing something that is not a valid JS identifier
Globals.`not-a-valid-identifier-var`
Globals.`not-a-valid-identifier-def`()
Globals + 0
Globals.arguments
Globals.arguments2(0)

// Calling an `apply` method without `@JSName`
Globals(0)

// Accessing a bracket-access/call member with a non-constant string
val str = computeSomeString()
Globals.bracketSelect(str)
Globals.bracketUpdate(str, 0)
Globals.bracketCall(str)(0)

// Accessing a bracket-access/call member with a non-valid JS ident
Globals.bracketSelect("not an ident")
Globals.bracketUpdate("not an ident", 0)
Globals.bracketCall("not an ident")(0)

// Accessing a member whose JS name is a symbol
Globals.symbolVar
Globals.symbolDef()
{% endhighlight %}

## The case of `js.Dynamic.global`

`js.Dynamic.global` is an `@JSGlobalScope object` that lets you read and write any field and call any top-level function in a dynamically typed way.
As with any other global-scope object, it must always be used at the left-hand-side of a dot-selection, with a valid JavaScript on the right-hand-side.

For example, the following uses are valid:

{% highlight scala %}
val x = js.Dynamic.global.foo
js.Dynamic.global.foo = 24

js.Dynamic.global.bar(0)
{% endhighlight %}

but the following uses are not valid:

{% highlight scala %}
val x = js.Dynamic.global

js.Dynamic.global.`not-a-valid-identifier`

val str = computeSomeString()
val y = js.Dynamic.global.selectDynamic(str)
{% endhighlight %}

The example means that it is not possible to dynamically look up a global variable given its name.

## Practical tips

### Testing whether a global variable exists

In Scala.js 0.6.x, it was possible to test whether a global variable exists (e.g., to perform a feature test) as follows:

{% highlight scala %}
if (!js.isUndefined(js.Dynamic.global.Promise)) {
  // Promises are supported
} else {
  // Promises are not supported
}
{% endhighlight %}

In Scala.js 1.x, accessing `js.Dynamic.global.Promise` will throw a `ReferenceError` if `Promise` is not defined, so this does not work anymore.
Instead, you must use `js.typeOf`:

{% highlight scala %}
if (js.typeOf(js.Dynamic.global.Promise) != "undefined")
{% endhighlight %}

Just like in JavaScript, where `typeof Promise` is special, so is `js.typeOf(e)` if `e` is a member of a global-scope object (i.e., a global variable).
If the global variable does not exist, `js.typeOf(e)` returns `"undefined"` instead of throwing a `ReferenceError`.

### Dynamically lookup a global variable given its name

In general, it is not possible to dynamically lookup a global variable given its name, even in JavaScript.
If absolutely necessary, one typically has to detect the *global object*, and use a normal field selection on it.
Assuming `globalObject` is a `js.Dynamic` representing the global object, we can do

{% highlight scala %}
val x = globalObject.selectDynamic(dynVarName)
{% endhighlight %}

There is no fully standard way to detect the global object.
However, most JavaScript environments fall into two categories:

* Either the global object is available as the global variable named `global` (e.g., in Node.js)
* Or the "global" `this` keyword refers to the global object.

{% comment %}
Due to https://github.com/scala/bug/issues/8124, `js.special` is completely missing from the Scaladocs.
Therefore we cannot link to it.
As a stop-gap measure, we point to the source code.
{% endcomment %}

The global variable `global` can of course be read with `js.Dynamic.global.global` (the double `global` is intended).
The global `this` can be read with [`js.special.globalThis`](https://github.com/scala-js/scala-js/blob/v1.0.0-M1/library/src/main/scala/scala/scalajs/js/special/package.scala#L40-L70).
Together, these can be used to correctly detect the global scope in most environments:

{% highlight scala %}
val globalObject: js.Dynamic = {
  import js.Dynamic.{global => g}
  if (js.typeOf(g.global) != "undefined" && (g.global.Object eq g.Object)) {
    // Node.js environment detected
    g.global
  } else {
    // In all other well-known environment, we can use the global `this`
    js.special.globalThis.asInstanceOf[js.Dynamic]
  }
}
{% endhighlight %}
