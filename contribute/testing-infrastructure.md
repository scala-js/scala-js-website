---
layout: page
title: Testing infrastructure
---
{% include JB/setup %}

Scala.js currently has a testing infrastructure based on
[Jasmine](http://pivotal.github.io/jasmine/) and built with the JavaScript
interoperability framework of Scala.js itself.

However, Jasmine is not the best we can have when we have the power of Scala.
For example, [ScalaTest](http://www.scalatest.org/) provides several nice DSLs
for different styles of tests.

We should be able to write tests using a framework like ScalaTest and all its
nice features. Then compile it with Scala.js and run it with a JavaScript
interpreter.
Ideally, if we write a cross-compiling library, the tests should also
cross-compile on the JVM and on JavaScript!
