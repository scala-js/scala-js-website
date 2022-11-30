---
layout: doc
title: Getting Started with Scala.js, Vite, Laminar and ScalablyTyped
---

This series of tutorials teaches you how to use Scala.js together with modern development tools.

1. [Scala.js and Vite](./scalajs-vite.html):
  * Set up a hello world project ready for live reloading in the browser.
  * Generate minimized production assets.
2. [Laminar and ScalablyTyped](./laminar-scalablytyped.html):
  * Build UIs with Laminar using Function Reactive Programming (FRP), a hybrid model between imperative and functional programming particularly well suited for UI development in Scala.
  * Integrate JavaScript libraries using ScalablyTyped.

If you have time, reading and applying them in order will give you more in-depth knowledge about the development environment.

If you are in a hurry, you can skip the ones you are not interested in.
Each tutorial starts with a link to a repo that you can clone to get off the ground.

In any case, make sure that you have the Prerequisites listed below covered.

## Prerequisites

In any case, make sure that you have the following tools installed first:

* [Scala and its development tools](https://www.scala-lang.org/download/)
* [Node.js](https://nodejs.org/en/download/)

If in doubt, try the following commands in a terminal.
They should all succeed, though the reported version numbers may differ.

{% highlight shell %}
$ node -v
v16.13.0
$ npm -v
8.1.0
$ sbt -version
sbt version in this project: 1.7.3
sbt script version: 1.7.3
{% endhighlight %}

We also recommend that you use an IDE for Scala.
If you do not know what to pick, we recommend [VS Code](https://code.visualstudio.com/download/) with [the Metals extension](https://scalameta.org/metals/docs/editors/vscode/).
