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

Note: when using ECMAScript modules, fullopt file [optimization](../internals/performance.html) is limited, because Google Closure Compiler cannot be used with them.

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

## Module Splitting

When emitting modules, the Scala.js linker is able to split its output into multiple JavaScript modules (i.e. files).

There are several reasons to split the JavaScript output into multiple files:

* Share code between different parts of an application (e.g. user/admin interfaces).
* Load parts of a large app progressively
* Create smaller files to minimize changes for incremental downstream tooling.

The Scala.js linker can split a full Scala.js application automatically based on:

* Entry points (top-level exports and module initializers)
* Dynamic import boundaries (calls to `js.dynamicImport`)
* The split style (fewest modules, smallest modules, or a combination thereof)

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

### Dynamic Imports

Warning: Dynamic imports in Scala.js 1.4.0 are affected by [#4386](https://github.com/scala-js/scala-js/issues/4386), see the issue for a workaround.

Dynamic imports allow a Scala.js application to be loaded in multiple steps to reduce initial loading time.
To defer loading of a part of your Scala.js application to a later point in time, use [`js.dynamicImport`]({{ site.production_url }}/api/scalajs-library/latest/scala/scalajs/js/index.html#dynamicImport[A](body:=%3EA):scala.scalajs.js.Promise[A]):

**Example**:

{% highlight scala %}
import scala.scalajs.js
import scala.scalajs.js.annotation._

import scala.concurrent.ExecutionContext.Implicits.global

class HeavyFeature {
  def doHeavyFeature(x: Int): Int =
    x * 2
}

object MyApp {
  @JSExportTopLevel(name = "onClick")
  def onClick(input: Int): Unit = {
    val resultPromise: js.Promise[Int] = js.dynamicImport {
      new HeavyFeature().doHeavyFeature(input)
    }
    for (result <- resultPromise.toFuture)
      updateUIWithOutput(result)
  }

  private def updateUIWithOutput(i: Int): Unit = ???
}
{% endhighlight %}

The `js.dynamicImport` method has the following signature:

{% highlight scala %}
def dynamicImport[A](body: => A): js.Promise[A]
{% endhighlight %}

Semantically, it will evaluate `body` asynchronously and return a Promise of the result.
More importantly, it acts as a border for the Scala.js linker to split out a module that will be dynamically loaded.
The above program would generate
* a public module `main.js` containing `onClick` and its direct dependencies
* an internal module `MyApp$$anon$1.js` containing `HeavyFeature`
* an internal module `main-MyApp$$anon$1.js` containing common dependencies of `main.js` and `MyApp$$anon$1.js`.

Internal modules allow the Scala.js linker to split code internally.
Unlike public modules, internal modules may not be imported by user code.
Doing so is undefined behavior and subject to change at any time.

In the example above, the `js.dynamicImport` is replaced by `import("./MyApp$$anon$1.js")`, followed by an invocation of the main entry point in `MyApp$$anon$1.js` (the `body` passed to `js.dynamicImport`).
Therefore, when `main.js` is loaded, we do not need to load, nor download `MyApp$$anon$1.js`.
It will only be loaded the first time `onClick` is actually called.
This reduces the initial download time for users.

Dynamic imports and entry points can be arbitrarily combined.

### Module Split Styles

So far, we have seen how public modules and dynamic import boundaries can be defined.

Based on these, the Scala.js linker automatically uses the dependency graph of the code to generate appropriate internal modules.

However, there are still choices involved.
They can be configured with the `moduleSplitStyle`:

{% highlight scala %}
import org.scalajs.linker.interface.ModuleSplitStyle
scalaJSLinkerConfig ~= (_.withModuleSplitStyle(ModuleSplitStyle.SmallestModules))
{% endhighlight %}

There are currently three module split styles: `FewestModules`, `SmallestModules` and `SmallModulesFor(packages)`.

#### `FewestModules`

Create as few modules as possible
* while respecting dynamic import boundaries and
* without including unnecessary code.

This is the default.

In the entry points example above, this would generate:

* `a.js`: public module, containing `AppA` and the export of `start`.
* `b.js`: public module, containing `AppB`, `mutable.Set`, the export of `start` and the call to `AppB.main`
* `a-b.js`: internal module, Scala.js core and the implementation of `println`.

This also works for more than two public modules, creating intermediate shared (internal) modules as necessary.

The dynamic import example above already assumes this module split style so a module listing is omitted.

#### `SmallestModules`

Create modules that are as small as possible.
The smallest unit of splitting is a Scala class (see [Splitting Granularity](#splitting-granularity) below for more).

Using this mode typically results in an internal module per class with the exception of classes that have circular dependencies: these are put into the same module to avoid a circular module dependency graph.

In the entry points example above, this would generate:

* `a.js`: public module, containing the export of `start`.
* `b.js`: public module, containing the export of `start` and the call to `AppB.main`
* many internal small modules (~50 for this example), approximately one per class.

In the dynamic import example, this would generate:
* `main.js`: public module, containing the export of `onClick`.
* many internal small modules (~150 for this example), approximately one per class.

Generating many small modules can be useful if the output of Scala.js is further processed by downstream JavaScript bundling tools.
In incremental builds, they will not need to reprocess the entire Scala.js-generated .js file, but instead only the small modules that have changed.

#### `SmallModulesFor(packages: List[String])`

Create modules that are as small as possible for the classes in the specified `packages` (and their subpackages).
For all other classes, create as few modules as possible.
This is a combination of the two other split styles.

The typical usage pattern is to list the application's packages as argument.
This way, often-changing classes receive independent, small modules, while the stable classes coming from libraries are bundled together as much as possible.
For example, if your application code lives in `my.app`, you could configure your module split style as:

{% highlight scala %}
import org.scalajs.linker.interface.ModuleSplitStyle
scalaJSLinkerConfig ~= (_.withModuleSplitStyle(ModuleSplitStyle.SmallModulesFor(List("my.app"))))
{% endhighlight %}

### Splitting Granularity

Scala.js only splits modules along class boundaries.
It is important to be aware of this when structuring your application to avoid unnecessary grouping.

For example, the following structure likely leads to poor splitting (if `FeatureN`s are not always used together):

{% highlight scala %}
object UI {
  def renderFeature1(): Unit = ???
  def renderFeature2(): Unit = ???
  def renderFeature3(): Unit = ???
}

object Calc {
  def calcFeature1(): Unit = ???
  def calcFeature2(): Unit = ???
  def calcFeature3(): Unit = ???
}
{% endhighlight %}

For better splitting, group code that belongs to the same feature:

{% highlight scala %}
object Feature1 {
  def render(): Unit = ???
  def calc(): Unit = ???
}

object Feature2 {
  def render(): Unit = ???
  def calc(): Unit = ???
}

object Feature3 {
  def render(): Unit = ???
  def calc(): Unit = ???
}
{% endhighlight %}

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
   .withOutputPatterns(OutputPatterns.fromJSFile("%s.mjs"))
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
