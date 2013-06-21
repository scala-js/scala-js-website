---
layout: page
title: Port the Java library
---
{% include JB/setup %}

Scala is built on top of Java and its standard library. Therefore, Scala.js
needs some parts of the Java library to work. This port of the Java library
is itself written in Scala.js.

Currently, only a very small portion is implemented. A very simple, although
sometimes tedious, thing that will help Scala.js is to expand this port. It
basically boils down to

1.  Identifying what classes are needed (either because they are used by the
    Scala library, or because their are generally useful)
2.  Translate their definition from Java to Scala
3.  "Native" methods in Java are typically implemented in Scala.js using the
    interoperability with JavaScript.

See [the Scala-JavaLib repo on GitHub](https://github.com/sjrd/scala-javalib/tree/scala-js).
