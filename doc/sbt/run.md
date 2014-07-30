---
layout: page
title: Compiling, Running, Linking, Optimizing
---

To compile, simply use the `compile` task:

    sbt> compile

This will generate `.sjsir` and `.class` files for each class in your project (just like for Scala JVM). The `.class` files are used by the Scala.js compiler for symbol lookup during separate compilation. **Do not use these `.class` files to run your project on a JVM.** See the section below about cross-compilation.

The `.sjsir` files are a binary representation of (extended) JavaScript code which can be linked to actual JavaScript code as will be explained shortly.

You now can run your application already by using the `run` task:

    sbt> run

This will detect and run classes that extend `scala.scalajs.js.JSApp`, while optionally prompting the user to choose a class if multiple such classes exist (fails with multiple classes if `ScalaJSKeys.persistLauncher := true`, see section below for details).

To run the `.sjsir` files, we invoke the Rhino JavaScript interpreter with a special scope that lazily reads and loads required `.sjsir` files on the fly (much like Java class loading). Note that by default, this environment doesn't have a DOM. If you need it set `ScalaJSKeys.requiresDOM := true` in your settings.

## Fast-Optimize

To produce a proper JavaScript file from your code, you need to call the linker:

    sbt> fastOptJS

This will perform fast Scala.js-specific optimizations and write the resulting code to a single JavaScript file. You can now use this JavaScript file in your HTML page or in whatever way you like. The resulting file in the target folder will have the suffix `-fastopt.js`.

If you want to run this code, you can tell sbt to run after the linking stage:

    sbt> fastOptStage::run

This will invoke an external JavaScript interpreter and pass the generated file to it. Depending on your `requiresDOM` setting, it will either invoke Node.js or PhantomJS. *You need to install these separately* and make them available on the execution path (i.e. as shell commands `node` and `phantomjs`).

Note that running in the `fastOptStage` is often faster than running just after compilation because

a. As their name implies, fast optimizations are *really* fast (starting from the second run in an sbt session),
b. External virtual machines are much faster than Rhino, and
c. The code is, well, optimized, so faster itself.

We recommend you to operate in the `fastOptStage` in your development cycle.

#### Disabling the optimizations

If, for some reason, you want to disable the optimizations of the fast-optimizer (while still enjoying its other advantages: one small .js file, running an external VM), you can do so with the following sbt setting:

{% highlight scala %}
ScalaJSKeys.inliningMode := scala.scalajs.sbtplugin.InliningMode.Off
{% endhighlight %}

Alternatively, you can force the optimizer to run in batch mode (non incremental) on every run with the following setting:

{% highlight scala %}
ScalaJSKeys.inliningMode := scala.scalajs.sbtplugin.InliningMode.Batch
{% endhighlight %}

## Full-Optimize

To make the resulting JavaScript even smaller (and usually faster as well), the sbt plugin integrates the Google Closure Compiler under the so-called full-optimizations. You can use them by issuing:

    sbt> fullOptJS

This will call the Google Closure Compiler on the result of the fast-optimizations stage. Note that this can take a while and is therefore not recommended in the development cycle. The resulting file in the target folder will have the suffix `-opt.js`.

Equivalent to the `fastOptStage` you can run your JavaScript code after the `fullOptStage`:

    sbt> fullOptStage::run

The same stage commands can be applied to the command `test` (have a look at the [bootstrapping skeleton](https://github.com/sjrd/scala-js-example-app) for a testing example).

## Writing Launcher Code

If you want the code which is used to run the main class to be written to a file, you can set `ScalaJSKeys.persistLauncher := true`. Note that this will require your main class to be either unique or explicitly set (`mainClass := Some(<name>)`). The resulting file in the target folder will have the suffix `-launcher.js`.
