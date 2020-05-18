---
layout: post
title: Announcing Scala.js 1.1.0
category: news
tags: [releases]
permalink: /news/2020/05/18/announcing-scalajs-1.1.0/
---


We are pleased to announce the release of Scala.js 1.1.0!

The highlight of this release is the new support for `@js.native` `val`s and `def`s, which we detail below.
The version of the Scala standard library has been upgraded to Scala 2.12.11 and 2.13.2.
In addition, it contains a number of bug fixes, including all the ones fixed in v0.6.33.

Important note: if you use [scalajs-bundler](https://scalacenter.github.io/scalajs-bundler/), you will need to upgrade it to v0.18.0 or later.

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to [the tutorial]({{ BASE_PATH }}/tutorial/).

If you need help with anything related to Scala.js, you may find our community [on Gitter](https://gitter.im/scala-js/scala-js) and [on Stack Overflow](https://stackoverflow.com/questions/tagged/scala.js).

Bug reports can be filed [on GitHub](https://github.com/scala-js/scala-js/issues).

## Release notes

If upgrading from Scala.js 0.6.x, make sure to read [the release notes of Scala.js 1.0.0`]({{ BASE_PATH }}/news/2020/02/25/announcing-scalajs-1.0.0/) first, as it contains a host of important information, including breaking changes.

This is a **minor** release:

* It is backward binary compatible with all earlier versions in the 1.x series: libraries compiled with 1.0.x can be used with 1.1.0 without change.
* It is *not* forward binary compatible with 1.0.x: libraries compiled with 1.1.0 cannot be used with 1.0.x.
* It is *not* entirely backward source compatible: it is not guaranteed that a codebase will compile *as is* when upgrading from 1.0.x (in particular in the presence of `-Xfatal-warnings`).

As a reminder, libraries compiled with 0.6.x cannot be used with Scala.js 1.x; they must be republished with 1.x first.

## New warnings

These changes already exist in Scala.js 0.6.33, but are new compared to 1.0.1.

In Scala.js 1.1.0, the Scala.js compiler will start reporting warnings when trying to override `equals` and `hashCode` in a JS type (extending `js.Any`).
For example:

{% highlight scala %}
class A extends js.Object {
  override def hashCode(): Int = 1
  override def equals(obj: Any): Boolean = false
}
{% endhighlight %}

will report the following warnings:

{% highlight none %}
Test.scala:6: warning: Overriding hashCode in a JS class does not change its hash code.
  To silence this warning, change the name of the method and optionally add @JSName("hashCode").
  override def hashCode(): Int = 1
               ^
Test.scala:7: warning: Overriding equals in a JS class does not change how it is compared.
  To silence this warning, change the name of the method and optionally add @JSName("equals").
  override def equals(obj: Any): Boolean = false
               ^
{% endhighlight %}

Overriding `equals` and `hashCode` never *worked*, in the sense that it would not affect `==` and `##`.
The new warnings make it clear.

## New features

### `@js.native` `val`s and `def`s

Scala.js 1.1.0 adds support for `@js.native` `val`s and `def`s (but not `lazy val`s, `var`s or setter `def`s) in Scala `object`s.
For example:

{% highlight scala %}
object QueryString {
  @js.native
  @JSImport("querystring", "stringify")
  def stringify(obj: js.Dictionary[String], sep: String = "&",
      eq: String = "="): String = js.native
}

object OS {
  @js.native
  @JSImport("os", "EOL")
  val EOL: String = js.native
}
{% endhighlight %}

The rhs of such members must be `= js.native`, and they must have an `@JSGlobal` or `@JSImport` annotation to specify where to load it from.

As illustrated by the above example, they are particularly suited to `import` top-level functions and variables from JavaScript modules, without requiring to import the whole module namespace (with `JSImport.Namespace`).

They can also be used to accurately load resources from pseudo-modules, like Webpack allows for CSS, JSON and image files, among others:

{% highlight scala %}
object LogoPage {
  @js.native
  @JSImport("resources/img/logo-banner.png", JSImport.Default)
  val logoBanner: String = js.native

  ...
  img(src := logoBanner, alt := "My logo")
  ...
}
{% endhighlight %}

## Miscellaneous

### Upgrade to GCC v20200315

The Google Closure Compiler used internally by Scala.js for `fullOptJS` has been upgraded to v20200315.

## Bug fixes

Among others, the following bugs have been fixed in 1.1.0:

* [#4021](https://github.com/scala-js/scala-js/issues/4021) The Refiner eliminates needed static fields in non-instantiated classes
* [#4001](https://github.com/scala-js/scala-js/issues/4001) Scala.js 1.0.0 unnecessary generates imports for parent classes

as well as the following bugs, carried from v0.6.33:

* [#4034](https://github.com/scala-js/scala-js/issues/4034) Incorrect result for `-x` when `x` is `+0.0`
* [#3998](https://github.com/scala-js/scala-js/issues/3998) Self-types in non-native JS traits cause confusing error message
* [#3818](https://github.com/scala-js/scala-js/issues/3818) Linking error for `Future.never` from Scala 2.13
* [#3939](https://github.com/scala-js/scala-js/issues/3939) Compile error on a method with `@JSName("finalize")` in a non-native JS class

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av1.1.0+is%3Aclosed).
