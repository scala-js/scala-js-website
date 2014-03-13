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

After having imported the project to your IDE, rename the package `example`
(in "main" and in "test") to `com.mycompany.mycoolproject`. In the end, the
directory structure should match this:

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

Make sure that you rename both files and classes, as in Scala they do not need
to match.

Also watch out for the test class, since it references (imports) the main class.
If your IDE did not pick up the rename, you will have to fix it yourself:

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

The HTML files `index-dev.html`, `index-preopt.html` and `index.html` are used
to "host" the Scala.js application. They load the generated JavaScript files,
which the SBT plugin generates somewhere under `target`, then fire up the
`main()` method.

Since the generated file names correspond to the SBT-project's name (which we
renamed), the HTML files need to be updated.

In `index-dev.html` you need to change:

1. `example-extdeps.js` to `my-cool-project-extdeps.js`
2. `example-intdeps.js` to `my-cool-project-intdeps.js`
3. `example.js` to `my-cool-project.js`

In `index-preopt.html`:

1. `example-preopt.js` to `my-cool-project-preopt.js`

And in `index.html`:

1. `example-opt.js` to `my-cool-project-opt.js`

Also, in all three HTML files, the inline script must call the new object:

{% highlight html %}
<script type="text/javascript">
MyCoolProject().main();
</script>
{% endhighlight %}
