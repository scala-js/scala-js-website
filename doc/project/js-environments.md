---
layout: doc
title: JavaScript Environments
---

In order to decide how to run JavaScript code, the Scala.js sbt plugin uses the setting key `jsEnv`.
If it is not set, Scala.js uses Rhino if `scalaJSUseRhino` is `true`, and to Node.js or PhantomJS otherwise (depending on whether the DOM is required).
You can use `jsEnv` to override this default, or to provide finer-grained configuration, as shown in this section.

For example, to switch to PhantomJS, you can set:

{% highlight scala %}
jsEnv := PhantomJSEnv().value
{% endhighlight %}

We'd like to stress here again, that you need to separately install Node.js and PhantomJS if you would like to use these environments.

## <a name="phantomjs-no-auto-terminate"></a> Disabling auto-termination of PhantomJS

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

## <a name="phantomjs-arguments"></a> Passing arguments to PhantomJS

You can pass command-line arguments to the PhantomJS interpreter like this:

{% highlight scala %}
jsEnv := PhantomJSEnv(args = Seq("arg1", "arg2")).value
{% endhighlight %}

For more options of the PhantomJS environment, see
[the ScalaDoc of `PhantomJSEnv`]({{ site.production_url }}/api/sbt-scalajs/{{ site.versions.scalaJS }}/#org.scalajs.sbtplugin.ScalaJSPlugin$$AutoImport$).

## <a name="node-on-ubuntu"></a> Node.js on Ubuntu

The easiest way to handle Node.js versions and installations on Ubuntu (and in Linux systems in general) is to use [nvm](https://github.com/creationix/nvm). All instructions are included.

Then run `nvm` to install the version of Node.js that you want:

    nvm install 5.0

For more options of the Node.js environment, see
[the ScalaDoc of `NodeJSEnv`]({{ site.production_url }}/api/sbt-scalajs/{{ site.versions.scalaJS }}/#org.scalajs.sbtplugin.ScalaJSPlugin$$AutoImport$).
