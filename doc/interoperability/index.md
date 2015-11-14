---
layout: doc
title: Interoperability
---

A key feature of Scala.js is its interoperability with JavaScript code, which
far exceeds that of many other languages targeting JavaScript. Except of course
for languages that translate almost literally to JavaScript (e.g.,
[TypeScript](http://www.typescriptlang.org/) and
[CoffeeScript](http://coffeescript.org/)).

Scala.js exhibits both means to call JavaScript APIs from Scala.js, and to be
called from JavaScript code.

* [Call JavaScript APIs from Scala.js](calling-javascript.html)
* [Export Scala.js APIs to JavaScript](export-to-javascript.html)
* [Write JavaScript classes in Scala.js](sjs-defined-js-classes.html)

## <a name="type-correspondance"></a> Type Correspondance
Some Scala types are directly mapped to corresponding underlying
JavaScript types. These correspondances can be used when calling
Scala.js code from JavaScript and when defining typed interfaces for
JavaScript code.

<table class="table table-bordered">
  <thead>
    <tr><th>Scala type</th><th>JavaScript type</th><th>Restrictions</th></tr>
  </thead>
  <tbody>
    <tr><td>java.lang.String</td><td>string</td><td></td></tr>
    <tr><td>scala.Boolean</td><td>boolean</td><td></td></tr>
    <tr><td>scala.Char</td><td><i>opaque</i></td><td></td></tr>
    <tr><td>scala.Byte</td><td>number</td><td>integer, range (-128, 127)</td></tr>
    <tr><td>scala.Short</td><td>number</td><td>integer, range (-32768, 32767)</td></tr>
    <tr><td>scala.Int</td><td>number</td><td>integer, range (-2147483648, 2147483647)</td></tr>
    <tr><td>scala.Long</td><td><i>opaque</i></td><td></td></tr>
    <tr><td>scala.Float</td><td>number</td><td></td></tr>
    <tr><td>scala.Double</td><td>number</td><td></td></tr>
    <tr><td>scala.Unit</td><td>undefined</td><td></td></tr>
    <tr><td>scala.Null</td><td>null</td><td></td></tr>
    <tr><td>subtypes of js.Object</td><td><i>corresponding JavaScript
  type</i></td><td>see <a href="calling-javascript.html">calling JavaScript guide</a></td></tr>
    <tr>
      <td>
        other Scala classes<br />
        <small>including value classes</small>
      </td>
      <td>
        <i>opaque, except for exported methods</i><br />
        <small>Note: <code>toString()</code> is always exported</small>
      </td>
      <td>see <a href="export-to-javascript.html">exporting Scala.js APIs to JavaScript</a></td>
    </tr>
  </tbody>
</table>

On the other hand, some JavaScript (collection) types have similar types in Scala. Instead of mapping them directly, Scala.js provides conversions between them. We show with a couple of snippets how you can convert from JavaScript to Scala types and back. Please refer to the [Scaladocs]({{ BASE_PATH }}/doc/api.html) for details.

### `js.Array[T] <--> mutable.Seq[T]`

{% highlight scala %}
import scala.scalajs.js

val jsArr = js.Array(1, 2, 3)

// Scala style operations on js.Array (returns a js.Array)
val x: js.Array[Int] = jsArr.takeWhile(_ < 3)

// Use a js.Array as a Scala mutable.Seq
val y: mutable.Seq[Int] = jsArr

// toArray (from js.ArrayOps) -- Copy into scala.Array
val z: scala.Array[Int] = jsArr.toArray

import js.JSConverters._

val scSeq = Seq(1, 2, 3)

// Seq to js.Array -- Copy to js.Array
val jsArray: js.Array[Int] = scSeq.toJSArray
{% endhighlight %}

### `js.Dictionary[T] <--> mutable.Map[String, T]`

{% highlight scala %}
import scala.scalajs.js

val jsDict = js.Dictionary("a" -> 1, "b" -> 2)

// Scala style operations on js.Dictionary (returns mutable.Map)
val x: mutable.Map[String, Int] = jsDict.mapValues(_ * 2)

// Use a js.Dictionary as Scala mutable.Map
val y: mutable.Map[String, Int] = jsDict

import js.JSConverters._

val scMap = Map("a" -> 1, "b" -> 2)

// Map to js.Dictionary -- Copy to js.Dictionary
val jsDictionary: js.Dictionary[Int] = scMap.toJSDictionary
{% endhighlight %}

### `js.UndefOr[T] <--> Option[T]`

{% highlight scala %}
import scala.scalajs.js

val jsUndefOr: js.UndefOr[Int] = 1

// Convert to scala.Option
val x: Option[Int] = jsUndefOr.toOption

import js.JSConverters._

val opt = Some(1)

// Convert to js.Undefined
val y: js.UndefOr[Int] = opt.orUndefined
{% endhighlight %}
