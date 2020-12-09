---
layout: doc
title: Building
---

To compile, simply use the `compile` task:

    sbt> compile

This will generate `.sjsir` and `.class` files for each class in your project (just like for Scala JVM). The `.class` files are used by the Scala.js compiler for symbol lookup during separate compilation. **Do not use these `.class` files to run your project on a JVM.** See the section below about cross-compilation.

The `.sjsir` files are an internal representation which can be linked to actual JavaScript code as will be explained shortly.

## Actually *do* something

To produce JavaScript code, we need to either export something (e.g. a method or a class) or do something when the JavaScript code is loaded.
Otherwise, Scala.js will not produce any JavaScript code (because to do nothing, there is no need for any code).

To do something when your code is loaded, you need a top-level object with a `main` method (to export something, see [Export Scala.js APIs to JavaScript]({{ site.production_url }}/doc/interoperability/export-to-javascript.html)).

{% highlight scala %}
object Main {
  def main(args: Array[String]): Unit = {
    println("Hello world!")
  }
}
{% endhighlight %}

as well as the following sbt setting, which, to put it simply, turns your Scala.js project into an "application" rather than a "library":

{% highlight scala %}
scalaJSUseMainModuleInitializer := true
{% endhighlight %}

Just like in a JVM project, sbt will automatically detect the object with a `main(Array[String]): Unit` method, and use it as the main method of the application.

Note that this will require that there is a *unique* such object or that the one to use be explicitly set with `mainClass in Compile := Some(<name>)`.
If you explicitly set `mainClass`, note that it needs to be set on a per-configuration basis (i.e. the part `in Compile` is essential, otherwise the setting will be ignored). For further information see the Stack Overflow entry ['How to set mainClass in ScalaJS build.sbt?'](http://stackoverflow.com/questions/34965072/how-to-set-mainclass-in-scalajs-build-sbt) (specific to Scala.js) and the Stack Overflow entry ['How to set main class in build?'](http://stackoverflow.com/questions/6467423/how-to-set-main-class-in-build) (not specific to Scala.js).

## Produce JavaScript code

To produce JavaScript code from your Scala code, you need to call the linker:

    sbt> fastLinkJS

This will perform fast Scala.js-specific optimizations and write the resulting JavaScript code to a directory.
With the default options, it will write a single file `main.js`.
You can now use this JavaScript file in your HTML page or in whatever way you like.
The resulting directory in the target folder will have the suffix `-fastopt`.

Loading the `main.js` file produced by `fastLinkJS` will print `"Hello world!"`.

**Note for Scala.js 1.2.x and earlier:** in Scala.js 1.2.x and earlier, we used `fastOptJS` instead of `fastLinkJS`, which always produces a single file with the suffix `-fastopt.js` directly in the target directory.

## Running in the console

You can run a Scala.js application (that has `scalaJSUseMainModuleInitializer` set to `true`) by using the `run` task:

    sbt> run

This will run the `main.js` file right inside of your sbt console.
By default, the file is run with [Node.js](https://nodejs.org/), which you need to install separately.

There are alternative JavaScript interpreters that are available.
See [JavaScript environments](./js-environments.html) for more details.

## Disabling the optimizations

If, for some reason (for example, to make stepping through the code with a debugger more predictable), you want to disable the optimizations, you can do so with the following sbt setting:

{% highlight scala %}
scalaJSLinkerConfig ~= { _.withOptimizer(false) }
{% endhighlight %}

`scalaJSLinkerConfig` contains various other options controlling the Scala.js linker.
See [the Scaladoc of `StandardLinker.Config`]({{ site.production_url }}/api/scalajs-linker-interface/{{ site.versions.scalaJS }}/org/scalajs/linker/interface/StandardConfig.html) for details.

## Full-Optimize

To make the resulting JavaScript even smaller (and usually faster as well), the sbt plugin integrates the Google Closure Compiler under the so-called full-optimizations. You can use them by issuing:

    sbt> fullLinkJS

This will produce a `main.js` file that is fully optimized in another directory.
Note that this can take a while and is therefore not recommended in the development cycle.
The resulting directory in the target folder will have the suffix `-opt`.

You can run your code and tests in fullOpt stage with the following command:

    sbt> set scalaJSStage in Global := FullOptStage

**Note for Scala.js 1.2.x and earlier:** in Scala.js 1.2.x and earlier, we used `fullOptJS` instead of `fullLinkJS`, which always produces a single file with the suffix `-opt.js`.
`scalaJSStage` works the same way in Scala.js 1.2.x and in later versions.
