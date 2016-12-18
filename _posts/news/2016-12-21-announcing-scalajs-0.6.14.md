---
layout: post
title: Announcing Scala.js 0.6.14
category: news
tags: [releases]
permalink: /news/2016/12/21/announcing-scalajs-0.6.14/
---


We are excited to announce the release of Scala.js 0.6.14!

This release features a few language enhancements for interoperability.
Among others, it allows to export top-level functions, and provides language support for JavaScript "configuration objects".

<!--more-->

## Getting started

If you are new to Scala.js, head over to
[the tutorial]({{ BASE_PATH }}/tutorial/).

## Release notes

If upgrading from Scala.js 0.6.12 or earlier, make sure to read [the release notes of 0.6.13]({{ BASE_PATH }}/news/2016/10/17/announcing-scalajs-0.6.13/), which contain some breaking changes in sbt build definitions.

As a minor release, 0.6.14 is backward source and binary compatible with previous releases in the 0.6.x series.
Libraries compiled with earlier versions can be used with 0.6.14 without change.
However, it is not forward compatible: libraries compiled with 0.6.14 cannot be used by projects using 0.6.{0-13}.

Please report any issues [on GitHub](https://github.com/scala-js/scala-js/issues).

## JavaScript configuration objects

Many JavaScript libraries expose APIs where options are given in what we call configuration objects.
A well-known example would be the [`$.ajax()`](http://api.jquery.com/jquery.ajax/) function of jQuery, which we can declare as:

{% highlight scala %}
@ScalaJSDefined
trait JQueryAjaxSettings extends js.Object {
  val data: js.Object | String | js.Array[Any]
  val contentType: Boolean | String
  val crossDomain: Boolean
  val success: js.Function3[Any, String, JQueryXHR, _]
  ...
}

def ajax(url: String, settings: JQueryAjaxSettings): JQueryXHR = js.native
{% endhighlight %}

The `val`s need to be declared abstract because, in previous versions of Scala.js, `@ScalaJSDefined` traits could not have concrete members.
This makes it tedious to create an instance of `JQueryAjaxSettings`, since the Scala type system forces us to fill them in, although the fields are optional in JavaScript.
Previous workarounds include a) using `js.Dynamic.literal(...).asInstanceOf[JQueryAjaxSettings]` or b) using [`JSOptionBuilder`](https://github.com/jducoeur/jsext#jsoptionbuilder).

Scala.js 0.6.14 finally provides language support for this kind of API.
It is now allowed to have concrete members in `@ScalaJSDefined` traits, *if* their right-hand-side is `= js.undefined` (this implies that their type must be a supertype of `js.UndefOr[Nothing]`).
With this relaxed rule, we can define `JQueryAjaxSettings` as follows:

{% highlight scala %}
@ScalaJSDefined
trait JQueryAjaxSettings extends js.Object {
  val data: js.UndefOr[js.Object | String | js.Array[Any]] = js.undefined
  val contentType: js.UndefOr[Boolean | String] = js.undefined
  val crossDomain: js.UndefOr[Boolean] = js.undefined
  val success: js.UndefOr[js.Function3[Any, String, JQueryXHR, _]] = js.undefined
  ...
}
{% endhighlight %}

When calling `ajax()`, we can now give an anonymous object that overrides only the `val`s we care about:

{% highlight scala %}
jQuery.ajax(someURL, new JQueryAjaxSettings {
  override val crossDomain: js.UndefOr[Boolean] = true
  override val success: js.UndefOr[js.Function3[Any, String, JQueryXHR, _]] = {
    js.defined { (data: Any, textStatus: String, xhr: JQueryXHR) =>
      println("Status: " + textStatus)
    }
  }
})
{% endhighlight %}

Note that for functions, we use `js.defined { ... }` to drive Scala's type inference.
Otherwise, it needs to apply two implicit conversions, which is not allowed.

The explicit types are still quite annoying, but they are only necessary in Scala 2.10 and 2.11.
If you use Scala 2.12, you can omit all the type annotations (but keep `js.defined`), thanks to improved type inference for `val`s and SAM conversions:

{% highlight scala %}
jQuery.ajax(someURL, new JQueryAjaxSettings {
  override val crossDomain = true
  override val success = js.defined { (data, textStatus, xhr) =>
    println("Status: " + textStatus)
  }
})
{% endhighlight %}

## Export top-level functions

In Scala.js 0.6.13 and earlier, the only way to export something resembling a top-level function was to export the method and its enclosing object, as follows:

{% highlight scala %}
@JSExport
object Main {
  @JSExport
  def main(): Unit = { ... }
}
{% endhighlight %}

However, this requires to call it as `Main().main()` from JavaScript, which shows that it is not actually a top-level function.

In Scala.js 0.6.14, you can use the `@JSExportTopLevel` annotation instead:

{% highlight scala %}
object Main {
  @JSExportTopLevel("main")
  def main(): Unit = { ... }
}
{% endhighlight %}

which allows to call `main()` from JavaScript.
`@JSExportTopLevel` methods must be declared in top-level `object`s.

## Bug fixes

Among others, the following bugs have been fixed in 0.6.14:

* [#2587](https://github.com/scala-js/scala-js/issues/2587) Incorrect result for `BigDecimal` multiplication (corner case)
* [#2639](https://github.com/scala-js/scala-js/issues/2639) The linker should refuse to build if `@JSImport` is used with `NoModule`
* [#2640](https://github.com/scala-js/scala-js/issues/2640) `TimeoutException` when running PhantomJS with macOS Sierra
* [#2643](https://github.com/scala-js/scala-js/issues/2643) `js.ThisFunction` passing Scala-`this` instead of JS-`this` when using Scala 2.12.0
* [#2655](https://github.com/scala-js/scala-js/issues/2655) Inconsistent behavior in `NumericRange.min` method between JVM and JS
* [#2689](https://github.com/scala-js/scala-js/issues/2689) The optimizer does something wrong with `return` inside `finally`

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av0.6.14+is%3Aclosed).
