---
layout: page
title: Scala.js
tagline: A Scala to JavaScript compiler
---
{% include JB/setup %}

<img id="front-page-logo" alt="Scala.js logo" title="Scala.js logo"
    src="{{ BASE_PATH }}/images/scala-js-logo.svg" />

[![Build Status](https://travis-ci.org/scala-js/scala-js.png?branch=master)](https://travis-ci.org/scala-js/scala-js)

Scala.js compiles Scala code to JavaScript, allowing you to write your
Web application entirely in Scala!

<p><b><span style="color: red">Important notice!</span></b> Scala.js is still <i>experimental</i>!
Although this is a project of LAMP/EPFL for which we will continue to provide
best-effort improvements and bug fixes, it is <i>not</i> supported by Typesafe,
and not part of any of their support contracts. You have been warned!</p>

Outstanding features are:

*   Support all of Scala (including macros!),
    modulo [a few semantic differences](http://www.scala-js.org/doc/semantics.html)
*   Very good [interoperability with JavaScript code](http://www.scala-js.org/doc/js-interoperability.html).
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
and follow the instructions in its readme.

## Resources

*   [Documentation](./doc/)
*   [Official mailing list](https://groups.google.com/forum/?fromgroups#!forum/scala-js)
*   [Live-coding with Scala.js at Scala eXchange 2013](http://skillsmatter.com/podcast/scala/scala-js-write-in-scala-for-the-browser-4567)
*   [Presentation of Scala.js at Scala Days 2013](http://www.parleys.com/play/51c380bfe4b0ed8770356866) (older and somewhat obsolete)

## Useful links

#### Libraries

*   [Static types for the DOM API](https://github.com/scala-js/scala-js-dom),
    by Haoyi Li

*   [Static types for jQuery](https://github.com/scala-js/scala-js-jquery),
    brought to you by Sébastien Doeraene

#### Tools

*   [Scala.js workbench](https://github.com/lihaoyi/scala-js-workbench),
    an sbt plugin for Scala.js projects to make development in the browser more
    pleasant, by Haoyi Li

#### Miscellaneous

*   [Port of the Dart benchmark harness](https://github.com/jonas/scalajs-benchmarks)
    by Jonas Fonseca

## Contribute

*   [Scala.js on GitHub](https://github.com/scala-js/scala-js)

Want to contribute to Scala.js? Check out the
[list of contributing opportunities](./contribute/).

## Built with Scala.js

Beginning a list of websites using Scala.js:

*   December 2013

    -   [Untitled game](http://lihaoyi.github.io/scala-js-game-2/)
        by Haoyi Li

*   October 2013

    -   [Several games](http://lihaoyi.github.io/scala-js-games/)
        by Haoyi Li

*   July 2013

    -   [Knapsack on a graph](http://krishnanraman.github.io/scala-js/examples/helloworld/helloworld.html)
        by Krishnan Raman

*   June 2013

    -   [Collidium Online](http://collidium.shadaj.me/) by
        [@ShadajL](https://twitter.com/ShadajL)

*   April 2013

    -   The [Reversi]({{ BASE_PATH }}/examples/reversi/) example by myself

<a href="https://github.com/scala-js/scala-js-website"><img style="position: absolute; top: 0; right: 0; border: 0;" src="https://s3.amazonaws.com/github/ribbons/forkme_right_orange_ff7600.png" alt="Fork me on GitHub"></a>
