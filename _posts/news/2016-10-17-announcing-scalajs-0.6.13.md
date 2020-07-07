---
layout: post
title: Announcing Scala.js 0.6.13
category: news
tags: [releases]
permalink: /news/2016/10/17/announcing-scalajs-0.6.13/
---


We are excited to announce the release of Scala.js 0.6.13!

This release contains one particularly anticipated feature: the ability to generate CommonJS modules with Scala.js!
It also standardizes on Node.js as the default runner for all sbt projects (with `sbt run` and `sbt test`), which constitutes a breaking change for builds.
Read on for more details!

<!--more-->

## Getting started

If you are new to Scala.js, head over to
[the tutorial]({{ BASE_PATH }}/tutorial/).

## Release notes

As a minor release, 0.6.13 is backward source and binary compatible with previous releases in the 0.6.x series, although *build* definitions are not.
Libraries compiled with earlier versions can be used with 0.6.13 without change.
However, it is not forward compatible: libraries compiled with 0.6.13 cannot be used by projects using 0.6.{0-12}.

Please report any issues [on GitHub](https://github.com/scala-js/scala-js/issues).

## Breaking changes

This release changes the default JavaScript interpreters used to perform `sbt run` and `sbt test`.
Until 0.6.12 (and since 0.6.6), the defaults were:

* Rhino by default
* Node.js with `scalaJSUseRhino in Global := false`
* PhantomJS with `scalaJSUseRhino in Global := false` and `jsDependencies += RuntimeDOM`

The new defaults are the following:

* Node.js by default
* Node.js + [`jsdom`](https://github.com/jsdom/jsdom) with `jsDependencies += RuntimeDOM`

Note that Node.js and jsdom need to be installed separately on your system.

* [Download Node.js here](https://nodejs.org/en/download/)
* Install jsdom with `npm install jsdom` (either in your project's root directory, or [globally](https://docs.npmjs.com/getting-started/installing-npm-packages-globally))

We decided to standardize on Node.js for all command-line executions by default because it is always the best alternative.
Rhino is extremely slow.
Although using it by default works out-of-the-box, it caused a number of users to stick to it and discovering months or years later that their tests could run 10x-100x faster by switching to Node.js.
PhantomJS, on the other hand, [reportedly suffers from significant issues](https://github.com/scala-js/scala-js/issues/1881).
`jsdom` seems to be better maintained at this point.

You can restore the previous behaviors with the following sbt settings:

* Rhino: `scalaJSUseRhino in Global := true`.
  Rhino is however *deprecated*, and will not be supported anymore in 1.0.0.
* PhantomJS: `jsEnv := PhantomJSEnv().value`.

Remember that you can also use Selenium with Scala.js, using [scalajs-env-selenium](https://github.com/scala-js/scala-js-env-selenium).

## Deprecation: `@JSGlobalScope` replaces `extends js.GlobalScope`

As indicated by a deprecation warning, `extends js.GlobalScope` should not be used anymore.
Instead, you should annotate the object with `@JSGlobalScope`.
For example, this old snippet:

{% highlight scala %}
import scala.scalajs.js

@js.native
object Foo extends js.GlobalScope
{% endhighlight %}

should be replaced with

{% highlight scala %}
import scala.scalajs.js
import js.annotation._

@js.native
@JSGlobalScope
object Foo extends js.Object
{% endhighlight %}

## `@JSImport` and emitting CommonJS modules

This is a long-awaited feature!
Scala.js can now emit CommonJS modules (i.e., those used by Node.js, as well as several bundlers).

### Enabling CommonJS module

You can enable emission of a CommonJS module with the following sbt setting:

{% highlight scala %}
scalaJSModuleKind := ModuleKind.CommonJSModule
{% endhighlight %}

When emitting a CommonJS module, top-level `@JSExport`ed classes and objects are stored in the `exports` object, so that they can be required from other CommonJS modules.

Obviously, this requires that you use Node.js for `sbt run` and `sbt test` (should you use them at all), and that you use a JavaScript bundler such as [Webpack](https://webpack.github.io/docs/) to create a bundle fit for use in the browser.
At the moment, Scala.js does not provide any facility to do so.

Emitting CommonJS modules is also not compatible with `persistLauncher := true`, as a different launcher needs to be emitted for fastOpt versus fullOpt.

You can find more information on module support [in the documentation]({{ BASE_PATH }}/doc/project/module.html).

### Importing stuff from other CommonJS modules

To import other CommonJS modules from Scala.js, you should use `@JSImport` ([Scaladoc]({{ site.production_url }}/api/scalajs-library/0.6.13/#scala.scalajs.js.annotation.JSImport)).
Semantically speaking, `@JSImport` is an [ECMAScript 2015 import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import), but Scala.js desugars it into a CommonJS `require`.
Let us see an example first:

{% highlight scala %}
import scala.scalajs.js
import js.annotation._

// ES6:      import { Foo } from "bar.js"
// CommonJS: var Foo = require("bar.js").Foo;
@js.native
@JSImport("bar.js", "Foo")
class Foobaz(var bar: Int) extends js.Object

val foo = new Foobaz(5) // JS: new Foo(5)
{% endhighlight %}

If the module exports top-level functions or variables, you should create an `object` representing the module itself, like this:

{% highlight scala %}
// ES6:      import * as bar from "bar.js"
// CommonJS: var bar = require("bar.js");
@js.native
@JSImport("bar.js", JSImport.Namespace)
object Bar extends js.Object {
  def aFunction(x: Int): Int = js.native
}

val result = Bar.aFunction(5) // JS: bar.aFunction(5)
{% endhighlight %}

Note that importing with `@JSImport` is completely incompatible with the `jsDependencies` mechanism.
If you use `@JSImport`, you have to manage your JavaScript dependencies on your own (possibly through `npm`).

You can find more information on `@JSImport` [in the facade types documentation]({{ BASE_PATH }}/doc/interoperability/facade-types.html#import).

### New Java libraries

* `java.util.Timer`
* `java.util.concurrent.atomic.AtomicLongArray`
* `java.io.DataInputStream` (was already available with `scalajs-javalib-ex`, but is now available by default)

## Bug fixes

Among others, the following bugs have been fixed in 0.6.13:

* [#2592](https://github.com/scala-js/scala-js/issues/2592) Yet another String.split() inconcistency
* [#2598](https://github.com/scala-js/scala-js/issues/2598) FrameworkDetector swallows the stderr output of the JS env
* [#2602](https://github.com/scala-js/scala-js/issues/2602) Linker thinks it's used concurrently when in fact it's been made invalid after an exception
* [#2603](https://github.com/scala-js/scala-js/issues/2603) Inner def with default param in a Scala.js-defined JS class produces invalid IR
* [#2625](https://github.com/scala-js/scala-js/issues/2625) Outer pointer checks fail in 2.12 (not fixed in 2.12.0-RC1)
* [#2382](https://github.com/scala-js/scala-js/issues/2382) Name clash for $outer pointers of two different nesting levels, only for 2.12.0-RC2 onwards (not fixed in 2.10, 2.11, nor 2.12.0-RC1)

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/milestone/41?closed=1).
