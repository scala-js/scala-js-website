---
layout: post
title: Announcing Scala.js 0.6.20
category: news
tags: [releases]
permalink: /news/2017/09/01/announcing-scalajs-0.6.20/
---


We are pleased to announce the release of Scala.js 0.6.20!

This release is mostly intended to bridge the gap between the 0.6.x and 1.x branches, to make it easier to cross-compile and/or migrate.

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to
[the tutorial]({{ BASE_PATH }}/tutorial/).

## Release notes

If upgrading from Scala.js 0.6.14 or earlier, make sure to read [the release notes of 0.6.15]({{ BASE_PATH }}/news/2017/03/21/announcing-scalajs-0.6.15/), which contain important migration information.

As a minor release, 0.6.20 is backward source and binary compatible with previous releases in the 0.6.x series.
Libraries compiled with earlier versions can be used with 0.6.20 without change.
0.6.20 is also forward binary compatible with 0.6.{17-19}, but not with earlier releases: libraries compiled with 0.6.20 cannot be used by projects using 0.6.{0-16}.

Please report any issues [on GitHub](https://github.com/scala-js/scala-js/issues).

## Breaking changes

### sbt 0.13.16 or above is required (or sbt 1.x)

The sbt plugin of Scala.js 0.6.20 starts using features of sbt 0.13.16.
If you are using an older version of sbt 0.13.x, you will have to upgrade to 0.13.16 or later.

Since 0.6.19, Scala.js also supports sbt 1.0.0+.

### `scalajs-env-selenium` has to be upgraded to 0.2.0

Scala.js 0.6.20 contains internal changes to improve the so-called test adapter, which is the mechanism used by sbt to communicate with testing frameworks.
These changes are invisible to you, but they broke [`scalajs-env-selenium`](https://github.com/scala-js/scala-js-env-selenium) 0.1.x.
If you use it, you will have to upgrade it to 0.2.0.

## Deprecations

Scala.js 0.6.20 introduces more aggressive deprecations for features that will disappear in 1.x.
Note that those features have already had better replacements since Scala.js 0.6.18; we are just making it more obvious that these new features should be used to be compatible with 1.x.

### `@ScalaJSDefined`

This annotation is now deprecated.
Instead of using it, you should add the following to your project settings:

{% highlight scala %}
scalacOptions += "-P:scalajs:sjsDefinedByDefault"
{% endhighlight %}

and remove the `@ScalaJSDefined` annotations everywhere in your codebase.
The semantics of your codebase will be unchanged.

### `js.JSApp`

`js.JSApp` has traditionally provided two services to an `object Foo` that extends it.
These two services are replaced by two different features.

#### Discoverability by sbt as main object

Since Scala.js 0.6.18, the sbt plugin can recognize "standard" `main` methods of the form

{% highlight scala %}
def main(args: Array[String]): Unit = ...
{% endhighlight %}

in objects, even if they do not extend `js.JSApp`.
Use such a main method to replace `js.JSApp` in the context of discoverability by sbt.

To enable it as main method, make sure you also set

{% highlight scala %}
scalaJSUseMainModuleInitializer := true
{% endhighlight %}

in your project settings.

#### Automatic export to JavaScript

Given

{% highlight scala %}
package bar

object Foo extends js.JSApp {
  def main(): Unit = println("Hello world!")
}
{% endhighlight %}

the object `Foo` and its `main` method are automatically exported such that JavaScript code can call

{% highlight javascript %}
bar.Foo().main();
{% endhighlight %}

To achieve exactly the same behavior without `js.JSApp`, define `Foo` as

{% highlight scala %}
package bar

object Foo {
  @JSExportTopLevel("bar.Foo")
  protected def getInstance(): this.type = this

  @JSExport
  def main(): Unit = println("Hello world!")
}
{% endhighlight %}

Alternatively, you can define it as

{% highlight scala %}
package bar

object Foo {
  @JSExportTopLevel("bar.Foo.main")
  def main(): Unit = println("Hello world!")
}
{% endhighlight %}

but in that case, the JavaScript code will have to be changed to

{% highlight javascript %}
bar.Foo.main();
{% endhighlight %}

### `jsDependencies += RuntimeDOM` and `requiresDOM := true`

These settings will not be supported by [`sbt-jsdependencies`](https://github.com/scala-js/jsdependencies) 1.x, the new home of `jsDependencies` and related features.

Instead of relying on them to configure a JS environment equipped with the DOM, you should explicitly do so.
For example, to use Node.js with jsdom, use:

{% highlight scala %}
jsEnv := new org.scalajs.jsenv.jsdomnodejs.JSDOMNodeJSEnv()
{% endhighlight %}

## New features

### Improved support for cross-compilation with 1.x and `jsDependencies`

[The release notes of Scala.js 1.0.0-M1]({{ BASE_PATH }}/news/2017/07/03/announcing-scalajs-1.0.0-M1/) detail how to cross-compile between 0.6.x and 1.x.
One aspect of it was particularly painful: handling the new `JSDependenciesPlugin`.
Scala.js 0.6.20 makes this easier by introducing a shim of `JSDependenciesPlugin` inside sbt-scalajs.
It is now sufficient to add the following to your `project/plugins.sbt`:

{% highlight scala %}
// For jsDependencies
{
  if (scalaJSVersion.startsWith("0.6.")) Nil
  else Seq(addSbtPlugin("org.scala-js" % "sbt-jsdependencies" % "1.0.0-M1"))
}
{% endhighlight %}

and add `enablePlugins(JSDependenciesPlugin)` to the projects that require it.
There is no need for the hacky `project/JSDependenciesCompat.scala` anymore.

### JDK APIs

The following JDK API class has been added:

* `java.util.SplittableRandom`

## Bug fixes

The following bugs have been fixed in 0.6.20:

* [#3107](https://github.com/scala-js/scala-js/issues/3107) `ByteArrayOutputStream` (and in general all `Closeable`s) should be an `AutoCloseable`
* [#3082](https://github.com/scala-js/scala-js/issues/3082) Incorrect handling of main generates broken code

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av0.6.20+is%3Aclosed).
