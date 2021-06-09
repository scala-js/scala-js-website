---
layout: post
title: Announcing Scala.js 1.6.0
category: news
tags: [releases]
permalink: /news/2021/06/09/announcing-scalajs-1.6.0/
---


We are excited to announce the release of Scala.js 1.6.0!

This release fixes a number of bugs and brings new interoperability features, notably `js.import.meta`.
It also brings new facades for `js.WeakRef` and `js.FinalizationRegistry`, while proper implementations of `java.lang.ref.*` are moved to separate libraries.

The Scala standard library was upgraded to versions 2.12.13 and 2.13.5.

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to [the tutorial]({{ BASE_PATH }}/tutorial/).

If you need help with anything related to Scala.js, you may find our community [on Gitter](https://gitter.im/scala-js/scala-js) and [on Stack Overflow](https://stackoverflow.com/questions/tagged/scala.js).

Bug reports can be filed [on GitHub](https://github.com/scala-js/scala-js/issues).

## Release notes

If upgrading from Scala.js 0.6.x, make sure to read [the release notes of Scala.js 1.0.0]({{ BASE_PATH }}/news/2020/02/25/announcing-scalajs-1.0.0/) first, as they contain a host of important information, including breaking changes.

This is a **minor** release:

* It is backward binary compatible with all earlier versions in the 1.x series: libraries compiled with 1.0.x through 1.5.x can be used with 1.6.0 without change.
* It is *not* forward binary compatible with 1.5.x: libraries compiled with 1.6.0 cannot be used with 1.5.x or earlier.
* It is *not* entirely backward source compatible: it is not guaranteed that a codebase will compile *as is* when upgrading from 1.5.x (in particular in the presence of `-Xfatal-warnings`).

As a reminder, libraries compiled with 0.6.x cannot be used with Scala.js 1.x; they must be republished with 1.x first.

## Fixes with compatibility concerns

### Classes in `java.lang.ref.*` have been moved to separate libraries

Until Scala.js 1.5.x, the core library contained stub implementations of the classes in `java.lang.ref.*`, such as `WeakReference`.
These implementations did not respect the weak semantics, and instead held *strong* references.
Despite linking and successfully running, code using `WeakReference` et al. was therefore stubtly wrong.

Since this goes against our policy for the standard library that linking code must be correct, we have removed those stubs from the core library.
To preserve binary compatibility, we introduce two variants of a library that provides the removed pieces:

* [`scalajs-fake-weakreferences`](https://github.com/scala-js/scala-js-fake-weakreferences) is an exact copy of what used to ship in Scala.js core; it can be used as a drop-in replacement when upgrading to Scala.js 1.6.0.
* [`scalajs-weakreferences`](https://github.com/scala-js/scala-js-weakreferences) provides a *correct* implementation of `WeakReference` and `ReferenceQueue` instead, but relies on ECMAScript 2021's built-in `WeakRef` and `FinalizationRegistry`; it can be used for new code.

Due to the removal from the core library, you may encounter linking errors when upgrading to Scala.js 1.6.0, such as:

{% highlight text %}
[error] Referring to non-existent class java.lang.ref.WeakReference
[error]   called from helloworld.HelloWorld$.main([java.lang.String)void
[error]   called from static helloworld.HelloWorld.main([java.lang.String)void
[error]   called from core module module initializers
[error] involving instantiated classes:
[error]   helloworld.HelloWorld$
{% endhighlight %}

You may fix these linking errors by adding the following dependency to your `libraryDependencies`:

{% highlight scala %}
"org.scala-js" %%% "scalajs-fake-weakreferences" % "1.0.0"
{% endhighlight %}

We encourage you to try and get rid of that dependency when you get the chance, since it is (intentionally) broken.

## `js.import.meta`

ECMAScript 2020 introduced the meta-property `import.meta`, which provides host-dependent information about the enclosed module.
Until Scala.js 1.5.x, there was no way to access that meta-property.
Scala.js 1.6.0 introduces a new primitive to address that shortcoming:

{% highlight scala %}
import scala.scalajs.js

val moduleMetaInfo: js.Dynamic = js.`import`.meta
println(moduleMetaInfo.url) // Node.js-specific
{% endhighlight %}

Since `import.meta` is only valid in an ES module, using `js.import.meta` requires to [emit the Scala.js code as an `ESModule`]({{ BASE_PATH }}/doc/project/module.html).
Failing to do so will result in a linking error such as

{% highlight text %}
[error] Uses import.meta with a module kind other than ESModule
[error]   called from helloworld.HelloWorld$.main([java.lang.String)void
[error]   called from static helloworld.HelloWorld.main([java.lang.String)void
[error]   called from core module module initializers
[error] involving instantiated classes:
[error]   helloworld.HelloWorld$
{% endhighlight %}

## Miscellaneous

### New facades for the JavaScript standard library

The following definitions for ECMAScript 2021 library features were added:

* `js.WeakRef`
* `js.FinalizationRegistry`

### Upgrade to JUnit 4.13.2

The Scala.js version of JUnit has been updated to match the API of JUnit 4.13.2.
The most important change is the addition of `org.junit.Assert.assertThrows`.

### New configuration for the target ECMAScript version

Until Scala.js 1.5.x, one could only choose between targeting ECMAScript 5.1 or ECMAScript 2015, based on the following setting:

{% highlight scala %}
scalaJSLinkerConfig ~= { _.withESFeatures(_.withUseECMAScript2015(false)) } // default true
{% endhighlight %}

It is now possible to choose any known ECMAScript version since 5.1, using the following setting:

{% highlight scala %}
scalaJSLinkerConfig ~= (_.withESFeatures(_.withESVersion(ESVersion.ES2018))) // default ES2015
{% endhighlight %}

Possible values are `ES5_1` and `ES2015` through `ES2020`.
We will add further choices in the future, as new versions of ECMAScript are released.

The Scala.js linker and libraries may choose to optimize the resulting code, or offer more features, based on the target ECMAScript version.
As of Scala.js 1.6.0, choices greater than `ES2015` are only used for optimizations.

### Upgrade to GCC v20210406

We upgraded to the Google Closure Compiler v20210406.

## Bug fixes

Among others, the following bugs have been fixed in 1.6.0:

* [#4466](https://github.com/scala-js/scala-js/issues/4466) 1 ULP error when toFloat is called for some long values
* [#4499](https://github.com/scala-js/scala-js/issues/4499) FewestModules can result in filenames that are greater than 255 Characters

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av1.6.0+is%3Aclosed).
