---
layout: page
title: Threading and Co.
---
{% include JB/setup %}

Scala is famously parallel-aware. JavaScript is single-threaded. What do we
do about that in Scala.js?

The field of exploration is quite large here.

My "work assignment" for this semester (fall 2013) is to design and implement
an actor system for Scala.js, much like Akka, that would be able to communicate
in a (mostly) transparent way with an Akka backend.
