---
layout: doc
title: Building
---

To compile, simply use the `compile` task:

    sbt> compile

This will generate `.sjsir` and `.class` files for each class in your project (just like for Scala JVM). The `.class` files are used by the Scala.js compiler for symbol lookup during separate compilation. **Do not use these `.class` files to run your project on a JVM.** See the section below about cross-compilation.

The `.sjsir` files are a binary representation of (extended) JavaScript code which can be linked to actual JavaScript code as will be explained shortly.

You now can run your application already by using the `run` task:

    sbt> run

This will detect and run classes that extend
[`js.JSApp`]({{ site.production_url }}/api/scalajs-library/{{ site.versions.scalaJS }}/#scala.scalajs.js.JSApp), while optionally prompting the user to choose a class if multiple such classes exist (fails with multiple classes if `persistLauncher := true`, see section below for details).

By default, to run the `.sjsir` files, we invoke the Rhino JavaScript interpreter with a special scope that lazily reads and loads required `.sjsir` files on the fly (much like Java class loading).
Note that by default, this environment doesn't have a DOM.
If you need it set `jsDependencies += RuntimeDOM` in your settings.

## Running with Node.js or PhantomJS

Since Rhino is very slow and limited, we recommend to use [Node.js](http://nodejs.org/) or [PhantomJS](http://phantomjs.org/) instead of Rhino.
You can disable Rhino with the following sbt setting:

    scalaJSUseRhino in Global := false

which you can put in your `build.sbt`, or in a separate `.sbt` file, e.g.,
`local.sbt`, which is not checked in your version control.

If `RuntimeDOM` is required, `run` (and `test`) will use PhantomJS.
Otherwise, it will use Node.js.
*You need to install these separately* and make them available on the execution path (i.e. as shell commands `node` and `phantomjs`).

The section on [JavaScript environments](./js-environments.html) explains more on the topic, including finer-grained configuration.

## Produce one JavaScript file

To produce a proper JavaScript file from your code, you need to call the linker:

    sbt> fastOptJS

This will perform fast Scala.js-specific optimizations and write the resulting code to a single JavaScript file. You can now use this JavaScript file in your HTML page or in whatever way you like. The resulting file in the target folder will have the suffix `-fastopt.js`.

### Disabling the optimizations

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

## Writing Launcher Code

If you want the code which is used to run the main class to be written to a file, you can set `persistLauncher := true`.
Note that this will require your main class to be either unique or explicitly set (`mainClass in Compile := Some(<name>)`).
If you explicitly set `mainClass`, note that it needs to be set on a per-configuration basis (i.e. the part `in Compile` is essential, otherwise the setting will be ignored). For further information see the Stack Overflow entry ['How to set mainClass in ScalaJS build.sbt?'](http://stackoverflow.com/questions/34965072/how-to-set-mainclass-in-scalajs-build-sbt) (specific to Scala.js) and the Stack Overflow entry ['How to set main class in build?'](http://stackoverflow.com/questions/6467423/how-to-set-main-class-in-build) (not specific to Scala.js).

The resulting file in the target folder will have the suffix `-launcher.js`.
