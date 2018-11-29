---
layout: post
title: Announcing Scala.js 0.6.26
category: news
tags: [releases]
permalink: /news/2018/11/29/announcing-scalajs-0.6.26/
---


We are pleased to announce the release of Scala.js 0.6.26!

The highlight of this release is the support for ECMAScript modules.
It also fixes a few issues.

Starting from 0.6.26 in the 0.6.x branch, Scala.js has been relicensed under the Apache License 2.0, following the corresponding relicensing of Scala upstream.
Scala.js 1.x milestones have also been relicensed since version 1.0.0-M6.

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to
[the tutorial]({{ BASE_PATH }}/tutorial/).

## Release notes

If you use `.scala` build files in `project/` and are upgrading from Scala.js 0.6.22 or earlier, do read [the release notes of 0.6.23]({{ BASE_PATH }}/news/2018/05/22/announcing-scalajs-0.6.23/), which contain a source breaking change in that situation.

If upgrading from Scala.js 0.6.14 or earlier, make sure to read [the release notes of 0.6.15]({{ BASE_PATH }}/news/2017/03/21/announcing-scalajs-0.6.15/), which contain important migration information.

As a minor release, 0.6.26 is backward binary compatible with previous releases in the 0.6.x series.
Libraries compiled with earlier versions can be used with 0.6.26 without change.
0.6.26 is also forward binary compatible with 0.6.{17-25}, but not with earlier releases: libraries compiled with 0.6.26 cannot be used by projects using 0.6.{0-16}.

Please report any issues [on GitHub](https://github.com/scala-js/scala-js/issues).

## Top-level exports with namespaces are deprecated

Top-level exports with namespaces, such as

{% highlight scala %}
@JSExportTopLevel("foo.Bar")
object Bar
{% endhighlight %}

are deprecated, as they do not have a good equivalent in ECMAScript modules.

If necessary, you can use the following idiom instead:

{% highlight scala %}
package mypack

// not directly exported
object Bar

object TopLevelExports {
  @JSExportTopLevel("foo")
  val foo = new js.Object {
    val Bar = mypack.Bar
  }
}
{% endhighlight %}

The deprecation warning can be silenced in the 0.6.x series with

{% highlight scala %}
scalacOptions += "-P:scalajs:suppressExportDeprecations"
{% endhighlight %}

## Support for ECMAScript modules

Scala.js can now emit a project as an ECMAScript module, in addition to a script or a CommonJS module.
This can be enabled with

{% highlight scala %}
scalaJSLinkerConfig ~= { _.withModuleKind(ModuleKind.ESModule) }
{% endhighlight %}

In that case, `@JSImport` and `@JSExportTopLevel` will straightforwardly map to ECMAScript `import` and `export` statements:

{% columns %}
{% column 6 Scala.js %}
{% highlight scala %}
@JSExportTopLevel("foo")
object Bar
{% endhighlight %}
{% endcolumn %}

{% column 6 ECMAScript %}
{% highlight javascript %}
export { Bar as foo }
{% endhighlight %}
{% endcolumn %}
{% endcolumns %}

{% columns %}
{% column 6 Scala.js %}
{% highlight scala %}
@js.native
@JSImport("mod.js", "foo")
object Bar extends js.Object
{% endhighlight %}
{% endcolumn %}

{% column 6 ECMAScript %}
{% highlight javascript %}
import { foo as Bar } from "mod.js"
{% endhighlight %}
{% endcolumn %}
{% endcolumns %}

{% columns %}
{% column 6 Scala.js %}
{% highlight scala %}
@js.native
@JSImport("mod.js", JSImport.Namespace)
object Bar extends js.Object
{% endhighlight %}
{% endcolumn %}

{% column 6 ECMAScript %}
{% highlight javascript %}
import * as Bar from "mod.js"
{% endhighlight %}
{% endcolumn %}
{% endcolumns %}

{% columns %}
{% column 6 Scala.js %}
{% highlight scala %}
@js.native
@JSImport("mod.js", JSImport.Default)
object Bar extends js.Object
{% endhighlight %}
{% endcolumn %}

{% column 6 ECMAScript %}
{% highlight javascript %}
import Bar from "mod.js"
{% endhighlight %}
{% endcolumn %}
{% endcolumns %}

To run and test such a project, Node.js v10.2.0 or later is required.
We recommend v10.12.0 or later, as it is the version that we continuously test.
In addition, you will need a few additional settings:

{% highlight scala %}
jsEnv := {
  new org.scalajs.jsenv.NodeJSEnv(
      org.scalajs.jsenv.NODEJSEnv.Config()
        .withArguments(List("--experimental-modules"))
  )
}

artifactPath in (proj, Compile, fastOptJS) :=
  (crossTarget in (proj, Compile)).value / "myproject.mjs"

artifactPath in (proj, Test, fastOptJS) :=
  (crossTarget in (proj, Test)).value / "myproject-test.mjs"
{% endhighlight %}

The first setting is required to enable the support of ES modules in Node.js.
The other two make sure that the JavaScript produced have the extension `.mjs`, which is required for Node.js to interpret them as ES modules.

The support for running and testing ES modules with Node.js is *experimental*, as the support of ES modules by Node.js is itself experimental.
Things could change in future versions of Node.js and/or Scala.js.

## Bug fixes

Among others, the following bugs have been fixed in 0.6.26:

* [#3445](https://github.com/scala-js/scala-js/issues/3445) Linking error on `Array()` pattern with Scala.js 0.6.25 and Scala 2.13.0-M4
* [#3280](https://github.com/scala-js/scala-js/issues/3280) Matcher.groupCount behaviour inconsistent between JS and JVM
* [#3492](https://github.com/scala-js/scala-js/issues/3492) Double underscore `__` should not be forbidden in top-level exports

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av0.6.26+is%3Aclosed).
