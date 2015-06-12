---
layout: page
title: Scala.js
tagline: the Scala to JavaScript compiler
---
{% include JB/setup %}

<img id="front-page-logo" alt="Scala.js logo" title="Scala.js logo"
    src="{{ BASE_PATH }}/images/scala-js-logo.svg" />

Scala.js compiles Scala code to JavaScript, allowing you to write your web application entirely in Scala! Take a look at the [project gallery](#built_with_scalajs) to see what kind of things you can build with Scala.js.

## Get started

<span><a href="{{ BASE_PATH }}/doc/tutorial.html" class="btn btn-large btn-success">Start the Tutorial</a></span>
&nbsp;&nbsp;&nbsp;
<span><a href="http://www.scala-js-fiddle.com/" class="btn btn-large btn-success">Try it in the Browser</a></span>

The easiest way to get started is to follow our [tutorial](./doc/tutorial.html). You can also fork the
[bootstrapping skeleton](https://github.com/sjrd/scala-js-example-app)
and follow the instructions in its readme or [try it out in the browser](http://www.scala-js-fiddle.com/). There's also an e-book [Hands-on Scala.js](https://lihaoyi.github.io/hands-on-scala-js) which contains a lot of introductory material to help you get started.

We also have a [standalone distribution](./downloads.html) that doesn't require SBT.

_Note that Scala.js is not part of the Typesafe Reactive platform.
Thus, although we consider Scala.js production-ready, Typesafe does not provide any commercial support for it._


## Noteworthy features

*   Support all of Scala (including macros!),
    modulo [a few semantic differences](./doc/semantics.html)
*   Very good [interoperability with JavaScript code](./doc/js-interoperability.html).
    For example, use jQuery and HTML5 from your Scala.js code, either in a
    typed or untyped way. Or create Scala.js objects and call their methods
    from JavaScript.
*   [Integrated with sbt](./doc/sbt-plugin.html)
    (including support for dependency management and incremental compilation)
*   Can be used with your favorite IDE for Scala
*   Generates [Source Maps](http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/)
    for a smooth debugging experience (step through your Scala code from within
    your browser supporting source maps)
*   Integrates [Google Closure Compiler](https://developers.google.com/closure/compiler/)
    for producing minimal code for production. Compiled blobs range from 170-400kb
*   Produces (very) efficient JavaScript code
    ([benchmarks](https://github.com/sjrd/scalajs-benchmarks))

## Resources

*   [Documentation](./doc/): APIs, guides, and reference.
*   [Scala.js tag on Stackoverflow](http://stackoverflow.com/questions/tagged/scala.js): for delimited technical questions on using Scala.js.
*   [Official mailing list](https://groups.google.com/forum/?fromgroups#!forum/scala-js): for general discussion, ideas, announcements of your libraries, etc.
*   [Gitter chat room](https://gitter.im/scala-js/scala-js): come and meet the community of Scala.js users.

Featured presentations to get you convinced:

*   [Hands-on Scala.js](http://vimeo.com/111978847) at Pacific North-West Scala 2014, by Li Haoyi
*   [Cross-Platform Development in Scala.js](https://www.youtube.com/watch?v=Ksoi6AG9nbA) at Scala by the Bay 2014, by Li Haoyi

## Libraries

This is a collection of libraries known to work with Scala.js.
Some of them, like `scala-js-dom` and `scala-js-jquery`, are specific to Javascript and don't make sense on the JVM.
Some others, such as `scala-async`, are pure-macro projects, and thus work with Scala.js out of the box.
Most of them, though, are cross-compiling over JVM and JS, and thus have separate artifacts to run on each platform.

If you have a library that would be useful to the Scala.js community, please 
[add it to this list](https://github.com/scala-js/scala-js-website/edit/master/index.md)! 
Add a new entry for the library under the appropriate category below, press "Propose file change"
and then "Create a Pull Request".

### Static types for JavaScript libraries

*   [scalajs-dom](https://github.com/scala-js/scala-js-dom): static types for the DOM API, plus a few extensions
*   [scalajs-jquery](https://github.com/scala-js/scala-js-jquery): static types for jQuery
*   [jquery-facade](https://github.com/jducoeur/jquery-facade): alternate static types for jQuery -- less complete, more strongly typed
*   [scalajs-pouchdb](https://github.com/chandu0101/scalajs-facades/tree/master/core/src/main/scala/chandu0101/scalajs/facades/pouchdb): static types for PouchDB
*   [bootstrap-datepicker-facade](https://github.com/jducoeur/bootstrap-datepicker-scalajs): static types for [bootstrap-datepicker](https://github.com/eternicode/bootstrap-datepicker)
*   [scalajs-google-maps](https://github.com/coreyauger/scalajs-google-maps): static types for google maps v3
*   [scala-js-vaadin-components](https://github.com/hezamu/scala-js-vaadin-components): static types for [Vaadin Components](http://vaadin.com/components)

### Testing frameworks

All these testing frameworks cross-compile on the JVM and JS.

*   [uTest](https://github.com/lihaoyi/utest)
*   [MiniTest](https://github.com/monifu/minitest)
*   [Little Spec](https://github.com/eecolor/little-spec)
*   [Nyaya](https://github.com/japgolly/nyaya): Property testing and related.
*   [zcheck](https://github.com/InTheNow/zcheck): A wrapper around scalacheck and scalaz's Speclite.
*   [Greenlight](https://github.com/greencatsoft/greenlight)

### HTML templating libraries

*   [Scalatags](https://github.com/lihaoyi/scalatags): cross-compiling HTML templating library/DSL that works on both Scala/JVM and Scala.js

### UI frameworks

*   [scalajs-react](https://github.com/japgolly/scalajs-react): Type-safe and Scala-friendly library over Facebook's [React](http://facebook.github.io/react/).
*   [scala-js-binding](https://github.com/antonkulaga/scala-js-binding): An all-Scala.js HTML binding library
*   [scalajs-angular](https://github.com/greencatsoft/scalajs-angular) with [TodoMvc example](https://github.com/greencatsoft/scalajs-angular-todomvc): static types and complementary API for AngularJS
*   [scalajs-angulate](https://github.com/jokade/scalajs-angulate): another binding to AngularJS with enhancements
*   [Widok](https://widok.github.io/): Reactive web framework for the JVM and Scala.js

### Serialization/pickling libraries

*   [uPickle](https://github.com/lihaoyi/upickle): cross-compiling statically-typed pickling (via typeclasses/macros) for both Scala/JVM and Scala.js
*   [Prickle](https://github.com/benhutchison/prickle): cross-compiling statically-typed pickling library with support for pickling object graphs containing shared objects and cycles
*   [BooPickle](https://github.com/ochrons/boopickle): highly efficient binary serialization for both Scala and Scala.js
*   [Scala.js Pickling](https://github.com/scala-js/scala-js-pickling): cross-compiling pickling library based on explicit registration of picklers

### Client-server communication

*   [autowire](https://github.com/lihaoyi/autowire): cross-compiling statically-typed Ajax calls and RPCs

### Visualization

*   [Paths.scala.js](https://github.com/andreaferretti/paths-scala-js): a library to generate SVG charts and shapes (wrapper over [Paths.js](https://github.com/andreaferretti/paths-js))

### FRP/reactive extensions

*   [Scala.Rx](https://github.com/lihaoyi/scala.rx): cross-compiling change-propagation/FRP library
*   [Monifu](https://github.com/alexandru/monifu): cross-compiling reactive extensions (Rx) with back-pressure, atomic references and other multi-threading primitives

### Ports of well-known Scala libraries

*   [NICTA/rng](https://github.com/japgolly/rng): Pure-functional random value generation.
*   [Monocle](https://github.com/japgolly/Monocle): Optics library strongly inspired by Haskell [Lens](https://github.com/ekmett/lens).
*   [Scalaz](https://github.com/japgolly/scalaz): Library for functional programming.
*   [Shapeless](https://github.com/japgolly/shapeless): Generic programming for Scala.

### Miscellaneous

*   [Scala-Async](https://github.com/scala/async) (works out-of-box with Scala.js)
*   Scalaxy [Loops](https://github.com/ochafik/Scalaxy/tree/master/Loops) and [Streams](https://github.com/ochafik/Scalaxy/tree/master/Streams) (work out-of-box with Scala.js)
*   [jsext](https://github.com/jducoeur/jsext): utilities for developing facades and working with Futures
*   [slogging](https://github.com/jokade/slogging): a simple logging library with an API compatible to scala-logging (and slf4j)

## Skeletons

*   [workbench-example-app](https://github.com/lihaoyi/workbench-example-app): skeleton application using [Scala.js workbench](https://github.com/lihaoyi/scala-js-workbench) for live-reloading in the browser, together with a collection of sample applications developed using it
*   [Play! application with Scala.js](https://github.com/vmunier/play-with-scalajs-example)
*   [Node.js module with Scala.js](https://github.com/rockymadden/scala-node-example)
*   [SPA tutorial with Scala.js and React](https://github.com/ochrons/scalajs-spa-tutorial): Simple Single Page Application tutorial built upon scalajs-react, Spray and Bootstrap.
*   [scalaWUI](https://github.com/mathieuleclaire/scalaWUI): A ready to work Client/Server application built with  [scalatra](http://scalatra.org/), [scala.rx](https://github.com/lihaoyi/scala.rx), [autowire](https://github.com/lihaoyi/autowire). An example using the D3.js lib.

## Tools

*   [Scala.js workbench](https://github.com/lihaoyi/scala-js-workbench): sbt plugin for Scala.js projects for live-reloading in the browser ([example app](https://github.com/lihaoyi/workbench-example-app))

## Miscellaneous

* [Port of the Dart benchmark harness](https://github.com/sjrd/scalajs-benchmarks)

## Contribute

* [Scala.js on GitHub](https://github.com/scala-js/scala-js)

## <a name="built_with_scalajs"></a> Built with Scala.js

List of websites using Scala.js:

* April 2015
  - [Querki](http://www.querki.net/help/#Learning-Querki), a cloud-based system for small-scale data management
* March 2015
  - [Doctus](http://entelijan.net/art/doctus/), a library for the creation of visual art pieces, by [Wolfgang Wagner](http://entelijan.net/)
* September 2014
  - [Weather Information System](https://github.com/knoldus/ScalaJs_Weather_Report), by [Ayush Mishra](https://www.linkedin.com/pub/ayush-mishra/23/87b/a27), [Knoldus Software LLP](http://www.knoldus.com/home.knol)
* July 2014
  - [Play and Scala.js Showcase](https://github.com/hussachai/play-scalajs-showcase), by Hussachai Puripunpinyo
* May 2014
  - [Papa-Carlo Incremental Parser Demo](http://lakhin.com/projects/papa-carlo/demo/), by Eliah-Lakhin
* April 2014
  - [Ray-Tracer](http://lihaoyi.github.io/workbench-example-app/raytracer.html), a ray-tracer written in Scala.js by Li Haoyi
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


## Version History

- [0.6.3](/news/2015/05/12/announcing-scalajs-0.6.3/)
- [0.6.2](/news/2015/03/16/announcing-scalajs-0.6.2/)
- [0.6.1](/news/2015/03/03/announcing-scalajs-0.6.1/)
- [0.6.0](/news/2015/02/05/announcing-scalajs-0.6.0/)
- [0.6.0-RC2](/news/2015/01/23/announcing-scalajs-0.6.0-RC2/)
- [0.6.0-RC1](/news/2015/01/12/announcing-scalajs-0.6.0-RC1/)
- [0.6.0-M3](/news/2014/12/22/announcing-scalajs-0.6.0-M3/)
- [0.6.0-M2](/news/2014/12/05/announcing-scalajs-0.6.0-M2/)
- [0.6.0-M1](/news/2014/12/01/announcing-scalajs-0.6.0-M1/)
- [0.5.6](/news/2014/11/19/announcing-scalajs-0.5.6/)
- [0.5.5](/news/2014/09/18/announcing-scalajs-0.5.5/)
- [0.5.4](/news/2014/08/29/announcing-scalajs-0.5.4/)
- [0.5.3](/news/2014/07/30/announcing-scalajs-0.5.3/)
- [0.5.2](/news/2014/07/09/announcing-scalajs-0.5.2/)
- [0.5.1](/news/2014/06/30/announcing-scalajs-0.5.1/)
- [0.5.0](/news/2014/06/13/announcing-scalajs-0.5.0/)
- [0.4.4](https://groups.google.com/forum/#!searchin/scala-js/0.4.3/scala-js/ZVWU0NLxSI0/HUydhe56bA4J)
- [0.4.3](https://groups.google.com/forum/#!topic/scala-js/xnswQ7qHvjs)
- [0.4.2](https://groups.google.com/forum/#!topic/scala-js/apbxL1KHiTo)
- [0.4.1](https://groups.google.com/forum/#!topic/scala-js/urFh-U2K53U)
- [0.4.0](https://groups.google.com/forum/#!topic/scala-js/j9Ir4-_a1ls)
- [0.3](https://groups.google.com/forum/#!searchin/scala-js/0.3/scala-js/siSw-EsVy1w/6CzCE4WkCL0J)
- [0.2](https://groups.google.com/forum/#!searchin/scala-js/0.2/scala-js/ouSSRrBmrZE/Xx-pgAFrk7AJ)
- [0.1](http://www.scala-lang.org/news/2013/11/29/announcing-scala-js-v0.1.html)

## Hall of Fame

* [Bug in node.js/v8](http://github.com/joyent/node/issues/7528) discovered by Scala.js through Scala test suite

<a href="https://github.com/scala-js/scala-js-website"><img style="position: absolute; top: 0; right: 0; border: 0;" src="https://s3.amazonaws.com/github/ribbons/forkme_right_orange_ff7600.png" alt="Fork me on GitHub"></a>
