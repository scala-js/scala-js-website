---
layout: post
title: Announcing Scala.js 1.10.0
category: news
tags: [releases]
permalink: /news/2022/04/04/announcing-scalajs-1.10.0/
---


We are pleased to announce the release of Scala.js 1.10.0!

**This release addresses a security vulnerability in `java.util.UUID.randomUUID()`.**
All versions of Scala.js prior to 1.10.0 are affected, including all 0.6.x versions.
We strongly recommend that all users upgrade to Scala.js 1.10.0 as soon as possible.
Read [the security advisory](https://github.com/scala-js/scala-js/security/advisories/GHSA-j2f9-w8wh-9ww4) for more details.
The issue was registered as [CVE-2022-28355](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2022-28355).

This release also brings a new mode of module splitting, which creates the smallest possible modules for a given list of packages, and the fewest possible modules for the rest.

Finally, it contains some minor optimizations, notably contributed by [@japgolly](https://github.com/japgolly).

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to [the tutorial]({{ BASE_PATH }}/tutorial/).

If you need help with anything related to Scala.js, you may find our community [in `#scala-js` on Discord](https://discord.com/invite/scala) and [on Stack Overflow](https://stackoverflow.com/questions/tagged/scala.js).

Bug reports can be filed [on GitHub](https://github.com/scala-js/scala-js/issues).

## Release notes

If upgrading from Scala.js 0.6.x, make sure to read [the release notes of Scala.js 1.0.0]({{ BASE_PATH }}/news/2020/02/25/announcing-scalajs-1.0.0/) first, as they contain a host of important information, including breaking changes.

This is a **minor** release:

* It is backward binary compatible with all earlier versions in the 1.x series: libraries compiled with 1.0.x through 1.9.x can be used with 1.10.0 without change.
* Despite being a minor release, 1.10.0 is forward binary compatible with 1.8.x and 1.9.x. It is *not* forward binary compatible with 1.7.x. Libraries compiled with 1.10.0 can be used with 1.8.x and 1.9.x but not with 1.7.x or earlier.
* It is *not* entirely backward source compatible: it is not guaranteed that a codebase will compile *as is* when upgrading from 1.9.x (in particular in the presence of `-Xfatal-warnings`).

As a reminder, libraries compiled with 0.6.x cannot be used with Scala.js 1.x; they must be republished with 1.x first.

## Fixes with compatibility concerns

### `java.util.UUID.randomUUID()` now depends on `java.security.SecureRandom`, which is provided by external libraries

Until Scala.js 1.9.x, `java.util.UUID.randomUUID()` was implemented using `java.util.Random`, which is not cryptographically secure.
This is therefore a security issue concerning `randomUUID()`.
To address that, Scala.js 1.10.x uses `java.security.SecureRandom` in the implementation of the latter instead.
`java.util.Random` remains unchanged, since it correctly implements its (deterministic) specification.

However, `SecureRandom` cannot be implemented on all JavaScript environments, as ECMAScript, per se, lacks any primitive to access a good source of entropy.
While it can be implemented on top of browser APIs or Node.js APIs, we have no decent fallback for other cases.
Not fully implementing it correctly for all platforms would go against our policy for the standard library, i.e., that linking code must be correct.
Therefore, Scala.js core does not provide any implementation of `java.security.SecureRandom`.

This means that code that was previously calling `java.util.UUID.randomUUID()` will now fail to link.
To preserve binary compatibility, we introduce two variants of a library that provides `java.security.SecureRandom`:

* [`scalajs-java-securerandom`](https://github.com/scala-js/scala-js-java-securerandom) provides a *correct*, cryptographically secure implementation of `java.security.SecureRandom`, but relies on the Node.js `crypto` module or the Web Crypto API `crypto.getRandomValues` to be available (e.g., in browsers).
* [`scalajs-fake-insecure-java-securerandom`](https://github.com/scala-js/scala-js-fake-insecure-java-securerandom) is a fake, *insecure* implementation that works in any ECMAScript environment. The only reason this exists is to unblock migration from Scala.js 1.9.x and earlier, in situations that require `randomUUID()` and can accept that they will be insecure.

Due to the changes in the core library, you may encounter linking errors when upgrading to Scala.js 1.10.0, such as:

{% highlight text %}
[error] Referring to non-existent class java.security.SecureRandom
[error]   called from private java.util.UUID$.csprng$lzycompute()java.util.Random
[error]   called from private java.util.UUID$.csprng()java.util.Random
[error]   called from java.util.UUID$.randomUUID()java.util.UUID
[error]   called from static java.util.UUID.randomUUID()java.util.UUID
[error]   called from helloworld.HelloWorld$.main([java.lang.String)void
[error]   called from static helloworld.HelloWorld.main([java.lang.String)void
[error]   called from core module module initializers
[error] involving instantiated classes:
[error]   java.util.UUID$
[error]   helloworld.HelloWorld$
{% endhighlight %}

You may fix these linking errors by adding the following dependency to your `libraryDependencies`:

{% highlight scala %}
"org.scala-js" %%% "scalajs-java-securerandom" % "1.0.0"
{% endhighlight %}

As mentioned above, this will only work in environments that either provide the Web Crypto API, or Node.js' `crypto` module.

If you need random UUID generation in other environments, we encourage you to implement it yourselves.
Find out if your environment provides a source of cryptographically secure pseudo-random numbers.
If it does, you may want to use it to shim `crypto.getRandomValues`, and/or send a pull request to [`scalajs-java-securerandom`](https://github.com/scala-js/scala-js-java-securerandom).
Otherwise, replace calls to `randomUUID()` with another implementation, in a way that corresponds to your requirements in terms of security and collision likelihood.

If you have **no other choice**, depend on `scalajs-fake-insecure-java-securerandom` instead.
As its name implies, this is an *insecure* implementation, and you should get rid of this dependency as soon as possible.

## New module split style: `SmallModulesFor(packages)`

Prior to 1.10.0, Scala.js had two opposite module split styles:

* `FewestModules` (the default), which generates as few modules as possible, and
* `SmallestModules`, which generates as many small modules as possible (up to one per class).

As detailed in [#4327](https://github.com/scala-js/scala-js/issues/4327), those two extremes both suffered from issues for iterative development.

Scala.js 1.10.0 introduces a third style, `ModuleSplitStyle.SmallModulesFor(packages: List[String])`.
That style creates as many small modules as possibles for the classes in the listed packages (and their subpackages).
For all other classes, it generates as few modules as possible.
It is a combination of the previously existing styles.

The typical usage pattern is to list the application's packages as argument.
This way, often-changing classes receive independent, small modules, while the stable classes coming from libraries are bundled together as much as possible.
For example, if your application code lives in `com.example.myapp`, you could configure your module split style as:

{% highlight scala %}
import org.scalajs.linker.interface.ModuleSplitStyle
scalaJSLinkerConfig ~= (_.withModuleSplitStyle(ModuleSplitStyle.SmallModulesFor(List("com.example.myapp"))))
{% endhighlight %}

## Miscellaneous

### Optimizations

Scala.js 1.10.0 brings some new optimizations to the produced JavaScript files:

* Closures that do not need to capture anything produce simple lambdas, instead of redundant IIFEs (Immediately Invoked Function Expressions); contributed by [@japgolly](https://github.com/japgolly)
* `js.dynamicImport` blocks that do nothing but access a native JS class, object or member from a JS module avoid creating an intermediate Scala.js-generated module; instead they directly refer to the target JS module in the generated dynamic `import()` call.

## Bug fixes

Among others, the following bugs have been fixed in 1.10.0:

* [#4657](https://github.com/scala-js/scala-js/issues/4657) Scala.js should not provide a cryptographically insecure `UUID.randomUUID()` implementation

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av1.10.0+is%3Aclosed).
