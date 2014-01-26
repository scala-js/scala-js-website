---
layout: page
title: Creating a Scala.js project with giter8
---
{% include JB/setup %}

## Problem

You want to get started quickly with Scala.js from some existing pre-configured project, where you can specify custom names for packages and classes.

## Solution

Install [giter8](https://github.com/n8han/giter8) and use the [template for Scala.js](https://github.com/sebnozzi/scala-js.g8) projects.

What is giter8?

> "Giter8 is a command line tool to generate files and directories from templates published on github or any other git repository"

Using the [giter8 template](https://github.com/sebnozzi/scala-js.g8) you can easily generate a [Scala.js](http://www.scala-js.org/) project where this is set-up automatically for you:

* a custom **name**
* a custom **package structure**

It saves you the work of having to [manually update](./customize-app.html) the directory structure, Scala classes, HTML and JavaScript files.

### Installation

#### Installing giter8

To install giter8 for the first time, follow the [installation instructions](https://github.com/n8han/giter8#installation) on the official page.

If you _already_ have giter8 installed, but it's from before **17th Jan 2014**, you need to **upgrade** (if in doubt, upgrade).

First, clean-up the [conscript](https://github.com/n8han/conscript) cache with:

    cs --clean-boot

Afterwards, re-install giter8 with:

    cs n8han/giter8

### Usage

#### Creating Scala.js projects

From the command line, run:

    g8 sebnozzi/scala-js.g8

(Note that this schema refers to the [project on github](https://github.com/sebnozzi/scala-js.g8))

You will be asked for:

1. Version,
1. Organization and
1. Name

of your project.

After enter the requested information your project structure will be created (note that in the example above the version was left blank and thus default value was taken).

Sample session:

    # g8 sebnozzi/scala-js.g8
    
    Scala.js Project 
    
    version [0.1-SNAPSHOT]:
    organization [org.example]: com.sebnozzi
    name [ScalaJS Example]: My Cool Project
    
    Template applied in ./my-cool-project
        
    # cd my-cool-project
    # sbt

You can now use you Scala.js project as expected: `packageJS`, `test`, `optimizeJS` should all work from SBT.