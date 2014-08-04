---
layout: page
title: Scala.js
tagline: A Scala to JavaScript compiler
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
and follow the instructions in its readme or [try it out in the browser](http://www.scala-js-fiddle.com/).

We also have a [standalone distribution](./downloads.html) that doesn't require SBT.

<p><b><span style="color: red">Important notice!</span></b> Scala.js is still <i>experimental</i>!
Although this is a project of LAMP/EPFL for which we will continue to provide
best-effort improvements and bug fixes, it is <i>not</i> supported by Typesafe,
and not part of any of their support contracts. You have been warned!</p>


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

## Resources

*   [Documentation](./doc/)
*   [Official mailing list](https://groups.google.com/forum/?fromgroups#!forum/scala-js)
*   [Scala.js tag on Stackoverflow](http://stackoverflow.com/questions/tagged/scala.js). Please help building it up by asking questions.

Presentations:

*   [Scala.js at Scaladays 2014](http://www.parleys.com/play/53a7d2cbe4b0543940d9e555), by Sébastien Doeraene
*   [Live Coding Scala.js at SF Scala 2014](http://vimeo.com/87845442) by Li Haoyi
*   [Live-coding with Scala.js at Scala eXchange 2013](http://skillsmatter.com/podcast/scala/scala-js-write-in-scala-for-the-browser-4567)
*   [Presentation of Scala.js at Scala Days 2013](http://www.parleys.com/play/51c380bfe4b0ed8770356866) (older and somewhat obsolete)

### Libraries

This is a collection of libraries that work with Scala.js. Some of them, like `scala-js-dom` and `scala-js-jquery`, are specific to Javascript and don't make sense on the JVM. Some others are such as `scala-async` are pure-macro projects, and thus work with Scala.js out of the box. Most of them, though, started off as Scala-JVM projects and were ported over, and thus have separate artifacts to run on each platforms. The SBT snippets given are for the version that runs on Scala.js.

####[scala-js-dom](https://github.com/scala-js/scala-js-dom)
{% highlight scala %}
"org.scala-lang.modules.scalajs" %%% "scalajs-dom" % "0.6"
{% endhighlight %}
Static types for the DOM API, by Li Haoyi

####[scala-js-jquery](https://github.com/scala-js/scala-js-jquery)
{% highlight scala %}
"org.scala-lang.modules.scalajs" %%% "scalajs-jquery" % "0.6"
{% endhighlight %}
Static types for jQuery, by Sébastien Doeraene

####[scala-js-react](https://github.com/japgolly/scalajs-react)
{% highlight scala %}
// Minimal usage
libraryDependencies += "com.github.japgolly.scalajs-react" %%% "core" % "0.4.0"

// Test support including ReactTestUtils
libraryDependencies += "com.github.japgolly.scalajs-react" %%% "test" % "0.4.0" % "test"

// Scalaz support
libraryDependencies += "com.github.japgolly.scalajs-react" %%% "ext-scalaz70" % "0.4.0" // or
libraryDependencies += "com.github.japgolly.scalajs-react" %%% "ext-scalaz71" % "0.4.0"
{% endhighlight %}
Lifts Facebook's React library into Scala.js and endeavours to make it as type-safe and Scala-compatible as possible, by David Barri

####[scala-js-binding](https://github.com/antonkulaga/scala-js-binding)
{% highlight scala %}
addSbtPlugin("me.lessis" % "bintray-sbt" % "0.1") // project/build.sbt
resolvers += bintray.Opts.resolver.repo("denigma", "denigma-releases")
libraryDependencies += "org.denigma" %%% "binding" % "0.4.4"
{% endhighlight %}

A ScalaJS html binding library, by Anton Kulaga

####[Scalatags](https://github.com/lihaoyi/scalatags)
{% highlight scala %}
"com.scalatags" %%% "scalatags" % "0.3.8"
{% endhighlight %}
A HTML templating library/DSL that works on both Scala-JVM and Scala-JS, by Li Haoyi

####[Scala.Rx](https://github.com/lihaoyi/scala.rx)
{% highlight scala %}
"com.scalarx" %%% "scalarx" % "0.2.5"
{% endhighlight %}
A change-propagation/FRP library that runs on both Scala-JVM and Scala-JS, by Li Haoyi

####[uTest](https://github.com/lihaoyi/utest#%C2%B5test-011)
{% highlight scala %}
addSbtPlugin("com.lihaoyi" % "utest-js-plugin" % "0.1.8") // project/build.sbt
"com.lihaoyi" %%% "utest" % "0.1.8"
{% endhighlight %}

A tiny, portable unit testing library that lets you run the same tests on both Scala-JVM and Scala-JS, by Li Haoyi

####[uPickle](https://github.com/lihaoyi/upickle)
{% highlight scala %}
"com.lihaoyi" %%% "upickle" % "0.2.0"
{% endhighlight %}
Statically-typed pickling (via typeclasses/macros) for both Scala-JVM and Scala-JS, by Li Haoyi

####[autowire](https://github.com/lihaoyi/autowire)
{% highlight scala %}
"com.lihaoyi" %%% "autowire" % "0.1.2"
{% endhighlight %}
Statically-typed Ajax calls and RPCs for both Scala-JVM and Scala-JS, by Li Haoyi

####[Scala.js Pickling](https://github.com/scala-js/scala-js-pickling)
{% highlight scala %}
"org.scalajs" %%% "scalajs-pickling" % "0.3"
{% endhighlight %}
A cross-compiling pickling (aka serialization) library for Scala.js and Scala
with a common JSON-based format, by Sébastien Doeraene

####[Monifu](https://github.com/alexandru/monifu)

Reactive extensions (Rx) with back-pressure, atomic references and other multi-threading primitives cross-compiled to Scala.js, by Alexandru Nedelcu

####[Scalaz](https://github.com/japgolly/scalaz)
{% highlight scala %}
"com.github.japgolly.fork.scalaz" %%% "scalaz-core" % "7.1.0"
{% endhighlight %}
Port of [Scalaz](https://github.com/scalaz/scalaz) to Scala.js, maintained by David Barri

####[Monocle](https://github.com/japgolly/Monocle)
{% highlight scala %}
"com.github.japgolly.fork.monocle" %%% "monocle-core" % "0.5.0"
{% endhighlight %}
Port of [Monocle](https://github.com/julien-truffaut/Monocle) to Scala.js, maintained by David Barri
####[Shapeless](https://groups.google.com/forum/#!searchin/scala-js/shapeless/scala-js/5Sf2up0z3PU/9F9SYB0qHEcJ)
{% highlight scala %}
resolvers += "bintray-alexander_myltsev" at "http://dl.bintray.com/content/alexander-myltsev/maven"
libraryDependencies += "name.myltsev" %% "parboiled_sjs0.5" % "2.0.0"
{% endhighlight %}

Port of [Shapeless](https://github.com/milessabin/shapeless) to Scala.js, maintained by Alexander Myltsev

####[Scala-Async](https://github.com/scala/async)

{% highlight scala %}
"org.scala-lang.modules" %% "scala-async" % "0.9.1"
{% endhighlight %}

Scala-Async is a pure-macro project without any runtime dependencies. Thus it works with Scala.js out of the box, without needing to be specially compiled for it.


####Scalaxy [Loops](https://github.com/ochafik/Scalaxy/tree/master/Loops) and [Streams](https://github.com/ochafik/Scalaxy/tree/master/Streams)

Another pure-macro project, Scalaxy loops and streams work great with Scala.js without needing to be specially compiled for it.

### Skeletons

####[workbench-example-app](https://github.com/lihaoyi/workbench-example-app)

A skeleton application using [Scala.js workbench](https://github.com/lihaoyi/scala-js-workbench) for live-reloading in the browser, together with a collection of sample applications developed using it

####[Play! application with Scala.js](https://github.com/vmunier/play-with-scalajs-example)

by Vincent Munier

####[Node.js module with Scala.js](https://github.com/rockymadden/scala-node-example)

by Rocky Madden

### Tools

####[Scala.js workbench](https://github.com/lihaoyi/scala-js-workbench)

A sbt plugin for Scala.js projects for live-reloading in the browser ([example app](https://github.com/lihaoyi/workbench-example-app)), by Li Haoyi

####[Scala.js Resource](https://github.com/lihaoyi/scala-js-resource)

A sbt plugin for bundling of binary files so they can be accessed from the browser, by Li Haoyi

### Miscellaneous

* [Port of the Dart benchmark harness](https://github.com/jonas/scala-js-benchmarks)
  by Jonas Fonseca

## Contribute

* [Scala.js on GitHub](https://github.com/scala-js/scala-js)

Want to contribute to Scala.js? Check out the
[list of contributing opportunities](./contribute/).

## <a name="built_with_scalajs"></a> Built with Scala.js

List of websites using Scala.js:

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

