---
layout: doc
title: Dependencies
---


## Depending on Scala.js libraries

To be able to use a Scala library in Scala.js, it has to be separately compiled for Scala.js. You then can add it to your library dependencies as follows:

{% highlight scala %}
libraryDependencies += "org.scala-js" %%% "scalajs-dom" % "{{ site.versions.scalaJSDOM }}"
{% endhighlight %}

Note the `%%%` (instead of the usual `%%`) which will add the current Scala.js version to the artifact name. This allows to

- Cross-publish libraries to different Scala.js versions
- Disambiguate Scala.js artifacts from their JVM counterparts

Some Scala.js core libraries (such as the Scala.js library itself) do not need the `%%%` since their version number *is* the Scala.js version number itself.

Note that you can also use `%%%` in a Scala/JVM project, in which case it will be the same as `%%`. This allows you to use the same `libraryDependencies` settings when cross compiling Scala/JVM and Scala.js.
