---
layout: page
title: Scala.js
tagline: A Scala to JavaScript compiler
---
{% include JB/setup %}

<img id="front-page-logo" alt="Scala.js logo" title="Scala.js logo"
    src="{{ BASE_PATH }}/images/scala-js-logo.svg" />

[![Build Status](https://travis-ci.org/scala-js/scala-js.png?branch=master,scala-2.11)](https://travis-ci.org/scala-js/scala-js)

Scala.js compiles Scala code to JavaScript, allowing you to write your
Web application entirely in Scala!

<p><b><span style="color: red">Important notice!</span></b> Scala.js is still <i>experimental</i>!
Although this is a project of LAMP/EPFL for which we will continue to provide
best-effort improvements and bug fixes, it is <i>not</i> supported by Typesafe,
and not part of any of their support contracts. You have been warned!</p>

Noteworthy features:

*   Support all of Scala (including macros!),
    modulo [a few semantic differences](./doc/semantics.html)
*   Very good [interoperability with JavaScript code](./doc/js-interoperability.html).
    For example, use jQuery and HTML5 from your Scala.js code, either in a
    typed or untyped way. Or create Scala.js objects and call their methods
    from JavaScript.
*   Integrated with [sbt](http://www.scala-sbt.org/)
    (including support for dependency management and incremental compilation)
*   Can be used with your favorite IDE for Scala
*   Generates [Source Maps](http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/)
    for a smooth debugging experience (step through your Scala code from within
    your browser supporting source maps)
*   Integrates [Google Closure Compiler](https://developers.google.com/closure/compiler/)
    for producing minimal code for production.

## Get started

The easiest way to get started is to fork the
[bootstrapping skeleton](https://github.com/sjrd/scala-js-example-app)
and follow the instructions in its readme. You can also [try it out in the browser](http://www.scala-js-fiddle.com/).

## Resources

*   [Documentation](./doc/)
*   [Official mailing list](https://groups.google.com/forum/?fromgroups#!forum/scala-js)
*   [Scala.js tag on Stackoverflow](http://stackoverflow.com/questions/tagged/scala.js). Please help building it up by asking questions.

Presentations:

*   [Live Coding Scala.js at SF Scala 2014](http://vimeo.com/87845442) by Li Haoyi
*   [Live-coding with Scala.js at Scala eXchange 2013](http://skillsmatter.com/podcast/scala/scala-js-write-in-scala-for-the-browser-4567)
*   [Presentation of Scala.js at Scala Days 2013](http://www.parleys.com/play/51c380bfe4b0ed8770356866) (older and somewhat obsolete)

## Useful links

#### Libraries

* [Static types for the DOM API](https://github.com/scala-js/scala-js-dom),
  by Li Haoyi
* [Static types for jQuery](https://github.com/scala-js/scala-js-jquery),
  brought to you by Sébastien Doeraene
* [Scalatags](https://github.com/lihaoyi/scalatags), a HTML templating
  library/DSL that works on both Scala-JVM and Scala-JS, by Li Haoyi
* [Scala.Rx](https://github.com/lihaoyi/scala.rx), a change-propagation/FRP library that runs on both Scala-JVM and Scala-JS, by Li Haoyi
* [uTest](https://github.com/lihaoyi/utest#%C2%B5test-011), a tiny, portable unit testing library that lets you run the same tests on both Scala-JVM and Scala-JS, by Li Haoyi
* [Scala.js Pickling](https://github.com/scala-js/scala-js-pickling),
  a cross-compiling pickling (aka serialization) library for Scala.js and Scala
  with a common JSON-based format, by Sébastien Doeraene
* [Monifu](https://github.com/alexandru/monifu), reactive extensions (Rx) with back-pressure, atomic references and other multi-threading primitives cross-compiled to Scala.js

#### Skeletons

* [Play! application with Scala.js](https://github.com/vmunier/play-with-scalajs-example)
* [Node.js module with Scala.js](https://github.com/rockymadden/scala-node-example),
  by Rocky Madden

#### Tools

* [Scala.js workbench](https://github.com/lihaoyi/scala-js-workbench),
  an sbt plugin for Scala.js projects for live-reloading in the browser ([example app](https://github.com/lihaoyi/workbench-example-app)), by Li Haoyi
* [Scala.js Resource](https://github.com/lihaoyi/scala-js-resource), an sbt plugin for bundling of binary files so they can be accessed from the browser, by Li Haoyi

#### Miscellaneous

* [Port of the Dart benchmark harness](https://github.com/jonas/scala-js-benchmarks)
  by Jonas Fonseca

## Contribute

* [Scala.js on GitHub](https://github.com/scala-js/scala-js)

Want to contribute to Scala.js? Check out the
[list of contributing opportunities](./contribute/).

## Built with Scala.js

Beginning a list of websites using Scala.js:

* February 2014
  - [TodoMVC](http://lihaoyi.github.io/workbench-example-app/todo.html), an implementation of the [TodoMVC example application](http://todomvc.com/) using Scala.js, Scalatags, Scala.Rx and scala-js-dom, by Li Haoyi
  - [Sierpinski Triangle](http://lihaoyi.github.io/workbench-example-app/triangle.html) and [Dodge the dot](http://lihaoyi.github.io/workbench-example-app/dodge.html) (Scala.js workbench [example apps](https://github.com/lihaoyi/workbench-example-app)), by Li Haoyi
  - [Scala.jsFiddle](http://www.scala-js-fiddle.com/), an online scratchpad that lets you compile and run Scala.js snippets right in the browser, by Li Haoyi
* December 2013
  - [Roll](http://lihaoyi.github.io/roll/), a 2D Physics Platformer
    by Li Haoyi
* December 2013
  - [Sliding Puzzle](https://github.com/sebnozzi/sliding-puzzle)
    by [Sebastian Nozzi](http://www.sebnozzi.com/)
* October 2013
  - [Several games](http://lihaoyi.github.io/scala-js-games/)
    by Li Haoyi
* July 2013
  - [Knapsack on a graph](http://krishnanraman.github.io/scala-js/examples/helloworld/helloworld.html)
    by Krishnan Raman
* June 2013
  - [Collidium Online](http://collidium.shadaj.me/) by
    [@ShadajL](https://twitter.com/ShadajL)
* April 2013
  - The [Reversi]({{ BASE_PATH }}/examples/reversi/) example by Sébastien Doeraene

## Hall of Fame

* [Bug in node.js/v8](http://github.com/joyent/node/issues/7528) discovered by Scala.js through Scala test suite

<a href="https://github.com/scala-js/scala-js-website"><img style="position: absolute; top: 0; right: 0; border: 0;" src="https://s3.amazonaws.com/github/ribbons/forkme_right_orange_ff7600.png" alt="Fork me on GitHub"></a>
