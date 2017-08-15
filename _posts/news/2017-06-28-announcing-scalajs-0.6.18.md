---
layout: post
title: Announcing Scala.js 0.6.18
category: news
tags: [releases]
permalink: /news/2017/06/28/announcing-scalajs-0.6.18/
---


We are pleased to announce the release of Scala.js 0.6.18!

This release is mostly a bug-fix release, but it also brings one new feature: the ability to recognize "standard" `main` methods (with `args: Array[String]`) in addition to `js.JSApp` objects.

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to
[the tutorial]({{ BASE_PATH }}/tutorial/).

## Release notes

If upgrading from Scala.js 0.6.14 or earlier, make sure to read [the release notes of 0.6.15]({{ BASE_PATH }}/news/2017/03/21/announcing-scalajs-0.6.15/), which contain important migration information.

As a minor release, 0.6.18 is backward source and binary compatible with previous releases in the 0.6.x series.
Libraries compiled with earlier versions can be used with 0.6.18 without change.
0.6.18 is also forward binary compatible with 0.6.17, but not with earlier releases: libraries compiled with 0.6.18 cannot be used by projects using 0.6.{0-16}.

Please report any issues [on GitHub](https://github.com/scala-js/scala-js/issues).

## New features

### Support for "standard" `main` methods

Until Scala.js 0.6.17, in order for the sbt plugin to recognize an `object` as a *main* object, and call its main method (either through the deprecated *launchers*, or more recently with `scalaJSUseMainModuleInitializer := true`), that object had to extend `js.JSApp`.
For example, a hello world would look like:

{% highlight scala %}
import scala.scalajs.js

object HelloWorld extends js.JSApp {
  def main(): Unit = {
    println("Hello world!")
  }
}
{% endhighlight %}

With this release onwards, the "standard" shape of main objects, JVM-style, are also recognized.
The above example can be rewritten as

{% highlight scala %}
object HelloWorld {
  def main(args: Array[String]): Unit = {
    println("Hello world!")
  }
}
{% endhighlight %}

and truly be cross-platform.
This style of main objects is only supported with `scalaJSUseMainModuleInitializer := true` (not with the deprecated *launchers*).

### Simplified sbt setting to configure all aspects of Scala.js

In preparation for Scala.js 1.x, we introduce a new sbt setting to configure all aspects of the Scala.js linker: `scalaJSLinkerConfig`.
That settings aggregates and replaces the following settings:

* `scalaJSSemantics`
* `scalaJSModuleKind`
* `scalaJSOutputMode`
* `emitSourceMaps`
* `relativeSourceMaps`
* `scalaJSOutputWrapper`
* `scalaJSOptimizerOptions`

The old settings will of course continue to work in 0.6.x, but they will be dropped in Scala.js 1.x.
New builds are encouraged to use `scalaJSLinkerConfig`.

Note that, due to backward compatibility concerns, in 0.6.x the value of `scalaJSLinkerConfig` is only relevant in the project scope (not scoped per config like with `in Compile`), and in the fully-qualified scope (project, config, *and*, `fastOptJS`/`fullOptJS`).
Usually, it will only be set in the project scope, in which case you have nothing to worry about.

## Bug fixes

Among others, the following bugs have been fixed in 0.6.18:

* [#2945](https://github.com/scala-js/scala-js/issues/2945) Scala.js sbt plugin ignores `logBuffered` setting
* [#3025](https://github.com/scala-js/scala-js/issues/3025) `@noinline` breaks the optimizer
* [#3013](https://github.com/scala-js/scala-js/issues/3013) Super call to a mixin of an outer class confuses the codegen in 2.12+

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av0.6.18+is%3Aclosed).
