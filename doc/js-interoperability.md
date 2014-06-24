---
layout: page
title: JavaScript interoperability
---
{% include JB/setup %}

A key feature of Scala.js is its interoperability with JavaScript code, which
far exceeds that of many other languages targeting JavaScript. Except of course
for languages that translate almost literally to JavaScript (e.g.,
[TypeScript](http://www.typescriptlang.org/) and
[CoffeeScript](http://coffeescript.org/)).

Scala.js exhibits both means to call JavaScript APIs from Scala.js, and to be
called from JavaScript code.

* [Call JavaScript APIs from Scala.js](calling-javascript.html)
* [Export Scala.js APIs to JavaScript](export-to-javascript.html)

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
    <tr><td>java.lang.String</td><td>string</td><td></tr></tr>
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
