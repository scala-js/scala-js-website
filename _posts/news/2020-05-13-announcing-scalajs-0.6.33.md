---
layout: post
title: Announcing Scala.js 0.6.33
category: news
tags: [releases]
permalink: /news/2020/05/13/announcing-scalajs-0.6.33/
---


We are pleased to announce the release of Scala.js 0.6.33!

This is mostly a bugfix release, including a fix for a bad interaction with React.js' development mode and the `jsdom` JS env.
In addition, we have upgraded to the standard libraries of Scala 2.12.11 and 2.13.2.

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to
[the tutorial]({{ BASE_PATH }}/tutorial/).

## Release notes

If you use `.scala` build files in `project/` and are upgrading from Scala.js 0.6.22 or earlier, do read [the release notes of 0.6.23]({{ BASE_PATH }}/news/2018/05/22/announcing-scalajs-0.6.23/), which contain a source breaking change in that situation.

If upgrading from Scala.js 0.6.14 or earlier, make sure to read [the release notes of 0.6.15]({{ BASE_PATH }}/news/2017/03/21/announcing-scalajs-0.6.15/), which contain important migration information.

As a minor release, 0.6.33 is backward binary compatible with previous releases in the 0.6.x series.
Libraries compiled with earlier versions can be used with 0.6.33 without change.
0.6.33 is also forward binary compatible with 0.6.{29-32}, but not with earlier releases: libraries compiled with 0.6.33 cannot be used by projects using 0.6.{0-28}.

Please report any issues [on GitHub](https://github.com/scala-js/scala-js/issues).

## New warnings

In Scala.js 0.6.33, the Scala.js compiler will start reporting warnings when trying to override `equals` and `hashCode` in a JS type (extending `js.Any`).
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

## Bug fixes

Among others, the following bugs have been fixed in 0.6.33:

* [#4034](https://github.com/scala-js/scala-js/issues/4034) Incorrect result for `-x` when `x` is `+0.0`
* [#3998](https://github.com/scala-js/scala-js/issues/3998) Self-types in non-native JS traits cause confusing error message
* [#3458](https://github.com/scala-js/scala-js/issues/3458) Bad interactions in `JSDOMNodeJSEnv` error handling with React.js dev mode
* [#3818](https://github.com/scala-js/scala-js/issues/3818) Linking error for `Future.never` from Scala 2.13
* [#3939](https://github.com/scala-js/scala-js/issues/3939) Compile error on a method with `@JSName("finalize")` in a non-native JS class

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av0.6.33+is%3Aclosed).
