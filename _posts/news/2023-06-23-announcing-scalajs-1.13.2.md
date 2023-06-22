---
layout: post
title: Announcing Scala.js 1.13.2
category: news
tags: [releases]
permalink: /news/2023/06/23/announcing-scalajs-1.13.2/
---


We are pleased to announce the release of Scala.js 1.13.2!

This release mostly contains bug fixes.
It also upgrades the Scala standard library to versions 2.12.18 and 2.13.11.

Due to a deep incompatibility between sbt 1.6+ and Scala 2.12.4, we have dropped support for that particular version of Scala.
Other Scala 2.12.2+ versions are still supported.

This release is the first to be built with sbt 1.9.x, which means that our sbt plugin `sbt-scalajs` is now dual-published on Maven Central using the legacy Ivy style and the new Maven-compliant style.
The transitive dependency `sbt-platform-deps` is also dual-published.
See [the release notes of sbt 1.9.0](https://eed3si9n.com/sbt-1.9.0#pom-consistency-of-sbt-plugin-publishing) for more information.

Read on for more details.

<!--more-->

## Getting started

If you are new to Scala.js, head over to [the tutorial]({{ BASE_PATH }}/tutorial/).

If you need help with anything related to Scala.js, you may find our community [in `#scala-js` on Discord](https://discord.com/invite/scala) and [on Stack Overflow](https://stackoverflow.com/questions/tagged/scala.js).

Bug reports can be filed [on GitHub](https://github.com/scala-js/scala-js/issues).

## Release notes

If upgrading from Scala.js 0.6.x, make sure to read [the release notes of Scala.js 1.0.0]({{ BASE_PATH }}/news/2020/02/25/announcing-scalajs-1.0.0/) first, as they contain a host of important information, including breaking changes.

This is a **patch** release:

* It is backward binary compatible with all earlier versions in the 1.x series: libraries compiled with 1.0.x through 1.13.1 can be used with 1.13.2 without change.
* It is forward binary compatible with 1.13.0 and 1.13.1: libraries compiled with 1.13.2 can be used with previous 1.13.x versions without change.
* It is backward source compatible with 1.13.0 and 1.13.1: source code that used to compile with previous 1.13.x versions should compile as is when upgrading to 1.13.2.

In addition, like Scala.js 1.13.0:

* It is *not* forward binary compatible with 1.12.x: libraries compiled with 1.13.2 cannot be used with 1.12.x or earlier.
* It is *not* entirely backward source compatible with 1.12.x: it is not guaranteed that a codebase will compile *as is* when upgrading from 1.12.x or earlier (in particular in the presence of `-Xfatal-warnings`).

As a reminder, libraries compiled with 0.6.x cannot be used with Scala.js 1.x; they must be republished with 1.x first.

## Miscellaneous

### New JDK APIs

This release adds support for the following JDK classes:

* `java.util.StringJoiner`

## Bug fixes

Among others, the following bugs have been fixed in 1.13.2:

* [#4850](https://github.com/scala-js/scala-js/issues/4850) ClassDef checker error after linking when only using the class data of a non-native JS class
* [#4855](https://github.com/scala-js/scala-js/issues/4855) Linker emits modules with colliding names on case-insensitive filesystems
* [#4865](https://github.com/scala-js/scala-js/issues/4865) `IllegalArgumentException`: A constructor or static initializer must have a void result type
* [#4870](https://github.com/scala-js/scala-js/issues/4870) `UndefinedBehaviorError`: `java.lang.NegativeArraySizeException` in `BigInteger`
* [#4878](https://github.com/scala-js/scala-js/issues/4878) `StringIndexOutOfBoundsException` in `String.regionMatches`
* [dotty#17542](https://github.com/lampepfl/dotty/issues/17542) Scala.js IR error `java.io.Serializable` expected but `java.lang.Class` found

You can find the full list [on GitHub](https://github.com/scala-js/scala-js/issues?q=is%3Aissue+milestone%3Av1.13.2+is%3Aclosed).
