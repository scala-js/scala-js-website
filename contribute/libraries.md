---
layout: page
title: Libraries for Scala.js
---
{% include JB/setup %}

## Lightweight collection library

Scala has a very powerful, yet very heavy, collection library. Scala.js could
use a lightweight version of that library, with a subset of the collections,
maybe a subset of methods.

What is kept, however, should be available through the same interface, to have
any hope of sharing code between client and server.

## UI library

UI programming is hard. UI programming in a browser is very hard. Several
libraries exist for JavaScript. Scala.js can of course directly use theses
libraries out of the box, thanks to its great interoperability, but it is
likely possible to come up with some DSL on top of these that would better
leverage the Scala language.

## Networking and Websockets

Again, websockets can be used out of the box. But a more Scala-like library
might be implemented on top of them.

In the long term, we would want Akka to work in Scala.js, so that server and
client could communicate through the same API.
