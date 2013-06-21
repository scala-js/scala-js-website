---
layout: page
title: Testing infrastructure
---
{% include JB/setup %}

Scala.js lacks a testing infrastructure. One thing you can do is come up with
some kind thereof.

Random facts and links:

*   Scala has [a big test suite](https://github.com/scala/scala/tree/master/test),
    often refered to as `partest`, which we should leverage in some way
*   [Specs2](http://etorreborre.github.io/specs2/) is a popular testing
    framework for Scala, written in Scala
*   [Jasmine](http://pivotal.github.io/jasmine/) is a behavior-driven testing
    framework for JavaScript
*   [Rhino](https://developer.mozilla.org/en-US/docs/Rhino) is a JavaScript
    engine working on the JVM, which could be used as runner for the tests
