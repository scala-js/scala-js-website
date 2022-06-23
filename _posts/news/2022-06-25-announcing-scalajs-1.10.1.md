---
layout: post
title: Announcing Scala.js 1.10.1
category: news
tags: [releases]
permalink: /news/2022/06/25/announcing-scalajs-1.10.1/
---


We are pleased to announce the release of Scala.js 1.10.1!

This release mostly contains bug fixes and optimizations.
It also updates the version of the Scala standard library to 2.12.16 for 2.12.x versions.

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to [the tutorial]({{ BASE_PATH }}/tutorial/).

If you need help with anything related to Scala.js, you may find our community [in `#scala-js` on Discord](https://discord.com/invite/scala) and [on Stack Overflow](https://stackoverflow.com/questions/tagged/scala.js).

Bug reports can be filed [on GitHub](https://github.com/scala-js/scala-js/issues).

## Release notes

If upgrading from Scala.js 0.6.x, make sure to read [the release notes of Scala.js 1.0.0]({{ BASE_PATH }}/news/2020/02/25/announcing-scalajs-1.0.0/) first, as they contain a host of important information, including breaking changes.

This is a **patch** release:

* It is backward binary compatible with all earlier versions in the 1.x series: libraries compiled with 1.0.x through 1.10.0 can be used with 1.10.1 without change.
* It is forward binary compatible with 1.10.0: libraries compiled with 1.10.1 can be used with 1.10.0 without change.
* It is backward source compatible with 1.10.0: source code that used to compile with 1.10.0 should compile as is when upgrading to 1.10.1.

In addition, like Scala.js 1.10.0:

* It is forward binary compatible with 1.8.x and 1.9.x, but *not* 1.7.x: libraries compiled with 1.10.1 can be used with 1.8.x and later, but not with 1.7.x or earlier.
* It is *not* entirely backward source compatible with 1.9.x: it is not guaranteed that a codebase will compile *as is* when upgrading from 1.9.x or earlier (in particular in the presence of `-Xfatal-warnings`).

As a reminder, libraries compiled with 0.6.x cannot be used with Scala.js 1.x; they must be republished with 1.x first.

## Miscellaneous

### Optimizations

Scala.js 1.10.0 brought some optimizations with respect to closures.
Scala.js 1.10.1 expands on these optimizations with the following improvements:

* When a closure captures a variable that ends up being constant-folded, the constant is propagated inside the closure, and the capture parameter is removed.
* Most closures that are not declared within a loop do not need an IIFE (Immediately Invoked Function Expression) anymore, even when they actually capture some variables.

## Bug fixes

Among others, the following bugs have been fixed in 1.10.1:

* [#4684](https://github.com/scala-js/scala-js/issues/4684) Unit JS default param makes compiler crash with "Found a dangling UndefinedParam"
* [#4675](https://github.com/scala-js/scala-js/issues/4675) ES2021 not supported in fullLinkJS

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av1.10.1+is%3Aclosed).
