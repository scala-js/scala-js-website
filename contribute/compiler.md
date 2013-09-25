---
layout: page
title: Compiler
---
{% include JB/setup %}

Contributions to the compiler itself require a bit of knowledge about
compiler construction, and not being afraid of diving into the Scala compiler
itself. This is the hard-core stuff.

The compiler is basically complete, now. The only thing that is remaining, as
far as I can tell, is:

*   Implementation of `Long` that supports the 64 bits they are supposed to
    support. I recommend mimicking the way
    [GWT](https://developers.google.com/web-toolkit/), which is basically
    an object with 3 fields, and then methods that operate on them to
    implement the arithmetic operations.
