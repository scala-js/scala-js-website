---
layout: page
title: Passing basic types to JavaScript
---
{% include JB/setup %}

## Problem

You need to pass simple types (String, Int, Boolean) to JavaScript functions.

## Solution

Let us illustrate the case by writing some functions on the host-page.

Edit `index-dev.html` and add the following function:

    function happyNew(name, year) {
      alert("Hey " + name + ", happy new " + year + "!");
    }

As we saw in the recipe of [accessing the global scope][1], we need to make the following import:

    import scala.scalajs.js
    import js.Dynamic.{ global => g }

Now on the Scala side you can call it like this:

    def main(): Unit = {
      g.happyNew("Martin", 2014)
    }

Which will result in the values being used and the corresponding alert being shown.

 [1]: ./accessing-global-scope.html