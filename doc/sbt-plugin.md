---
layout: page
title: Scala.js sbt Plugin
---
{% include JB/setup %}

Scala.js comes with an sbt plugin that facilitates compiling, running and testing with Scala.js. For a quick start, have a look at our [bootstrapping skeleton](https://github.com/sjrd/scala-js-example-app).

## Setup

Load the sbt plugin (`project/build.sbt`)

    addSbtPlugin("org.scala-lang.modules.scalajs" % "scalajs-sbt-plugin" % "0.5.0")

Add Scala.js settings (`build.sbt`):

    scalaJSSettings

There is also a list of settings that doesn't change the `run` and `test` tasks (`build.sbt`):

    scalaJSBuildSettings

Note that `scalaJSSettings` contains all these settings, so don't use both of them.

## Compiling, Running, Linking, Running, Optimizing, Running

To compile, simply use the `compile` task:

    sbt> compile

This will generate `.sjsir` and `.class` files for each class in your project (just like for Scala JVM). The `.class` files are used by the Scala.js compiler for symbol lookup during separate compilation. **Do not use these `.class` files to run your project on a JVM.** See the section below about cross-compilation.

The `.sjsir` files are a binary representation of (extended) JavaScript code which can be linked to actual JavaScript code as will be explained shortly.

You now can run your application already by using the `run` task:

    sbt> run

This will detect and run classes that extend `scala.scalajs.js.JSApp`, while optionally prompting the user to choose a class if multiple such classes exist. To run the `.sjsir` files, we invoke the Rhino JavaScript interpreter with a special scope that lazily reads and loads required `.sjsir` files on the fly (much like Java class loading). Note that by default, this environment doesn't have a DOM. If you need it set `requiresDOM := true` in your settings.

To produce a proper JavaScript file from your code, you need to call the linker:

    sbt> fastOptJS

This will perform a coarse dead-code elimination and write all remaining code to a single JavaScript file. You can now use this JavaScript file in your HTML-page or in whatever way you like. The resulting file in the target folder will have the suffix `-fastopt.js`.

If you want to run this code, you can tell sbt to run after the linking stage:

    sbt> fastOptStage::run

This will invoke an external JavaScript interpreter and pass the generated file to it. Depending on your `requiresDOM` setting, it will either invoke Node.js or Phantom.js. *You need to install these separately* and make them available on the execution path (i.e. as shell commands `node` and `phantomjs`).

Note that running in the `fastOptStage` is often faster than running just after compilation since the external virtual machines are much faster. We recommend you to operate in the `fastOptStage` in your development cycle.

To make the resulting JavaScript even smaller, the sbt plugin integrates the Google Closure Compiler to minimize code even further. You can optimize by issuing:

    sbt> fullOptJS

This will call the Google Closure Compiler on the result of the linking stage. Note that this can take a while and is therefore not recommended in the development cycle. The resulting file in the target folder will have the suffix `-opt.js`.

Equivalent to the `fastOptStage` you can run your JavaScript code after the `fullOptStage`:

    sbt> fullOptStage::run

The same stage commands can be applied to the command `test` (have a look at the [bootstrapping skeleton](https://github.com/sjrd/scala-js-example-app) for a testing example).

If you want the code which is used to run the main class to be written to a file, you can set `persistLauncher := true`. Note that this will require your main class to be either unique or explicitly set (`mainClass := Some(<name>)`). The resulting file in the target folder will have the suffix `-launcher.js`.

## Depending on Scala.js libraries

To be able to use a Scala library in Scala.js, it has to be separately compiled for Scala.js. You then can add it to your library dependencies as follows:

    libraryDependencies += "org.scala-lang.modules.scalajs" %%% "scalajs-dom" % "0.5"

Note the `%%%` (instead of the usual `%%`) which will add the current Scala.js version to the artifact name. This allows to

- Cross-publish libraries to different Scala.js versions
- Disambiguate Scala.js from Scala JVM libraries

Some Scala.js core libraries (such as the Scala.js library itself) do not need the `%%%` since their version number *is* the Scala.js version number itself.

## Depending on JavaScript libraries

Thanks to [WebJars](http://www.webjars.org/), you can easily fetch a JavaScript library like so:

    libraryDependencies += "org.webjars" % "jquery" % "1.10.2"

This will fetch the required JAR containing jQuery. However, it will not include it once you run your JavaScript code, since there is no class-loading process for JavaScript.

The Scala.js sbt plugin has `jsDependencies` for this purpose. You can write:

    jsDependencies += "org.webjars" % "jquery" % "1.10.2" / "jquery.js"

This will make your project depend on the respective WebJar and include a file named `jquery.js` in the said WebJar when your project is run or tested. We are trying to make the semantics of "include" to be as close as possible to writing:

    <script type="text/javascript" src="..."></script>

However, sometimes this doesn't work when running with Node.js. If this happens to you, change to Phantom.js (see below on how to do that).

All `jsDependencies` and associated metadata (e.g. for ordering) are persisted in a file (called `JS_DEPENDENCIES`) and shipped with the artifact your project publishes. For example, if you depend on the `jasmine-test-framework` package for Scala.js (a thin wrapper around Jasmine), you do not need to explicitly depend or include `jasmine.js`; this mechanism does it for you.

### Scoping to a Configuration

You may scope `jsDependencies` on a given configuration, just like for normal `libraryDependencies`:

    jsDependencies += "org.webjars" % "jquery" % "1.10.2" / "jquery.js" % "test"

### Dependency Ordering

Since JavaScript does not have a class loading mechanism, the order in which libraries are loaded may matter. If this is the case, you can specify a library's dependencies like so:

    jsDependencies += "org.webjars" % "jasmine" % "1.3.1" / "jasmine-html.js" dependsOn "jasmine.js"

Note that the dependee must be declared as explicit dependency elsewhere, but not necessarily in this project (for example in a project the current project depends on).

### Local JavaScript Files

If you need to include JavaScript files which are provided in the resources of your project, use:

    jsDependencies += ProvidedJS / "myJSLibrary.js"

This will look for `myJSLibrary.js` in the resources and include it. It is an error if it doesn't exist. You may use ordering and scoping if you need.

### Write a Dependency File

If you want all JavaScript dependencies to be concatenated to a single file (for easy inclusion into a HTML file for example), you can set:

    skip in packageJSDependencies := false

in your project settings. The resulting file in the target folder will have the suffix `-jsdeps.js`.

## JavaScript Environments

In order to decide how to run JavaScript code, the Scala.js sbt plugin uses the following two setting keys:

- `preLinkJSEnv` the JavaScript Environment (i.e. virtual machine) used to run unlinked `.sjsir` files (defaults to Rhino)
- `postLinkJSEnv` the JavaScript Environment used to run linked JavaScript (defaults to Node.js if DOM is not required, otherwise Phantom.js)

You may change these environments at your discretion. However, note that running Rhino on linked JavaScript and Node.js or Phantom.js on unlinked JavaScript is unlikely to work or at least slow.

For example, to switch to Phantom.js, you can set:

    postLinkJSEnv := new scala.scalajs.sbtplugin.env.phantomjs.PhantomJSEnv

We'd like to stress here again, that you need to separately install Node.js and Phantom.js if you would like to use these environments.

### Node.js on Ubuntu

On Ubuntu, the Node.js command from the [nodejs package](http://packages.ubuntu.com/utopic/nodejs) is called `nodejs` instead of `node` (when installed through the package manager). This will make the Node.js environment fail (since it simply calls `node`).

You have two options to solve this:

1. Install [nodejs-legacy](http://packages.ubuntu.com/utopic/nodejs-legacy) which will add an alias called `node`
2. Explicitly tell the Node.js environment the name of the command:

         postLinkJSEnv := new scala.scalajs.sbtplugin.env.nodejs.NodeJSEnv("nodejs")


## Cross-Building

Sometimes it is desirable to compile the same source code with Scala.js and Scala JVM. In order to do this, you need two different projects, one for Scala.js and one for Scala JVM and a folder with the shared source code. You then can tell sbt to use the shared source folder in addition to the normal source locations.

We give a simple example of how such a project, we call it `foo`, could look. You can find this project on [GitHub](https://github.com/scala-js/scalajs-cross-compile-example).

### Directory Structure

    <project root>
     +- foo-jvm
     |   +- src/main/scala
     +- foo-js
     |   +- src/main/scala
     +- foo-shared
         +- src/main/scala

In `foo-shared/src/main/scala` are the shared source files. In `foo-{js|jvm}/src/main/scala` are the source files specific to the respective platform (these folders are optional).

### sbt Build File

Starting from sbt 0.13, you can write a multi-project build in a `.sbt` file. This is an example how your `build.sbt` could look like:

    name := "Foo root project"

    version := "0.1"

    lazy val root = project.in(file(".")).aggregate()

    lazy val fooJS = project.in(file("foo-js")).settings(scalaJSSettings: _*).settings(
      name := "foo",
      unmanagedSourceDirectories in Compile += root.base / "foo-shared" / "src" / "main" / "scala"
    )

    lazy val fooJVM = project.in(file("foo-jvm")).settings(
      name := "foo",
      unmanagedSourceDirectories in Compile += root.base / "foo-shared" / "src" / "main" / "scala"
    )

You now have separate projects to compile towards Scala.js and Scala JVM. Note the same name given to both projects, this allows them to be published with corresponding artifact names:

- `foo_2.10-0.1-SNAPSHOT.jar`
- `foo_sjs0.5.0-RC2_2.10-0.1-SNAPSHOT.jar`

If you do not publish the artifacts, you may choose different names for the projects.
