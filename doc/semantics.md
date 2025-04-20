---
layout: doc
title: Semantics of Scala.js
tagline: and how they differ from Scala
---

In general, the semantics of the Scala.js language are the same as Scala on
the JVM.
However, a few differences exist, which we mention here.

## Primitive data types

All nine primitive data types of Scala, i.e., `Boolean`, `Char`, `Byte`, `Short`, `Int`, `Long`, `Float`, `Double` and `Unit`, work exactly as on the JVM, with the following three exceptions.

### `toString` of `Float`, `Double` and `Unit`

`x.toString()` returns slightly different results for floating point numbers
and `()` (`Unit`).

{% highlight scala %}
().toString   // "undefined", instead of "()"
1.0.toString  // "1", instead of "1.0"
1.4f.toString // "1.399999976158142" instead of "1.4"
{% endhighlight %}

In general, a trailing `.0` is omitted.
Floats print in a weird way because they are printed as if they were Doubles,
which means their lack of precision shows up.

To get sensible and portable string representation of floating point numbers,
use `String.format()` or related methods.

### Runtime type tests are based on values

Instance tests (and consequently pattern matching) on any of `Byte`,
`Short`, `Int`, `Float`, `Double` are based on the value and not the
type they were created with. The following are examples:

- 1 matches `Byte`, `Short`, `Int`, `Float`, `Double`
- 128 (`> Byte.MaxValue`) matches `Short`, `Int`, `Float`, `Double`
- 32768 (`> Short.MaxValue`) matches `Int`, `Float`, `Double`
- 2147483647 matches `Int` and `Double`, but not `Float`
  (because that number cannot be represented in a 32-bit `Float`)
- 2147483648 (`> Int.MaxValue`) matches `Float`, `Double`
- 1.5 matches `Float`, `Double`
- 1.4 only matches `Double`
  (unlike 1.5, the value 1.4 cannot be represented in a 32-bit `Float`)
- `NaN`, `Infinity`, `-Infinity` and `-0.0` match `Float`, `Double`

As a consequence, the following apparent subtyping relationships hold:

    Byte <:< Short <:<  Int  <:< Double
                   <:< Float <:<

#### Implications for formatting negative values in hexadecimal

Because there is no runtime difference between `Byte` `Short` and `Int`s (for sufficiently low values),
`java.util.Formatter` (and hence all formatting strings) assume `Int` to determine the padding when formatting negative hexadecimal values.

This leads to the following difference in format output:

{% highlight scala %}
val b: Byte = -38.toByte
"%x".format(b)
// JVM: "da"
// Scala.js: "ffffffda"
{% endhighlight %}

To achieve portable code, convert the value to an unsigned int first:

{% highlight scala %}
val b: Byte = -38.toByte
"%x".format(b & 0xff)
// "da" on both platforms
{% endhighlight %}

### `getClass()`

In Scala/JVM as well as Scala.js, when assigning a primitive value to an `Any` (or a generic type), and asking for its `getClass()`, Scala returns the *boxed class* of the value's type, rather than the primitive value.
For example, `(true: Any).getClass()` returns `classOf[java.lang.Boolean]`, not `classOf[scala.Boolean]`.

In Scala.js, for numeric types, and for the same reason that instance tests are based on values, the result will be the *smallest* boxed class that can store the value.
Hence, `(5: Any).getClass()` will return `classOf[java.lang.Byte]`, while `(50000: Any).getClass()` will return `classOf[java.lang.Integer]`.

**Scala.js 1.x only:**
Moreover, for `()` (unit), the result will be `classOf[java.lang.Void]` instead of `classOf[scala.runtime.BoxedUnit]` like the JVM.
`scala.runtime.BoxedUnit` is an implementation detail of Scala on the JVM, which Scala.js does not emulate.
Instead, it uses the more sensible `java.lang.Void`, as `Void` is the boxed class corresponding to the `void` primitive type, which is `scala.Unit`.
This means that while `java.lang.Void` is not instantiable on the JVM, in Scala.js it has a singleton instance, namely `()`.
This also manifests itself in `Array[Unit]` which is effectively `Array[java.lang.Void]` at run-time, instead of `Array[scala.runtime.BoxedUnit]`.

## Undefined behaviors

The JVM is a very well specified environment, which even specifies how some
bugs are reported as exceptions.

There are two groups of relevant exceptions:

* Exceptions thrown on unsatisfied preconditions of core language features:
  * `NullPointerException`
  * `ArrayIndexOutOfBoundsException` and `StringIndexOutOfBoundsException`
  * `ClassCastException`
  * `ArrayStoreException`
  * `NegativeArraySizeException`
* System errors:
  * `StackOverflowError` and `OutOfMemoryError`

Because Scala.js does not receive VM support to detect such erroneous
conditions, checking them is typically too expensive.

Therefore, conditions that would throw one of these exceptions are considered
[undefined behavior](http://en.wikipedia.org/wiki/Undefined_behavior).

However, the first group can be configured to be compliant with the JVM specification using sbt settings.
System errors are not handled by Scala.js, which inherits their behavior from the host JavaScript engine.

Every configurable undefined behavior has 3 possible modes:

* `Compliant`: behaves as specified on a JVM
* `Unchecked`: completely unchecked and undefined
* `Fatal`: checked, but throws `UndefinedBehaviorError`s instead of the specified exception

By default, undefined behaviors are in `Fatal` mode for `fastLinkJS` and in
`Unchecked` mode for `fullLinkJS` (`fastOptJS` / `fullOptJS` up to Scala.js 1.2.x).
This is so that bugs can be detected more easily during development, with
predictable exceptions and stack traces.
In production code (`fullLinkJS`), the checks are removed for maximum
efficiency.

`UndefinedBehaviorError`s are *fatal* in the sense that they are not matched by
`case NonFatal(e)` handlers.
This makes sure that they always crash your program as early as possible, so
that you can detect and fix the bug.
It is *never* OK to catch an `UndefinedBehaviorError` (other than in a testing
framework), since that means your program will behave differently in `fullLinkJS`
stage than in `fastLinkJS`.

If you need a particular kind of exception to be thrown in compliance with the
JVM semantics, you can do so with an sbt setting.
For example, this setting enables compliant `asInstanceOf`s:

{% highlight scala %}
scalaJSLinkerConfig ~= { _.withSemantics(_.withAsInstanceOfs(
  org.scalajs.linker.interface.CheckedBehavior.Compliant)) }
{% endhighlight %}

Note that this will have (potentially major) performance impacts.

## JavaScript interoperability

The JavaScript interoperability feature is, in itself, a big semantic
difference. However, its details are discussed in a
[dedicated page](./interoperability).

## Reflection

Java reflection and, a fortiori, Scala reflection, are not supported. There is
limited support for `java.lang.Class`, e.g., `obj.getClass.getName` will work
for any Scala.js object (not for objects that come from JavaScript interop).

## Regular expressions

Regular expressions, as provided by `java.util.regex.Pattern` and its derivatives like `scala.util.matching.Regex` and the `.r` method, are supported, although with some limitations.
More details can be found [on the Regular expressions documentation page](./regular-expressions.html).

## Symbols

`scala.Symbol` is supported, but is a potential source of memory leaks
in applications that make heavy use of symbols. The main reason is that
JavaScript does not support weak references, causing all symbols created
by Scala.js to remain in memory throughout the lifetime of the application.

## Enumerations

The methods `Value()` and `Value(i: Int)` on `scala.Enumeration` use
reflection to retrieve a string representation of the member name and
are therefore -- in principle -- unsupported. However, since
Enumerations are an integral part of the Scala library, Scala.js adds
limited support for these two methods:

<ol>
<li>Calls to either of these two methods of the forms:

{% highlight scala %}
val <ident> = Value
val <ident> = Value(<num>)
{% endhighlight %}

are statically rewritten to (a slightly more complicated version of):

{% highlight scala %}
val <ident> = Value("<ident>")
val <ident> = Value(<num>, "<ident>")
{% endhighlight %}

Note that this also includes calls like
{% highlight scala %}
val A, B, C, D = Value
{% endhighlight %}
since they are desugared into separate <code>val</code> definitions.
</li>
<li>Calls to either of these two methods which could not be rewritten,
or calls to constructors of the protected <code>Val</code> class without an
explicit name as parameter, will issue a warning.</li>
</ol>

Note that the name rewriting honors the `nextName`
iterator. Therefore, the full rewrite is:

{% highlight scala %}
val <ident> = Value(
  if (nextName != null && nextName.hasNext)
    nextName.next()
  else
    "<ident>"
)
{% endhighlight %}

We believe that this covers most use cases of
`scala.Enumeration`. Please let us know if another (generalized)
rewrite would make your life easier.

## Historical

### Non-strict floats (removed in Scala.js 1.19.0; default until 1.8.0)

Until v1.8.0, Scala.js underspecified the behavior of `Float`s by default with so-called *non-strict floats*.

Non-strict floats could be enabled with the following sbt setting, until v1.19.0 excluded:

{% highlight scala %}
scalaJSLinkerConfig ~= { _.withSemantics(_.withStrictFloats(false)) }
{% endhighlight %}

Under non-strict floats, any `Float` value can be stored as a `Double` instead, and any operation on `Float`s can be computed with double precision.
The choice of whether or not to behave as such, when and where, is left to the implementation.
In addition, `x.isInstanceOf[Float]` will return `true` for any `number` values (not only the ones that fit in a 32-bit float).

Non-strict floats were deprecated in v1.8.0 and removed in v1.19.0.

Non-strict floats could significantly improve the performance (up to 4x for `Float`-intensive applications) when targeting JS engines that do not support [the `Math.fround` function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/fround), such as Internet Explorer (which implies emitting ES 5.1 code).
If you are in that situation, we advise to use `Double`s instead of `Float`s as much as possible.
