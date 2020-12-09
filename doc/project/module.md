---
layout: doc
title: Emitting a JavaScript module
---

By default, the `-fastopt.js` and `-fullopt.js` files produced by Scala.js are top-level *scripts*, and their `@JSExport`ed stuff are sent to the global scope.
With modern JavaScript toolchains, we typically write *modules* instead, which import and export things from other modules.
You can configure Scala.js to emit a JavaScript module instead of a top-level script.

Two kinds of modules are supported: CommonJS modules (traditional module system of Node.js) and ECMAScript modules.
They are enabled with the following sbt settings:

{% highlight scala %}
// ECMAScript
scalaJSLinkerConfig ~= { _.withModuleKind(ModuleKind.ESModule) }
// CommonJS
scalaJSLinkerConfig ~= { _.withModuleKind(ModuleKind.CommonJSModule) }
{% endhighlight %}

When emitting a module, `@JSExportTopLevel`s are really *exported* from the Scala.js module.
Moreover, you can use top-level `@JSImport` to [import native JavaScript stuff](../interoperability/facade-types.html#import) from other JavaScript module.

For example, consider the following definitions:

{% highlight scala %}
import scala.scalajs.js
import scala.scalajs.js.annotation._

@js.native
@JSImport("bar.js", "Foo")
class JSFoo(val x: Int) extends js.Object

@JSExportTopLevel("Babar")
class Foobaz(x: String) extends js.Object {
  val inner = new JSFoo(x.length)

  def method(y: String): Int = x + y
}
{% endhighlight %}

Once compiled under `ModuleKind.ESModule`, the resulting module would be equivalent to the following JavaScript module:

{% highlight javascript %}
import { Foo as JSFoo } from "bar.js";

class Foobaz {
  constructor(x) {
    this.x = x;
    this.inner = new JSFoo(x.length);
  }

  method(y) {
    return this.x + y;
  }
}

export { Foobaz as Babar };
{% endhighlight %}

With `ModuleKind.CommonJSModule`, it would instead be equivalent to:

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

## ES modules and Node.js

Node.js needs explicit signaling that a module is an ECMAScript module (the default is CommonJS).

There are two ways to achieve this:
* Use the file extension `.mjs`.
* Configure it in `package.json`.

For details, see the [Node.js packages documentation](https://nodejs.org/api/packages.html#packages_determining_module_system).

To set the extension used by Scala.js to `.mjs` use the following setting:

{% highlight scala %}
import org.scalajs.linker.interface.OutputPatterns

scalaJSLinkerConfig ~= {
  // Enable ECMAScript module output.
  _.withModuleKind(ModuleKind.ESModule)
  // Use .mjs extension.
   .withOutputPatterns(OutputPatterns.fromJSFile(".mjs"))
}
{% endhighlight %}

**Note for Scala.js 1.2.x and earlier:**

`OutputPatterns` was introduced in Scala.js 1.3.0. In earlier versions, the following settings were necessary:

{% highlight scala %}
artifactPath in (proj, Compile, fastOptJS) :=
  (crossTarget in (proj, Compile)).value / "myproject.mjs"

artifactPath in (proj, Test, fastOptJS) :=
  (crossTarget in (proj, Test)).value / "myproject-test.mjs"
{% endhighlight %}
