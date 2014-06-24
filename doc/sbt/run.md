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

This will detect and run classes that extend `scala.scalajs.js.JSApp`, while optionally prompting the user to choose a class if multiple such classes exist (fails with multiple classes if `persistLauncher := true`, see section below for details).

To run the `.sjsir` files, we invoke the Rhino JavaScript interpreter with a special scope that lazily reads and loads required `.sjsir` files on the fly (much like Java class loading). Note that by default, this environment doesn't have a DOM. If you need it set `requiresDOM := true` in your settings.

## Fast-Optimize

To produce a proper JavaScript file from your code, you need to call the linker:

    sbt> fastOptJS

This will perform a coarse dead-code elimination and write all remaining code to a single JavaScript file. You can now use this JavaScript file in your HTML page or in whatever way you like. The resulting file in the target folder will have the suffix `-fastopt.js`.

If you want to run this code, you can tell sbt to run after the linking stage:

    sbt> fastOptStage::run

This will invoke an external JavaScript interpreter and pass the generated file to it. Depending on your `requiresDOM` setting, it will either invoke Node.js or PhantomJS. *You need to install these separately* and make them available on the execution path (i.e. as shell commands `node` and `phantomjs`).

Note that running in the `fastOptStage` is often faster than running just after compilation since the external virtual machines are much faster. We recommend you to operate in the `fastOptStage` in your development cycle.

## Full-Optimize

To make the resulting JavaScript even smaller, the sbt plugin integrates the Google Closure Compiler to minimize code even further. You can optimize by issuing:

    sbt> fullOptJS

This will call the Google Closure Compiler on the result of the linking stage. Note that this can take a while and is therefore not recommended in the development cycle. The resulting file in the target folder will have the suffix `-opt.js`.

Equivalent to the `fastOptStage` you can run your JavaScript code after the `fullOptStage`:

    sbt> fullOptStage::run

The same stage commands can be applied to the command `test` (have a look at the [bootstrapping skeleton](https://github.com/sjrd/scala-js-example-app) for a testing example).

## Writing Launcher Code

If you want the code which is used to run the main class to be written to a file, you can set `persistLauncher := true`. Note that this will require your main class to be either unique or explicitly set (`mainClass := Some(<name>)`). The resulting file in the target folder will have the suffix `-launcher.js`.
