---
layout: doc
title: Emitting a JavaScript module
---

By default, the `-fastopt.js` and `-fullopt.js` files produced by Scala.js are top-level *scripts*, and their `@JSExport`ed stuff are sent to the global scope.
With modern JavaScript toolchains, we typically write *modules* instead, which import and export things from other modules.
You can configure Scala.js to emit a JavaScript module instead of a top-level script.
Currently, only the CommonJS module format is supported, with the following sbt setting:

{% highlight scala %}
scalaJSLinkerConfig ~= { _.withModuleKind(ModuleKind.CommonJSModule) }
{% endhighlight %}

**Important:** Using this setting is incompatible with the (deprecated) setting `persistLauncher := true`.
It is also basically incompatible with `jsDependencies`; use [scalajs-bundler](https://scalacenter.github.io/scalajs-bundler/) instead.

When emitting a module, `@JSExportTopLevel`s are really *exported* from the Scala.js module.
Moreover, you can use top-level `@JSImport` to [import native JavaScript stuff](../interoperability/facade-types.html#import) from other JavaScript module.

For example, consider the following definitions:

{% highlight scala %}
import scala.scalajs.js
import scala.scalajs.js.annotation._

@js.native
@JSImport("bar.js", "Foo")
class JSFoo(val x: Int) extends js.Object

// @ScalaJSDefined // required for Scala.js 0.6.x, unless using -P:scalajs:sjsDefinedByDefault
@JSExportTopLevel("Babar")
class Foobaz(x: String) extends js.Object {
  val inner = new JSFoo(x.length)

  def method(y: String): Int = x + y
}
{% endhighlight %}

Once compiled under `ModuleKind.CommonJSModule`, the resulting module would be equivalent to the following JavaScript module:

{% highlight javascript %}
var bar = require("bar.js");

class Foobaz {
  constructor(x) {
    this.x = x;
    this.inner = new bar.Foo(x.length);
  }

  method(y) {
    return this.x + y;
  }
}

exports.Babar = Foobaz;
{% endhighlight %}
