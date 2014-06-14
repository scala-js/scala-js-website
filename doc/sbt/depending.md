---
layout: page
title: Depending on Libraries
---

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

However, sometimes this doesn't work when running with Node.js. If this happens to you, change to PhantomJS (see below on how to do that).

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
