---
layout: doc
title: Why Scala.js?
---

JavaScript is the language supported by web browsers, and is the only language available if you wish to write
interactive web applications. As more and more activity moves online, the importance of web apps will only increase over
time. JavaScript being so dominant and popular, why would you want to use something else?

## JavaScript-the-language

JavaScript is an OK language to do small-scale development: an animation here, an on-click transition there. There are a
number of warts in the language, e.g. its verbosity, and a large amount of surprising behavior, but while your code-base
doesn't extend past a few hundred lines of code, you often will not mind or care.

However, JavaScript is not an easy language to work in at scale: when your code-base extends to thousands, tens or
hundreds of thousands of lines of code. The un-typed nature of the language, which is fine for small applications,
becomes an issue when you are mainly working with code that you did not write.

In a large code-base, finding out what methods or properties a variable has is often a long chase through dozens of
files to see how it ended up being passed to the current function. Refactorings, which are OK when you can just test the
code to see if it works, become dangerous when your code base is large enough that "just test all the code" would take
hours. Language-warts which are slightly annoying in small programs become a minefield in large ones: it's only a matter
of time before you hit one, often in code you did-not/cannot test, resulting in breakages in production.

Apart from the inherent danger of the language, JavaScript has another major problem: the language has left many things
unspecified, yet at the same time provides the ability to emulate these things in a variety of ways. This means that
rather than having a single way of e.g. defining a class and instantiating an object, there is a decade-long debate
between a dozen different and equally-bad, hand-crafted alternatives. Large code-bases use third-party libraries, and
most are guaranteed (purely due to how stastistics work) to do these basic things differently from your own code, making
understanding these disparate code-bases (e.g. when something goes wrong) very difficult.

To work in JavaScript, you need the discipline to limit yourself to the sane subset of the language, avoiding all the
pitfalls along the way. Even if you manage to do so, what constitutes a pitfall and what constitutes a
clever-language-feature changes yearly, making it difficult to maintain cohesiveness over time. This is compounded by
the fact that refactoring is difficult, and so removing "unwanted" patterns from a large code-base a difficult (often
multi-year) process.

## JavaScript-the-platform

However, even though JavaScript-the-language is pretty bad, JavaScript-the-platform has some very nice properties that
make it a good target for application developers:

* Zero-install distribution: just go to a URL and have the application downloaded and ready to use.
* Hyperlinks: being able to link to a particular page or item within a web app is a feature other platforms lack, and
makes it much easier to cross-reference between different systems
* Sandboxed security: web applications are secure by default. No matter how sketchy the websites you visit, you can be
sure that once you close the page, they're gone

These features are all very nice to have, and together have made the web platform the success it is today.

In many ways, mobile App platforms like Android and iOS have closed the gap between "native" and "web" applications.
Installing a new App may take 30 seconds, you can often deep-link to certain pages within an App, and Apps have a much
tighter security model than desktop software does. Nevertheless, 30 seconds is still much longer than the 0.5 seconds it
takes to open a web page, deep-linking in apps is not very prevalent, and the security model still often leaves space
for rogue Apps to misbehave and steal data.

Despite the problems with JavaScript (and other tools like HTML an CSS, which have their own problems) the Web platform
got a lot of things right, and the Desktop and Mobile platforms have a lot of catching up to do. If only we could
improve upon the parts that aren't so great. This is where Scala.js comes in.

# Scala.js

With Scala.js, you can cross compile your Scala code to a JavaScript executable that can run on all major web browsers.
You get all the benefits of the web platform in terms of deployability, security, and hyperlinking, with none of the
problems of writing your software in JavaScript. Scala.js provides a better language to do your work in, but also
provides some other goodies that have in-so-far never been seen in mainstream web development: shared-code and
client-server integration.

## The Language

At a first approximation, Scala.js provides you a sane language to do development in the web browser. This saves you
from an endless stream of JavaScript warts like this one:

{% highlight scala %}
JavaScript> ["10", "10", "10", "10"].map(parseInt)
[10, NaN, 2, 3] // WTF
scala> List("10", "10", "10", "10").map(parseInt)
List(10, 10, 10, 10) // Yay!
{% endhighlight %}

Not only do you have an expressive language with static types, you also have great tooling with IDEs like IntelliJ and
Eclipse, a rich library of standard collections, and many other modern conveniences that we take for granted but are
curiously missing when working in the wild west of web development: the browser! You get all of the upside of developing
for the web platform.

While not useful for small applications, where most of the logic is gluing together external APIs, this comes in very
useful in large applications where a lot of the complexity and room-for-error is entirely internal. With larger apps,
you can no longer blame browser vendors for confusing APIs that make your code terrible: these confusing APIs only lurk
in the peripherals around a larger, complex application. One thing you learn working in large-ish web client-side
code-bases is that the bulk of the confusion and complexity is no-one's fault but your own, as a team.

At this point, all of Google, Facebook, and Microsoft have all announced work on a typed variant of JavaScript. Clearly,
JavaScript isn't cutting it anymore, and the convenience and "native-ness" of the language is more than made up for in
the constant barrage of self-inflicted problems. Scala.js takes this idea and runs with it!

## Sharing Code

Shared code is one of the holy-grails of web development. Traditionally the client-side code and server-side code has
been written in separate languages: PHP or Perl or Python or Ruby or Java on the server, with only JavaScript on the
client. This means that algorithms were often implemented twice, constants copied-&-pasted, or awkward Ajax calls are
made in an attempt to centralize the logic in one place (the server). With the advent of Node.js in the last few years,
you can finally re-use the same code on the server as you can on the client, but with the cost of having all the
previously client-only problems with JavaScript now inflicted upon your server code base. Node.js expanded your
range-of-options for writing shared client/server logic from "Write everything twice" to "Write everything twice, or
write everything in JavaScript". More options is always good, but it's not clear which of the two choices is more
painful!

Scala.js provides an alternative to this dilemma. With Scala.js, you can utilize the same libraries you use writing your
Scala servers when writing your Scala web clients! On one end, you are sharing your templating language with
[Scalatags](https://github.com/lihaoyi/scalatags) or sharing your serialization logic with
[uPickle](https://github.com/lihaoyi/upickle-pprint). At the other, you are sharing large, abstract FP libraries like
[Cats](https://github.com/non/cats) or [Shapeless](https://github.com/milessabin/shapeless).

Sharing code means several things:

* Not having to find two libraries to do a particular common task
* Not having to re-learn two different ways of doing the exact same thing
* Not needing to implement the same algorithms twice, for the times you can't find a good library to do what you want
* Not having to debug problems caused by subtle differences in the two implementations
* Not having to resort to awkward Ajax-calls or pre-computation to avoid duplicating logic between the client and server

Shared code doesn't just mean sharing pre-made libraries between the client and server. You can easily publish your own
libraries that can be used on both Scala-JVM and Scala.js. This means that as a library author, you can at once target
two completely different platforms, and (with some work) take advantage of the intricacies of each platform to optimize
your library for each one.

Shared code means that if you, as an application writer, want some logic to be available on both the client and server,
you simply put it in a `shared/` folder, and that's the end of the discussion. No architectural patterns to follow, no
clever techniques need to be involved. Shared logic, whether that means constants, functions, data structures, all the
way to algorithms and entire libraries, can simply be placed in shared/ and be instantly accessible from both your
client-side web code and your server.

Shared code has long been the holy-grail of web development. Even now, people speak of shared code as if it were a myth.
With Scala.js, shared code is the simple, boring reality. And all this while, just as importantly, you don't need to
re-write your large enterprise back-end systems in a language that doesn't scale well beyond 100s of lines of code.

## Client-Server Integration

There is an endless supply of new platforms which have promised to change-the-way-we-do-web-development-forever. From
old-timers like Ur-Web, to GWT, to Asana's LunaScript, to more recently things like [Meteor.js](https://www.meteor.com/).

One common theme in all these platforms is that their main selling point is their tight, seamless client-server
integration, to the point where you can just make method calls across the client-server boundary and the
platform/language/compiler figures out what to do.

With Scala.js and Scala-JVM, such conveniences like making method calls across the client-server boundary is the boring
reality. Not only are the calls transparent, they are also statically checked, so any mistake in the route name or the
parameters it expects, or the result type it returns to you, will be caught by the compiler long before even manual
testing. It becomes impossible to make a malformed Ajax call.

There's a lot to be said for automating things using a computer. The entire field of software engineering is basically
about automating tasks that were previously done manually: accounting, banking, making travel arrangements, and all
that. However, in the world of web-development, there has always been one set of tasks that has traditionally be done
manually: the task of ensuring the web-clients are properly synchronized with the web-servers. Communication between the
two has always been a manual, tedious, error-prone process, and mistakes often end un-noticed until something breaks in
production.

With Scala.js, like the other experimental platforms that have come before us, we attempt to provide a way forward from
this manual-tedium.

-------

In many ways, Scala.js all-at-once provides many of the traditional holy-grails of web development: People have always
dreamed about doing web development in a sane, best-of-breed language that compiles to both client and server. Of not
having to worry too hard about whether code goes on the client or on the server, and being able to move or share it if
necessary. Of having a compiler that will verify and check that your entire system is correct.

Scala.js provides all these things, and much more. If you're interested enough to want to make use of Scala.js, read on!
