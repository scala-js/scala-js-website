---
layout: post
title: Announcing Scala.js 0.5.6
category: news
tags: [releases]
---


We are excited to announce the release of Scala.js 0.5.6!

This is a backport release from the upcoming 0.6.x branch and contains various minor bug fixes and enhancements.
<!--more-->

To upgrade, change the version number in `project/plugins.sbt`, as usual. Further, you will need to upgrade to sbt >= 0.13.6 since this release of Scala.js is published against sbt 0.13.6.

Scala.js 0.5.6 is binary compatible with Scala.js 0.5.5 and hence backward binary compatible with older releases of the 0.5.x branch.

Please report any issues [on GitHub](https://github.com/scala-js/scala-js/issues).

## Changes in the 0.5.6 release

For changes introduced in 0.5.0, how to upgrade, getting started etc. have a look at the [0.5.0 announcement]({{ BASE_PATH }}/news/2014/06/13/announcing-scalajs-0.5.0/) (see also the announcements for [0.5.1]({{ BASE_PATH }}/news/2014/06/30/announcing-scalajs-0.5.1/), [0.5.2]({{ BASE_PATH }}/news/2014/07/09/announcing-scalajs-0.5.2/), [0.5.3]({{ BASE_PATH }}/news/2014/07/30/announcing-scalajs-0.5.3/), [0.5.4]({{ BASE_PATH }}/news/2014/08/29/announcing-scalajs-0.5.4/) and [0.5.5]({{ BASE_PATH }}/news/2014/09/18/announcing-scalajs-0.5.5/)).

### Export Facilities

#### @JSExport transition

In Scala.js 0.6.x, putting `@JSExport` on a class or an object will export it to its fully qualified name, rather than its simple name. To ease the transition to 0.6.x, Scala.js 0.5.6 will warn if an `@JSExport` annotation without explicit name is put on a top level object or class. Otherwise, such code would silently break when migrating to 0.6.x.

To silence the warning, simply specify the desired name explicilty.

#### @JSExportDescendentClasses

Analogous to `@JSExportDescendentObjects`, this annotation causes all constructors of extending classes to be exported under the fully qualified name of the class.

### Java Library

The following features of the Java library have been added:

#### Charset Conversions

Scala.js now supports the [standard charset conversions](https://docs.oracle.com/javase/7/docs/api/index.html?java/nio/charset/StandardCharsets.html) that every JRE supports. You can now pass instances of `Charset` to methods that convert bytes to characters and vice versa.

Note that you should avoid using `Charset.forName` (and methods that take charsets as strings in general), since they will make all `Charset` implementations reachable and hence explode your code size. If you compile on JDK6 (which does not have `StandardCharsets`), you may use [`scala.scalajs.niocharset.StandardCharsets`]({{ site.production_url }}/api/scalajs-library/0.5.6/#scala.scalajs.niocharset.StandardCharsets) to retrieve an instance of the desired `Charset`.

This also allowed to implement `String.getBytes` ([#1087](https://github.com/scala-js/scala-js/issues/1087)).

#### Others

- `java.io.PrintWriter`
- `java.util.UUID`

### Bugfixes

Amongst others, the following bugs have been fixed since 0.5.5:

- [#1140](https://github.com/scala-js/scala-js/issues/1140) fullOptJs and fastOptJs hang when running on JDK 8
- [#1148](https://github.com/scala-js/scala-js/issues/1148) Compiler crash with Scoverage
- [#1171](https://github.com/scala-js/scala-js/issues/1171) String.split / regex discrepancy
- [#1191](https://github.com/scala-js/scala-js/issues/1191) Assign multiple variables from a case class with `@JSExportAll` causes compilation error

See the [full list](https://github.com/scala-js/scala-js/issues?page=1&q=is%3Aissue+is%3Aclosed+milestone%3Av0.5.6) on GitHub.
