---
layout: page
title: Frequently Asked Questions
---
{% include JB/setup %}

### How to structure a .sbt build to cross-compile with Scala and Scala.js?

The best way to do this is two have two sbt projects, with two different base
directories, that share their source directory. This is easily done with the
`sourceDirectory` setting of sbt.

{% highlight scala %}
lazy val core = project

lazy val corejs = project.settings(
    scalaJSSettings:_*
).settings(
    sourceDirectory := (sourceDirectory in core).value
)
{% endhighlight %}

### Can I use macros with Scala.js? What about compiler plugins?

Yes, you can. Just make sure that project containing the macro definitions is
compiled with the regular Scala, not Scala.js. Then your normal project can
depend on the macro project, and be compiled with Scala.js.

The same applies to compiler plugins.

### Where can I find an example of non trivial Scala.js project?

I suggest my own personal project
[FunLabyrinthe](https://github.com/sjrd/funlabyrinthe-scala).
It features a number of non trivial setups with Scala.js:

*   Multiple projects, some being cross-compiled between Scala and Scala.js,
    some being specific to one platform
*   Macros
*   Compiler plugins (currently only the continuations plugin, but there's
    going to be a custom one too at some point)

You can also take a look at these projects [built with Scala.js](../#built_with_scalajs).

### Have you considered targeting [asm.js](http://asmjs.org/)? Would it help?

asm.js would not help in implementing Scala.js.

asm.js was designed as a target for C-like languages, that consider the memory
as a huge array of bytes, and with manual memory management. By their own
acknowledgment (see [their FAQ](http://asmjs.org/faq.html)), it is not a good
target for managed languages like Scala.
