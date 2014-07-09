---
layout: page
title: Cross-Building
---

Sometimes it is desirable to compile the same source code with Scala.js and Scala JVM. In order to do this, you need two different projects, one for Scala.js and one for Scala JVM and a folder with the shared source code. You then can tell sbt to use the shared source folder in addition to the normal source locations.

We give a simple example of how such a project, we call it `foo`, could look. You can find this project on [GitHub](https://github.com/scala-js/scalajs-cross-compile-example).

## Directory Structure

    <project root>
     +- foo-jvm
     |   +- src/main/scala
     +- foo-js
     |   +- src/main/scala
     +- foo-shared
         +- src/main/scala

In `foo-shared/src/main/scala` are the shared source files. In `foo-{js|jvm}/src/main/scala` are the source files specific to the respective platform (these folders are optional).

## sbt Build File

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
- `foo_sjs0.5_2.10-0.1-SNAPSHOT.jar`

If you do not publish the artifacts, you may choose different names for the projects.

## Dependencies

If your cross compiled source depends on libraries, you will have to add the dependencies on the libraries separately for each project (using the `%%%` for the Scala.js project). For example, if your code uses [Scalatags](http://github.com/lihaoyi/scalatags), your project definitions look like this:

    lazy val fooJS = project.in(file("foo-js")).settings(scalaJSSettings: _*).settings(
      name := "foo",
      unmanagedSourceDirectories in Compile += root.base / "foo-shared" / "src" / "main" / "scala",
      libraryDependencies += "com.scalatags" %%% "scalatags" % "0.3.5"
    )

    lazy val fooJVM = project.in(file("foo-jvm")).settings(
      name := "foo",
      unmanagedSourceDirectories in Compile += root.base / "foo-shared" / "src" / "main" / "scala",
      libraryDependencies += "com.scalatags" %% "scalatags" % "0.3.5"
    )
