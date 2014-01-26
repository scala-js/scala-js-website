---
layout: page
title: Cookbook
---
{% include JB/setup %}

# Project Setup

* Creating a Scala.js project from scratch
* Creating a Scala.js project from the example application
* Customizing the example application
* Creating a Scala.js project from the giter8 template
* Including 3rd party JavaScript libraries
* Including the DOM wrapper
* Including the jQuery wrapper
* Setting up a multi-module project

# Development Tasks

* Enabling incremental compilation
* Setting breakpoints on the browser
* Logging on the browser
* Using 3rd party JavaScript libraries
* Generating production / optimized code
* Troubleshooting Google's Closure compiler optimizations

# JavaScript Interop

* Overview of js.Scala types
* Understanding the implicit conversions

## Calling JavaScript from Scala

* [Accessing the JavaScript global scope](./interop/accessing-global-scope.html)
* [Passing basic types to JavaScript](./interop/passing-basic-types.html)
* Passing collections to JavaScript
* Passing anonymous functions to JavaScript
* Constructing JavaScript object-literals
* Dealing with JavaScript return values

## Calling Scala from JavaScript

* Scala.js calling convention
* Finding Scala object instances
* Passing basic JavaScript types to Scala
* Passing JavaScript collections to Scala
* Passing JavaScript functions to Scala
* Passing JavaScript object-literals to Scala
* Dealing with Scala return values

## Writing type-safe wrappers

* Wrapping JavaScript with traits
* Returning the same type (via `this.type`)
* Mapping variable parameters
* Mapping JavaScript's "new"

# jQuery

* Accessing the global jQuery object
* Registering to UI events
* Performing DOM queries
* Manipulating the DOM
* Performing AJAX calls
* Using jQuery UI

# Testing

* Set-up project for testing
* Writing Jasmine tests
* Testing non-UI code
* Testing UI functionality
