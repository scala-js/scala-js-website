---
layout: doc
title: JavaScript Environments
---

In order to decide how to run JavaScript code, the Scala.js sbt plugin uses the setting key `jsEnv`.
By default, `jsEnv` is set to use [Node.js](http://nodejs.org/), which you need to install separately.

**Scala.js 0.6.x:** If your application or one of its libraries requires a DOM (which can be specified with `jsDependencies += RuntimeDOM`), the `JSDOMNodeJSEnv` environment described will be used by default.

## Node.js

Node.js is the default environment used by Scala.js.
You can also explicitly enable it, for example to customize it, using the following sbt setting:

{% highlight scala %}
jsEnv := new org.scalajs.jsenv.nodejs.NodeJSEnv()
{% endhighlight %}

### <a name="node-on-ubuntu"></a> Node.js on Ubuntu

The easiest way to handle Node.js versions and installations on Ubuntu (and in Linux systems in general) is to use [nvm](https://github.com/creationix/nvm). All instructions are included.

Then run `nvm` to install the version of Node.js that you want:

    nvm install 5.0

For more options of the Node.js environment, see
[the Scaladoc of `NodeJSEnv`]({{ site.production_url }}/api/scalajs-js-envs/{{ site.versions.scalaJS }}/#org.scalajs.jsenv.nodejs.NodeJSEnv).

## Node.js with JSDOM

This environment uses [jsdom](https://github.com/tmpvar/jsdom) to provide a headless browser environment on top of Node.js.
You can enable it with the following sbt setting:

{% highlight scala %}
jsEnv := new org.scalajs.jsenv.jsdomnodejs.JSDOMNodeJSEnv()
{% endhighlight %}

You will need to `npm install jsdom` for the above environment to work.

**Scala.js 1.x:** The above setting requires the following line in your `project/plugins.sbt`:

{% highlight scala %}
libraryDependencies += "org.scala-js" %% "scalajs-env-jsdom-nodejs" % "1.0.0-M1"
{% endhighlight %}

**Scala.js 0.6.x:** This environment is selected by default if your application or one of its libraries declares a dependency on the DOM, with `jsDependencies += RuntimeDOM`.
Note that this is deprecated, so you should use `jsEnv := ...` anyway.

## PhantomJS

[PhantomJS](http://phantomjs.org/) is a Webkit-based headless browser.
You can use it with Scala.js with the following sbt setting:

{% highlight scala %}
jsEnv := PhantomJSEnv().value
{% endhighlight %}

**Scala.js 1.x:** The above setting requires the following line in your `project/plugins.sbt`:

{% highlight scala %}
addSbtPlugin("org.scala-js" % "sbt-scalajs-env-phantomjs" % "1.0.0-M1")
{% endhighlight %}

### <a name="phantomjs-no-auto-terminate"></a> Disabling auto-termination of PhantomJS

By default, the PhantomJS interpreter terminates itself as soon as the `main()` method returns.
This may not be what you want, if for example you register time-outs or use WebSockets.
You can disable this behavior with the following setting:

{% highlight scala %}
jsEnv := PhantomJSEnv(autoExit = false).value
{% endhighlight %}

You can terminate the interpreter from your Scala code with

{% highlight scala %}
System.exit(0)
{% endhighlight %}

### <a name="phantomjs-arguments"></a> Passing arguments to PhantomJS

You can pass command-line arguments to the PhantomJS interpreter like this:

{% highlight scala %}
jsEnv := PhantomJSEnv(args = Seq("arg1", "arg2")).value
{% endhighlight %}

For more options of the PhantomJS environment, see
[the Scaladoc of `PhantomJSEnv`]({{ site.production_url }}/api/sbt-scalajs/{{ site.versions.scalaJS }}/#org.scalajs.sbtplugin.ScalaJSPlugin$$AutoImport$).

## Selenium

[Selenium](http://docs.seleniumhq.org/) provides a programmatic interface to real browsers.
See the separate project [scalajs-env-selenium](https://github.com/scala-js/scala-js-env-selenium) for instructions on how to use with Scala.js.

## Rhino (deprecated)

**Scala.js 0.6.x only**

Rhino can be used with the following sbt setting:

{% highlight scala %}
scalaJSUseRhino in Global := true
{% endhighlight %}
