---
layout: page
title: Frequently Asked Questions
---
{% include JB/setup %}

### Have you considered targeting [asm.js](http://asmjs.org/)? Would it help?

asm.js would not help in implementing Scala.js.

asm.js was designed as a target for C-like languages, that consider the memory
as a huge array of bytes, and with manual memory management. By their own
acknowledgment (see [their FAQ](http://asmjs.org/faq.html)), it is not a good
target for managed languages like Scala.
