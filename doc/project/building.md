---
layout: doc
title: Building
---

To compile, simply use the `compile` task:

    sbt> compile

This will generate `.sjsir` and `.class` files for each class in your project (just like for Scala JVM). The `.class` files are used by the Scala.js compiler for symbol lookup during separate compilation. **Do not use these `.class` files to run your project on a JVM.** See the section below about cross-compilation.

The `.sjsir` files are an internal representation which can be linked to actual JavaScript code as will be explained shortly.

## Produce one JavaScript file

To produce a proper JavaScript file from your code, you need to call the linker:

    sbt> fastOptJS

This will perform fast Scala.js-specific optimizations and write the resulting code to a single JavaScript file. You can now use this JavaScript file in your HTML page or in whatever way you like. The resulting file in the target folder will have the suffix `-fastopt.js`.

## Actually *do* something

By default, Scala.js produces "libraries", that do not actually *do* anything when their `-fastopt.js` file is loaded.
To make it do something, you need a main `js.JSApp` object:

{% highlight scala %}
import scala.scalajs.js

object Main extends js.JSApp {
  def main(): Unit = {
    println("Hello world!")
  }
}
{% endhighlight %}

as well as the following sbt setting, which, to put it simply, turns your Scala.js project into an "application" rather than a "library":

{% highlight scala %}
scalaJSUseMainModuleInitializer := true
{% endhighlight %}

sbt will automatically detect the object that extends [`js.JSApp`]({{ site.production_url }}/api/scalajs-library/latest/#scala.scalajs.js.JSApp) (which must be unique), and use it as the main method of the application.
Now, the .js file produced by `fastOptJS` will print `"Hello world!"`.

Note that this will require that there is a *unique* object that extends `js.JSApp` or that the one to use be explicitly set with `mainClass in Compile := Some(<name>)`.
If you explicitly set `mainClass`, note that it needs to be set on a per-configuration basis (i.e. the part `in Compile` is essential, otherwise the setting will be ignored). For further information see the Stack Overflow entry ['How to set mainClass in ScalaJS build.sbt?'](http://stackoverflow.com/questions/34965072/how-to-set-mainclass-in-scalajs-build-sbt) (specific to Scala.js) and the Stack Overflow entry ['How to set main class in build?'](http://stackoverflow.com/questions/6467423/how-to-set-main-class-in-build) (not specific to Scala.js).

## Running in the console

You can run a Scala.js application (that has `scalaJSUseMainModuleInitializer` set to `true`) by using the `run` task:

    sbt> run

This will run the `-fastopt.js` file right inside of your sbt console.
By default, the file is run with [Node.js](http://nodejs.org/), which you need to install separately.
If your application or one of its libraries requires a DOM (which can be specified with `jsDependencies += RuntimeDOM`), you will also need to install [`jsdom`](https://github.com/tmpvar/jsdom) with `npm install jsdom`.

There are alternative JavaScript interpreters that are available.
See [JavaScript environments](./js-environments.html) for more details.

### Deprecated: Run without `scalaJSUseMainModuleInitializer`

It is still possible to `run` a Scala.js application that does not have `scalaJSUseMainModuleInitializer := true`.
However, this is not recommended anymore.

## Disabling the optimizations

If, for some reason (for example, to make stepping through the code with a debugger more predictable), you want to disable the optimizations, you can do so with the following sbt setting:

{% highlight scala %}
scalaJSOptimizerOptions ~= { _.withDisableOptimizer(true) }
{% endhighlight %}

`scalaJSOptimizerOptions` contains various other options controlling the optimizer.
See [the ScalaDoc]({{ site.production_url }}/api/sbt-scalajs/{{ site.versions.scalaJS }}/#org.scalajs.sbtplugin.OptimizerOptions)
for details.

## Full-Optimize

To make the resulting JavaScript even smaller (and usually faster as well), the sbt plugin integrates the Google Closure Compiler under the so-called full-optimizations. You can use them by issuing:

    sbt> fullOptJS

This will produce another single JavaScript file that is fully optimized.
Note that this can take a while and is therefore not recommended in the development cycle.
The resulting file in the target folder will have the suffix `-opt.js`.

You can run your code and tests in fullOpt stage with the following command:

    sbt> set scalaJSStage in Global := FullOptStage

## Deprecated: Writing Launcher Code

For applications that do not use `scalaJSUseMainModuleInitializer := true`, it is possible to generate a small .js file that calls the `main` method, known as a "launcher" file.
This is done with the following sbt setting:

{% highlight scala %}
persistLauncher := true
{% endhighlight %}

The resulting file in the target folder will have the suffix `-launcher.js`.

This feature is deprecated: applications should migrate to using `scalaJSUseMainModuleInitializer`.
