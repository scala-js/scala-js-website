---
layout: doc
title: Performance
---

Scala.js compiler optimizes the generated JavaScript very well, so that you, as a developer, don't have to worry about
your application's performance. It does things like inlining and rewriting iterators as while-loops to get good
performance even with complex Scala code.

## Benchmarks

We test the performance of Scala.js programs with [a large benchmark suite](https://github.com/sjrd/scalajs-benchmarks).
The benchmarks come from the paper [Cross-language compiler benchmarking: Are we fast yet?](https://stefan-marr.de/papers/dls-marr-et-al-cross-language-compiler-benchmarking-are-we-fast-yet/) by S. Marr, B. Daloze, and H. Mössenböck, ported to Scala.

We show here some results from June 2018.
More details can be found in Section 4.5 of the Ph.D. thesis [Cross-Platform Language Design](https://infoscience.epfl.ch/record/256862) by S. Doeraene.

In the following graphs, all bars represent execution time (lower is better) normalized against running on the JVM.
If a benchmark shows an execution time of 2, it means it executed 2x slower in Scala.js than on the JVM.

### In devevelopment mode (fastOpt)

The default `fastOpt` configuration is to use the Scala.js optimizer, and keep strict checks for [the undefined behaviors of Scala.js]({{ site.baseufl }}/doc/semantics.html#undefined-behaviors).
We can see that, in development mode, Scala.js runs between around 0.9x and 6x slower than the JVM, with the majority of benchmarks in the 1.5x to 3x bracket.

<div data-benchmarks="bounce brainfuck cd deltablue gcbench json kmeans list mandelbrot nbody permute richards tracer"
  data-configs="es5.1 dev no-opt no-gcc Node.js;es5.1 dev yes-opt no-gcc Node.js"
  data-confignames="Without optimizer;With optimizer"></div>

### In production mode (fullOpt)

In the `fullOpt` configuration, we remove the checks for undefined behaviors.
Moreover, by default we enable the Google Closure Compiler (GCC) in addition to our own optimizer.

In the first set of benchmarks below, we see a general trend.
GCC tends to improve the run-time performance a bit, but not nearly as much as our own optimizer.
The combination of both is mostly equivalent to just our own optimizer, but the benefits of GCC are mostly about code size.

The only exception is `gcbench`, where our own optimizer does nothing on its own, although GCC significantly improves the performance on its own.
The combination of both optimizers still yields the best performance.

In all cases, when both optimizers are enabled, the Scala.js benchmarks run between 0.9x and 3x slower than the JVM.

<div data-benchmarks="bounce brainfuck cd deltablue gcbench json kmeans list mandelbrot nbody permute richards tracer"
  data-configs="es5.1 prod no-opt no-gcc Node.js;es5.1 prod no-opt yes-gcc Node.js;es5.1 prod yes-opt no-gcc Node.js;es5.1 prod yes-opt yes-gcc Node.js"
  data-confignames="No optimizer, no GCC;No optimizer, with GCC;With optimizer, no GCC;With optimizer and GCC"></div>

### Comparison between fullOpt and hand-written JavaScript

For three benchmarks, we also have the hand-written JavaScript code, coming from the JavaScript Octane benchmark suite.
We compare Scala.js' production mode against the hand-written JavaScript code below.
In the following graph, all execution times are normalized against the hand-written JavaScript code, instead of the JVM.

In the worst case, `deltablue`, fully optimized Scala.js is 1.27x slower than hand-written JavaScript.
In the best case, `tracer`, Scala.js executes in 0.67x the time of hand-written JavaScript, i.e., 33% faster.

<div data-benchmarks="deltablue richards tracer"
  data-configs="es5.1 prod no-opt no-gcc Node.js;es5.1 prod no-opt yes-gcc Node.js;es5.1 prod yes-opt no-gcc Node.js;es5.1 prod yes-opt yes-gcc Node.js;js Node.js"
  data-confignames="No optimizer, no GCC;No optimizer, with GCC;With optimizer, no GCC;With optimizer and GCC;Hand-written JavaScript"
  data-normalize-against="js Node.js" data-y-axis-title="Normalized execution time wrt. hand-written JS"></div>
