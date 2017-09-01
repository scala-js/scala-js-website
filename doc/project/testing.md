---
layout: doc
title: Testing
---

In this section we will discuss how to test Scala.js code managed as [Full cross project](./cross-build.html). All names
for example subproject name such as `fooJVM` are taken from
[cross compile example](https://github.com/scala-js/scalajs-cross-compile-example).

## Directory Structure

    <project root>
     +- jvm
     |   +- src/main/scala
     |   +- src/test/scala
     +- js
     |   +- src/main/scala
     |   +- src/test/scala
     +- shared
         +- src/main/scala
         +- src/test/scala

Similarly to `{shared|js|jvm}/src/main/scala` folders that contain your code, there can be also
`{shared|js|jvm}/src/test/scala` folders that would contain your tests. Tests that verify correctness of shared code
should go to `shared` test folder, while tests that check Scala JVM code or Scala.js code only should go to `jvm` or
`js` test folders respectively. Calling `sbt> fooJVM/test` will execute all tests residing in `shared` and `jvm`
folders, thus testing Scala JVM code. Calling `sbt> fooJS/test` will execute all tests residing in `shared` and `js`
folders, so Scala.js code is tested. In case of the full cross project, root project aggregates JVM and JS
parts, so when calling `sbt> test` will effectively run both `fooJVM/test` and `fooJS/test`.

## Integration testing

Configuring a regular non-Scala.js sbt project to have `it:test` is
[documented in sbt](http://www.scala-sbt.org/0.13/docs/Testing.html#Integration+Tests).
For a Scala.js project, you will also need to install the Scala.js-specific settings and tasks to the `it` configuration, as follows:

{% highlight scala %}
lazy val myProject = project.in(file(".")).
  enablePlugins(ScalaJSPlugin).
  // add the `it` configuration
  configs(IntegrationTest).
  // add `it` tasks
  settings(Defaults.itSettings: _*).
  // add Scala.js-specific settings and tasks to the `it` configuration
  settings(inConfig(IntegrationTest)(ScalaJSPlugin.testConfigSettings): _*).
  ...
{% endhighlight %}

For a `crossProject`, you also need to setup the `shared/src/it/scala` source directory.
The complete setup is as follows:

{% highlight scala %}
lazy val cross = crossProject.in(file(".")).
  // add the `it` configuration
  configs(IntegrationTest).
  // add `it` tasks
  settings(Defaults.itSettings: _*).
  // add Scala.js-specific settings and tasks to the `it` configuration
  jsSettings(inConfig(IntegrationTest)(ScalaJSPlugin.testConfigSettings): _*).
  // add the `shared` folder to source directories
  settings(
    unmanagedSourceDirectories in IntegrationTest ++=
      CrossType.Full.sharedSrcDir(baseDirectory.value, "it").toSeq
  ).
  ...
{% endhighlight %}

Now you can put tests in `{shared|jvm|js}/src/it/scala` and they will run when you call `sbt> it:test`. Similarly to
`test`, there is also two iterations and they can be executed separately by explicitely stating jvm or js project name,
for example `sbt> fooJS/it:test`.

## Testing frameworks

A list of testing frameworks compatible with Scala.js can be found [here](../../libraries/testing.html).

Note: Don't forget to mark a test framework SBT dependency as `test,it` if you have both unit and integration tests.
