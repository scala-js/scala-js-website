---
layout: post
title: Announcing Scala.js 0.5.4
category: news
tags: [releases]
---


We are excited to announce the release of Scala.js 0.5.4!

This release contains various bug fixes and enhancements to both the compiler and the sbt plugin.
<!--more-->

Scala.js 0.5.4 is backward binary compatible with older versions of the 0.5.x branch. However, it is *not* forward binary compatible. This means:

- You don't need to re-publish libraries
- You must upgrade to Scala.js 0.5.4 if any library you depend on uses Scala.js 0.5.4

If you choose to re-publish a library, make sure to bump its version.

Please report any issues [on GitHub](https://github.com/scala-js/scala-js/issues).

## Upgrading from 0.5.3 an below

Simply change the version number in `project/plugins.sbt`, as usual.

If you use [uTest](https://github.com/lihaoyi/utest), you need to upgrade it to version 0.2.3 or later.
This is due to a binary incompatible change in the sbt plugin.

## Improvements in the 0.5.4 release

For changes introduced in 0.5.0, how to upgrade, getting started etc. have a look at the [0.5.0 announcement]({{ BASE_PATH }}/news/2014/06/13/announcing-scalajs-0.5.0/) (see also the announcements for [0.5.1]({{ BASE_PATH }}/news/2014/06/30/announcing-scalajs-0.5.1/), [0.5.2]({{ BASE_PATH }}/news/2014/07/09/announcing-scalajs-0.5.2/) and [0.5.3]({{ BASE_PATH }}/news/2014/07/30/announcing-scalajs-0.5.3/)).

### JavaScript Export Facilities

A few improvements have been made to `@JSExport`-related features, to export Scala.js APIs to JavaScript:

* [Export methods with named arguments]({{ BASE_PATH }}/doc/export-to-javascript.html#JSExportNamed)
* [Automatically export all public members of a class/object]({{ BASE_PATH }}/doc/export-to-javascript.html#JSExportAll)
* [Export fields declared as constructor parameters]({{ BASE_PATH }}/doc/export-to-javascript.html#constructor-params)

### PhantomJS

The interface to the PhantomJS interpreter has been enhanced with two features:

* [Passing command-line arguments to PhantomJS]({{ BASE_PATH }}/doc/sbt/js-envs.html#phantomjs-arguments)
* [Configuring PhantomJS not to terminate automatically when the `main()` method returns]({{ BASE_PATH }}/doc/sbt/js-envs.html#phantomjs-no-auto-terminate)
* You can use `java.lang.System.exit(exitCode)` to explicitly terminate the PhantomJS environment

### Conversions

The new object [JSConverters](http://www.scala-js.org/api/scalajs-library/0.5.4/#scala.scalajs.js.JSConverters$) provides extension methods to convert between JavaScript collections and Scala collections (maps, sequences and option).

[More information in the documentation]({{ BASE_PATH }}/doc/js-interoperability.html)

### Source maps for fullOptJS

Source maps are now generated for `fullOptJS` as well.

To support this, we have changed the way we integrate the Google Closure Compiler.
Should you experience any regression, please file an issue, and use the following fallback to revert to the old mechanism (which will not generate source maps):

{% highlight scala %}
ScalaJSKeys.directFullOptJS := false
{% endhighlight %}

### %%% Cross versioning

The `%%%` operator used to build library dependencies for Scala.js has been enhanced.
It is now able to determine whether it is used inside a Scala.js project or a Scala/JVM project.
In the latter, it will be equivalent to `%%`.
This allows to use `%%%` consistently for cross-compiling projects.

[More information in the documentation]({{ BASE_PATH }}/doc/sbt/depending.html)

### Auto-detect whether the DOM is required

The setting `requiresDOM` will now default to `true` if the special `RuntimeDOM` dependency is listed in the (transitive) `jsDependencies` of your project.
To specify that your library or program depends on the DOM, use the following setting:

{% highlight scala %}
ScalaJSKeys.jsDependencies += scala.scalajs.sbtplugin.RuntimeDOM
{% endhighlight %}

It is still possible to override this behavior by explicitly setting `requiresDOM`, as before.

### Tools.js

Our tools API now cross-compiles for Scala/JVM and Scala.js.
It can therefore be used in Scala.js, for example to link and optimize Scala.js IR on the client.

#### Bugfixes

The following bugs have been fixed since 0.5.3:

- [#897](https://github.com/scala-js/scala-js/issues/897) fastOptJS crash: Invalid lhs for Assign: This()
- [#898](https://github.com/scala-js/scala-js/issues/898) PhantomJS polyfill doesn't work
- [#899](https://github.com/scala-js/scala-js/issues/899) Compiler should always unbox arguments to reflective calls
- [#904](https://github.com/scala-js/scala-js/issues/904) Stack overflow in fast optimizer
- [#906](https://github.com/scala-js/scala-js/issues/906) Assignment to exported var gives "Unhandled type class" warning
- [#907](https://github.com/scala-js/scala-js/issues/907) fastOptJS crash: statements before Dictionary.delete() in exported functions
- [#908](https://github.com/scala-js/scala-js/issues/908) Calling Dictionary.delete() with js.Object property throws RuntimeException
- [#919](https://github.com/scala-js/scala-js/issues/919) sbt: Inspecting does not work with scalaJSSettings
- [#920](https://github.com/scala-js/scala-js/issues/920) Return type lifting for JSExports fails on RefinedTypes
- [#940](https://github.com/scala-js/scala-js/issues/940) Compiler crash on strange pattern match
