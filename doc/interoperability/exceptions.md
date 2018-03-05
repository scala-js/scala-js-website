---
layout: doc
title: JavaScript types
---

Scala.js can both throw and catch exceptions as you normally would in scala. Scala.js also supports exceptions originating in or being caught by JS.

Scala.js' wrapper, `js.JavasScriptException`, wraps any JS value although it typically wraps a `js.Error`. The wrapper indicates that  special "wrapper" processing should occur during interoperation with JS.

Throwing an exception from Scala.js:
* Scala.js throws an instance of `js.JavaScriptException` -> JS catches the wrapped value
* Scala.js throws something else (which in scala is a `Throwable`) -> JS catches it as is

Throwing an exception from JS:
* JS throws an instance of Scala.js' `Throwable` -> Scala.js catches it as is
* JS throws something else -> Scala.js catches it as wrapped in a `js.JavaScriptException`
