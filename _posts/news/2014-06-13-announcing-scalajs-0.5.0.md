---
layout: post
title: Announcing Scala.js 0.5.0
category: news
tags: [releases]
---


We are very excited to announce the final release of Scala.js 0.5.0!
This version is a major milestone towards the maturity of Scala.js, probably
the most important release since its very first prototype.

Scala.js is a compiler from Scala to JavaScript. It allows you to write your
entire web application in Scala and simply compile to JavaScript!
<!--more-->

*   [Tutorial]({{ BASE_PATH }}/doc/tutorial.html),
    for newcomers to Scala.js
*   [Upgrading from Scala.js 0.4.x](./#upgrading)
*   Try Scala.js right in your browser with
    [Scala.jsFiddle](http://www.scala-js-fiddle.com/)
    (currently using Scala.js 0.4.4)

## New features in the 0.5.x series

Scala.js 0.5.0 introduces new features, improvements and bug fixes in many
areas, ranging from compiler correctness to usability to emitted code size and
speed.

### Language changes

*   Scala semantics for integer and character types (i.e., wrapping semantics)
    *   `Int`, `Byte`, `Short`, and `Char` now behave the same way as on the
        JVM with respect to wrapping around their range, e.g., `Int` is truly
        a signed 32-bit integer.
    *   Exception: division by 0 is still unspecified.
    *   `Long` continues to behave as a proper signed 64-bit integer, as it
        did for a long time
    *   `Float` still behaves just like `Double`, as it always did.
    *   [Full details]({{ BASE_PATH }}/doc/semantics.html)
*   Improved interoperability with JavaScript
    *   Normal Scala primitive types can be used instead of `js.Number`,
        `js.Boolean`, `js.String` and `js.Undefined` for interoperability with
        JavaScript, because they are guaranteed to always be represented as
        primitive JavaScript values (`Char` and `Long` are still opaque to
        JavaScript, because they do not have a corresponding type in JavaScript).
        See [the documentation on type correspondance]({{ BASE_PATH }}/doc/js-interoperability.html#type-correspondance)
        for more details.
    *   Introduced the type `js.UndefOr[+A]`
        ([API](http://www.scala-js.org/api/scalajs-library/0.5.0/#scala.scalajs.js.UndefOr)),
        which represents a value of type `A` _or_ `undefined`, and offers an
        `Option`-like interface where `undefined` takes the role of `None`.

### Improvements to the generated code

*   Smaller. For a non-trivial application, we have
    *   ~1.3 MB for fast-optimized code (for iterative development)
    *   ~180 KB for full-optimized code (for production)
*   Faster.
    *   Values of primitive types, excluding `Char`, are not boxed anymore when
        assigned to `Any` or generic types
    *   We don't have precise benchmarks, but we received reports of noticeable
        improvements.

### sbt plugin changes

*   `preoptimizeJS` and `optimizeJS` have been renamed `fastOptJS` and
    `fullOptJS`, respectively, to better represent their intent.
    `fastOptJS` is *really* fast (less than 1/2 second in addition to the
    normal `compile` of scalac), and is now the recommended default for
    iterative development.
*   Running and testing with [Node.js](http://nodejs.org/) and
    [PhantomJS](http://phantomjs.org/)
    *   With `fastOptStage::run` or `fastOptStage::test`, run your code using
        a native-speed interpreter on the result of fast-optimization.
    *   By default, Node.js is used, unless the setting `requiresDOM := true`
        is set, in which case PhantomJS is used
    *   Replace `fastOptStage` by `fullOptStage` to execute the full-optimized
        version of your code.
    *   Node.js and/or PhantomJS must be installed separately for this to work.
        The basic `run` and `test` still use Rhino and work out-of-the-box.
*   Auto-discovery of objects extending the `js.JSApp` trait
    ([API](http://www.scala-js.org/api/scalajs-library/0.5.0/#scala.scalajs.js.JSApp))
    *   Can be run directly with the `run` task
    *   With `persistLauncher := true`, sbt will emit a tiny JavaScript entry
        point that calls the `main` method.
    *   To support this the best we could, we have dropped auto-discovery of
        objects defining a `def main(args: Array[String])` method.
    *   [More information in the tutorial]({{ BASE_PATH }}/doc/tutorial.html#optimizing)

### Binary compatibility and dependency management

*   Backward binary compatibility across minor releases
    *   Similarly to Scala, except it is only _backward_.
    *   For example, libraries compiled with Scala.js 0.5.0 will be usable with
        Scala.js 0.5.1, but not (necessarily) the other way around.
    *   The sbt plugin encodes the Scala.js binary version in artifact names
        in addition to the Scala binary version.
        For example, the artifacts for a library "foo" compiled with
        Scala 2.11.1 and Scala.js 0.5.0 will be named `foo_sjs0.5_2.11`.
    *   To depend on the doubly-cross compiled version of a Scala.js library,
        use `%%%` instead of `%%` in your `libraryDependencies`. For example,
        `"org.scala-lang.modules.scalajs" %%% "scalajs-dom" % "0.6"`
*   Managing your dependencies on JavaScript libraries
    *   In addition to depending on other Scala.js libraries, Scala.js now
        supports depending on JavaScript libraries through
        [WebJars](http://www.webjars.org/), that will be resolved automatically.
    *   You can ask the sbt plugin to package all your JavaScript dependencies
        in a single `.js` file if you so wish, but this is not mandatory.
    *   See the [tutorial]({{ BASE_PATH }}/doc/tutorial.html#using-jquery) for more information.

### Command line interface (CLI)

*   Following a request by some of our users, we added a
    [stand-alone distribution]({{ BASE_PATH }}/downloads.html) that allows to
    use Scala.js without sbt (but with Scala).
    *   `scalajsc` is a front-end to `scalac` setting up correctly the Scala.js
        compiler plugin and library on the classpath
    *   `scalajsld` performs linking and optimizations (the equivalent of
        `fastOptJS` and `fullOptJS` in sbt)
    *   `scalajsp` prints the content of `.sjsir` files (the intermediate files
        produced by `scalajsc` and consumed by `scalajsld`) in a human-readable
        form.

## <a name="upgrading"></a> Upgrading from Scala.js 0.4.x

Source code written for Scala.js 0.4.x should mostly compile without change
for Scala.js 0.5.0. Due to the ability to type JavaScript APIs more precisely,
in particular using `scala.Int`s and `js.UndefOr`, it is possible that code
interacting with, for example, the statically typed DOM API will need some
minor changes.

However, build files and HTML files surrounding Scala.js source code will need
important adaptations. The easiest is to reproduce the changes of
[this commit](https://github.com/sjrd/scala-js-example-app/commit/45de74a6a029eb9d11579f667a622a8393a7b143)
of the bootstrapping skeleton.

You may also wish to take advantage of the new `persistLauncher` setting to
automatically generate a launcher script based on the discovered `JSApp`, in
which case you can also apply the changes of
[this other commit](https://github.com/sjrd/scala-js-example-app/commit/b4cf28f7e6d5447fde248369a6f62d718c3f8aca).

## Known issues

This release suffers from a few known issues, which we decided to postpone to
a later (binary-compatible) release. The most important ones are:

*   [#727](https://github.com/scala-js/scala-js/issues/727) -
    Source mapping does not work with our Rhino interpreter (with `run` and
    `test`)
    *   Prefer `fastOptStage::run` and `fastOptStage::test` to run with Node.js:
        it is faster and you will get stack traces from your `.scala` source
        files.
*   [#608](https://github.com/scala-js/scala-js/issues/608) -
    Ordering issues with the test reporter, which can mix results of tests
    ran in parallel.
    *   When a test fails, consider using `fastOptStage::testQuick` or
        `fastOptStage::testOnly` to rerun only the failing test, which will
        mitigate this issue.
*   [#706](https://github.com/scala-js/scala-js/issues/706) -
    JS libraries that act "too" smartly in Node.js.
    *   Work around: force usage of PhantomJS instead of Node.js, on which this
        issue does not seem to manifest.

You can find the complete list of known issues (and report new issues)
[on GitHub](https://github.com/scala-js/scala-js/issues).
