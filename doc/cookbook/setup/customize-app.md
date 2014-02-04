---
layout: page
title: Customizing the example application
---
{% include JB/setup %}

## Problem

You [cloned the example application](./example-app.html), but would like to have custom package and class names.

For this recipe we'll assume that your organization is `com.mycompany` and your project is called `My Cool Project`.

## Solution

### Changing the project name

Edit the `buid.sbt` and change the name to `My Cool Project`:

{% highlight scala %}
name := "My Cool Project"
{% endhighlight %}

### Renaming the packages

Renaming the packages might be easier to accomplish from within an IDE than directly manipulating directories.

In this case you should generate the IDE project first, and then import it (using the SBT plugins for either Eclipse or IntelliJ).

After having imported the project to your IDE, do the following:

1. rename the package `example` (in "main") to `com.mycompany.mycoolproject`
2. rename the package `example.test` (in "test") also to `com.mycompany.mycoolproject`

At the end, the directory structure should match this:

    src/main/scala/com/mycompany/mycoolproject/ScalaJSExample.scala
    src/test/scala/com/mycompany/mycoolproject/ScalaJSExampleTest.scala

And the the Scala classes should refer to the new package:

{% highlight scala %}
package com.mycompany.mycoolproject
{% endhighlight %}

### Renaming the classes

Rename both file-names and classes:

1. from `ScalaJSExample(.scala)` to `MyCoolProject(.scala)`.
2. from `ScalaJSExampleTest(.scala)` to `MyCoolProjectTest(.scala)`.

Make sure that you rename both files and classes, as in Scala they don’t need to match.

Also watch out for the test class, since it references (imports) the main class. If your IDE didn’t pick up the rename, you’ll have to fix it yourself:

{% highlight scala %}
it("should implement square()") {
  import MyCoolProject._
{% endhighlight %}

Lastly, though not critical, it would also be correct to change this line in the test class:

{% highlight scala %}
describe("ScalaJSExample") {
{% endhighlight %}

to:

{% highlight scala %}
describe("MyCoolProject") {
{% endhighlight %}

### Fixing the JavaScript file-references

The HTML files `index-dev.html` and `index.html` are used to "host" the Scala.js application. They load the generated JavaScript files, which the SBT plugin generates somewhere under `target`.

Since the generated file-names correspond to the SBT-project’s name (which we renamed), the HTML files need to be updated.

In `index-dev.html` you need to change:

1. `example-extdeps.js` to `my-cool-project-extdeps.js`
2. `example-intdeps.js` to `my-cool-project-intdeps.js`
3. `example.js` to `my-cool-project.js`

And in `index.html`:

1. `example-opt.js` to `my-cool-project-opt.js`

### Fixing the bootstrap file (startup.js)

There is one last very special file that needs to be updated. Under the directory `js` you’ll find `startup.js`.

This JavaScript file kick-starts the Scala.js application by calling the `main()` method of the main class.

As you might have noticed, nowhere in the HTML files is `startup.js` referenced. Instead, it is referenced in `build.sbt` build-file. When generating code, Scala.js includes the contents of `startup.js` in the resulting JavaScript files.

We need to change both the references to the package and the main class (the method name did not change). The convention to use for the package name is to replace the dots `.` with underscores `_`.

The end-result should look like:

{% highlight javascript %}
ScalaJS.modules.com_mycompany_mycoolproject_MyCoolProject().main();
{% endhighlight %}
