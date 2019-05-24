---
layout: post
title: Announcing Scala.js 0.6.28
category: news
tags: [releases]
permalink: /news/2019/05/24/announcing-scalajs-0.6.28/
---


We are pleased to announce the release of Scala.js 0.6.28!

**This release drops support for building on JDK 6 and 7!**
In exchange, it adds support for using the Google Closure Compiler when emitting ECMAScript 2015 code.

This release also prepares for Scala 2.13.0 final.
Older releases will not support that version.

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to
[the tutorial]({{ BASE_PATH }}/tutorial/).

## Release notes

If you use `.scala` build files in `project/` and are upgrading from Scala.js 0.6.22 or earlier, do read [the release notes of 0.6.23]({{ BASE_PATH }}/news/2018/05/22/announcing-scalajs-0.6.23/), which contain a source breaking change in that situation.

If upgrading from Scala.js 0.6.14 or earlier, make sure to read [the release notes of 0.6.15]({{ BASE_PATH }}/news/2017/03/21/announcing-scalajs-0.6.15/), which contain important migration information.

As a minor release, 0.6.28 is backward binary compatible with previous releases in the 0.6.x series.
Libraries compiled with earlier versions can be used with 0.6.28 without change.
0.6.28 is also forward binary compatible with 0.6.{17-27}, but not with earlier releases: libraries compiled with 0.6.28 cannot be used by projects using 0.6.{0-16}.

Please report any issues [on GitHub](https://github.com/scala-js/scala-js/issues).

## Drop support for building on JDK 6 and JDK 7

This was long overdue.
Keeping support for JDK 6 and JDK 7 was holding us back from significant improvements, notably the ability to upgrade GCC and enable it for ES 2015 code (see below).

## Support for using the Google Closure Compiler with the ES 2015 output

When emitting ECMAScript 2015 code, using the sbt setting

{% highlight scala %}
scalaJSLinkerConfig ~= { _.withESFeatures(_.withUseECMAScript2015(true)) }
{% endhighlight %}

previously Scala.js would disable the Google Closure Compiler even in fullOpt mode, because we used an old version of GCC that did not support ES 2015.
We have now upgraded GCC to a recent release, and starting with Scala.js 0.6.28, GCC is enabled in fullOpt mode when using ES 2015.

## Bug fixes

Among others, the following bugs have been fixed in 0.6.28:

* [#3612](https://github.com/scala-js/scala-js/issues/3612) and [#3622](https://github.com/scala-js/scala-js/issues/3622) Spurious failures and warnings of Scaladoc with Scala 2.13.0-RC1+
* [#3611](https://github.com/scala-js/scala-js/issues/3611) Test failures are ignored when filename is null in the stack trace

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av0.6.28+is%3Aclosed).
