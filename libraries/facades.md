---
layout: libraries
title: JavaScript library facades
---

## JavaScript libraries for Scala.js

These facades wrap existing JavaScript libraries, giving you type safe access to their functionality. Some of the
facades may only partially expose the underlying JavaScript library functionality, so make sure to check out the
details. To quickly start using one of these libraries, just click on the dependency clipboard button to get the
relevant SBT dependency definition.

**Scala.js 1.x:** At the moment, the list below is maintained for Scala.js 0.6.x only.
Consult the readmes of relevant projects to see whether they support milestones of Scala.js 1.x.

{% include library.html lib=site.data.library.jsfacades %}

[DefinitelyScala.com](https://definitelyscala.com/) has more open source Scala.js facades for some of your favorite JavaScript libraries, derived from DefinitelyTyped's TypeScript definitions.

If you didn't find a facade for the library you'd like to use, it's quite easy to do one yourself. Check out the
[facade documentation](../doc/interoperability/facade-types.html) and the
[TypeScript conversion tool](https://github.com/sjrd/scala-js-ts-importer).
You can also skip whole facade-business and just
[call JavaScript APIs dynamically](../doc/interoperability/facade-types.html#calling-javascript-from-scalajs-with-dynamic-types),
without type-checking, the same way you do it when programming in JavaScript itself.

-------

<small markdown="1">Additions and corrections to this section may be reported through
[GitHub issues](https://github.com/scala-js/scala-js-website/issues). Please include Name, Url, Description and
Dependency</small>
