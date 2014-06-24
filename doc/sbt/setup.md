---
layout: page
title: Scala.js sbt Setup
---

Load the sbt plugin (`project/plugins.sbt`)

    addSbtPlugin("org.scala-lang.modules.scalajs" % "scalajs-sbt-plugin" % "0.5.0")

Add Scala.js settings (`build.sbt`):

    scalaJSSettings

There is also a list of settings that doesn't change the `run` and `test` tasks (`build.sbt`):

    scalaJSBuildSettings

Note that `scalaJSSettings` contains all these settings, so don't use both of them.
