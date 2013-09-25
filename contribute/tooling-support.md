---
layout: page
title: Tooling support
---
{% include JB/setup %}

## sbt

There is rudimentary support for Scala.js projects using
[sbt](http://www.scala-sbt.org/) through an sbt plugin, but it is far from
being *good*.

*   Incremental compilation is not supported, i.e., all the source files are
    recompiled everytime. To have this, we need some support from `sbt`
    itself. Check out
    [the discussion](https://groups.google.com/forum/?hl=fr#!topic/simple-build-tool/tHlXlrSkXhc)
    on the sbt mailing list.

## IDEs

Standard IDE plugins for Scala do not support Scala.js because they do not
recognize the type definition files of Scala.js.

They expect to find `.class` files on the classpath, from which they load the
type information they need for autocompletion, inline compilation, etc. But
Scala.js emits `.jstype` files instead, alongside the `.js` files.

The Scala.js compiler is able to read these `.jstype` files, but the IDEs
cannot. Adding IDE support is probably only a matter of making their
respective Scala plugins able to do so.
