---
layout: post
title: Announcing Scala.js 1.7.1
category: news
tags: [releases]
permalink: /news/2021-10-07/announcing-scalajs-1.7.1/
---


We are pleased to announce the release of Scala.js 1.7.1!

This is mostly a bugfix release.
It also updates the version of the Scala standard library to 2.12.15 for 2.12.x versions.

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to [the tutorial]({{ BASE_PATH }}/tutorial/).

If you need help with anything related to Scala.js, you may find our community [on Gitter](https://gitter.im/scala-js/scala-js) and [on Stack Overflow](https://stackoverflow.com/questions/tagged/scala.js).

Bug reports can be filed [on GitHub](https://github.com/scala-js/scala-js/issues).

## Release notes

If upgrading from Scala.js 0.6.x, make sure to read [the release notes of Scala.js 1.0.0]({{ BASE_PATH }}/news/2020/02/25/announcing-scalajs-1.0.0/) first, as they contain a host of important information, including breaking changes.

This is a **patch** release:

* It is backward binary compatible with all earlier versions in the 1.x series: libraries compiled with 1.0.x through 1.7.0 can be used with 1.7.1 without change.
* It is forward binary compatible with 1.7.0: libraries compiled with 1.7.1 can be used with 1.7.0 without change.
* It is backward source compatible with 1.7.0: source code that used to compile with 1.7.0 should compile as is when upgrading to 1.7.1.

In addition, like Scala.js 1.7.0:

* It is *not* forward binary compatible with 1.6.x: libraries compiled with 1.7.1 cannot be used with 1.6.x or earlier.
* It is *not* entirely backward source compatible with 1.6.x: it is not guaranteed that a codebase will compile *as is* when upgrading from 1.6.x or earlier (in particular in the presence of `-Xfatal-warnings`).

As a reminder, libraries compiled with 0.6.x cannot be used with Scala.js 1.x; they must be republished with 1.x first.

## Fixes with compatibility concerns

### Default parameter values of `@js.native def`s are now ignored

#### Context

In native JS types, default parameters of methods are only meaningful by their *presence*, but not by their actual *values*.
When calling a method without specifying one of its default parameters, the parameter is actually omitted in JavaScript, and therefore it is up to the called method to fill in its own default behavior.
This notably allows to use the pseudo-value `= js.native`.
For example:

{% highlight scala %}
@js.native @JSGlobal
object Foo extends js.Object {
  def bar(x: Int, y: Int = js.native): Int = js.native
}
{% endhighlight %}

could be an accurate description of the following JavaScript definition:

{% highlight javascript %}
const Foo = {
  bar(x, y) {
    return x + (y === undefined ? 1 : y);
  }
};
{% endhighlight %}

When calling that method from Scala.js as

{% highlight scala %}
println(Foo.bar(5))
{% endhighlight %}

it is translated as `Foo.bar(5)`, without second parameter, and it is therefore the JavaScript condition on `y === undefined` that is used.

This behavior applies regardless of the value used in the facade.
If we pretend in the facade that the default value is `2`, as follows:

{% highlight scala %}
  def bar(x: Int, y: Int = 2): Int = js.native
{% endhighlight %}

it will have no impact on the behavior of the code.
The parameter will still be omitted when calling the JavaScript function, which will still use `1` as the actual default value.

#### Issue in previous versions

The above behavior has always been specified as is.
It was however previously incorrectly implemented for `@js.native def`s.
For example, if `bar` was a top-level function, we could have defined is as

{% highlight scala %}
object Foo {
  @js.native @JSGlobal("bar")
  def bar(x: Int, y: Int = 2): Int = js.native
}
{% endhighlight %}

In that case, until Scala.js 1.7.0, calling `Foo.bar(5)` was erroneously compiled to `bar(5, 2)`.
This is inconsistent with other native JS methods.

That also prevented such definitions to use `= js.native`, since it would report that `js.native` cannot be compiled to actual code for run-time execution.

#### Fix in Scala.js 1.7.1

In Scala.js 1.7.1, the behavior of default parameters in `@js.native def`s has been aligned with other native JS methods.
Now, the call `Foo.bar(5)` is correctly compiled to `bar(5)`, and therefore uses the JS-defined default value of `1`.

**This change may break some code** when compiling the call site `bar(5)` with Scala.js 1.7.1, if the code relied on the buggy previous behavior.
That may only happen if the default value specified in the facade type is not an accurate representation of what the JavaScript code actually uses.

The fix also allows `= js.native` to be used in the default parameters of `@js.native def`s.

## Bug fixes

Among others, the following bugs have been fixed in 1.7.1:

* [#4542](https://github.com/scala-js/scala-js/issues/4542) Many `dynamicImports` with `FewestModules` causes the Linker to GC itself to death
* [#4545](https://github.com/scala-js/scala-js/issues/4545) JDK 12+ bug: Referring to non-existent class `java.lang.constant.ConstantDesc`
* [#4548](https://github.com/scala-js/scala-js/issues/4548) Referencing only the class data of an imported native JS class causes a GCC error
* [#4553](https://github.com/scala-js/scala-js/issues/4553) `js.native` as default arg doesn't compile for top-level method facades
* [#4554](https://github.com/scala-js/scala-js/issues/4554) Default values for params of `@js.native def`s are actually used, instead of being replaced by `<UndefinedParam>`

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av1.7.1+is%3Aclosed).
