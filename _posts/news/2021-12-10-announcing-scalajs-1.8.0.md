---
layout: post
title: Announcing Scala.js 1.8.0
category: news
tags: [releases]
permalink: /news/2021/12/10/announcing-scalajs-1.8.0/
---


We are excited to announce the release of Scala.js 1.8.0!

This release supports Node.js 17 out of the box.
If you were previously using one of the workarounds described [in this issue](https://github.com/scala-js/scala-js-js-envs/issues/12), you may remove it when upgrading to Scala.js 1.8.0.

It also introduces compiler warnings when using the default `ExecutionContext.global`.
Read below for details about the reasons, replacements and ways to silence the warnings.

Finally, it introduces a few new language features, including support for the JavaScript metaproperty `new.target`.

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to [the tutorial]({{ BASE_PATH }}/tutorial/).

If you need help with anything related to Scala.js, you may find our community [on Gitter](https://gitter.im/scala-js/scala-js) and [on Stack Overflow](https://stackoverflow.com/questions/tagged/scala.js).

Bug reports can be filed [on GitHub](https://github.com/scala-js/scala-js/issues).

## Release notes

If upgrading from Scala.js 0.6.x, make sure to read [the release notes of Scala.js 1.0.0]({{ BASE_PATH }}/news/2020/02/25/announcing-scalajs-1.0.0/) first, as they contain a host of important information, including breaking changes.

This is a **minor** release:

* It is backward binary compatible with all earlier versions in the 1.x series: libraries compiled with 1.0.x through 1.7.x can be used with 1.8.0 without change.
* It is *not* forward binary compatible with 1.7.x: libraries compiled with 1.8.0 cannot be used with 1.7.x or earlier.
* It is *not* entirely backward source compatible: it is not guaranteed that a codebase will compile *as is* when upgrading from 1.7.x (in particular in the presence of `-Xfatal-warnings`).

As a reminder, libraries compiled with 0.6.x cannot be used with Scala.js 1.x; they must be republished with 1.x first.

## New compiler warnings with broad applicability

### The default `ExecutionContext.global` is now deprecated

The default `ExecutionContext` provided by Scala.js as `ExecutionContext.global` and `ExecutionContext.Implicits.global` uses JavaScript `Promise`s as its underlying mechanism.
While it is standard in ECMAScript 2015+, it turns out that they are not *fair* with respect to other asynchronous events, like timers and network operations.
Details on this issue are explained in [the readme for `scalajs-macrotask-executor`](https://github.com/scala-js/scala-js-macrotask-executor).

We cannot fix the default `ExecutionContext` because the only existing solutions use features of browsers and Node.js that are outside of the ECMAScript standard.
To address the issue, Scala.js 1.8.0 emits a compiler warning to nudge users towards using `scalajs-macrotask-executor`.

Attempts to use either of the following imports:

{% highlight scala %}
import scala.concurrent.ExecutionContext.global
import scala.concurrent.ExecutionContext.Implicits.global
{% endhighlight %}

will emit the following extensive warning:

{% highlight none %}
Test.scala:5: warning: The global execution context in Scala.js is based on JS Promises (microtasks).
Using it may prevent macrotasks (I/O, timers, UI rendering) from running reliably.

Unfortunately, there is no way with ECMAScript only to implement a performant
macrotask execution context (and hence Scala.js core does not contain one).

We recommend you use: https://github.com/scala-js/scala-js-macrotask-executor
Please refer to the README.md of that project for more details regarding
microtask vs. macrotask execution contexts.

If you do not care about macrotask fairness, you can silence this warning by:
- Adding @nowarn("cat=other") (Scala >= 2.13.x only)
- Setting the -P:scalajs:nowarnGlobalExecutionContext compiler option
- Using scala.scalajs.concurrent.JSExecutionContext.queue
  (the implementation of ExecutionContext.global in Scala.js) directly.

If you do not care about performance, you can use
scala.scalajs.concurrent.QueueExecutionContext.timeouts().
It is based on setTimeout which makes it fair but slow (due to clamping).

      scala.concurrent.Future { }
                              ^
{% endhighlight %}

As the warning says, the recommended fix is to use the executor provided by [`scalajs-macrotask-executor`](https://github.com/scala-js/scala-js-macrotask-executor), as an external dependency.

If you prefer to keep the existing behavior and silence the warning instead, this can be done in a number of ways:

* Adding `@nowarn("cat=other")` (Scala >= 2.13.x only)
* Setting the `-P:scalajs:nowarnGlobalExecutionContext` compiler option (in sbt, with `scalacOptions += "-P:scalajs:..."`)
* Using `scala.scalajs.concurrent.JSExecutionContext.queue` (the implementation of ExecutionContext.global in Scala.js) directly

## New features

### `@JSImport`'s second argument is now optional

When importing native JS members from a module, we use `@JSImport` as follows:

{% highlight scala %}
@js.native @JSImport("module.js", "SomeClass")
class SomeClass extends js.Object

@js.native @JSImport("fs", "readFileSync")
def readFileSync(file: String, charset: String): String = js.native
{% endhighlight %}

The first argument to `@JSImport` represents the module name, while the second one is the module member name to import.
In many cases, like in the examples above, the member name is reused as the Scala name.

Starting with Scala.js 1.8.0, the second argument becomes optional, and defaults to the name of the Scala entity that is annotated.
The above example can be simplified as follows, without change of behavior:

{% highlight scala %}
@js.native @JSImport("module.js")
class SomeClass extends js.Object

@js.native @JSImport("fs")
def readFileSync(file: String, charset: String): String = js.native
{% endhighlight %}

### `@JSGlobal`'s argument is now optional when used inside an `object`

Similarly to the above change, the argument of `@JSGlobal` is now optional when the annotated entity is in a Scala `object`.
It was already optional when used at the top-level.
For example, the following is now allowed:

{% highlight scala %}
object JSTimers {
  @js.native @JSGlobal
  def setTimeout(f: js.Function0[Any], delay: Int): Unit
}
{% endhighlight %}

### New primitive for JavaScript's metaproperty `new.target`

The [JavaScript metaproperty `new.target`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new.target) gives access to the constructor that was used in a calling `new Foo()` expression.
It is mainly used in a parent class constructor to know what child class is being instantiated:

{% highlight javascript %}
class Parent {
  constructor() {
    console.log("Instantiating a " + new.target.name);
  }
}

class Child extends Parent {
  constructor() {
    super();
  }
}

new Parent() // prints "Instantiating a Parent"
new Child()  // prints "Instantiating a Child"
{% endhighlight %}

Scala.js 1.8.0 introduces a new primitive, `js.new.target`, which can be used in the constructor of non-native JS classes, and is equivalent to JavaScript's `new.target`.
With it, the above example can be translated to Scala.js as:

{% highlight scala %}
import scala.scalajs.js

class Parent extends js.Object {
  println("Instantiating a " + js.`new`.target.name)
}

class Child extends Parent

new Parent()
new Child()
{% endhighlight %}

Attempting to use `js.new.target` anywhere but in the constructor of a non-native JS class will result in a compile error.

While JavaScript also allows to use `new.target` in a `function` body, there is no equivalent in Scala.js so far.
We expect the use cases for that to be very rare, and we have not found a compelling design for that feature in Scala.js yet.
This is still tracked as [issue #4588](https://github.com/scala-js/scala-js/issues/4588).

### Hashbang lines are accepted in .js file headers

Scala.js 1.7.0 introduced a new linker configuration, `jsHeader`, to specify a comment to insert at the top of .js files:
Scala.js 1.8.0 extends that mechanism to allow hashbang lines at the very beginning of the header.
For example, the following header is now valid:

{% highlight scala %}
scalaJSLinkerConfig ~= {
  _.withJSHeader(
    """
      |#!/usr/bin/env node
      |
      |/* This is the header, which source maps
      | * take into account.
      | */
    """.stripMargin.trim() + "\n"
  )
}
{% endhighlight %}

## Miscellaneous

### New JDK APIs

The following methods of `java.lang.String` were added (thanks to [@tom91136](https://github.com/tom91136)):

* `isBlank()`
* `strip()`
* `stripLeading()`
* `stripTrailing()`
* `indent(n: Int)`
* `stripIndent()`
* `translateEscapes()`

### Upgrade to GCC v20211201

We upgraded to the Google Closure Compiler v20211201.

## Bug fixes

Among others, the following bugs have been fixed in 1.8.0:

* [#4581](https://github.com/scala-js/scala-js/issues/4581) Scala.js v1.7.0 breaks pattern match in constructor of non-native JS class
* [#4583](https://github.com/scala-js/scala-js/issues/4583) Error while emitting, head of empty list
* [#4560](https://github.com/scala-js/scala-js/issues/4560) Console output (e.g., `println`) not redirected to sbt client
* [#4601](https://github.com/scala-js/scala-js/issues/4601) IR checking error with `scala-java-time`
* [#4604](https://github.com/scala-js/scala-js/issues/4604) `0/0` should throw an exception

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av1.8.0+is%3Aclosed).
