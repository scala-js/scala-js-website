---
layout: doc
title: Getting Started with Scala.js and Vite
---

In this first tutorial, we learn how to get started with Scala.js and [Vite](https://vitejs.dev/).
We use Vite to provide live-reloading of the Scala.js application in the browser for development.
We also configure it to build a minimal bundle for production.

Going through this tutorial will make sure you understand the basic building blocks.
If you prefer to skip this step and directly write Scala.js code, you may jump to [Getting Started with Scala.js and Laminar](./laminar-scalablytyped.html).

If you prefer to navigate the end result for this tutorial directly, checkout [the scalajs-vite-end-state branch](https://github.com/sjrd/scalajs-sbt-vite-laminar-chartjs-example/tree/scalajs-vite-end-state) instead of creating everything from scratch.

## Prerequisites

Make sure to install [the prerequisites](./index.html#prerequisites) before continuing further.

## Vite template

We bootstrap our setup using the vanilla Vite template.
Navigate to a directory where you store projects, and run the command

{% highlight shell %}
$ npm create vite@3.2.1
{% endhighlight %}

Choose a project name (we choose `livechart`).
Select the "Vanilla" framework and the "JavaScript" variant.
Our output gives:

{% highlight shell %}
$ npm create vite@3.2.1
Need to install the following packages:
  create-vite@3.2.1
Ok to proceed? (y)
✔ Project name: … livechart
✔ Select a framework: › Vanilla
✔ Select a variant: › JavaScript

Scaffolding project in .../livechart...

Done. Now run:

  cd livechart
  npm install
  npm run dev
{% endhighlight %}

As instructed, we follow up with

{% highlight shell %}
$ cd livechart
$ npm install
[...]
$ npm run dev

  VITE v3.2.3  ready in 135 ms

  ➜  Local:   http://127.0.0.1:5173/
  ➜  Network: use --host to expose
{% endhighlight %}

Open the provided URL to see the running JavaScript-based hello world.

### Exploring the template

In the generated folder, we find the following relevant files:

* `index.html`: the main web page; it contains a `<script type=module src="main.js">` referencing the main JavaScript entry point.
* `main.js`: the main JavaScript entry point; it sets up some DOM elements, and sets up a counter for a button.
* `counter.js`: it implements a counter functionality for a button.
* `package.json`: the config file for `npm`, the JavaScript package manager and build orchestrator.

Remarkably, there is no `vite.config.js` file, which would be the configuration for Vite itself.
Vite gives a decent experience out of the box, without any configuration.

### Live changes

One of the main selling points of Vite is its ability to automatically refresh the browser upon file changes.
Open the file `main.js` and change the content of the `<h1>` element:

{% highlight diff %}
     <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
       <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
     </a>
-    <h1>Hello Vite!</h1>
+    <h1>Hello Scala.js!</h1>
     <div class="card">
       <button id="counter" type="button"></button>
     </div>
{% endhighlight %}

Observe that the page automatically and instantaneously refreshes to show the changes.

## Introducing Scala.js

We use [sbt](https://www.scala-sbt.org/) as a build tool for Scala and Scala.js.
We set it up as follows.

In the subdirectory `livechart/project/`, we add two files: `build.properties` and `plugins.sbt`.

* `project/build.properties`: set the version of sbt

{% highlight plaintext %}
sbt.version=1.8.0
{% endhighlight %}

* `project/plugins.sbt`: declare sbt plugins; in this case, only sbt-scalajs

{% highlight scala %}
addSbtPlugin("org.scala-js" % "sbt-scalajs" % "1.12.0")
{% endhighlight %}

At the root of our `livechart/` project, we add one file: `build.sbt`.

* `build.sbt`: the main sbt build

{% highlight scala %}
import org.scalajs.linker.interface.ModuleSplitStyle

lazy val livechart = project.in(file("."))
  .enablePlugins(ScalaJSPlugin) // Enable the Scala.js plugin in this project
  .settings(
    scalaVersion := "3.2.1",

    // Tell Scala.js that this is an application with a main method
    scalaJSUseMainModuleInitializer := true,

    /* Configure Scala.js to emit modules in the optimal way to
     * connect to Vite's incremental reload.
     * - emit ECMAScript modules
     * - emit as many small modules as possible for classes in the "livechart" package
     * - emit as few (large) modules as possible for all other classes
     *   (in particular, for the standard library)
     */
    scalaJSLinkerConfig ~= {
      _.withModuleKind(ModuleKind.ESModule)
        .withModuleSplitStyle(
          ModuleSplitStyle.SmallModulesFor(List("livechart")))
    },

    /* Depend on the scalajs-dom library.
     * It provides static types for the browser DOM APIs.
     */
    libraryDependencies += "org.scala-js" %%% "scalajs-dom" % "2.2.0",
  )
{% endhighlight %}

Finally, we write the following content in the file `src/main/scala/livechart/LiveChart.scala`:

{% highlight scala %}
package livechart

import scala.scalajs.js
import scala.scalajs.js.annotation.*

import org.scalajs.dom

// import javascriptLogo from "/javascript.svg"
@js.native @JSImport("/javascript.svg", JSImport.Default)
val javascriptLogo: String = js.native

@main
def LiveChart(): Unit =
  dom.document.querySelector("#app").innerHTML = s"""
    <div>
      <a href="https://vitejs.dev" target="_blank">
        <img src="/vite.svg" class="logo" alt="Vite logo" />
      </a>
      <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
        <img src="$javascriptLogo" class="logo vanilla" alt="JavaScript logo" />
      </a>
      <h1>Hello Scala.js!</h1>
      <div class="card">
        <button id="counter" type="button"></button>
      </div>
      <p class="read-the-docs">
        Click on the Vite logo to learn more
      </p>
    </div>
  """

  setupCounter(dom.document.getElementById("counter"))
end LiveChart

def setupCounter(element: dom.Element): Unit =
  var counter = 0

  def setCounter(count: Int): Unit =
    counter = count
    element.innerHTML = s"count is $counter"

  element.addEventListener("click", e => setCounter(counter + 1))
  setCounter(0)
end setupCounter
{% endhighlight %}

Note that the above is not idiomatic Scala, but rather a direct translation of the Vite template code into Scala.js.
We will see in the next tutorial how to use Laminar to write it more idiomatically.

For the most part, the Scala.js version uses straightforward Scala syntax corresponding to the original JavaScript code.
The definition of `javascriptLogo` deserves some explanation.

We translated it from the JavaScript import

{% highlight javascript %}
import javascriptLogo from "/javascript.svg"
{% endhighlight %}

which is actually a shorthand for

{% highlight javascript %}
import { default as javascriptLogo } from "/javascript.svg"
{% endhighlight %}

Many bundlers, Vite included, treat `import`s with asset files such as `.svg` as pseudo-modules whose `default` import is the *file path* to the corresponding asset in the processed bundle.
Further down, we use it as the value for the `src` attribute an `<img>` tag.
Read more about this mechanism [in the Vite documentation on static asset handling](https://vitejs.dev/guide/assets.html).

The translation in Scala.js reads as

{% highlight scala %}
@js.native @JSImport("/javascript.svg", JSImport.Default)
val javascriptLogo: String = js.native
{% endhighlight %}

The `@js.native` annotation tells Scala.js that `javascriptLogo` is provided externally by JavaScript.
The `@JSImport("/javascript.svg", JSImport.Default)` is the translation of the `default` import from the `/javascript.svg` pseudo-module.
Since it represents a file path, we declare `javascriptLogo` as a `String`.

The `= js.native` is a Scala.js idiosyncrasy: we need a concrete value to satisfy the Scala typechecker.
In an ideal world, it would not be required.

We can now build the Scala.js project by opening a new console, and entering sbt:

{% highlight shell %}
$ sbt
[...]
sbt:livechart> ~fastLinkJS
{% endhighlight %}

The `fastLinkJS` task produces the `.js` outputs from the Scala.js command.
The `~` prefix instructs sbt to re-run that task every time a source file changes.

There is one thing left to change: replace the hand-written JavaScript code with our Scala.js application.
Open the file `main.js`, remove almost everything to leave only the following two lines:

{% highlight javascript %}
import './style.css'
import './target/scala-3.2.1/livechart-fastopt/main.js'
{% endhighlight %}

If you had not stopped the `npm run dev` process with Vite, Vite will immediately pick up the changes and refresh the browser with our updated "Hello Scala.js!" message.

## Live changes with Scala.js

Earlier, we noticed how changing the JavaScript files caused Vite to immediately refresh the browser.
Is that also the case if we change the Scala source files?

Indeed it is.
Let us change the message to

{% highlight diff %}
       <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
         <img src="/javascript.svg" class="logo vanilla" alt="JavaScript logo" />
       </a>
-      <h1>Hello Scala.js!</h1>
+      <h1>Hello Scala.js and Vite!</h1>
       <div class="card">
         <button id="counter" type="button"></button>
       </div>
{% endhighlight %}

Once we save, we notice that the browser refreshes with the updated message.

There are two things happening behind the scenes:

1. The `~fastLinkJS` task in sbt notices that a `.scala` file has changed, and therefore rebuilds the `.js` output.
1. The `npm run dev` process with Vite notices that a `.js` file imported from `/main.js` has changed, and triggers a refresh with the updated files.

All these steps are *incremental*.
When we change a single Scala file, only that one gets recompiled by the Scala incremental compiler.
Then, only the affected small `.js` modules produced by `fastLinkJS` are regenerated.
Finally, Vite only reloads those small `.js` files that were touched.
This ensures that the development cycle remains as short as possible.

## Production build

The `fastLinkJS` task of sbt and the `npm run dev` task of Vite are optimized for incremental development.
For production, we want to perform more optimizations on the Scala.js side with `fullLinkJS`, and bundle minimized files with `npm run build`.

For that to work well, we need to conditionally wire the output of `fastLinkJS` (resp. `fullLinkJS`) to the input of Vite when it is in development mode (resp. production mode).
This requires some configuration in Vite.

We create the file `vite.config.js` at the root of our project, with the following content:

{% highlight javascript %}
import { spawnSync } from "child_process";
import { defineConfig } from "vite";

// Detect whether Vite runs in development or production mode
function isDev() {
  return process.env.NODE_ENV !== "production";
}

// Utility to invoke a given sbt task and fetch its output
function printSbtTask(task) {
  const args = ["--error", "--batch", `print ${task}`];
  const options = {
    stdio: [
      "pipe", // StdIn
      "pipe", // StdOut
      "inherit", // StdErr
    ],
  };
  const result = process.platform === 'win32'
    ? spawnSync("sbt.bat", args.map(x => `"${x}"`), {shell: true, ...options})
    : spawnSync("sbt", args, options);

  if (result.error)
    throw result.error;
  if (result.status !== 0)
    throw new Error(`sbt process failed with exit code ${result.status}`);
  return result.stdout.toString('utf8').trim();
}

// Get the output of fastLinkJS or fullLinkJS depending on isDev()
const scalaJSOutputTask = isDev() ? "fastLinkJSOutput" : "fullLinkJSOutput";
const scalaJSOutput = printSbtTask(scalaJSOutputTask);

// Tell Vite to replace references to `@scalaJSOutput` by the path computed above
export default defineConfig({
  resolve: {
    alias: [
      {
        find: "@scalaJSOutput",
        replacement: scalaJSOutput,
      },
    ],
  },
});
{% endhighlight %}

While this may look scary, most of the complexity is concentrated into `printSbtTask`.
That utility invokes a third-party process (sbt) in a platform-independent way (in particular, for Windows) and retrieves its `stdout` output.
Other than that, we are doing two things:

1. Depending on `process.env.NODE_ENV`, we retrieve the output of the sbt task `fastLinkJSOutput` or `fullLinkJSOutput`.
   These tasks return the output directory of `fastLinkJS` and `fullLinkJS`, respectively.
2. We tell Vite to replace references to `@scalaJSOutput` by the retrieved path.

We then amend the top-level `main.js` file to use that new `@scalaJSOutput` variable:

{% highlight javascript %}
import './style.css'
import '@scalaJSOutput/main.js'
{% endhighlight %}

If the `npm run dev` process is still running, Vite will automatically pick up the new configuration and restart its server.

Now, nothing visible has changed, since we still render the development mode.
To build to the production version of our website, we stop Vite with `Ctrl+C` and launch the following instead:

{% highlight shell %}
$ npm run build

> livechart2@0.0.0 build
> vite build

vite v3.2.3 building for production...
✓ 11 modules transformed.
dist/assets/javascript.8dac5379.svg   0.97 KiB
dist/index.html                       0.44 KiB
dist/assets/index.d0964974.css        1.19 KiB / gzip: 0.62 KiB
dist/assets/index.b5e141cb.js         28.67 KiB / gzip: 6.95 KiB
{% endhighlight %}

Since the built website uses an ECMAScript module, we need to serve it through an HTTP server to visualize it.
We use the npm application `http-server` for that purpose, as we can run it without any additional dependency:

{% highlight shell %}
$ cd dist
$ npx http-server
Starting up http-server, serving ./

http-server version: 14.1.1

http-server settings:
CORS: disabled
Cache: 3600 seconds
Connection Timeout: 120 seconds
Directory Listings: visible
AutoIndex: visible
Serve GZIP Files: false
Serve Brotli Files: false
Default File Extension: none

Available on:
  http://127.0.0.1:8080
Hit CTRL-C to stop the server
{% endhighlight %}

Navigate to the mentioned URL to see your website.

## Conclusion

In this tutorial, we saw how to configure Scala.js with Vite from the ground up.
We used sbt as our build tool, but the same effect can be achieved with any other Scala build tool, such as [Mill](https://com-lihaoyi.github.io/mill/) or [scala-cli](https://scala-cli.virtuslab.org/).

Our setup features the following properties:

* Development mode with live reloading: changing Scala source files automatically triggers recompilation and browser refresh.
* Production mode, wired to automatically take the `fullLinkJS` output of Scala.js, and producing a unique `.js` file.

In our [next tutorial about Laminar and ScalablyTyped](./laminar-scalablytyped.html), we will learn how to write UIs in idiomatic Scala code, and how to integrate third-party libraries.
