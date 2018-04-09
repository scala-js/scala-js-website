---
layout: doc
title: Handling Exceptions
---

Both Scala and JavaScript feature exception handling, but Scala only allows
instances of Throwable to be thrown/caught (which is enforced by the type
checker). JavaScript can throw/catch any type of value.

To reconcile the two worlds, Scala.js lifts all exceptions that are not
instances of Throwable inside js.JavaScriptException.  This lifting works both
ways.

Throwing an exception from Scala.js:

* Scala.js throws an instance of `js.JavaScriptException` -> JS catches the wrapped value
* Scala.js throws an instance of `Throwable` -> JS catches it as is

Throwing an exception from JS:

* JS throws an instance of Scala.js' `Throwable` -> Scala.js catches it as is
* JS throws something else -> Scala.js catches it wrapped in a `js.JavaScriptException`
