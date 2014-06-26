---
layout: page
title: Frequently Asked Questions
---
{% include JB/setup %}

### How to structure a .sbt build to cross-compile with Scala and Scala.js?

The best way to do this is to have two sbt projects, with two different base
directories that share a common source directory. This is easily done with the
`sourceDirectory` or the `unmanagedSourceDirectories` setting of sbt.

Please follow our [cross-building guide](./sbt/cross-building.html) for details.

### Can I use macros with Scala.js? What about compiler plugins?

Yes, you can. There is nothing specific to Scala.js here.

### Where can I find an example of non trivial Scala.js project?

Have a look at these projects [built with Scala.js](../#built_with_scalajs).

### Have you considered targeting [asm.js](http://asmjs.org/)? Would it help?

asm.js would not help in implementing Scala.js.

asm.js was designed as a target for C-like languages, that consider the memory
as a huge array of bytes, and with manual memory management. By their own
acknowledgment (see [their FAQ](http://asmjs.org/faq.html)), it is not a good
target for managed languages like Scala.

### My `jsDependencies` do not work / are not included when running / testing in `fastOptStage` and `fullOptStage`

Some JavaScript libraries alter their behavior when included, depending on the including environment (Browser, CommonJS, RequireJS, Node.js, etc.). Since the inclusion semantics of the Scala.js sbt plugin corresponds to a `<script>` tag in an HTML page, this behavior may make the inclusion fail on [Node.js](http://nodejs.org/) (which is the default JavaScript VM for `fastOptStage` and `fullOptStage`).

We currently do not know how to fix this behavior, so the "official fix" is to use [PhantomJS](http://phantomjs.org/) instead by setting

     postLinkJSEnv := new scala.scalajs.sbtplugin.env.phantomjs.PhantomJSEnv

in the concerned build files (of course you will also need to [install PhantomJS](http://phantomjs.org/download.html)).

JavaScript libraries which are known to be affected by this are:

- [`mustache.js`](https://github.com/janl/mustache.js)

We keep track of this issue in [#706](https://github.com/scala-js/scala-js/issues/706). You are encouraged to comment and contribute if you know something more about this or if the JavaScript library you use is affected by this.
