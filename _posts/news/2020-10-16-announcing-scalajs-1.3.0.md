---
layout: post
title: Announcing Scala.js 1.3.0
category: news
tags: [releases]
permalink: /news/2020/10/16/announcing-scalajs-1.3.0/
---


We are excited to announce the release of Scala.js 1.3.0!

This release brings one of the most awaited features for Scala.js: module splitting support!
It is now possible to split the generated .js file into multiple modules, to optimize download size in multi-page applications or speed up incremental bundling.

In addition, this release contains a number of new methods and classes in the JDK implementation, among which the higher-order methods of the `java.util` collections, and the locale-sensitive overloads of `String.toLowerCase`, `toUpperCase` and `format`.

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to [the tutorial]({{ BASE_PATH }}/tutorial/).

If you need help with anything related to Scala.js, you may find our community [on Gitter](https://gitter.im/scala-js/scala-js) and [on Stack Overflow](https://stackoverflow.com/questions/tagged/scala.js).

Bug reports can be filed [on GitHub](https://github.com/scala-js/scala-js/issues).

## Release notes

If upgrading from Scala.js 0.6.x, make sure to read [the release notes of Scala.js 1.0.0]({{ BASE_PATH }}/news/2020/02/25/announcing-scalajs-1.0.0/) first, as they contain a host of important information, including breaking changes.

This is a **minor** release:

* It is backward binary compatible with all earlier versions in the 1.x series: libraries compiled with 1.0.x through 1.2.x can be used with 1.3.0 without change.
* It is *not* forward binary compatible with 1.2.x: libraries compiled with 1.3.0 cannot be used with 1.2.x or earlier.
* It is *not* entirely backward source compatible: it is not guaranteed that a codebase will compile *as is* when upgrading from 1.2.x (in particular in the presence of `-Xfatal-warnings`).

As a reminder, libraries compiled with 0.6.x cannot be used with Scala.js 1.x; they must be republished with 1.x first.

## Known source breaking changes

### `js.Promise.then`

The result type of `js.Promise.then` was changed from `js.Thenable` to `js.Promise`.
This is unlikely to cause any issue in most cases, since `js.Promise` extends `js.Thenable`.
It might cause compilation errors in some rare cases due to type inference, or if you declare a subclass of `js.Promise`.

## Module splitting

### Quickstart

First, instead of `fastOptJS` / `fullOptJS`, use `fastLinkJS` / `fullLinkJS`.
The outputs of those commands will be in a subdirectory like `project/target/scala-2.13/project-fastopt/`, instead of as a single file `.../scala-2.13/project-fastopt.js`.
You can then create different entry points and/or generate as many small modules as possible using the following setups.

#### For different entry points

Set the `moduleID` for your top-level exports and/or module initializers explicitly (a module initializer is basically a main method for the module).
The default `moduleID` is `"main"`.

{% highlight scala %}
@JSExportTopLevel(name = "startAdmin", moduleID = "admin")
def startAdmin(): Unit = ???
{% endhighlight %}

{% highlight scala %}
import org.scalajs.linker.interface.ModuleInitializer
scalaJSModuleInitializers in Compile += {
  ModuleInitializer.mainMethod("my.app.admin.Main", "main")
    .withModuleID("admin")
}
{% endhighlight %}

Everything with the same `moduleID` will go into the same entry point module.

#### For many small modules

By default, module splitting genereates as few modules as possible.
In some cases, generates as many modules as small as possible is preferable, which can be configured with:

{% highlight scala %}
import org.scalajs.linker.interface.ModuleSplitStyle
scalaJSLinkerConfig ~= (_.withModuleSplitStyle(ModuleSplitStyle.SmallestModules))
{% endhighlight %}

### What is Module Splitting?

With module splitting, the Scala.js linker splits its output into multiple JavaScript modules (i.e. files).
Both ES6 modules (`ModuleKind.ESModule`) and CommonJS modules (`ModuleKind.CommonJSModule`) are supported.

There are several reasons to split JavaScript output into multiple files:

* Share code between different parts of an application (e.g. user/admin interfaces).
* Create smaller files to minimize changes for incremental downstream tooling.
* Load parts of a large app progressively (not supported yet, see [#4201](https://github.com/scala-js/scala-js/issues/4201)).

The Scala.js linker can split a full Scala.js application automatically based on:

* The entry points (top-level exports and module initializers)
* The split style (fewest modules or smallest modules)

### Entry Points

Scala.js-generated code has two different kinds of entry points:

* Top level exports: Definitions to be called from external JS code.
* Module initializers: Code that gets executed when a module is imported (i.e., main methods).

The Scala.js linker determines how to group entry points into different (public) modules by using their assigned `moduleID`.
The default `moduleID` is `"main"`.

The `moduleID` of a top-level export can be specified using the `moduleID` parameter.
The `moduleID` of a `ModuleInitializer` can be specified by the `withModuleID` method.

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
The exception is file extensions.
If you need to produce `*.mjs` files for Node.js, use:

{% highlight scala %}
import org.scalajs.linker.interface.OutputPatterns
scalaJSLinkerConfig ~= (_.withOutputPatterns(OutputPatterns.fromJSFile("%s.mjs")))
{% endhighlight %}

In order to make sense of the files in the directory, linking returns a `Report` listing the public modules and their file names.

### sbt backwards compatibility

Since the `fastOptJS` / `fullOptJS` keys/tasks assume that linking will produce a single file, we had to introduce two new keys/tasks for linking: `fastLinkJS` / `fullLinkJS`.
These tasks return the `Report` instead of an individual `File`.

In order to ensure backwards compatibility, the `fastOptJS` / `fullOptJS` tasks now invoke `fastLinkJS` / `fullLinkJS` respectively and copy the produced files to their target location.
However, this only works if the linker produced a single public module.
So with actual module splitting, `fastOptJS` / `fullOptJS` will fail.

The `run` and `test` tasks now depend on `fastLinkJS` / `fullLinkJS` (depending on the `scalaJSStage`) and load the public module with `moduleID="main"` (they fail if no such module exists).
This does not change their behavior for existing builds but allows running and testing with module splitting enabled.

## Miscellaneous

### New JDK APIs

This release contains a significant amount of additions in the JDK APIs that we support, notably thanks to contributions by [@er1c](https://github.com/er1c), [@ekrich](https://github.com/ekrich) and [@exoego](https://github.com/exoego).

New interface definitions in `java.util.function.*`:

* `BiConsumer`, `Supplier`, `Function`, `BiFunction`, `UnaryOperator`, `BinaryOperator` and `BiPredicate`
* Specializations of `Supplier`, and `Predicate`

New classes:

* `java.lang.Character.UnicodeBlock`
* `java.util.StringTokenizer`
* `java.io.CharArrayWriter`
* `java.io.CharArrayReader`

Methods with fixed behavior to comply with the JDK specification:

* In `java.lang.Character`:
  * `toLowerCase(Char)` and `toUpperCase(Char)`
* In `java.lang.String`:
  * `compareTo`
  * `equalsIgnoreCase`
  * `compareToIgnoreCase`

New methods in existing classes and interfaces (some are only available when compiling on a recent enough JDK):

* In `java.lang.String`:
  * `repeat` (JDK 11+)
* In `java.lang.Character`:
  * `toLowerCase(codePoint: Int)` and `toUpperCase(codePoint: Int)`
  * `toTitleCase(ch: Char)` and `toTitleCase(codePoint: Int)`
  * `highSurrogate` and `lowSurrogate`
  * `hashCode(ch: Char)`
  * `reverseBytes(ch: Char)`
  * `toString(codePoint: Int)` (JDK 11+)
* Default methods in `java.util.Iterator`:
  * `remove`
  * `forEachRemaining`
* Default methods in `java.util.List`:
  * `sort`
  * `replaceAll`
* Default methods in `java.util.Map`:
  * `getOrDefault`
  * `forEach`
  * `replaceAll`
  * `putIfAbsent`
  * `remove(key, value)`
  * `replace(key, oldValue, newValue)`
  * `replace(key, value)`
  * `computeIfAbsent`
  * `computeIfPresent`
  * `compute`
  * `merge`
* In `java.util.Optional`:
  * `isEmpty` (JDK 11+)
  * `ifPresent`
  * `ifPresentOrElse` (JDK 9+)
  * `filter`
  * `map`
  * `flatMap`
  * `or` (JDK 9+)
  * `orElse`
  * `orElseGet`
  * `orElseThrow(Supplier)`
  * `orElseThrow()` (JDK 10+)
* In `java.util.Properties`:
  * `load`
  * `save`
  * `store`
  * `list`

Finally, the following `Locale`-sensitive methods have been added, although they will only transitively link if support for `java.util.Locale` APIs is enabled using [scala-java-locales](https://github.com/cquiroz/scala-java-locales):

* In `java.lang.String`:
  * `toLowerCase(Locale)` and `toUpperCase(Locale)`
  * `format(Locale, ...)`
* In `java.util.Formatter`:
  * constructors with a `Locale` parameter
  * `format(Locale, ...)`

Speaking of locales, we have slightly changed the definition of the default locale of Scala.js.
Previously, it was specified as `en-US`.
Starting from Scala.js 1.3.0, it is specified as `Locale.ROOT`.
This change makes no difference in terms of behavior (only in terms of "spirit"), since all the methods that were previously implemented in Scala.js have the same behavior for `ROOT` than for `en-US`.

Note that it is not possible to change the default locale, as methods that do not take `Locale` arguments are hard-coded for the behavior of `Locale.ROOT` (even when `scala-java-locales` is used).
To get locale-sensitive behavior, the overloads taking explicit `Locale` arguments must be used.

## Bug fixes

Among others, the following bugs have been fixed in 1.3.0:

* [#4195](https://github.com/scala-js/scala-js/issues/4195) `LinkedHashMap` iteration not empty after `clear`
* [#4188](https://github.com/scala-js/scala-js/issues/4188) Make `js.Promise.then` return `js.Promise` instead of `js.Thenable`
* [#4203](https://github.com/scala-js/scala-js/issues/4203) `Matcher.region` not mutating the matcher
* [#4204](https://github.com/scala-js/scala-js/issues/4204) `Matcher.start()/end()` give incorrect results
* [#4210](https://github.com/scala-js/scala-js/issues/4210) `java.util.Date.from(Instant)` throws the wrong kind of exception

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av1.3.0+is%3Aclosed).
