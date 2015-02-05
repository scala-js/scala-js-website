---
layout: page
title: Scala.js sbt Setup
---

Load the sbt plugin (`project/plugins.sbt`)

{% highlight scala %}
addSbtPlugin("org.scala-js" % "sbt-scalajs" % "{{ site.scalaJSVersion }}")
{% endhighlight %}

Enable the plugin on the sbt project (`build.sbt`):

{% highlight scala %}
lazy val root = project.
  enablePlugins(ScalaJSPlugin)
{% endhighlight %}

If you are using a `Build.scala` definition, import the following:

{% highlight scala %}
import org.scalajs.sbtplugin.ScalaJSPlugin
import org.scalajs.sbtplugin.ScalaJSPlugin.autoImport._
{% endhighlight %}
