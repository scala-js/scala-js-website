---
layout: post
title: Announcing Scala.js 0.6.3
category: news
tags: [releases]
---


We are excited to announce the release of Scala.js 0.6.3!

A lot has happened in this release, probably because we dragged it for a longer amount of time than usual (2 months since the last release!).
Besides the usual bag of bug fixes, there are three highlights:

* Support for `BigInteger` and `BigDecimal`, thanks to an incredible amount of work by [@InTheNow](https://github.com/InTheNow).
* Extension of `jsDependencies` to specify minified versions of the JS libraries.
* *Experimental* output modes to target ECMAScript 6, as well as [Strong Mode](https://developers.google.com/v8/experiments).

We also welcome Nicolas Stucki aka [@nicolasstucki](https://github.com/nicolasstucki) to the core team at EPFL.
<!--more-->

## Getting started

If you are new to Scala.js, head over to
[the tutorial]({{ BASE_PATH }}/doc/tutorial.html).

## Release notes

For changes in the 0.6.x series compared to 0.5.x, read [the announcement of 0.6.0]({{ BASE_PATH }}/news/2015/02/05/announcing-scalajs-0.6.0/).

As a minor release, 0.6.3 is backward source and binary compatible with previous releases in the 0.6.x series.
Libraries compiled with earlier versions can be used with 0.6.3 without change.
However, it is not forward compatible: libraries compiled with 0.6.3 cannot be used by projects using 0.6.{0-2}.

Please report any issues [on GitHub](https://github.com/scala-js/scala-js/issues).

## Improvements

### Big numbers are here!

Thanks to [@InTheNow](https://github.com/InTheNow), `java.math.BigInteger` and `java.math.BigDecimal` are finally supported by Scala.js.
Consequently, so are `scala.math.BigInt` and `scala.math.BigDecimal`, as well as ranges of `Double`s.

### Minified versions of JS dependencies

The new `minified` modifier to `jsDependencies` allows to specify minified alternatives of JS libraries.
Use it like this:

    jsDependencies +=
      "org.webjars" % "immutable" % "3.4.0" / "immutable.js" minified "immutable.min.js"

Minified dependencies are packaged with `packageMinifiedJSDependencies`, which is automatically called when `fullOptJS` is invoked.
The result is put in a file `-jsdeps.min.js` next to `-jsdeps.js`.

Obviously, for JS dependencies that do not specify a minified version, their non-minified version is used instead.

### Opt-in silent fail for `@JSExportDescendent{Classes,Objects}`

Only public top-level classes and objects can be `@JSExport`ed.
Trying to export a non-public or inner entity does not compile.
For directly applied `@JSExport`, this is the expected behavior.
For `@JSExportDescendentClasses` and `@JSExportDescendentObjects`, however, it can prevent certain useful patterns.
In some cases it is preferable to simply ignore descendent classes and objects that cannot be exported, rather than failing with a compile error.

These two annotations now take an additional, optional parameter `ignoreInvalidDescendants` of type `Boolean`.
If `true`, invalid descendent classes and objects will be ignored for exports.

For example, this does not compile:

{% highlight scala %}
@JSExportDescendentClasses
trait Foo

object Bar {
  class InvalidExport extends Foo
}
{% endhighlight %}

If we change the definition of `Foo` to

{% highlight scala %}
@JSExportDescendentClasses(ignoreInvalidDescendants = true)
trait Foo
{% endhighlight %}

then it will compile and `InvalidExport` will be silently ignored.

### Emit ECMAScript 6

Now that ECMAScript 6 has reached the status of Release Candidate, it is time for Scala.js to offer the possibility to emit JavaScript code taking full advantage of its features.
You can do so with the following sbt setting:

    scalaJSOutputMode := org.scalajs.core.tools.javascript.OutputMode.ECMAScript6

This will cause the `fastOptJS` task (after a `clean`) to emit ES6-style code.
Among others, the following features are used:

* Classes
* `let` and `const`
* `...rest` parameters

Currently, very few runtimes support enough of ECMAScript 6 to be able to run the Scala.js output.
To the best of our knowledge, V8 4.2.71 minimum is required, with the feature flag `--harmony-rest-parameters`.
This runtime is available in [iojs](https://iojs.org/) >= 2.0.0, as well as in [Chrome Canary](https://www.google.fr/chrome/browser/canary.html).

You can use io.js with the `run` and `test` commands of sbt with the following sbt settings:

    postLinkJSEnv := NodeJSEnv(executable = "iojs", args = Seq("--harmony-rest-parameters")).value
    scalaJSStage := FastOptStage

**Caveats:**

* Only `fastOpt` works. `fullOpt` will break with crashes or obscure errors, do not use it.
* Runtime performance is *awful*. Benchmarks have shown degradations up to 10x slower than the normal output.

**Consequence:** This is currently a toy, an experiment, and should not be used in production.

### ECMAScript 6 Strong Mode

[Strong Mode](https://developers.google.com/v8/experiments) is an experiment conducted by the V8 team.
Their website will explain better than we can, but basically it is an extension to JS' strict mode, which further restricts what programs are valid.
It is meant to define a subset of JavaScript that can be optimized more predictably by runtimes, and which also causes less surprises to developers.
Contrary to [asm.js](http://asmjs.org/), it is still meant to be written by hand.

Early experiments show that Strong Mode can be an excellent target for Scala.js, because their semantics and restrictions align in many ways.
We have therefore invested time in providing a Strong Mode-compliant output to Scala.js.
Similarly to the ECMAScript 6 output, it can be activated with an sbt setting:

    scalaJSOutputMode := org.scalajs.core.tools.javascript.OutputMode.ECMAScript6StrongMode

Since Strong Mode is a subset of ECMAScript 6, any runtime which supports ES6 can also run Strong Mode code.
But to enable the additional checks, you have to use the `--strong-mode` argument to V8.
Using io.js, this can be done with:

    postLinkJSEnv := NodeJSEnv(executable = "iojs", args = Seq("--harmony-rest-parameters", "--strong-mode")).value
    scalaJSStage := FastOptStage

The same caveats as the ES6 mode apply.

Scala.js is an excellent platform for experimenting with Strong Mode, as we can easily generate huge amounts of Strong Mode-compliant code just by recompiling applications in this mode.
Since Strong Mode is still in flux, we are discussing with the V8 team to make it as good as it can be, for JavaScript developers at large as well as for Scala.js and compiler writers specifically.

## Bug fixes

Among others, the following bugs have been fixed:

* [#1490](https://github.com/scala-js/scala-js/issues/1490) JVM style module initialization under semantic flag
* [#1512](https://github.com/scala-js/scala-js/issues/1512) Atomic write of `-fastopt.js` and `-opt.js`
* [#1556](https://github.com/scala-js/scala-js/issues/1556) Test adapter provisions slaves too aggressively
* [#1560](https://github.com/scala-js/scala-js/issues/1560) `java.io.StringReader.read(c:Array[Char],offset:Int,len:Int)` returns 0 at eof, instead of -1
* [#1564](https://github.com/scala-js/scala-js/issues/1564) Allow overriding path prefixes
* [#1569](https://github.com/scala-js/scala-js/issues/1569) AssertionError when crossProject is used as a ProjectRef in another project
* [#1578](https://github.com/scala-js/scala-js/issues/1578) Report the full stack trace for exceptions thrown in Futures
* [#1582](https://github.com/scala-js/scala-js/issues/1582) Parsing hexadecimal Long that has 0x80000000 bit set fails
* [#1589](https://github.com/scala-js/scala-js/issues/1589) Switch statement with `if` causes compiler to fail
* [#1556](https://github.com/scala-js/scala-js/issues/1556) Test adapter provisions slaves too aggressively
* [#1625](https://github.com/scala-js/scala-js/issues/1625) Emit warning if `js.Dynamic.literal` has duplicate keys (and [#1595](https://github.com/scala-js/scala-js/issues/1595) not emit illegal JS in that situation)

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av0.6.3+is%3Aclosed).
