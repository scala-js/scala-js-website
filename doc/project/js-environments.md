---
layout: doc
title: JavaScript Environments
---

In order to decide how to run JavaScript code, the Scala.js sbt plugin uses the setting key `jsEnv`.
By default, `jsEnv` is set to use [Node.js](http://nodejs.org/), which you need to install separately.

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
[the Scaladoc of `NodeJSEnv`](https://javadoc.io/doc/org.scala-js/scalajs-env-nodejs_2.13/latest/org/scalajs/jsenv/nodejs/NodeJSEnv.html).

## Node.js with JSDOM

This environment uses [jsdom](https://github.com/jsdom/jsdom) to provide a headless browser environment on top of Node.js.
You can enable it with the following sbt setting:

{% highlight scala %}
jsEnv := new org.scalajs.jsenv.jsdomnodejs.JSDOMNodeJSEnv()
{% endhighlight %}

You will need to `npm install jsdom` for the above environment to work.

The above setting requires the following line in your `project/plugins.sbt`:

{% highlight scala %}
libraryDependencies += "org.scala-js" %% "scalajs-env-jsdom-nodejs" % "1.0.0"
{% endhighlight %}

## PhantomJS

[PhantomJS](http://phantomjs.org/) is a Webkit-based headless browser.
You can use it with Scala.js with the following sbt setting:

{% highlight scala %}
jsEnv := PhantomJSEnv().value
{% endhighlight %}

The above setting requires the following line in your `project/plugins.sbt`:

{% highlight scala %}
addSbtPlugin("org.scala-js" % "sbt-scalajs-env-phantomjs" % "1.0.0")
{% endhighlight %}

### <a name="phantomjs-arguments"></a> Passing arguments to PhantomJS

You can pass command-line arguments to the PhantomJS interpreter like this:

{% highlight scala %}
jsEnv := PhantomJSEnv(args = Seq("arg1", "arg2")).value
{% endhighlight %}

For more options of the PhantomJS environment, see
[the Scaladoc of `PhantomJSEnv`]({{ site.production_url }}/api/sbt-scalajs-env-phantomjs/1.0.0/org/scalajs/jsenv/phantomjs/sbtplugin/PhantomJSEnvPlugin$$autoImport$.html).

## Playwright 
[Playwright](https://playwright.dev/) is a comprehensive testing library, enabling automation of Chromium, Firefox, and WebKit browsers. 

It supports multiple platforms and languages, including Mobile Web, making it an optimal choice for testing JavaScript in real browser environments. 

[`scala-js-env-playwright`](https://github.com/gmkumar2005/scala-js-env-playwright) is an independent project that offers a `JSEnv` that uses Playwright for JavaScript execution.

The playwright-based `jsEnv` can be enabled by adding the following settings in `build.sbt` 
```scala
jsEnv := new PWEnv(
        browserName = "chrome",
        headless = true,
        showLogs = true
    )
```
Addtionally it requires the following line in `project/plugins.sbt`:
```scala
// For Scala.js 1.x
libraryDependencies += "io.github.gmkumar2005" %% "scala-js-env-playwright" % "0.1.11"
```
The `browserName` parameter accepts `chrome` , `chromium` , `firefox`, and `webkit` as possible options. 
Please be aware that webkit support is currently in an experimental stage.
It is fully tested on macOS and your mileage may vary on other platforms.

### In browser debugging
`keepAlive` is a work in progress. It is not fully functional yet.
As a workaround introducing delay in the test cases may help to keep the browser alive.


### Debugging
Additional debug information can be enabled by setting `debug` to `true`. 
It will also print the version of the browser which is used.
```scala
jsEnv := new PWEnv(
        browserName = "chrome",
        headless = true,
        debug = true
    )
``` 
### Headless Usage
Running in headless mode is crucial for operations within Docker containers and build servers. 

By default, `scala-js-env-playwright` operates in headless mode.
However, for debugging purposes, you can set headless to `false`.

### Details
For more options of the playWright environment see the github project [PlayWright-jsEnv](https://github.com/gmkumar2005/scala-js-env-playwright)

## Selenium

[Selenium](http://docs.seleniumhq.org/) provides a programmatic interface to real browsers.
See the separate project [scalajs-env-selenium](https://github.com/scala-js/scala-js-env-selenium) for instructions on how to use with Scala.js.
