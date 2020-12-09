---
layout: doc
title: Emitting JavaScript modules
---

## Basic Module Setup

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

## Module splitting

When emitting modules, the Scala.js linker is able to split its output into multiple JavaScript modules (i.e. files).

There are several reasons to split the JavaScript output into multiple files:

* Share code between different parts of an application (e.g. user/admin interfaces).
* Create smaller files to minimize changes for incremental downstream tooling.
* Load parts of a large app progressively (not supported yet, see [#4201](https://github.com/scala-js/scala-js/issues/4201)).

The Scala.js linker can split a full Scala.js application automatically based on:

* The entry points (top-level exports and module initializers)
* The split style (fewest modules or smallest modules)

### Entry Points

Scala.js-generated code has two different kinds of entry points:

* [Top-level exports]({{ site.production_url }}/doc/interoperability/export-to-javascript.html): Definitions to be called from external JS code.
* [Module initializers](./building.html): Code that gets executed when a module is imported (i.e., main methods).

The Scala.js linker determines how to group entry points into different (public) modules by using their assigned `moduleID`.
The default `moduleID` is `"main"`.

The `moduleID` of a top-level export can be specified using the [`moduleID` parameter]({{ site.production_url }}/api/scalajs-library/latest/scala/scalajs/js/annotation/JSExportTopLevel.html#%3Cinit%3E(name:String,moduleID:String):scala.scalajs.js.annotation.JSExportTopLevel).
The `moduleID` of a `ModuleInitializer` can be specified by the [`withModuleID` method]({{ site.production_url }}/api/scalajs-linker-interface/latest/org/scalajs/linker/interface/ModuleInitializer.html#withModuleID(moduleID:String):org.scalajs.linker.interface.ModuleInitializer).

**Example**:

Say you have the following `App.scala` and `build.sbt`:

{% highlight scala %}
package my.app

import scala.collection.mutable
import scala.scalajs.js.annotation._

// Separate objects to allow for splitting.

object AppA {
  @JSExportTopLevel(name = "start", moduleID = "a")
  def a(): Unit = println("hello from a")
}

object AppB {
  private val x = mutable.Set.empty[String]

  @JSExportTopLevel(name = "start", moduleID = "b")
  def b(): Unit = {
    println("hello from b")
    println(x)
  }

  def main(): Unit = x.add("something")
}
{% endhighlight %}

{% highlight scala %}
import org.scalajs.linker.interface.ModuleInitializer

scalaJSModuleInitializers in Compile += {
  ModuleInitializer.mainMethod("my.app.AppB", "main").withModuleID("b")
}
{% endhighlight %}

This would generate two public modules `a.js` / `b.js`.
`a.js` will export a method named `start` that calls `AppA.a`.
`b.js` will export a method named `start` that calls `AppB.b`.
Further, importing `b.js` will call `AppB.main`.

Note that there is no public module `main.js`, because there is no entry point using the default `moduleID`.

### Module Split Styles

So far, we have seen how public modules can be configured.
Based on the public modules, the Scala.js linker generates internal modules for the shared code between the public modules.
Unlike public modules, internal modules may not be imported by user code.
Doing so is undefined behavior and subject to change at any time.

The linker generates internal modules automatically based on the dependency graph of the code and `moduleSplitStyle`.
You can change it as follows:

{% highlight scala %}
import org.scalajs.linker.interface.ModuleSplitStyle
scalaJSLinkerConfig ~= (_.withModuleSplitStyle(ModuleSplitStyle.SmallestModules))
{% endhighlight %}

There are currently two module split styles: `FewestModules` and `SmallestModules`.

#### `FewestModules`

Create as few modules as possible without including unnecessary code.
This is the default.

In the example above, this would generate:

* `a.js`: public module, containing `AppA` and the export of `start`.
* `b.js`: public module, containing `AppB`, `mutable.Set`, the export of `start` and the call to `AppB.main`
* `a-b.js`: internal module, Scala.js core and the implementation of `println`.

This also works for more than two public modules, creating intermediate shared (internal) modules as necessary.

#### `SmallestModules`

Create modules that are as small as possible.
The smallest unit of splitting is a Scala class.

Using this mode typically results in an internal module per class with the exception of classes that have circular dependencies: these are put into the same module to avoid a circular module dependency graph.

In the example above, this would generate:

* `a.js`: public module, containing the export of `start`.
* `b.js`: public module, containing the export of `start` and the call to `AppB.main`
* many internal small modules (~50 for this example), approximately one per class.

Generating many small modules can be useful if the output of Scala.js is further processed by downstream JavaScript bundling tools.
In incremental builds, they will not need to reprocess the entire Scala.js-generated .js file, but instead only the small modules that have changed.

### Linker Output

With module splitting, the set of files created by the linker is not known at invocation time.
To support this new requirement, the linker output is configured as follows:

* A directory where all files go: `scalaJSLinkerOutputDirectory`
* Patterns for output file names: `outputPatterns` on `scalaJSLinkerConfig`.

Both of these have reasonable defaults and usually do not need to be changed.
The exception is file extensions for Node.js, for that, see the next section.

In order to make sense of the files in the directory, the linking tasks (`fastLinkJS`/`fullLinkJS`) return a [`Report`]({{ site.production_url }}/api/scalajs-linker-interface/latest/org/scalajs/linker/interface/Report.html) listing the public modules and their file names.

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
