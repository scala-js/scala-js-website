---
layout: page
title: Scala.js sbt Setup
---

Load the sbt plugin (`project/plugins.sbt`)

    addSbtPlugin("org.scala-lang.modules.scalajs" % "scalajs-sbt-plugin" % "{{ site.scalaJSVersion }}")

Add Scala.js settings (`build.sbt`):

    scalaJSSettings

If you are using a `Build.scala` definition, import the following:

    import scala.scalajs.sbtplugin.ScalaJSPlugin._

Either way, you might want to add the following import for some of the keys
specific to Scala.js to be available in the scope of your build:

    import ScalaJSKeys._
