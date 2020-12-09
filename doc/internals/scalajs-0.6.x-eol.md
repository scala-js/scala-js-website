---
layout: doc
title: Scala.js 0.6.x End of Life
---

The Scala.js 0.6.x series have been officially discontinued in June 2020, after [an RFC](https://github.com/scala-js/scala-js/issues/4045).
The last release in the 0.6.x series is Scala.js 0.6.33.

Scala.js 0.6.x being EOL means that:

* The [0.6.x git branch](https://github.com/scala-js/scala-js/tree/0.6.x) is frozen.
* Pull requests targeting the 0.6.x branch will be rejected.
* Issues that can only be reproduced with Scala.js 0.6.x will be closed.
* As long as Scala.js 0.6.33 works with newer versions of Scala 2.12.x and 2.13.x out of the box, we will publish its compiler plugins for those versions of Scala.
  Once they stop working out of the box, support for newer versions of Scala will be dropped.

Please upgrade to Scala.js 1.x as soon as possible.
See [the release notes of Scala.js 1.0.0]({{ BASE_PATH }}/news/2020/02/25/announcing-scalajs-1.0.0/) for important migration information.

There are no plans to offer paid support for Scala.js 0.6.x.

The last version of this website with 0.6.x documentation is at [9799280](https://github.com/scala-js/scala-js-website/tree/9799280483e3a21bb519e624b7fdb16e6a6af9c9).
