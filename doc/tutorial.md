---
layout: page
title: Scala.js Tutorial
---
{% include JB/setup %}

This step-by-step tutorial where we start with the setup of a Scala.js sbt project and end up having some user interaction and unit testing. The code created in this tutorial is available with one commit per step in the [scalajs-tutorial](https://github.com/scala-js/scalajs-tutorial) repository on GitHub.

## <a name="prerequisites"></a> Step 0: Prerequisites

To go through this tutorial, you will need to [download & install sbt](http://www.scala-sbt.org/0.13/tutorial/Setup.html) (>= 0.13.0). Note that no prior sbt knowledge (only a working installation) is required to follow the tutorial.

## <a name="setup"></a> Step 1: Setup

First create a new folder where your sbt project will go.

### sbt Setup

To setup Scala.js in a new sbt project, we need to do two things:

1. Add the Scala.js sbt plugin
2. Apply the Scala.js specific settings to the project

Adding the Scala.js sbt plugin is a one-liner in `project/plugins.sbt` (all file names we write in this tutorial are relative to the project root):

{% highlight scala %}
addSbtPlugin("org.scala-lang.modules.scalajs" % "scalajs-sbt-plugin" % "{{ site.scalaJSVersion }}")
{% endhighlight %}

We also setup basic project settings and Scala.js settings in the sbt build file (`build.sbt`, in the project root directory):

{% highlight scala %}
scalaJSSettings

name := "Scala.js Tutorial"

scalaVersion := "2.11.2"
{% endhighlight %}

Last, we need a `project/build.properties` to specify the sbt version:

{% highlight scala %}
sbt.version=0.13.5
{% endhighlight %}

That is all we need to configure the build.

If at this point you prefer to use Eclipse or IDEA as your IDE, you may use [sbteclipse](https://github.com/typesafehub/sbteclipse/wiki/Using-sbteclipse) or [sbt-idea](https://github.com/mpeltonen/sbt-idea) project files for the IDE. Note that for compiling and running your application, you will still need to use sbt from the command line.

#### Alternative versions

You may instead use 2.10.2, 2.10.3, 2.10.4, 2.11.0 or 2.11.1 for `scalaVersion` if you so wish. Similarly, any 0.13.x version of sbt should work without itch, for example 0.13.5.

### HelloWorld application

For starters, we add a very simple `TutorialApp` in the `tutorial.webapp` package. Create the file `src/main/scala/tutorial/webapp/TutorialApp.scala`:

{% highlight scala %}
package tutorial.webapp

import scala.scalajs.js.JSApp

object TutorialApp extends JSApp {
  def main(): Unit = {
    println("Hello world!")
  }
}
{% endhighlight %}

As you expect, this will simply print "HelloWorld" when run. To run this, simply launch `sbt` and invoke the `run` task:

    $ sbt
    > run
    [info] Compiling 1 Scala source to (...)/scala-js-tutorial/target/scala-2.11/classes...
    [info] Running tutorial.webapp.TutorialApp
    Hello world!
    [success] (...)

**Troubleshooting**: Should you experience errors with the `PermGen` size of the JVM at this point, you can increase it. Refer, for example, to [this StackOverflow question](http://stackoverflow.com/questions/8331135/transient-outofmemoryerror-when-compiling-scala-classes).

Congratulations! You have successfully compiled and run your first Scala.js application. The code is actually run by a JavaScript interpreter. If you do not believe this (it happens to us occasionally), you can use sbt's `last`:

    > last
    (...)
    [info] Running tutorial.webapp.TutorialApp
    [debug] with JSEnv of type class scala.scalajs.sbtplugin.env.rhino.RhinoJSEnv
    [debug] with classpath of type class scala.scalajs.tools.classpath.CompleteIRClasspath
    [success] (...)

So your code has actually been executed by the [Rhino](https://developer.mozilla.org/en-US/docs/Mozilla/Projects/Rhino) JavaScript interpreter.

## <a name="integrating-html"></a> Step 2: Integrating with HTML

Now that we have a simple JavaScript application, we would like to use it in an HTML page. To do this, we need two steps:

1. Generate a single JavaScript file out of our compiled code
2. Create an HTML page which includes that file and calls the application

### Generate JavaScript

To generate a single JavaScript file using sbt, just use the `fastOptJS` task:

    > fastOptJS
    [info] Fast optimizing (...)/scala-js-tutorial/target/scala-2.11/scala-js-tutorial-fastopt.js
    [success] (...)

This will perform some fast optimizations and generate the `target/scala-2.11/scala-js-tutorial-fastopt.js` file containing the JavaScript code.

### Create the HTML Page

To load and launch the created JavaScript, you will need an HTML file. Create the file `scalajs-tutorial-fastopt.html` (or whatever name you prefer, for example `index-fastopt.html`) in the project root with the following content. We will go in the details right after.

{% highlight html %}
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>The Scala.js Tutorial</title>
  </head>
  <body>
    <!-- Include Scala.js compiled code -->
    <script type="text/javascript" src="./target/scala-2.11/scala-js-tutorial-fastopt.js"></script>
    <!-- Run tutorial.webapp.TutorialApp -->
    <script type="text/javascript">
      tutorial.webapp.TutorialApp().main();
    </script>
  </body>
</html>
{% endhighlight %}

The first script tag simply includes the generated code (attention, you might need to adapt the Scala version from `2.11` to `2.10` here if you are using Scala 2.10.x instead of 2.11.x).

In the second script tag, we first get the `TutorialApp` object. Note the `()`: `TutorialApp` is a function in JavaScript, since potential object initialization code needs to be run upon the first access to the object. We then simply call the `main` method on the `TutorialApp` object.

Since `TutorialApp` extends `JSApp`, the object itself and its `main` method are automatically made available to JavaScript. This is not true in general. Continue reading this tutorial or have a look at the [Export Scala.js API to JavaScript](./export-to-javascript.html) guide for details.

If you now open the newly created HTML page in your favorite browser, you will see ... nothing. The `println` in the `main` method goes right to the JavaScript console, which is not shown by default in a browser. However, if you open the JavaScript console (e.g. in Chrome: right click -> Inspect Element -> Console) you can see the HelloWorld message.

## <a name="using-dom"></a> Step 3: Using the DOM

As the last step has shown, running JavaScript inside a HTML page is not particularly useful if you cannot interact with the page. JavaScript provides the DOM API to interact with the page.

### Adding the DOM Library

To use the DOM, it is best to use the statically typed Scala.js DOM library. To add it to your sbt project, add the following line to your `build.sbt`:

{% highlight scala %}
    libraryDependencies += "org.scala-lang.modules.scalajs" %%% "scalajs-dom" % "0.6"
{% endhighlight %}

sbt-savvy folks will notice the `%%%` instead of the usual `%%`. It means we are using a Scala.js library and not a normal Scala library. Have a look at the [Depending on Libraries](./sbt/depending.html) guide for details. Don't forget to reload the build file if sbt is still running:

    > reload
    [info] Loading global plugins from (...)
    [info] Loading project definition from (...)/scala-js-tutorial/project
    [info] Set current project to Scala.js Tutorial (in build (...)/scala-js-tutorial/)

If you are using an IDE plugin, you will also have to regenerate the project files for autocompletion to work.

### Using the DOM Library

Now that we added the DOM library, let's adapt our HelloWorld example to add a `<p>` tag to the body of the page, rather than printing to the console.

First of all, we import a couple of things:

{% highlight scala %}
import org.scalajs.dom
import dom.document
{% endhighlight %}

`dom` is the root of the JavaScript DOM and corresponds to the `window` object in JavaScript. We additionally import `document` (which corresponds to `document` in JavaScript) for convenience.

We now create a method that allows us to append a `<p>` tag with a given text to a given node:

{% highlight scala %}
def appendPar(targetNode: dom.Node, text: String): Unit = {
  val parNode = document.createElement("p")
  val textNode = document.createTextNode(text)
  parNode.appendChild(textNode)
  targetNode.appendChild(parNode)
}
{% endhighlight %}

Replace the call to `println` with a call to `appendPar` in the `main` method:

{% highlight scala %}
def main(): Unit = {
  appendPar(document.body, "Hello World")
}
{% endhighlight %}

### Rebuild the JavaScript

To rebuild the JavaScript, simply invoke `fastOptJS` again:

    > fastOptJS
    [info] Compiling 1 Scala source to (...)/scala-js-tutorial/target/scala-2.11/classes...
    [info] Fast optimizing (...)/scala-js-tutorial/target/scala-2.11/scala-js-tutorial-fastopt.js
    [success] (...)

As you can see from the log, sbt automatically detects that the sources must be recompiled before fast optimizing.

You can now reload the HTML in your browser and you should see a nice "Hello World" message.

Re-typing `fastOptJS` each time you change your source file is cumbersome. Luckily sbt is able to watch your files and recompile as needed:

    > ~fastOptJS
    [success] (...)
    1. Waiting for source changes... (press enter to interrupt)

From this point in the tutorial we assume you have an sbt with this command running, so we don't need to bother with rebuilding each time.

## <a name="js-export"></a> Step 4: Reacting on User Input

This step shows how you can add a button and react to events on it by still just using the DOM (we will use jQuery in the next step). We want to add a button that adds another `<p>` tag to the body when it is clicked.

We start by adding a method to `TutorialApp` which will be called when the button is clicked:

{% highlight scala %}
@JSExport
def addClickedMessage(): Unit = {
  appendPar(document.body, "You clicked the button!")
}
{% endhighlight %}

You will notice the `@JSExport` annotation. It tells the Scala.js compiler to make a method callable from JavaScript. We must also import this annotation:

{% highlight scala %}
import scala.scalajs.js.annotation.JSExport
{% endhighlight %}

To find out more about how to call Scala.js methods from JavaScript, have a look at the [Export Scala.js API to JavaScript](./export-to-javascript.html) guide.

Since we now have a method that is callable from JavaScript, all we have to do is add a button to our HTML and set its `onclick` attribute (make sure to add the button *before* the `<script>` tags):

{% highlight html %}
<button id="click-me-button" type="button" onclick="tutorial.webapp.TutorialApp().addClickedMessage()">Click me!</button>
{% endhighlight %}

Reload your HTML page (remember, sbt compiles your code automatically) and try to click the button. It should add a new paragraph saying "You clicked the button!" each time you click it.

## <a name="using-jquery"></a> Step 5: Using jQuery

Larger web applications have a tendency to set up reactions to events in JavaScript rather than specifying attributes. We will transform our current mini-application to use this paradigm with the help of jQuery. Also we will replace all usages of the DOM API with jQuery.

### Depending on jQuery

Just like for the DOM, there is a typed library for jQuery, especially packaged for Scala.js. Replace the `libraryDependencies += ...` line in your `build.sbt` by:

{% highlight scala %}
    libraryDependencies += "org.scala-lang.modules.scalajs" %%% "scalajs-jquery" % "0.6"
{% endhighlight %}

Since we won't be using the DOM directly, we don't need the old library anymore. Note that the jQuery library internally depends on the DOM, but we don't have to care about this. sbt takes care of it automatically.

Don't forget to reload the sbt configuration now:

1. Hit enter to abort the `~fastOptJS` command
2. Type `reload`
3. Start `~fastOptJS` again

Again, make sure to update your IDE project files if you are using a plugin.

### Using jQuery

In `TutorialApp.scala`, remove the imports for the DOM, and add the import for jQuery:

{% highlight scala %}
import org.scalajs.jquery.jQuery
{% endhighlight %}

This allows you to easily access the `jQuery` object (usually referred to as `$` in JavaScript) in your code.

We can now remove `appendPar` and replace all calls to it by the simple:

{% highlight scala %}
jQuery("body").append("<p>[message]</p>")
{% endhighlight %}

Where `[message]` is the string originally passed to `appendPar`.

If you try to reload your webpage now, it will not work (typically a `TypeError` would be reported in the console). The problem is that we haven't included the jQuery library itself, which is a plain JavaScript library.

### Adding JavaScript libraries

An option is to include `jquery.js` from an external source, such as [jsDelivr](http://www.jsdelivr.com/).

{% highlight html %}
<script type="text/javascript" src="http://cdn.jsdelivr.net/jquery/2.1.1/jquery.js"></script>
{% endhighlight %}

This can easily become very cumbersome, if you depend on multiple libraries. The Scala.js sbt plugin provides a mechanism for libraries to declare the plain JavaScript libraries they depend on and bundle them in single file. All you have to do is activate this and then include the file.

In your `build.sbt`, set:

{% highlight scala %}
    skip in ScalaJSKeys.packageJSDependencies := false
{% endhighlight %}

As an alternative to prefixing with `ScalaJSKeys`, you may import all its members (`import ScalaJSKeys._`). Most of the documentation omits the `ScalaJSKeys` prefix for brevity.

After reloading and rerunning `fastOptJS`, this will create `scala-js-tutorial-jsdeps.js` containing all JavaScript libraries next to the main JavaScript file. We can then simply include this file and don't need to worry about JavaScript libraries anymore:

{% highlight html %}
<!-- Include JavaScript dependencies -->
<script type="text/javascript" src="./target/scala-2.11/scala-js-tutorial-jsdeps.js"></script>
{% endhighlight %}

### Setup UI in Scala.js

We still want to get rid of the `onclick` attribute of our `<button>`. After removing the attribute, we add the `setupUI` method, in which we use jQuery to add an event handler to the button. We also move the "Hello World" message into this function.

{% highlight scala %}
def setupUI(): Unit = {
  jQuery("#click-me-button").click(addClickedMessage _)
  jQuery("body").append("<p>Hello World</p>")
}
{% endhighlight %}

Since we do not call `addClickedMessage` from plain JavaScript anymore, we can remove the `@JSExport` annotation (and the corresponding import).

Finally, we add a last call to `jQuery` in the main method, in order to execute `setupUI`, once the DOM is loaded:

{% highlight scala %}
def main(): Unit = {
  jQuery(setupUI _)
}
{% endhighlight %}

Again, since we are not calling `setupUI` directly from plain JavaScript, we do not need to export it (even though jQuery will call it).

We now have an application whose UI is completely setup from within Scala.js. The next step will show how we can test this application.

## <a name="testing"></a> Step 6: Testing

In this section we will show how such an application can be tested using [uTest](http://github.com/lihaoyi/utest), a tiny testing framework which compiles to both Scala.js and Scala JVM. As a note aside, this framework is also a good choice to test libraries that cross compile. See our [cross compiliation guide](./sbt/cross-building.html) for details.

### Supporting the DOM

Before we start writing tests which we will be able to run through the sbt console, we first have to solve another issue. Remember the task `run`? If you try to invoke it now, you will see something like this:

    > run
    [info] Running tutorial.webapp.TutorialApp
    org.mozilla.javascript.EcmaError: ReferenceError: "window" is not defined. (/home/ts/.ivy2/cache/org.webjars/jquery/jars/jquery-1.10.2.jar#META-INF/resources/webjars/jquery/1.10.2/jquery.js#14)
    (...)
    [trace] Stack trace suppressed: run last compile:run for the full output.
    [error] (compile:run) Exception while running JS code: ReferenceError: "window" is not defined. (/home/ts/.ivy2/cache/org.webjars/jquery/jars/jquery-1.10.2.jar#META-INF/resources/webjars/jquery/1.10.2/jquery.js#14)
    [error] (...)

What basically happens here, is that jQuery (yes, it is included automatically) tries to access the `window` object of the DOM, which doesn't exist by default in the Rhino runner. To make the DOM available in Rhino, add the following to your `build.sbt`:

{% highlight scala %}
ScalaJSKeys.jsDependencies += scala.scalajs.sbtplugin.RuntimeDOM
{% endhighlight %}

After reloading, you can invoke `run` successfully:

    > run
    [info] Running tutorial.webapp.TutorialApp
    [success] (...)

Just like other library dependencies, this setting applies transitively: if you depend on a library that depends on the DOM, the you depend on the DOM as well.

### Running with Node.js or PhantomJS

This step is optional and requires installing PhantomJS. You may skip it if you like.

You can run your Scala.js code after the fast-optimization stage using [Node.js](http://nodejs.org/) or [PhantomJS](http://phantomjs.org/). The sbt plugin defaults to Node.js and only runs PhantomJS if the project depends on `RuntimeDOM`. Note that you need to install Node.js and/or PhantomJS separately for this to work (also see the note about running [Node.js on Ubuntu](./sbt/js-envs.html#node-on-ubuntu)).

After installing [PhantomJS](http://phantomjs.org/), you can invoke:

    > fastOptStage::run
    [info] Running tutorial.webapp.TutorialApp
    [success] (...)

If you remember the `last` command from the beginning, you can use it to check that we are actually running PhantomJS:

    > last
    (...)
    [debug] with JSEnv of type class scala.scalajs.sbtplugin.env.phantomjs.PhantomJSEnv
    [debug] with classpath of type class scala.scalajs.tools.classpath.CompleteCIClasspath$SimpleCompleteCIClasspath
    [debug] PhantomJS using webpage launcher at: /tmp/phantomjs-launcher-webpage2065180431563237581.html
    [success] (...)

This even shows you the temporary webpage the plugin generates to launch PhantomJS. This can be useful for debugging.

### Adding uTest

According to the [explanation in uTest's readme](http://github.com/lihaoyi/utest#scalajs-and-sbt), we add the following to our `build.sbt`:

{% highlight scala %}
utest.jsrunner.Plugin.utestJsSettings
{% endhighlight %}

And the following to our `project/plugins.sbt`:

{% highlight scala %}
addSbtPlugin("com.lihaoyi" % "utest-js-plugin" % "0.2.3")
{% endhighlight %}

We are now ready to add a first simple test suite (`src/test/scala/tutorial/webapp/TutorialTest.scala`):

{% highlight scala %}
package tutorial.webapp

import utest._

import org.scalajs.jquery.jQuery

object TutorialTest extends TestSuite {

  // Initialize App
  TutorialApp.setupUI()

  def tests = TestSuite {
    'HelloWorld {
      assert(jQuery("p:contains('Hello World')").length == 1)
    }
  }
}
{% endhighlight %}

This test uses jQuery to verify that our page contains exactly one `<p>` element which contains the text "Hello World" after the UI has been set up.

To run this test, simply invoke the `test` task:

    > test
    [info] Compiling 1 Scala source to (...)/scalajs-tutorial/target/scala-2.11/test-classes...
    [info] 1/2     tutorial.webapp.TutorialTest.HelloWorld		Success
    [info] 2/2     tutorial.webapp.TutorialTest		Success
    [info] -----------------------------------Results-----------------------------------
    [info] tutorial.webapp.TutorialTest		Success
    [info]     HelloWorld		Success
    [info] Failures:
    [info]
    [info] Tests: 2
    [info] Passed: 2
    [info] Failed: 0
    [success] (...)

We have successfully created a simple test. Note that just like for `run`, you can run `fastOptStage::test`. Of course you'll need PhantomJS installed. It is possible that you see some warnings from the fast-optimizer, these come from uTest: It references Java classes which do not exist in Scala.js (mainly concurrency related).

### A more complex test

We also would like to test the functionality of our button. For this we face another small issue: The button doesn't exist when testing, since the tests start with an empty DOM tree. To solve this, we create the button in the `setupUI` method and remove it from the HTML:

{% highlight scala %}
jQuery("""<button type="button">Click me!</button>""")
  .click(addClickedMessage _)
  .appendTo(jQuery("body"))
{% endhighlight %}

This brings another unexpected advantage: We don't need to give it an ID anymore but can directly use the jQuery object to install the on-click handler.

We now define the `ButtonClick` test just below the `HelloWorld` test:

{% highlight scala %}
'ButtonClick {
  def messageCount =
    jQuery("p:contains('You clicked the button!')").length

  val button = jQuery("button:contains('Click me!')")
  assert(button.length == 1)
  assert(messageCount == 0)

  for (c <- 1 to 5) {
    button.click()
    assert(messageCount == c)
  }
}
{% endhighlight %}

After defining a helper method that counts the number of messages, we retrieve the button from the DOM and verify we have exactly one button and no messages. In the loop, we simulate a click on the button and then verify that the number of messages has increased.

You can now call the `test` task again:

    > test
    [info] Compiling 1 Scala source to (...)/scalajs-tutorial/target/scala-2.11/test-classes...
    [info] 1/3     tutorial.webapp.TutorialTest.HelloWorld		Success
    [info] 2/3     tutorial.webapp.TutorialTest.ButtonClick		Success
    [info] 3/3     tutorial.webapp.TutorialTest		Success
    [info] -----------------------------------Results-----------------------------------
    [info] tutorial.webapp.TutorialTest		Success
    [info]     HelloWorld		Success
    [info]     ButtonClick		Success
    [info] Failures:
    [info]
    [info] Tests: 3
    [info] Passed: 3
    [info] Failed: 0
    [success] (...)

This completes the testing part of this tutorial.

## <a name="optimizing"></a> Step 7: Optimizing for Production

Here we show a couple of things you might want to do when you promote your application to production.

### Full Optimization

Size is critical for JavaScript code on the web. To compress the compiled code even further, the Scala.js sbt plugin uses the advanced optimizations of the [Google Closure Compiler](http://developers.google.com/closure/compiler/). To run full optimizations, simply use the `fullOptJS` task:

    > fullOptJS
    [info] Optimizing (...)/scala-js-tutorial/target/scala-2.11/scala-js-tutorial-opt.js
    [info] Closure: 0 error(s), 0 warning(s)
    [success] (...)

Note that this can take a while on a larger project (tens of seconds) we do therefore not recommend to use `fullOptJS` during development. If you have used the `fastOptStage` before, there is an equivalent `fullOptStage` to run code after full optimization.

### Automatically Creating a Launcher

Before creating another HTML file which includes the fully optimized JavaScript, we are going to introduce another feature of the sbt plugin. Since the sbt plugin is able to detect the `JSApp` object of the application, there is no need to repeat this in the HTML file. If you add the following setting to your `build.sbt`, sbt will create a `scala-js-tutorial-launcher.js` file which calls the main method:

{% highlight scala %}
ScalaJSKeys.persistLauncher in Compile := true
ScalaJSKeys.persistLauncher in Test := false
{% endhighlight %}

We set `persistLauncher` to false for testing, since we do not have an application to run. In our HTML page, we can now include this file instead of the manual launcher:

{% highlight html %}
<!-- Run JSApp -->
<script type="text/javascript" src="./target/scala-2.11/scala-js-tutorial-launcher.js"></script>
{% endhighlight %}

If we rename our `JSApp` object, we need not change our HTML at all anymore. Note that the launcher generation only works if you have a single `JSApp` object. If you happen to have multiple `JSApp` objects but still would like to generate a launcher, you can set the `JSApp` object explicitly. Have a look at the [Compiling, Running, Linking, Optimizing](./sbt/run.html) guide for more details.

### Putting it all Together

We can now create our final production HTML file `scalajs-tutorial.html` which includes the fully optimized code:

{% highlight html %}
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>The Scala.js Tutorial</title>
  </head>
  <body>
    <!-- Include JavaScript dependencies -->
    <script type="text/javascript" src="./target/scala-2.11/scala-js-tutorial-jsdeps.js"></script>
    <!-- Include Scala.js compiled code -->
    <script type="text/javascript" src="./target/scala-2.11/scala-js-tutorial-opt.js"></script>
    <!-- Run main object -->
    <script type="text/javascript" src="./target/scala-2.11/scala-js-tutorial-launcher.js"></script>
  </body>
</html>
{% endhighlight %}

This completes the Scala.js tutorial. Refer to our [documentation page](./index.html) for deeper insights into various aspects of Scala.js.
