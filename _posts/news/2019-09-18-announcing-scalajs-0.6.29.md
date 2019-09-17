---
layout: post
title: Announcing Scala.js 0.6.29
category: news
tags: [releases]
permalink: /news/2019/09/18/announcing-scalajs-0.6.29/
---


We are excited to announce the release of Scala.js 0.6.29!

**We highly recommend to all users that they upgrade to this new version.**
It contains:

* a fix for a major bug in incremental compilation with sbt 1.x, and
* a major performance improvement, notably for pattern matching.

It also introduces `js.import(moduleName)`, equivalent to JavaScript's dynamic `import()` calls.

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to
[the tutorial]({{ BASE_PATH }}/tutorial/).

## Release notes

If you use `.scala` build files in `project/` and are upgrading from Scala.js 0.6.22 or earlier, do read [the release notes of 0.6.23]({{ BASE_PATH }}/news/2018/05/22/announcing-scalajs-0.6.23/), which contain a source breaking change in that situation.

If upgrading from Scala.js 0.6.14 or earlier, make sure to read [the release notes of 0.6.15]({{ BASE_PATH }}/news/2017/03/21/announcing-scalajs-0.6.15/), which contain important migration information.

As a minor release, 0.6.29 is backward binary compatible with previous releases in the 0.6.x series.
Libraries compiled with earlier versions can be used with 0.6.29 without change.
0.6.29 is not forward binary compatible with earlier releases: libraries compiled with 0.6.29 cannot be used by projects using 0.6.{0-28}.

Please report any issues [on GitHub](https://github.com/scala-js/scala-js/issues).

## Fix for a major bug in incremental compilation with sbt 1.x

When using sbt-scalajs with sbt 1.x, there was a major bug with incremental compilation, causing linker errors ([#3419](https://github.com/scala-js/scala-js/issues/3419) / [#3596](https://github.com/scala-js/scala-js/issues/3596)).
Scala.js 0.6.29 fixes this issue.

## Major performance improvement notably for pattern matching

Scala.js 0.6.29 features a major performance improvement to all instance tests of the form `x.isInstanceOf[C]` where `C` is a Scala `class`.
This includes most cases of pattern matching.
Applications that are pattern matching-intensive can experience speedups of up to 40%.

## Dynamic imports with `js.import()`

ECMAScript 2020 will standardize [dynamic imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#Dynamic_Imports).
Scala.js adds support for them with the `js.import[A <: js.Any]()` method, which returns a `js.Promise[A]`.
The parameter `A` should be a JS trait describing the API of the module, and be given explicitly.
Since `import` is a keyword in Scala, it must be called with backticks:

{% highlight scala %}
import scala.scalajs.js

trait FooAPI extends js.Any {
  def bar(x: Int): Int
}

val moduleName = "foo.js"
val promise = js.`import`[FooAPI](moduleName)
val future = promise.toFuture
for (module <- future) {
  println(module.bar(5))
}
{% endhighlight %}

## Miscellaneous

### The JDK collections were rewritten not to depend on the Scala collections

Until 0.6.28, several JDK collections, among which `java.util.HashMap`, `java.util.HashSet` and `java.util.TreeSet`, were implemented on top of corresponding Scala collections (e.g., `scala.collection.immutable.HashMap`).
Because of the semantic mismatches between JDK collections and Scala collections, those implementations had a lot of inefficiencies to paper over the differences.

In Scala.js 0.6.29, we have entirely reimplemented all those collections, so that JDK collections do not rely on Scala collections anymore.

The change was intended to only be performance-related.
However, it is possible that some behavioral changes have slipped in during the rewrite.
Hopefully, such changes would all be progressions towards better equivalence with the JVM behavior.

If you observe any regression in that space, please [file a bug report](https://github.com/scala-js/scala-js/issues/new?template=bug-report.md).

### The Unicode database was upgraded to match the latest JDK 8

The following Unicode characters are now recognized and properly categorized by methods of `java.lang.Character`: 00BB, 20BC through 20BF and 32FF.

### `js.special.globalThis` was deprecated in favor of `js.special.fileLevelThis`

ECMAScript has introduced a new global variable named `globalThis` that does *not* match Scala.js' `js.special.globalThis` primitive.
To avoid confusion, it has been renamed to `js.special.fileLevelThis`.

### New warnings for duplicate (redundant) `@JSExport` annotations

Duplicate `@JSExport` annotations will now emit a warning, as they are redundant.
For example:

{% highlight scala %}
class A {
  @JSExport
  @JSExport("a")
  def a = 1
}
{% endhighlight %}

will report the following warning:

    newSource1.scala:6: warning: Found duplicate @JSExport
          def a = 1
              ^

### The `scalajs-test-interface` artifact has been split in two (tools API only)

This is an internal change that only affects build tool authors.
Scala.js users and testing framework authors are not affected.

Previously, the `scalajs-test-interface` contained both the definition of the `sbt.testing.*` interfaces and the implementation of an internal component called the "testing bridge".
The latter is a private mechanism that communicates with the `TestAdapter` on the JVM side (which, as a build author, you probably use somewhere).

In this release, the testing bridge has been extracted in a separate artifact `scalajs-test-bridge`, to decouple it from the test interface that all testing frameworks depend on.
Testing frameworks should still depend only on `scalajs-test-interface`.
As a build author, though, you should now inject an artificial dependency on `scalajs-test-bridge` in the `Test` classpath of Scala.js projects, *with the same version* as the dependency on `scalajs-test-adapter` which your build tool has on the JVM.

As an example, [the change that was done in `sbt-scalajs`](https://github.com/scala-js/scala-js/commit/2240515b60390591fba83be88fab67a31b25adf7#diff-dd593403434ec9de3670cb5722f10171) was:

{% highlight diff %}
 libraryDependencies ++= Seq(
     // and of course the Scala.js library
     "org.scala-js" %% "scalajs-library" % scalaJSVersion,
-    // also bump the version of the test-interface
-    "org.scala-js" %% "scalajs-test-interface" % scalaJSVersion % "test"
+    // as well as the test-bridge in the Test configuration
+    "org.scala-js" %% "scalajs-test-bridge" % scalaJSVersion % "test"
 )
{% endhighlight %}

## Bug fixes

Among others, the following bugs have been fixed in 0.6.29:

* [#3419](https://github.com/scala-js/scala-js/issues/3419) / [#3596](https://github.com/scala-js/scala-js/issues/3596) Major bug in incremental compilation with sbt 1.x
* [#3607](https://github.com/scala-js/scala-js/issues/3607) Calling `getClass.getSimpleName` on objects returns name without trailing `$`
* [#3604](https://github.com/scala-js/scala-js/issues/3604) Implement `java.util.Collection.removeIf`
* [#3605](https://github.com/scala-js/scala-js/issues/3605) `ArrayBuilder.generic.addAll` is broken on 2.13
* [#3769](https://github.com/scala-js/scala-js/issues/3769), [#3770](https://github.com/scala-js/scala-js/issues/3770) and [#3771](https://github.com/scala-js/scala-js/issues/3771) Various bugs in `java.net.URI`
* [#3772](https://github.com/scala-js/scala-js/issues/3772), [#3773](https://github.com/scala-js/scala-js/issues/3773) and [#3774](https://github.com/scala-js/scala-js/issues/3774) Various bugs in `java.io.Reader` and its subclasses
* [#3775](https://github.com/scala-js/scala-js/issues/3775) `new OutputStreamWriter(out, "bad charset")` should throw `UnsupportedEncodingException`

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av0.6.29+is%3Aclosed).
