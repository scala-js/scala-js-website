---
layout: page
title: Accesing the JavaScript global scope
---
{% include JB/setup %}

## Problem

You need to access the JavaScript global scope from Scala.js, in order to call functions like `alert`, `prompt`, `console`, etc.

## Solution

What we need is the `global` value, which is a "view" of the JavaScript global scope.

It can be imported like this:

    import scala.scalajs.js.Dynamic.global

Alternatively, you can import it like this:

    import scala.scalajs.js
    import js.Dynamic.{ global => g }

The latter might be more convenient way, since it imports the whole `js` package and renames `global` to something more easy to use (just `g`).

Now let's issue an alert from Scala. Import the global scope and add this to your main class:

    def main(): Unit = {
      g.alert("Hello from Scala")
    }

After re-compiling and re-loading the host page, you should see the corresponding browser alert.

Let's write something to the JavaScript console. Change your main class to look like this:

    def main(): Unit = {
      g.console.log("Logged a message from Scala")
    }

Re-compile and re-load. If you open your JavaScript console, you should see the message.