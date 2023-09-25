---
layout: post
title: Announcing Scala.js 1.14.0
category: news
tags: [releases]
permalink: /news/2023/09/25/announcing-scalajs-1.14.0/
---

We are pleased to announce the release of Scala.js 1.14.0!

This release mainly brings speed improvements in the reachability analysis by parallelizing it.
It also upgrades the Scala 2.13.x standard library to version 2.13.12.

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to [the tutorial]({{ BASE_PATH }}/tutorial/).

If you need help with anything related to Scala.js, you may find our community [in `#scala-js` on Discord](https://discord.com/invite/scala) and [on Stack Overflow](https://stackoverflow.com/questions/tagged/scala.js).

Bug reports can be filed [on GitHub](https://github.com/scala-js/scala-js/issues).

## Release notes

If upgrading from Scala.js 0.6.x, make sure to read [the release notes of Scala.js 1.0.0]({{ BASE_PATH }}/news/2020/02/25/announcing-scalajs-1.0.0/) first, as they contain a host of important information, including breaking changes.

This is a **minor** release:

* It is backward binary compatible with all earlier versions in the 1.x series: libraries compiled with 1.0.x through 1.13.x can be used with 1.14.0 without change.
* Despite being a minor release, 1.14.0 is forward binary compatible with 1.13.x. It is *not* forward binary compatible with 1.12.x. Libraries compiled with 1.14.0 can be used with 1.13.x but not with 1.12.x or earlier.
* It is *not* entirely backward source compatible: it is not guaranteed that a codebase will compile *as is* when upgrading from 1.13.x (in particular in the presence of `-Xfatal-warnings`).

As a reminder, libraries compiled with 0.6.x cannot be used with Scala.js 1.x; they must be republished with 1.x first.

## Improvements

### Reachability Analysis is parallel by default

We have observed up to 2x speedup of reachability analysis on the Scala.js test
suite with this change. This corresponds to a 20% speedup overall on linking.

In case you encounter issues, you can disable the new behavior by setting:

{% highlight scala %}
scalaJSLinkerConfig ~= { _.withParallel(false) }
{% endhighlight %}

This will disable all parallelism in the linker (expect significant slowdown).

### Implicit conversions to js.Any for js.UndefOr in Scala 3

Because `js.UndefOr` is implemented differently in Scala 3, the implicit conversion to `js.Any` was not available.

Thanks to @armanbilge, `js.UndefOr[T]` now implicitly converts to `js.Any`, provided `T` is convertiable to `js.Any`.

For example, the following now compiles on Scala 3:

{% highlight scala %}
val x: js.Any = js.defined("")
{% endhighlight %}

### New ECMAScript Core Types

* [AggregateError](https://www.scala-js.org/api/scalajs-library/2.14.0/scala/scalajs/js/AggregateError.html) thanks to @armanbilge

### Call-site inline

The compiler and linker now use `@inline` / `@noinline` hints provided at the call-site.
See the [Scaladoc for `@inline`](https://www.scala-lang.org/api/2.13.11/scala/inline.html) for details.

### Better Default Bridge Generation

The linker will now avoid generating a default bridge in a subclass if an existing bridge in the superclass can be used.
This can lead to minor code-size improvements.

## Bug fixes

The following bugs have been fixed in 1.14.0:

* [#4882](https://github.com/scala-js/scala-js/issues/4882): Make UUID.compareTo() consistent with the JVM.

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av1.14.0+is%3Aclosed).
