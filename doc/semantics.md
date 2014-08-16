---
layout: page
title: Semantics of Scala.js
tagline: and how they differ from Scala
---
{% include JB/setup %}

Because the target platform of Scala.js is quite different from that of Scala,
a few language semantics differences exist.

## Numbers and characters

Numbers and characters have the same semantics as on the JVM
(including overflow and full 64-bit Longs) with the following four
exceptions. For information about how Scala numeric types map to
JavaScript numeric types, have a look at the
[interoparability guide](./js-interoperability.html).

### Floats may behave like Doubles
Since JavaScript doesn't have a native float type, we sometimes represent Floats
using doubles/numbers, rather than with lower-precision 32-bit floats.

The choice of how to represent floats is up to the implementation. You may not rely on floats providing 64-bit floating point precision.

Float literals are truncated to their (binary)
precision. However, output does not truncate to that precision. This
can lead to the following behavior (this works as expected when using
doubles):

{% highlight scala %}
println(13.345f)
// Scala:    13.345
// Scala.js: 13.345000267028809
{% endhighlight %}

### Integer division by 0 is undefined
Unlike the JVM where dividing an integer type by 0 throws an
exception, in Scala.js integer division by 0 is undefined.
This allows for efficient implementation of division. Dividing a
`Double` or `Float` by 0 yields positive or negative infinity as
expected.

### isInstanceOf tests are based on value
Instance tests (and consequently pattern matching) on any of `Byte`,
`Short`, `Int`, `Float`, `Double` are based on the value and not the
type they were created with. The following are examples:

- 1 matches `Byte`, `Short`, `Int`, `Float`, `Double`
- 128 (`> Byte.MaxValue`) matches `Short`, `Int`, `Float`, `Double`
- 32768 (`> Short.MaxValue`) matches `Int`, `Float`, `Double`
- 2147483648 (`> Int.MaxValue`) matches `Float`, `Double`
- 1.2 matches `Float`, `Double`

As a consequence, the following apparent subtyping relationship holds:

    Byte <:< Short <:< Int <:< Float =:= Double

### toString for integral Floats and Doubles
Calling `toString` on a Float or a Double that holds an integral
value, will not append ".0" to that value:

{% highlight scala %}
println(1.0)
// Scala:    1.0
// Scala.js: 1
{% endhighlight %}

This is due to how numeric values are represented at runtime in
Scala.js. Use a formatting interpolator if you always want to show
decimals:

{% highlight scala %}
val x = 1.0
println(f"$x%.1f")
// Scala:    1.0
// Scala.js: 1.0
{% endhighlight %}

## Unit
`scala.Unit` is represented using JavaScript's `undefined`. Therefore,
calling `toString()` on `Unit` will return `undefined` rather than
`()`.

## Strings

JavaScript uses UCS-2 for encoding strings and does not support
conversion to or from other character sets. As a result, `String`
constructors taking `Byte` arrays are not supported by Scala.js.

## JavaScript interoperability

The JavaScript interoperability feature is, in itself, a big semantic
difference. However, its details are discussed in a
[dedicated page](./js-interoperability.html).

## Reflection

Java reflection and, a fortiori, Scala reflection, are not supported. There is
limited support for `java.lang.Class`, e.g., `obj.getClass.getName` will work
for any Scala.js object (not for objects that come from JavaScript interop).

## Exceptions

In general, Scala.js supports exceptions, including catching them based on their
type. However, exceptions that are typically triggered by the JVM have flaky
semantics, in particular:

- `ArrayIndexOutOfBoundsException` is never thrown.
- `NullPointerException` is reported as JavaScript `TypeError` instead.
- `StackOverflowError` is unsupported since the underlying JavaScript exception
  type varies based on the browser.

## Regular expressions

[JavaScript regular expressions](http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Guide:Regular_Expressions)
are slightly different from
[Java regular expressions](http://docs.oracle.com/javase/6/docs/api/java/util/regex/Pattern.html).
The support for regular expressions in Scala.js is implemented on top of
JavaScript regexes.

This sometimes has an impact on functions in the Scala library that
use regular expressions themselves. A list of known functions that are
affected is given here:

- `StringLike.split(x: Array[Char])` (see issue #105)

## Symbols

`scala.Symbol` is supported, but is a potential source of memory leaks
in applications that make heavy use of symbols. The main reason is that
JavaScript does not support weak references, causing all symbols created
by Scala.js tow remain in memory throughout the lifetime of the application.

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
val <ident> = Value(<num>,"<ident>")
{% endhighlight %}

Note that this also includes calls like
{% highlight scala %}
val A,B,C,D = Value
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
