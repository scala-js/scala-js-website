---
layout: post
title: Announcing Scala.js 0.5.5
category: news
tags: [releases]
---


We are excited to announce the release of Scala.js 0.5.5!

This release contains various minor bug fixes and enhancements. It is the last anticipated release in the 0.5.x series and prepares the upcoming 0.6.x series by deprecating various obsolete features (see below for details).
<!--more-->

To upgrade, simply change the version number in `project/plugins.sbt`, as usual.

Scala.js 0.5.5 is backward binary compatible with older versions of the 0.5.x branch. However, it is *not* forward binary compatible. This means:

- You don't need to re-publish libraries
- You must upgrade to Scala.js 0.5.5 if any library you depend on uses Scala.js 0.5.5

If you choose to re-publish a library, make sure to bump its version.

Please report any issues [on GitHub](https://github.com/scala-js/scala-js/issues).

#### Upgrading from 0.5.3 and below

If you use [uTest](https://github.com/lihaoyi/utest), you need to upgrade it to version 0.2.3 or later.
This is due to a binary incompatible change in the sbt plugin in Scala.js 0.5.4.

## Changes in the 0.5.5 release

For changes introduced in 0.5.0, how to upgrade, getting started etc. have a look at the [0.5.0 announcement]({{ BASE_PATH }}/news/2014/06/13/announcing-scalajs-0.5.0/) (see also the announcements for [0.5.1]({{ BASE_PATH }}/news/2014/06/30/announcing-scalajs-0.5.1/), [0.5.2]({{ BASE_PATH }}/news/2014/07/09/announcing-scalajs-0.5.2/), [0.5.3]({{ BASE_PATH }}/news/2014/07/30/announcing-scalajs-0.5.3/) and [0.5.4]({{ BASE_PATH }}/news/2014/08/29/announcing-scalajs-0.5.4/)).

### Deprecations & Renamings

#### Implicit conversion between `scala.Array` and `js.Array`

Implicit conversion between `scala.Array` and `js.Array` has been deprecated in favor of `JSConverters`. Instead of relying on implicit conversion, use `toArray` and `toJSArray`:

**js.Array to scala.Array**

{% highlight scala %}
val jsArr = js.Array(1, 2, 3)
val scArr = jsArr.toArray
{% endhighlight %}

**scala.Array to js.Array**

{% highlight scala %}
import scala.scalajs.js.JSConverters._

val scArr = scala.Array(1, 2, 3)
val jsArr = scArr.toJSArray
{% endhighlight %}

Note that these conversions apply equally to other Scala collections like `Seq` or `List`. Conversion between `js.Dictionary` and Scala's `Map` is supported as well.

#### packageJS
`packageJS` has been deprecated in favor of `fastOptJS`.

Its providing tasks (`packageExternalDepsJS`, `packageInternalDepsJS` and `packageExportedProductsJS`) have been deprecated without replacement. If such a mechanism is required, [`ScalaJSPackager`]({{ site.production_url }}/api/scalajs-tools/0.5.5/#scala.scalajs.tools.packager.ScalaJSPackager) should be used directly.

#### sbt Task Renamings

Several sbt tasks have been renamed to avoid conflicts with other sbt plugins (see [#1050](https://github.com/scala-js/scala-js/issues/1050)). The tasks are still available under their old name in 0.5.5 in order to not break builds, but the aliases will be removed in 0.6.0. Inside the console, only the new name is available.

We have taken great care to only rename keys which are very unlikely to be used by a Scala.js build. Just in case, a list of the renamings is given below. Note that the sbt plugin will undergo a major reworking in 0.6.0 to make it an `AutoPlugin`. We therefore recommend to not update your build yet if you do not need to.

<table class="table table-bordered">
  <thead>
    <tr>
      <th>Old Name</th>
      <th>New Name</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>packageLauncher</td>
      <td>packageScalaJSLauncher</td>
    </tr>
    <tr>
      <td>preLinkClasspath</td>
      <td>scalaJSPreLinkClasspath</td>
    </tr>
    <tr>
      <td>execClasspath</td>
      <td>scalaJSExecClasspath</td>
    </tr>
    <tr>
      <td>launcher</td>
      <td>scalaJSLauncher</td>
    </tr>
    <tr>
      <td>jsConsole</td>
      <td>scalaJSConsole</td>
    </tr>
    <tr>
      <td>ensureUnforked</td>
      <td>scalaJSEnsureUnforked</td>
    </tr>
    <tr>
      <td>requestsDOM</td>
      <td>scalaJSRequestsDOM</td>
    </tr>
    <tr>
      <td>defaultPostLinkJSEnv</td>
      <td>scalaJSDefaultPostLinkJSEnv</td>
    </tr>
    <tr>
      <td>preLinkClasspath</td>
      <td>scalaJSPreLinkClasspath</td>
    </tr>
  </tbody>
</table>


### Improvements
The following improvements have been made in 0.5.5.

- Source mapping support in Rhino (enabled by default) ([#727](https://github.com/scala-js/scala-js/issues/727))
- Full source mapping support in Node.js (not only in testing). Requires installing `source-map-support` via `npm`.
- The Node.js runner honors the system environment's `NODE_PATH` ([#1016](https://github.com/scala-js/scala-js/issues/1016))
- Tiny JVM (only) library containing Scala.js export annotations ([#1006](https://github.com/scala-js/scala-js/issues/1006)). Use with:

        libraryDependencies += "org.scala-lang.modules.scalajs" %% "scalajs-stubs" % "0.5.5"

        resolvers += scala.scalajs.sbtplugin.ScalaJSPluginInternal.scalaJSReleasesResolver

        // or without Scala.js on the classpath
        resolvers += Resolver.url("scala-js-releases",
            url("http://dl.bintray.com/content/scala-js/scala-js-releases"))(
            Resolver.ivyStylePatterns)

- Improved accuracy and parallelization for incremental optimizer
- Allow to export protected members (`@JSExportAll` still only exports public members).

#### Bugfixes

The following bugs have been fixed since 0.5.4:

- [#985](https://github.com/scala-js/scala-js/issues/985) JSExport doesn't overload js.Any and Any correctly
- [#987](https://github.com/scala-js/scala-js/issues/987) Splitting an empty string should return an array with 1 element, not an empty array
- [#997](https://github.com/scala-js/scala-js/issues/997) Honor in-regex flags in java.util.regex
- [#1011](https://github.com/scala-js/scala-js/issues/1011) IR printer doesn't print -0.0 correctly
- [#1020](https://github.com/scala-js/scala-js/issues/1020) Correct stack frame resolution of anonymous functions in Chrome/v8
