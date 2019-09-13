---
layout: doc
title: Linking Errors
---

When linking a Scala.js application, either directly through `fastOptJS`/`fullOptJS` or indirectly through `run` or `test`, Scala.js can sometimes report *linking errors*.
They look like the following:

```
[info] Fast optimizing .../helloworld/target/scala-2.12/helloworld-fastopt.js
[error] Referring to non-existent method scala.concurrent.impl.Promise$CompletionLatch.releaseShared(scala.Int)scala.Boolean
[error]   called from scala.concurrent.impl.Promise$CompletionLatch.apply(scala.util.Try)scala.Unit
[error]   called from scala.concurrent.impl.Promise$CompletionLatch.apply(java.lang.Object)java.lang.Object
[error] ...
[error] There were linking errors
[error] (helloworld/compile:fastOptJS) There were linking errors
[error] Total time: 2 s, completed Sep 13, 2019 1:30:39 PM
```

This means that, as Scala.js was analyzing the program for all classes and methods reachable from the main method (or from the tests), if found a call to a method that does not exist, or a `new` for a class that does not exist, etc.

Linking errors can have several root causes, which we detail here.
The appropriate fix will depend on what the root cause is.

* [Depending on a JVM library instead of a JS library](#depending-on-a-jvm-library-instead-of-a-js-library) (`%%%` vs `%%`)
* [Using blocking APIs (e.g., `Await.result`)](#using-blocking-apis-eg-awaitresult)
* [Using unsupported JDK libraries (possibly transitively)](#using-unsupported-jdk-libraries-possibly-transitively)
* [Incremental compilation gone wrong](#incremental-compilation-gone-wrong)
* [Binary incompatibilities on the classpath](#binary-incompatibilities-on-the-classpath)


## Depending on a JVM library instead of a JS library

A common cause for linking errors is to use `%%` instead of `%%%` when depending on another Scala.js library.
Having the JVM version of a library on the classpath will allow *compilation* to succeed, but linking will fail.
For example, with the following setting:

```scala
libraryDependencies += "io.suzaku" %% "boopickle" % "1.3.1"
```

and the following code:

```scala
import boopickle.Default._

val data = Seq("Hello", "World!")
val buf = Pickle.intoBytes(data)
```

compilation will succeed but linking will fail with:

```
[error] Referring to non-existent class boopickle.Default$
[error]   called from helloworld.HelloWorld$.main()scala.Unit
[error]   called from core module module initializers
[error] involving instantiated classes:
[error]   helloworld.HelloWorld$
[error] Referring to non-existent class boopickle.PickleState$
[error]   called from helloworld.HelloWorld$.main()scala.Unit
[error]   called from core module module initializers
[error] involving instantiated classes:
[error]   helloworld.HelloWorld$
[error] Referring to non-existent method boopickle.PickleState$.pickleStateSpeed()boopickle.PickleState
[error]   called from helloworld.HelloWorld$.main()scala.Unit
[error]   called from core module module initializers
[error] involving instantiated classes:
[error]   helloworld.HelloWorld$
[error] Referring to non-existent method boopickle.Default$.stringPickler()boopickle.Pickler
[error]   called from helloworld.HelloWorld$.main()scala.Unit
[error]   called from core module module initializers
[error] involving instantiated classes:
[error]   helloworld.HelloWorld$
[error] Referring to non-existent method boopickle.Default$.Pickle()boopickle.PickleImpl$
[error]   called from helloworld.HelloWorld$.main()scala.Unit
[error]   called from core module module initializers
[error] involving instantiated classes:
[error]   helloworld.HelloWorld$
[error] Referring to non-existent method boopickle.Default$.iterablePickler(boopickle.Pickler,scala.collection.generic.CanBuildFrom)boopickle.Pickler
[error]   called from helloworld.HelloWorld$.main()scala.Unit
[error]   called from core module module initializers
[error] involving instantiated classes:
[error]   helloworld.HelloWorld$
[error] There were linking errors
```

### Hint to recognize this cause

If the `Referring to non-existent` lines mention a library that you depend on, and the first corresponding `called from` lines mention your code, it is very likely that an erroneous `%%` is the cause.

### Solution

Use `%%%` instead of `%%` when depending on other Scala.js librarys:

```scala
libraryDependencies += "io.suzaku" %%% "boopickle" % "1.3.1"
```

```
[info] Fast optimizing .../helloworld/target/scala-2.12/helloworld-fastopt.js
[success] Total time: 3 s, completed Sep 13, 2019 1:44:25 PM
```


## Using blocking APIs (e.g., `Await.result`)

The JavaScript platform does not support blocking at all.
Consequently, trying to use blocking APIs such `Await.result` is not supported, and will result in a linking error.
A typical example was shown in the introduction, and is reproducible with the following code:

```scala
import scala.concurrent.{Await, Future}
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration.Duration

val f = Future { 5 }
println(Await.result(f, Duration.Inf))
```

which yields

```
[error] Referring to non-existent method scala.concurrent.impl.Promise$CompletionLatch.releaseShared(scala.Int)scala.Boolean
[error]   called from scala.concurrent.impl.Promise$CompletionLatch.apply(scala.util.Try)scala.Unit
[error]   called from scala.concurrent.impl.Promise$CompletionLatch.apply(java.lang.Object)java.lang.Object
[error]   called from scala.util.Success.$$anonfun$map$1(scala.Function1)java.lang.Object
[error]   called from scala.util.Success.map(scala.Function1)scala.util.Try
[error]   called from scala.concurrent.Future.$$anonfun$map$1(scala.Function1,scala.util.Try)scala.util.Try
[error]   called from scala.concurrent.impl.Promise$DefaultPromise.$$anonfun$map$1(scala.Function1,scala.util.Try)scala.util.Try
[error]   called from scala.concurrent.Future.map(scala.Function1,scala.concurrent.ExecutionContext)scala.concurrent.Future
[error]   called from scala.concurrent.impl.Promise$KeptPromise$Successful.map(scala.Function1,scala.concurrent.ExecutionContext)scala.concurrent.Future
[error]   called from scala.concurrent.Future$.apply(scala.Function0,scala.concurrent.ExecutionContext)scala.concurrent.Future
[error]   called from helloworld.HelloWorld$.main()scala.Unit
[error]   called from core module module initializers
```

and other errors.

### Hint to recognize this cause

If the `Referring to non-existent` line mentions `CompletionLatch`, it is probably related to trying to block on a `Future`.

### Solution

Always use asynchronous combinators, such as `map`, `filter`, `flatMap`, `foreach`, and/or for comprehensions, when using `Future`.
Do not use `scala.concurrent.Await`.


## Using unsupported JDK libraries (possibly transitively)

Scala.js reimplements parts of the JDK libraries, but not everything is supported.
For example, the following code

```scala
println(new java.io.File("foo.txt").exists())
```

which directly uses `java.io.File`, results in

```
[error] Referring to non-existent class java.io.File
[error]   called from helloworld.HelloWorld$.main()scala.Unit
[error]   called from core module module initializers
[error] involving instantiated classes:
[error]   helloworld.HelloWorld$
[error] Referring to non-existent method java.io.File.exists()scala.Boolean
[error]   called from helloworld.HelloWorld$.main()scala.Unit
[error]   called from core module module initializers
[error] involving instantiated classes:
[error]   helloworld.HelloWorld$
[error] Referring to non-existent method java.io.File.<init>(java.lang.String)
[error]   called from helloworld.HelloWorld$.main()scala.Unit
[error]   called from core module module initializers
[error] involving instantiated classes:
[error]   helloworld.HelloWorld$
[error] There were linking errors
```

The following code indirectly uses `java.io.File` through `scala.io`:

```scala
val src = scala.io.Source.fromFile("foo.txt", "UTF8")
```

yields

```
[error] Referring to non-existent class java.io.File
[error]   called from scala.io.Source$.fromFile(java.lang.String,scala.io.Codec)scala.io.BufferedSource
[error]   called from scala.io.Source$.fromFile(java.lang.String,java.lang.String)scala.io.BufferedSource
[error]   called from helloworld.HelloWorld$.main()scala.Unit
[error]   called from core module module initializers
[error]   ...
[error] There were linking errors
```

### Hint to recognize this cause

If the `Referring to non-existent` line mentions a class from the `java.*` packages, you are probably trying to use an unsupported API.

### Solution

Some areas of the JDK libraries are not provided by the core distribution, but are provided by third-party libraries.
For example, the `java.util.Locale` API is provided by [scala-java-locales](https://github.com/cquiroz/scala-java-locales).
In that case, adding the relevant dependency can solve the problem:

```scala
libraryDependencies += "io.github.cquiroz" %%% "scala-java-locales" % "0.5.2-cldr31"
```

You can find a list of JDK extensions in [the Scala libraries list](../../libraries/libs.html).

If the API you want to use is not provided by any third party (e.g., `java.io.File`), then you are out of luck.
You must avoid that API, possibly using a JavaScript library instead (e.g., [the `fs` module of Node.js](https://nodejs.org/api/fs.html)).


## Incremental compilation gone wrong

Sometimes, the incremental compiler of Scala, called Zinc and used by most build tools, exhibits under-compilation bugs.
In that case, it is possible that the compiled `.sjsir` files are not completely in sync with the sources, and cannot be linked together.

```scala
[error] Referring to non-existent method helloworld.Foo.bar(java.lang.String)scala.Unit
[error]   called from helloworld.HelloWorld$.main()scala.Unit
[error]   called from core module module initializers
[error] involving instantiated classes:
[error]   helloworld.HelloWorld$
[error] There were linking errors
```

### Hint to recognize this cause

If the `Referring to non-existent` line mentions a class from your own codebase, you are probably facing an incremental compilation issue.

### Solution

`clean` the project (or possibly all projects) in your sbt build (or the equivalent operation in other build tools).
Retrying after `clean` should fix the issue.


## Binary incompatibilities on the classpath

When depending on multiple libraries, it is possible that several of them transitively depend on two incompatible versions of the same library.
Here is a hypothetical example:

```scala
[error] Referring to non-existent method somelib.SomeLib.bar(java.lang.String)scala.Unit
[error]   called from someotherlib.SomeOtherLib.foo(java.lang.String)scala.Unit
[error]   called from helloworld.HelloWorld$.main()scala.Unit
[error]   called from core module module initializers
[error] ...
[error] There were linking errors
```

In this case, `someotherlib` was compiled against some version `x` of `somelib`, but a new version `y > x` of `somelib` is used.
In that new version, the method `SomeLib.bar(String)` does not exist anymore, causing a binary incompatibility.

### Hint to recognize this cause

If the `Referring to non-existent` line mentions one library, and the first `called from` line mentions another library, there is probably a binary incompatibility between those two libraries.

This may also be detected and warned against by sbt itself, as *evicted* libraries.

### Solution

Find a set of versions for your libraries that are binary compatible.
This may involve upgrading and/or downgrading some of them.
