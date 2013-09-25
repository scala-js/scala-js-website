---
layout: page
title: Testing infrastructure
---
{% include JB/setup %}

Scala.js lacks a testing infrastructure. One thing you can do is come up with
some kind thereof.

## Testing libraries and applications written in Scala.js

The sbt plugin provides a `test` command that will run a top-level object's
main method, defined in the test configuration (much like `run` does for the
compile configuration).

However, this is not really appropriate for unit testing. So we need some kind
of unit testing framework for Scala.js.

Random links:

*   [Specs2](http://etorreborre.github.io/specs2/) is a popular testing
    framework for Scala, written in Scala
*   [Jasmine](http://pivotal.github.io/jasmine/) is a behavior-driven testing
    framework for JavaScript

## Testing the language implementation, aka the compiler

There is a branch
[topic/partest](https://github.com/sjrd/scala-js/tree/topic/partest)
with work in progress for running the Scala test suite with Scala.js. The
infrastructure is in place there, but tests must be filtered by hand to decide
whether or not they should be blacklisted.

Blacklisting is required for tests that work in Scala, but are not supposed to
work in Scala.js. Typical example: those that use reflection.
