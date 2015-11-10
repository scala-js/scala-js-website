---
layout: post
title: Announcing Scala.js 0.5.3
category: news
tags: [releases]
---


We are excited to announce the release of Scala.js 0.5.3!

This release was focused mostly on *performance*, bringing speedups from 1.3x to 3.3x to your applications.
In some cases, Scala.js becomes slightly *faster than JavaScript*!
<!--more-->

Scala.js 0.5.3 is backward binary compatible with older versions of the 0.5.x branch. However, it is *not* forward binary compatible. This means:

- You don't need to re-publish libraries
- You must upgrade to Scala.js 0.5.3 if any library you depend on uses Scala.js 0.5.3

If you choose to re-publish a library, make sure to bump its version.

Please report any issues [on GitHub](https://github.com/scala-js/scala-js/issues).

## Improvements in the 0.5.3 release

For changes introduced in 0.5.0, how to upgrade, getting started etc. have a look at the [0.5.0 announcement]({{ BASE_PATH }}/news/2014/06/13/announcing-scalajs-0.5.0/) (see also the announcements for [0.5.1]({{ BASE_PATH }}/news/2014/06/30/announcing-scalajs-0.5.1/) and [0.5.2]({{ BASE_PATH }}/news/2014/07/09/announcing-scalajs-0.5.2/)).

#### Performance improvements

Scala.js 0.5.3 is the first release to include an actual *optimizer* specific to Scala.js.
This optimizer runs as part of the `fastOptJS` task, and consistently brings speedups to all applications from 1.3x to 3.3x ([Rough benchmarks](https://docs.google.com/document/d/17b18-oLJEIADixkSPR2mYof13ny1nGTtEVfsdiM7AGE/edit)), along with code size reduction (15 % for the fastOpt version and 6 % for the fullOpt on our demo application) and less memory usage.
Because it runs at link time, the optimizer also applies to libraries you depend on that have been compiled with Scala.js 0.5.0 to 0.5.2 (although a few optimizations won't be as effective).

The optimizer is *incremental* in the same sense as the incremental compilation of sbt: on each run, it will reoptimize only the parts of your application that need reoptimizing.
This means that it will run much faster starting from the second run within an sbt session (within 200 ms in typical scenarios).

Should you experience any issue (e.g., your code broke), please report them [on GitHub](https://github.com/scala-js/scala-js/issues).
You can also disable the optimizer with the sbt setting

{% highlight scala %}
ScalaJSKeys.inliningMode := scala.scalajs.sbtplugin.InliningMode.Off
{% endhighlight %}

Alternatively, you can force it to run in batch mode (non incremental) on every run with the following setting:

{% highlight scala %}
ScalaJSKeys.inliningMode := scala.scalajs.sbtplugin.InliningMode.Batch
{% endhighlight %}

#### New parts of the Java standard library

The following classes from the Java standard library are now available:

* `java.net.URI`
* `InputStream`, `FilterInputStream`, `DataInput`, `ByteArrayInputStream`
* `scala.scalajs.js.typearray.ArrayBufferInputStream`, an implementation of `InputStream` reading a JavaScript `TypedArray`

These classes are automatically available in all your Scala.js projects.

Other, additional Java classes are also available in the `javalib-ex` package.
These classes require some features of ECMAScript 6 to be implemented by the JavaScript engine, and must therefore be enabled explicitly with this dependency:

{% highlight scala %}
libraryDependencies += "org.scala-lang.modules.scalajs" %% "scalajs-javalib-ex" % scalaJSVersion
{% endhighlight %}

Currently, the only additional class is `java.io.DataInputStream`.

#### JavaScript libraries in Node.js

Until 0.5.2, the Node.js runner had trouble running JavaScript libraries that were "too" smart about being run as a Node.js module (bug [#706](https://github.com/scala-js/scala-js/issues/706)).
To fix this issue, the `jsDependencies` mechanism has been augmented with an optional `commonJSName` directive, to be used as:

{% highlight scala %}
jsDependencies += "org.webjars" % "mustachejs" % "0.8.2" / "mustache.js" commonJSName "Mustache"
{% endhighlight %}

The `commonJSName` directive should be set to the name used by the library to export itself when run in a CommonJS environment (such as Node.js).
You can typically figure that out from the library's documentation.

#### Bugfixes

The following bugs have been fixed in 0.5.3:

- [#820](https://github.com/scala-js/scala-js/issues/820) Generated html for phantomjs on windows fails to load scripts
- [#843](https://github.com/scala-js/scala-js/issues/843) `js.Array.toList` (and others) fails with a `ClassCastException`
- [#865](https://github.com/scala-js/scala-js/issues/865) PhantomJS doesn't use existing shell environment
- [#872](https://github.com/scala-js/scala-js/issues/872) `string.split('\n')` does not work

#### Changes to the IR

Some (more) minor changes have been made to the IR to better accommodate the optimizer.
This is the reason for the lack of forward binary compatibility in this release.
