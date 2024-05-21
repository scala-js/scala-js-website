---
layout: doc
title: Basic tutorial
---

This is a step-by-step tutorial where we start with the setup of a Scala.js sbt project and end up having some user interaction and unit testing. The code created in this tutorial is available with one commit per step in the [scalajs-tutorial](https://github.com/scala-js/scalajs-tutorial) repository on GitHub.

## <a name="prerequisites"></a> Step 0: Prerequisites

To go through this tutorial, you will need to have installed a Java Development Kit (JDK) and [download & install sbt](https://www.scala-sbt.org/1.x/docs/Setup.html). Note that no prior sbt knowledge (only a working installation) is required to follow the tutorial.

You will also need to [download & install Node.js](https://nodejs.org/en/download/).

To run the complete tutorial application, you will also need to install jsdom as explained [below](#supporting-the-dom).

## <a name="setup"></a> Step 1: Setup

First create a new folder where your sbt project will go.

### sbt Setup

To setup Scala.js in a new sbt project, we need to do two things:

1. Add the Scala.js sbt plugin to the build
2. Enable the plugin in the project

Adding the Scala.js sbt plugin is a one-liner in `project/plugins.sbt` (all file names we write in this tutorial are relative to the project root):

{% highlight scala %}
addSbtPlugin("org.scala-js" % "sbt-scalajs" % "{{ site.versions.scalaJS }}")
{% endhighlight %}

We also setup basic project settings and enable this plugin in the sbt build file (`build.sbt`, in the project root directory):

{% highlight scala %}
enablePlugins(ScalaJSPlugin)

name := "Scala.js Tutorial"
scalaVersion := "2.13.14" // or a newer version such as "3.4.2", if you like

// This is an application with a main method
scalaJSUseMainModuleInitializer := true
{% endhighlight %}

Last, we need a `project/build.properties` to specify the sbt version (you can find the latest version [here](https://www.scala-sbt.org/download.html)):

{% highlight scala %}
sbt.version=1.7.1
{% endhighlight %}

That is all we need to configure the build.

If at this point you prefer to use an IDE, you can import the build into [VS Code with Metals](https://scalameta.org/metals/) (or any other editor supported by Metals) or IntelliJ IDEA (see "Installation" [here](https://docs.scala-lang.org/getting-started/intellij-track/getting-started-with-scala-in-intellij.html)).
Note that for compiling and running your application, you will still need to use sbt from the command line.

### HelloWorld application

For starters, we add a very simple `TutorialApp` in the `tutorial.webapp` package. Create the file `src/main/scala/tutorial/webapp/TutorialApp.scala`:

{% highlight scala %}
package tutorial.webapp

object TutorialApp {
  def main(args: Array[String]): Unit = {
    println("Hello world!")
  }
}
{% endhighlight %}

As you expect, this will simply print "HelloWorld" when run. To run this, simply launch `sbt` and invoke the `run` task:

    $ sbt
    sbt:Scala.js Tutorial> run
    [info] Compiling 1 Scala source to (...)/scalajs-tutorial/target/scala-2.13/classes ...
    [info] Fast optimizing (...)/scalajs-tutorial/target/scala-2.13/scala-js-tutorial-fastopt
    [info] Running tutorial.webapp.TutorialApp. Hit any key to interrupt.
    Hello world!
    [success] (...)

Congratulations! You have successfully compiled and run your first Scala.js application.
The code is actually run by a JavaScript interpreter, namely Node.

**Source maps in Node.js**: To get your stack traces resolved on Node.js, you will have to install the `source-map-support` package.
It is usually best to install it locally for this project.
You can initialize a private `package.json` as follows:

    $ npm init private

Then you can install `source-map-support`:

    $ npm install source-map-support

## <a name="integrating-html"></a> Step 2: Integrating with HTML

Now that we have a simple JavaScript application, we would like to use it in an HTML page. To do this, we need two steps:

1. Generate a single JavaScript file out of our compiled code
2. Create an HTML page which includes that file

### Generate JavaScript

To generate JavaScript using sbt, use the `fastLinkJS` task:

    > fastLinkJS
    [info] Fast optimizing (...)/scalajs-tutorial/target/scala-2.13/scala-js-tutorial-fastopt
    [success] (...)

This will perform some fast optimizations and generate the `target/scala-2.13/scala-js-tutorial-fastopt/main.js` file containing the JavaScript code.

(It is possible that the `[info]` does not appear, if you have just run the program and not made any change to it.)

### Create the HTML Page

To load and launch the created JavaScript, you will need an HTML file. Create the file `scalajs-tutorial-fastopt.html` (or whatever name you prefer, for example `index-dev.html`) in the project root with the following content. We will go in the details right after.

{% highlight html %}
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>The Scala.js Tutorial</title>
  </head>
  <body>
    <!-- Include Scala.js compiled code -->
    <script type="text/javascript" src="./target/scala-2.13/scala-js-tutorial-fastopt/main.js"></script>
  </body>
</html>
{% endhighlight %}

The script tag simply includes the generated code (attention, you might need to adapt the Scala version from `2.13` to `2.12` (or even `2.10` or `2.11`) here if you are using an older version of Scala).

Since we have set `scalaJSUseMainModuleInitializer := true` in the build, the `TutorialApp.main(args: Array[String])` method is automatically called at the end of the `-fastopt.js` file (with an empty array as argument).

If you now open the newly created HTML page in your favorite browser, you will see ... nothing. The `println` in the `main` method goes right to the JavaScript console, which is not shown by default in a browser. However, if you open the JavaScript console (e.g. in Chrome: right click -> Inspect Element -> Console) you can see the HelloWorld message.

## <a name="using-dom"></a> Step 3: Using the DOM

As the last step has shown, running JavaScript inside an HTML page is not particularly useful if you cannot interact with the page.
That's what the DOM API is for.

### Adding the DOM Library

To use the DOM, it is best to use the statically typed Scala.js DOM library. To add it to your sbt project, add the following line to your `build.sbt`:

{% highlight scala %}
libraryDependencies += "org.scala-js" %%% "scalajs-dom" % "{{ site.versions.scalaJSDOM }}"
{% endhighlight %}

sbt-savvy folks will notice the `%%%` instead of the usual `%%`. It means we are using a Scala.js library and not a
normal Scala library. Have a look at the [Dependencies](../../project/dependencies.html) guide for details. Don't forget
to reload the build file if sbt is still running:

    sbt:Scala.js Tutorial> reload
    [info] Loading settings for project global-plugins from plugins.sbt ...
    [info] Loading global plugins from (...)/.sbt/1.0/plugins
    [info] Loading settings for project scalajs-tutorial-build from plugins.sbt ...
    [info] Loading project definition from (...)/scalajs-tutorial/project
    [info] Loading settings for project scala-js-tutorial from build.sbt ...
    [info] Set current project to Scala.js Tutorial (in build file:(...)/scalajs-tutorial/)

If you are using an IDE plugin, you will also have to reimport the build for autocompletion to work.

### Using the DOM Library

Now that we added the DOM library, let's adapt our HelloWorld example to add a `<p>` tag to the body of the page, rather than printing to the console.

First of all, we import a couple of things:

{% highlight scala %}
import org.scalajs.dom
import org.scalajs.dom.document
{% endhighlight %}

`dom` is the root of the JavaScript DOM and corresponds to the global scope of JavaScript (aka the `window` object).
We additionally import `document` (which corresponds to `document` in JavaScript) for convenience.

We now create a method that allows us to append a `<p>` tag with a given text to a given node:

{% highlight scala %}
def appendPar(targetNode: dom.Node, text: String): Unit = {
  val parNode = document.createElement("p")
  parNode.textContent = text
  targetNode.appendChild(parNode)
}
{% endhighlight %}

Replace the call to `println` with a call to `appendPar` in the `main` method:

{% highlight scala %}
def main(args: Array[String]): Unit = {
  appendPar(document.body, "Hello World")
}
{% endhighlight %}

### Rebuild the JavaScript

To rebuild the JavaScript, simply invoke `fastLinkJS` again:

    sbt:Scala.js Tutorial> fastLinkJS
    [info] Compiling 1 Scala source to (...)/scalajs-tutorial/target/scala-2.13/classes ...
    [info] Fast optimizing (...)/scalajs-tutorial/target/scala-2.13/scala-js-tutorial-fastopt
    [success] (...)

As you can see from the log, sbt automatically detects that the sources must be recompiled before fast optimizing.

You can now reload the HTML in your browser and you should see a nice "Hello World" message.

Re-typing `fastLinkJS` each time you change your source file is cumbersome. Luckily sbt is able to watch your files and recompile as needed:

    sbt:Scala.js Tutorial> ~fastLinkJS
    [success] (...)
    [info] 1. Monitoring source files for scalajs-tutorial/fastLinkJS...
    [info]    Press <enter> to interrupt or '?' for more options.

From this point in the tutorial we assume you have an sbt with this command running, so we don't need to bother with rebuilding each time.

## <a name="js-export"></a> Step 4: Reacting on User Input

This step shows how you can add a button and react to events on it by still just using the DOM. We want to add a button that adds another `<p>` tag to the body when it is clicked.

We start by adding a method to `TutorialApp` which will be called when the button is clicked:

{% highlight scala %}
@JSExportTopLevel("addClickedMessage")
def addClickedMessage(): Unit = {
  appendPar(document.body, "You clicked the button!")
}
{% endhighlight %}

You will notice the `@JSExportTopLevel` annotation.
It tells the Scala.js compiler to make that method callable as top-level function from JavaScript. We must also import this annotation:

{% highlight scala %}
import scala.scalajs.js.annotation.JSExportTopLevel
{% endhighlight %}

To find out more about how to call Scala.js methods from JavaScript, have a look at the [Export Scala.js API to
JavaScript](../../interoperability/export-to-javascript.html) guide.

Since we now have a method that is callable from JavaScript, all we have to do is add a button to our HTML and set its
`onclick` attribute (make sure to add the button *before* the `<script>` tags):

{% highlight html %}
<button id="click-me-button" type="button" onclick="addClickedMessage()">
  Click me!
</button>
{% endhighlight %}

Reload your HTML page (remember, sbt compiles your code automatically) and try to click the button. It should add a new
paragraph saying "You clicked the button!" each time you click it.

## <a name="setup-ui-in-scala-js"></a> Step 5: Setup the UI in Scala.js

Previously, we have prepared the UI as an HTML document, then manipulated it from Scala.js code.
That approach required us to manually *export* the method used for the `onclick` event of the button, which is cumbersome.
We can avoid this issue by building the UI directly from the Scala.js code.

Instead of preparing the button in the HTML, we can add the following code to the `main` method in Scala.js:

{% highlight scala %}
val button = document.createElement("button")
button.textContent = "Click me!"
button.addEventListener("click", { (e: dom.MouseEvent) =>
  addClickedMessage()
})
document.body.appendChild(button)
{% endhighlight %}

This uses an anonymous function that we give to `addEventListener`.
It is very similar to the way we write an arrow function in JavaScript, except that the parameter is explicitly typed.

We can remove the `<button>` tag from the HTML file, and hence remove the `@JSExportTopLevel` annotation on `addClickedMessage()` (even though it will be indirectly called through the anonymous function).

As a last touch, we extract the setup of the UI in a separate method `def setupUI()`, which we will call only once the DOM is loaded, instead of synchronously from the `main` method:

{% highlight scala %}
def main(args: Array[String]): Unit = {
  document.addEventListener("DOMContentLoaded", { (e: dom.Event) =>
    setupUI()
  })
}

def setupUI(): Unit = {
  val button = document.createElement("button")
  button.textContent = "Click me!"
  button.addEventListener("click", { (e: dom.MouseEvent) =>
    addClickedMessage()
  })
  document.body.appendChild(button)

  appendPar(document.body, "Hello World")
}
{% endhighlight %}

You can now refresh the webpage to test the above changes.

We now have an application whose UI is completely setup from within Scala.js. The next step will show how we can test
this application.

## <a name="testing"></a> Step 6: Testing

In this section we will show how such an application can be tested using [uTest](http://github.com/lihaoyi/utest), a
tiny testing framework which compiles to both Scala.js and Scala JVM. As a note aside, this framework is also a good
choice to test libraries that cross compile. See our [cross compilation guide](../../project/cross-build.html) for
details.

### Supporting the DOM

Before we start writing tests which we will be able to run through the sbt console, we first have to solve another
issue. Remember the task `run`? If you try to invoke it now, you will see something like this:

    sbt:Scala.js Tutorial> run
    [info] Running tutorial.webapp.TutorialApp. Hit any key to interrupt.
    (...)/scalajs-tutorial/target/scala-2.13/scala-js-tutorial-fastopt/main.js:819
        $thiz.Lorg_scalajs_dom_package$__f_window = window;
                                                    ^

    ReferenceError: window is not defined
        at $p_Lorg_scalajs_dom_package$__window$lzycompute__Lorg_scalajs_dom_raw_Window ((...)/org/scalajs/dom/package.scala:219:40)
        ...
        at $c_Ltutorial_webapp_TutorialApp$.main__AT__V ((...)/tutorial/webapp/TutorialApp.scala:8:5)
        ...
    [error] org.scalajs.jsenv.ExternalJSRun$NonZeroExitException: exited with code 1
    [error]         at org.scalajs.jsenv.ExternalJSRun$$anon$1.run(ExternalJSRun.scala:186)
    [error] stack trace is suppressed; run last Compile / run for the full output
    [error] (Compile / run) org.scalajs.jsenv.ExternalJSRun$NonZeroExitException: exited with code 1
    [error] Total time: (...)

The issue we encounter is that our `main` method tries to access DOM functionality, which is not available in Node.js.

To make the DOM available, add the following to your `project/plugins.sbt`:

{% highlight scala %}
libraryDependencies += "org.scala-js" %% "scalajs-env-jsdom-nodejs" % "1.0.0"
{% endhighlight %}

and the following to your `build.sbt`:

{% highlight scala %}
jsEnv := new org.scalajs.jsenv.jsdomnodejs.JSDOMNodeJSEnv()
{% endhighlight %}

This will use the [`jsdom`](https://github.com/jsdom/jsdom) library to simulate a DOM in Node.js.
Note that you need to install it separately using

    $ npm install jsdom

After reloading, you can invoke `run` successfully:

    > run
    [info] Running tutorial.webapp.TutorialApp
    [success] (...)

Alternatively to Node.js with jsdom, you can use [Selenium](http://docs.seleniumhq.org/) or [Playwright](https://github.com/gmkumar2005/scala-js-env-playwright)
You can find more information about this in the [documentation about JavaScript environments]({{ BASE_PATH }}/doc/project/js-environments.html).

### Adding uTest

Using a testing framework in Scala.js is not much different than on the JVM.
It typically boils down to two sbt settings in the `build.sbt` file.
For uTest, these are:

{% highlight scala %}
libraryDependencies += "com.lihaoyi" %%% "utest" % "0.7.4" % "test"
testFrameworks += new TestFramework("utest.runner.Framework")
{% endhighlight %}

We are now ready to add a first simple test suite (`src/test/scala/tutorial/webapp/TutorialTest.scala`):

{% highlight scala %}
package tutorial.webapp

import utest._

import scala.scalajs.js

import org.scalajs.dom
import org.scalajs.dom.document
import org.scalajs.dom.ext._

object TutorialTest extends TestSuite {

  // Initialize App
  TutorialApp.setupUI()

  def tests = Tests {
    test("HelloWorld") {
      assert(document.querySelectorAll("p").count(_.textContent == "Hello World") == 1)
    }
  }
}
{% endhighlight %}

This test uses `querySelectorAll` to find all the `<p>` elements in the document, and `count` those whose `textContent` is the `"Hello World"`.
The `count` method is part of the Scala collections API, and is provided on DOM `NodeList`s by the

{% highlight scala %}
import org.scalajs.dom.ext._
{% endhighlight %}

To run this test, simply invoke the `test` task:

    > test
    [info] Compiling 1 Scala source to (...)/scalajs-tutorial/target/scala-2.13/test-classes...
    [info] Fast optimizing (...)/scalajs-tutorial/target/scala-2.13/scala-js-tutorial-test-fastopt
    -------------------------------- Running Tests --------------------------------
    + tutorial.webapp.TutorialTest.HelloWorld 2ms
    Tests: 1, Passed: 1, Failed: 0
    [success] Total time: 14 s, completed 16-mars-2018 20:04:28

We have successfully created a simple test.
Just like `run`, the `test` task uses Node.js to execute your tests.

### A more complex test

We also would like to test the functionality of our button:

{% highlight scala %}
test("ButtonClick") {
  def messageCount =
    document.querySelectorAll("p").count(_.textContent == "You clicked the button!")

  val button = document.querySelector("button").asInstanceOf[dom.html.Button]
  assert(button != null && button.textContent == "Click me!")
  assert(messageCount == 0)

  for (c <- 1 to 5) {
    button.click()
    assert(messageCount == c)
  }
}
{% endhighlight %}

After defining a helper method that counts the number of messages, we retrieve the button from the DOM and verify we
have exactly one button and no messages. In the loop, we simulate a click on the button and then verify that the number
of messages has increased.

You can now call the `test` task again:

    > test
    [info] Compiling 1 Scala source to (...)/scalajs-tutorial/target/scala-2.13/test-classes...
    [info] Fast optimizing (...)/scalajs-tutorial/target/scala-2.13/scala-js-tutorial-test-fastopt
    -------------------------------- Running Tests --------------------------------
    + tutorial.webapp.TutorialTest.HelloWorld 3ms
    + tutorial.webapp.TutorialTest.ButtonClick 6ms
    Tests: 2, Passed: 2, Failed: 0
    [success] Total time: 15 s, completed 16-mars-2018 20:07:33

This completes the testing part of this tutorial.

## <a name="optimizing"></a> Step 7: Optimizing for Production

Here we show a couple of things you might want to do when you promote your application to production.

### Full Optimization

Size is critical for JavaScript code on the web. To compress the compiled code even further, the Scala.js sbt plugin
uses the advanced optimizations of the [Google Closure Compiler](http://developers.google.com/closure/compiler/). To run
full optimizations, simply use the `fullLinkJS` task:

    > fullLinkJS
    [info] Full optimizing (...)/scalajs-tutorial/target/scala-2.13/scala-js-tutorial-opt
    [info] Closure: 0 error(s), 0 warning(s)
    [success] (...)

Note that this can take a while on a larger project (tens of seconds), which is why we typically don't use `fullLinkJS`
during development, but `fastLinkJS` instead. If you want to `run` and `test` the full-optimized version from sbt,
you need to change the *stage* using the following sbt setting:

    > set scalaJSStage in Global := FullOptStage

(by default, the stage is `FastOptStage`)

We also need to create our final production HTML file `scalajs-tutorial.html` which includes the fully optimized code:

{% highlight html %}
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>The Scala.js Tutorial</title>
  </head>
  <body>
    <!-- Include Scala.js compiled code -->
    <script type="text/javascript" src="./target/scala-2.13/scala-js-tutorial-opt/main.js"></script>
  </body>
</html>
{% endhighlight %}

### Compression

If you serve your Scala.js application from a web server, you should additionally
gzip the resulting `.js` files. This step might reduce the size of your application down
to 20% of its original size.

The setup depends on your server stack. A common option is to use
[sbt-web](https://github.com/sbt/sbt-web),
[sbt-web-scalajs](https://github.com/vmunier/sbt-web-scalajs) and
[sbt-gzip](https://github.com/sbt/sbt-gzip)
if you have a Play or Akka-http server.

This completes the Scala.js tutorial. Refer to our [documentation page](../../index.html) for deeper insights into various
aspects of Scala.js.
