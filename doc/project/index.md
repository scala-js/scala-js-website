---
layout: doc
title: Scala.js project structure
---


Scala.js comes with an sbt plugin that facilitates compiling, running and testing with Scala.js. For a quick start,
have a look at our [basic tutorial](../tutorial/basic/).

Load the sbt plugin (`project/plugins.sbt`)

{% highlight scala %}
addSbtPlugin("org.scala-js" % "sbt-scalajs" % "{{ site.versions.scalaJS }}")
{% endhighlight %}

Enable the plugin on the sbt project (`build.sbt`):

{% highlight scala %}
lazy val root = project
  .in(file("."))
  .enablePlugins(ScalaJSPlugin)
  .settings(
    // for an application with a main method
    scalaJSUseMainModuleInitializer := true,
  )
{% endhighlight %}

If you are using a `Build.scala` definition, import the following:

{% highlight scala %}
import org.scalajs.sbtplugin.ScalaJSPlugin
import org.scalajs.sbtplugin.ScalaJSPlugin.autoImport._
{% endhighlight %}

Next we'll look into the [building process](building.html) in more detail.
