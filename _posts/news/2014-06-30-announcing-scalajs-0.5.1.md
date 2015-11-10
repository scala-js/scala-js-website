---
layout: post
title: Announcing Scala.js 0.5.1
category: news
tags: [releases]
---


We are excited to announce the release of Scala.js 0.5.1!

This version features bug fixes and improvements while remaining binary compatible with Scala.js 0.5.0. Therefore,
Scala.js libraries may, but need not be republished with Scala.js 0.5.1.
<!--more-->

Please report any issues [on GitHub](https://github.com/scala-js/scala-js/issues).

## Improvements in the 0.5.1 release

For changes introduced in 0.5.0, how to upgrade, getting started etc. have a look at the [0.5.0 announcement]({{ BASE_PATH }}/news/2014/06/13/announcing-scalajs-0.5.0/).

#### Additions to the Java library

The following two are now implemented according to spec:

- `java.util.Date`
- `java.util.Random`

#### Wrappers for JavaScript Arrays and Dictionaries

Thanks to `js.WrappedArray` and `js.WrappedDictionary` (and some implicit conversions), `js.Array` and `js.Dictionary` can now be passed to Scala code that expects `mutable.Seq` and `mutable.Map` respectively:

{% highlight scala %}
def setHead(x: mutable.Seq[Int]): Unit = x(0) = 42
val array = js.Array(1, 2, 3)
setHead(array)
println(array) // -> 42,2,3
{% endhighlight %}

Further, this allows to call methods defined on `Map` on `js.Dictionary` (`foreach`, `map`, `filter`, etc.)

#### Filter `jsDependencies` when executing JavaScript code

The new sbt setting `jsDependencyFilter` can be used to modify the dependencies used when running/testing:

    jsDependencyFilter := (_.filter(_.resourceName != "jquery.js"))

The above would prevent "jquery.js" from being included by the sbt runners. See [FlatJSDependency]({{ site.production_url }}/api/scalajs-tools/0.5.1/#scala.scalajs.tools.jsdep.FlatJSDependency) for fields that you can use.

#### Ordered testing output

When testing in the `fastOptStage` or the `fullOptStage`, test output sometimes appeared interleaved. This has been fixed this release.

## Contributors

Thanks to all the code contributors:

- [Sébastien Doeraene](https://github.com/sjrd/)
- [Tobias Schlatter](https://github.com/gzm0/)
- [Alexander Myltsev](https://github.com/alexander-myltsev)
- [Matt Seddon](https://github.com/mseddon)
