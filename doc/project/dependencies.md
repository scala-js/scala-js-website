---
layout: doc
title: Dependencies
---


## Depending on Scala.js libraries

To be able to use a Scala library in Scala.js, it has to be separately compiled for Scala.js. You then can add it to your library dependencies as follows:

{% highlight scala %}
libraryDependencies += groupID %%% artifactID % revision
{% endhighlight %}

Note the `%%%` (instead of the usual `%%`) which will add the current Scala.js version to the artifact name. This allows to

- Cross-publish libraries to different Scala.js versions
- Disambiguate Scala.js artifacts from their JVM counterparts

Some Scala.js core libraries (such as the Scala.js library itself) do not need the `%%%` since their version number *is* the Scala.js version number itself.

Note that you can also use `%%%` in a Scala/JVM project, in which case it will be the same as `%%`. This allows you to use the same `libraryDependencies` settings when cross compiling Scala/JVM and Scala.js.

## Depending on libraries from another major version of scala

If you are using Scala 3 on your project, you want to use a library that is compiled Scala 2, you can by adding `.cross(CrossVersion.for3Use2_13)`, this tells the compiler to look for a library compiled with `Scala 2.13`.

Imagine that you want to use the revision `1.1.0` from the Scala.js DOM library. On the [scalajs-dom library's repository](https://mvnrepository.com/artifact/org.scala-js/scalajs-dom), we can see that revision `1.1.0` is not compiled for Scala 3 but we can still use it on a Scala 3 project in the following way:

{% highlight scala %}
libraryDependencies += ("org.scala-js" %%% "scalajs-dom" % "1.1.0")
  .cross(CrossVersion.for3Use2_13)
{% endhighlight %}
