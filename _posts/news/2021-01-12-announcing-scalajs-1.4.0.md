---
layout: post
title: Announcing Scala.js 1.4.0
category: news
tags: [releases]
permalink: /news/2021/01/12/announcing-scalajs-1.4.0/
---


We are excited to announce the release of Scala.js 1.4.0!

This release complements the module splitting support, introduced in Scala.js 1.3.0, with support for dynamic module loading.
It is now possible to structure an application such that specific features are only loaded if necessary, the first time they are used.

In addition, this release significantly improves the performance of `scala.Array`.
In particular, arrays of numeric types (except Longs) are implemented with JavaScript typed arrays under the hood.

This release also contains a number of bug fixes.
The version of the Scala standard library for 2.13.x was upgraded to 2.13.4.

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to [the tutorial]({{ BASE_PATH }}/tutorial/).

If you need help with anything related to Scala.js, you may find our community [on Gitter](https://gitter.im/scala-js/scala-js) and [on Stack Overflow](https://stackoverflow.com/questions/tagged/scala.js).

Bug reports can be filed [on GitHub](https://github.com/scala-js/scala-js/issues).

## Release notes

If upgrading from Scala.js 0.6.x, make sure to read [the release notes of Scala.js 1.0.0]({{ BASE_PATH }}/news/2020/02/25/announcing-scalajs-1.0.0/) first, as they contain a host of important information, including breaking changes.

This is a **minor** release:

* It is backward binary compatible with all earlier versions in the 1.x series: libraries compiled with 1.0.x through 1.3.x can be used with 1.4.0 without change.
* It is *not* forward binary compatible with 1.3.x: libraries compiled with 1.4.0 cannot be used with 1.3.x or earlier.
* It is *not* entirely backward source compatible: it is not guaranteed that a codebase will compile *as is* when upgrading from 1.3.x (in particular in the presence of `-Xfatal-warnings`).

As a reminder, libraries compiled with 0.6.x cannot be used with Scala.js 1.x; they must be republished with 1.x first.

## Fixes with compatibility concerns

### `java.lang.Class.isAssignableFrom`

[`java.lang.Class.isAssignableFrom` had some serious issues](https://github.com/scala-js/scala-js/issues/4328), which we fixed in Scala.js 1.4.0.
It now completly follows its specification on the JVM.
However, it is possible that some code was relying on the broken behavior, which was, in some cases, closer to how `isInstance` and `isInstanceOf` works on Scala.js.

In particular, the following idiom, which we have seen before, is now broken more often than before:

{% highlight scala %}
def validate[T: ClassTag](x: Any): Option[T] = {
  if (classTag[T].runtimeClass.isAssignableFrom(x.getClass()))
    Some(x.asInstanceOf[T])
  else
    None
}
{% endhighlight %}

Previously, if the `runtimeClass` was `java.lang.Integer`, and the value of `x` was the integer `5`, the above code would successfully return `Some(5)`.
With the fixed `isAssignableFrom`, it will return `None` on Scala.js 1.4.0.

This happens because `x.getClass()` returns the smallest numeric type that can hold the value `5`, i.e., `java.lang.Byte`.
The previous implementation of `isAssignableFrom` would return `true` for `classOf[j.l.Integer].isAssignableFrom(classOf[j.l.Byte])`, but it now returns `false`.

The above idiom can be fixed by replacing `isAssignableFrom` by `isInstance`:

{% highlight scala %}
def validate[T: ClassTag](x: Any): Option[T] = {
  if (classTag[T].runtimeClass.isInstance(x))
    Some(x.asInstanceOf[T])
  else
    None
}
{% endhighlight %}

## Dynamic module loading

In Scala.js 1.3.0, we had introduced [module splitting support]({{ BASE_PATH }}/doc/project/module.html#module-splitting).
Scala.js 1.4.0 goes one step further with dynamic module loading.
Using this feature requires to use `fastLinkJS`/`fullLinkJS` instead of `fastOptJS`/`fullOptJS`, since it generates several .js files for one project.
It is supported with any splitting mode and with any number of entry points.

Here is an example:

{% highlight scala %}
class HeavyFeature {
  def doHeavyFeature(x: Int): Int =
    x * 2
}

class MyApp {
  def useHeavyFeature(): Unit = {
    val input: Int = getInput()
    val resultPromise: js.Promise[Int] = js.dynamicImport {
      new HeavyFeature().doHeavyFeature(input)
    }
    for (result <- resultPromise.toFuture)
      updateUIWithOutput(result)
  }
}
{% endhighlight %}

The `js.dynamicImport` method has the following signature:

{% highlight scala %}
def dynamicImport[A](body: => A): js.Promise[A]
{% endhighlight %}

Semantically, it will evaluate `body` asynchronously and return a Promise of the result.
More importantly, it acts as a border for the Scala.js linker to split out a module that will be dynamically loaded.
Without going into too many details, the above Scala.js would generate something like the following JavaScript modules:

{% highlight javascript %}
// heavyfeature.js

class HeavyFeature {
  doHeavyFeature(x) {
    return x * 2;
  }
}

export function HeavyFeatureEntryPoint(x) {
  return new HeavyFeature().doHeavyFeature(x);
}
{% endhighlight %}

{% highlight javascript %}
// main.js

class MyApp {
  useHeavyFeature() {
    const input = getInput()
    const resultPromise = import("./heavyfeature.js")
      .then(mod => mod.HeavyFeatureEntryPoint(input));
    resultPromise.then(result => updateUIWithOutput(result));
  }
}
{% endhighlight %}

In other words, the content of the `js.dynamicImport {}` block is extracted in a separate module `heavyfeature.js`, along with all its dependencies.
The call is replaced by a dynamic `import()` call, followed by an invocation of the main entry point.

When the `main.js` application is loaded, we do not need to load, nor download, the `heavyfeature.js` file.
It will only be loaded dynamically the first time we actually call `useHeavyFeature()`.
This reduces initial download times for users.

**A word of caution:** Scala.js only splits into modules along class boundaries.
Therefore, do not put the heavy feature implementation in another method of `MyApp`, that is called from the `js.dynamicImport` block.
That would defeat the purpose, as the heavy feature would have to be put inside the same module as `MyApp`.
Always make sure that the code called by `js.dynamicImport` bocks lives in separate classes or objects.

## Miscellaneous

### New JS APIs

The following APIs were added in the JS types:

* Added `js.RegExp.ExecResult.groups`, introduced in ECMAScript 2018 (thanks to [@vhiairrassary](https://github.com/vhiairrassary))
* Added `js.TypedArray.fill`, introduced in ECMAScript 2015

### Tools API

Users of the `scalajs-ir` artifact in Scala.js itself may now use the functionality in `ir.Hashers`.
Previously, trying to do so would fail to link with missing `java.security.MessageDigest`.

### Upgrade to GCC v20210106

We upgraded to the Google Closure Compiler v20210106.

## Bug fixes

Among others, the following bugs have been fixed in 1.4.0:

* [#4295](https://github.com/scala-js/scala-js/issues/4295) {fast,full}OptJS is still failing for empty reports in 1.3.1, with a `NoSuchElementException`.
* [#4292](https://github.com/scala-js/scala-js/issues/4292) `Base64.DecodingInputStream` returns 0 instead of -1
* [#4350](https://github.com/scala-js/scala-js/issues/4350) Different behavior in `Regex#replaceAllIn` w.r.t. non-matching groups
* [#4328](https://github.com/scala-js/scala-js/issues/4328) `j.l.Class.isAssignableFrom` has some serious issues
* [#4278](https://github.com/scala-js/scala-js/issues/4278) Local JS classes inside anonymous classes cause IR checking errors
* [#4322](https://github.com/scala-js/scala-js/issues/4322) Default parameters in non-native JS traits cause IR checking errors
* [#4362](https://github.com/scala-js/scala-js/issues/4362) JS constructors that require `new` cannot be called with expanded varargs (`: _*`).
* [#3667](https://github.com/scala-js/scala-js/issues/3667) `RPCCore$RPCException`: encoded string too long
* [#4325](https://github.com/scala-js/scala-js/issues/4325) `withPrettyPrint(true)` causes `NullPointerException` in fullOptJS
* [#4212](https://github.com/scala-js/scala-js/issues/4212) Compiled JS files permissions are too restrictive

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av1.4.0+is%3Aclosed).
