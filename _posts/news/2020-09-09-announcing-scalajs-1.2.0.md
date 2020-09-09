---
layout: post
title: Announcing Scala.js 1.2.0
category: news
tags: [releases]
permalink: /news/2020/09/09/announcing-scalajs-1.2.0/
---


We are pleased to announce the release of Scala.js 1.2.0!

The highlight of this release is the addition of the JavaScript types `js.Map[K, V]` and `js.Set[T]` in the standard library.
Thanks to [@exoego](https://github.com/exoego) for this contribution!

In addition, this release contains a number of bug fixes and small improvements.
The version of the Scala standard library has been upgraded to Scala 2.12.12 and 2.13.3.

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to [the tutorial]({{ BASE_PATH }}/tutorial/).

If you need help with anything related to Scala.js, you may find our community [on Gitter](https://gitter.im/scala-js/scala-js) and [on Stack Overflow](https://stackoverflow.com/questions/tagged/scala.js).

Bug reports can be filed [on GitHub](https://github.com/scala-js/scala-js/issues).

## Release notes

If upgrading from Scala.js 0.6.x, make sure to read [the release notes of Scala.js 1.0.0]({{ BASE_PATH }}/news/2020/02/25/announcing-scalajs-1.0.0/) first, as they contain a host of important information, including breaking changes.

This is a **minor** release:

* It is backward binary compatible with all earlier versions in the 1.x series: libraries compiled with 1.0.x and 1.1.x can be used with 1.2.0 without change.
* It is *not* forward binary compatible with 1.1.x: libraries compiled with 1.2.0 cannot be used with 1.1.x or earlier.
* It is *not* entirely backward source compatible: it is not guaranteed that a codebase will compile *as is* when upgrading from 1.1.x (in particular in the presence of `-Xfatal-warnings`).

As a reminder, libraries compiled with 0.6.x cannot be used with Scala.js 1.x; they must be republished with 1.x first.

## Known source breaking changes

### `js.JSON.stringify`

The type of the `space` argument has been narrowed from `js.Any` in Scala.js <= 1.1.1 to `Int | String` in Scala.js 1.2.0.
This may cause code that uses this method not to compile anymore.
For example:

{% highlight scala %}
def configString(config: js.Dictionary[String], mySpace: js.Any): String =
  js.JSON.stringify(config, space = mySpace)
{% endhighlight %}

will stop compiling because `js.Any` is not a subtype of `Int | String`.
Ideally, this issue would be addressed by changing the type of `mySpace` itself and the callers of `configString`.
If that is not possible, for example due to binary compatibility constraints, it is always possible to use a cast:

{% highlight scala %}
def configString(config: js.Dictionary[String], mySpace: js.Any): String =
  js.JSON.stringify(config, space = mySpace.asInstanceOf[Int | String])
{% endhighlight %}

## Enhancements

### `js.Map[K, V]` and `js.Set[T]`

The standard library now contains definitions for the JavaScript built-in classes `Map` and `Set`, as `js.Map[K, V]` and `js.Set[T]`, respectively.
Like `js.Array`, they support the full Scala collection API.

### ECMAScript module support in `testHtml`

The task `testHtml` creates a .html page that runs the unit tests of a codebase in a browser.
Until Scala.js 1.1.1, it only supported Scripts (i.e., with the default `ModuleKind.NoModule`).
Starting with v1.2.0, it also supports ECMAScript modules (`ModuleKind.ESModule`).

It still does not support CommonJS modules, since those are not supported by browsers at all.

### Export abstract JS classes

It is now possible to export `abstract` JS classes (that extend `js.Any`), for example:

{% highlight scala %}
@JSExportTopLevel("AbstractBase")
abstract class AbstractBase extends js.Object
{% endhighlight %}

These can be extended by classes written in JavaScript.

## Miscellaneous

### New JDK APIs

* `java.util.Date.toInstant()` and `java.util.Date.from(Instant)`, although they will only transitively link if support for `java.time` APIs is enabled (e.g., using [scala-java-time](https://github.com/cquiroz/scala-java-time))
* `java.lang.Character.codePointCount`

### Upgrade to GCC v20200719

The Google Closure Compiler used internally by Scala.js for `fullOptJS` has been upgraded to v20200719.

## Bug fixes

Among others, the following bugs have been fixed in 1.2.0:

* [#4131](https://github.com/scala-js/scala-js/issues/4131) `getTime` on `java.util.Date` returns `0` when initialized with a value outside the ECMAScript Time Range
* [#4114](https://github.com/scala-js/scala-js/issues/4114) Compiler crash for JS class containing nested JS objects
* [#4171](https://github.com/scala-js/scala-js/issues/4171) "`NoSuchElementException`: key not found: `LabelName<matchAlts1>`" with dotty 0.27.0-RC1
* [#4174](https://github.com/scala-js/scala-js/issues/4174) fullOptJS shouldn't add a sourceMap references when sourceMap's are disabled
* [#4151](https://github.com/scala-js/scala-js/issues/4151) Very Long String in source results in cryptic error message
* [#4148](https://github.com/scala-js/scala-js/issues/4148) and [#4168](https://github.com/scala-js/scala-js/issues/4168) Unable to find extant inner trait IR during fastopt

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av1.2.0+is%3Aclosed).
