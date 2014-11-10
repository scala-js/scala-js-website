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
2.  Implement their specification in Scala
3.  "Native" methods in Java are typically implemented in Scala.js using the
    interoperability with JavaScript.

For license considerations, this must be a clean room implementation with
respect to most existing implementations.
However, as far as I understand it, the
[Apache Harmony](http://harmony.apache.org/) implementation, although
discontinued since 2011, can be used, since its license is compatible with
the BSD-style license of Scala.js.

See [the JavaLib subdirectory on GitHub](https://github.com/scala-js/scala-js/tree/master/javalib/src/main/scala/java).
