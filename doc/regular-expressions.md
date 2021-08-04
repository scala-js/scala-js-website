---
layout: doc
title: Regular expressions
---

[JavaScript regular expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) are different from [Java regular expressions](https://docs.oracle.com/en/java/javase/15/docs/api/java.base/java/util/regex/Pattern.html).
For `java.util.regex.Pattern` (and its derivatives like `scala.util.matching.Regex` and the `.r` method), Scala.js implements the semantics of Java regular expressions, although with some limitations.
The semantics and feature set of JavaScript regular expressions is available through `js.RegExp`, as any other JavaScript API.

## Support

The set of supported features for `Pattern` depends on the target ECMAScript version, specified in `ESFeatures.esVersion`.
By default, Scala.js targets ECMAScript 2015.
It is possible to change that target with the following setting:

{% highlight scala %}
scalaJSLinkerConfig ~= (_.withESFeatures(_.withESVersion(ESVersion.ES2018)))
{% endhighlight %}

**Attention!** While this enables more features of regular expressions, it restricts your application to environments that support recent JavaScript features.
If you maintain a library, this restriction applies to all downstream libraries and applications.
We therefore recommend to try and avoid the additional features, and prefer additional logic in code if that is possible.

In particular, we recommend avoiding the `MULTILINE` flag, aka `(?m)`, which requires ES2018.
We give some hints on how to avoid it below.

### Not supported

The following features are never supported:

* the `CANON_EQ` flag,
* the `\X`, `\b{g}` and `\N{...}` expressions,
* `\p{In𝘯𝘢𝘮𝘦}` character classes representing Unicode *blocks*,
* the `\G` boundary matcher, *except* if it appears at the very beginning of the regex (e.g., `\Gfoo`),
* embedded flag expressions with inner groups, i.e., constructs of the form `(?idmsuxU-idmsuxU:𝑋)`,
* embedded flag expressions without inner groups, i.e., constructs of the form `(?idmsuxU-idmsuxU)`, *except* if they appear at the very beginning of the regex (e.g., `(?i)abc` is accepted, but `ab(?i)c` is not), and
* numeric "back" references to groups that are defined later in the pattern (note that even Java does not support *named* back references like that).

### Conditionally supported

The following features require `esVersion >= ESVersion.ES2015` (which is true by default):

* the `UNICODE_CASE` flag.

The following features require `esVersion >= ESVersion.ES2018` (which is false by default):

* the `MULTILINE` and `UNICODE_CHARACTER_CLASS` flags,
* look-behind assertions `(?<=𝑋)` and `(?<!𝑋)`,
* the `\b` and `\B` expressions used together with the `UNICODE_CASE` flag,
* `\p{𝘯𝘢𝘮𝘦}` expressions where `𝘯𝘢𝘮𝘦` is not one of the [POSIX character classes](https://docs.oracle.com/en/java/javase/15/docs/api/java.base/java/util/regex/Pattern.html#posix).

### Always supported

It is worth noting that, among others, the following features *are* supported in all cases, even when no equivalent feature exists in ECMAScript at all, or in the target version of ECMAScript:

* correct handling of surrogate pairs (natively supported in ES 2015+),
* the `\G` boundary matcher when it is at the beginning of the pattern (corresponding to the 'y' flag, natively supported in ES 2015+),
* named groups and named back references (natively supported in ES 2018+),
* the `DOTALL` flag (natively supported in ES 2018+),
* ASCII case-insensitive matching (`CASE_INSENSITIVE` on but `UNICODE_CASE` off),
* comments with the `COMMENTS` flag,
* POSIX character classes in ASCII mode, or their Unicode variant with `UNICODE_CHARACTER_CLASS` (if the latter is itself supported, see above),
* complex character classes with unions and intersections (e.g., `[a-z&&[^g-p]]`),
* atomic groups `(?>𝑋)`,
* possessive quantifiers `𝑋*+`, `𝑋++` and `𝑋?+`,
* the `\A`, `\Z` and `\z` boundary matchers,
* the `\R` expression,
* embedded quotations with `\Q` and `\E`, both outside and inside character classes.

All the supported features have the correct semantics from Java.
This is even true for features that exist in JavaScript but with different semantics, among which:

* the `^` and `$` boundary matchers with the `MULTILINE` flag (when the latter is supported),
* the predefined character classes `\h`, `\s`, `\v`, `\w` and their negated variants, respecting the `UNICODE_CHARACTER_CLASS` flag,
* the `\b` and `\B` boundary matchers, respecting the `UNICODE_CHARACTER_CLASS` flag,
* the internal format of `\p{𝘯𝘢𝘮𝘦}` character classes, including the `\p{java𝘔𝘦𝘵𝘩𝘰𝘥𝘕𝘢𝘮𝘦}` classes,
* octal escapes and control escapes.

## Guarantees

If a feature is not supported, a `PatternSyntaxException` is thrown at the time of `Pattern.compile()`.

If `Pattern.compile()` succeeds, the regex is guaranteed to behave exactly like on the JVM, *except* for capturing groups within repeated segments (both for their back references and subsequent calls to `group`, `start` and `end`):

* on the JVM, a capturing group always captures whatever substring was successfully matched last by that group during the processing of the regex:
  - even if it was in a previous iteration of a repeated segment and the last iteration did not have a match for that group, or
  - if it was during a later iteration of a repeated segment that was subsequently backtracked;
* in JS and hence in Scala.js, capturing groups within repeated segments always capture what was matched (or not) during the last iteration that was eventually kept.

The behavior of JavaScript is more "functional", whereas that of the JVM is more "imperative".
This imperative nature is also reflected in the `hitEnd()` and `requireEnd()` methods of `Matcher`, which are not supported (they do not link).

The behavior of the JVM does not appear to be specified, and is questionable.
There are several open issues that argue it is buggy:

* [JDK-8027747](https://bugs.openjdk.java.net/browse/JDK-8027747)
* [JDK-8187083](https://bugs.openjdk.java.net/browse/JDK-8187083)
* [JDK-8187080](https://bugs.openjdk.java.net/browse/JDK-8187080)
* [JDK-8187082](https://bugs.openjdk.java.net/browse/JDK-8187082)

Scala.js keeps the the JavaScript behavior, and does not try to replicate the JVM behavior (potentially at great cost).

## Avoiding the `MULTILINE` flag, aka `(?m)`

The 'm' flag of JavaScript's `RegExp` is subtly different from that of Java's `Pattern`.
It considers that the position in the middle of a `\r\n` sequence is both the beginning and end of a line, whereas `Pattern` considers that neither is true.
The semantics of `Pattern` correspond to Unicode recommendations.

In general, we cannot implement the `Pattern` behavior without look-behind asertions (`(?<=𝑋)`), which are only available in ECMAScript 2018+.
However, in most concrete cases, it is possible to replace the usage of the 'm' flag with a combination of a) more complicated patterns and b) some ad hoc logic in the code using the regex.

Consider the following simple example, which matches every `foo` or `bar` or empty string on a line and prints them:

{% highlight scala %}
val regex = """(?m)^(foo|bar|)$""".r
for (m <- regex.findAllMatchIn(input))
  println(m.matched)
{% endhighlight %}

Assuming that, in the particular use case we are facing, only UNIX newlines can appear in the `input` string, we can rewrite the regex without the `(?m)` flag:

{% highlight scala %}
val regex2 = """(?:^|\n)(foo|bar|)(?=\n|$)""".r
{% endhighlight %}

`regex2` has exactly one match for each match of `regex`, and can therefore be used instead.
However, the specific string being matched changes, since the newline characters are included in the matched substrings.
The surrounding code can compensate for that discrepancy, using the capturing group in the middle:

{% highlight scala %}
for (m <- regex2.findAllMatchIn(input))
  println(m.group(1)) // `group(1)` instead of `matched`
{% endhighlight %}

If other newline characters must be recognized, a more complicated pattern needs to be used.
If it is acceptable to consider the position in the middle of `\r\n` as the start and end of a line (like JavaScript's `RegExp` does), the following regex works:

{% highlight scala %}
val regex3 = """(?:^|[\n\r\u0085\u2028\u2029])(foo|bar|)(?=[\n\r\u0085\u2028\u2029]|$)""".r
for (m <- regex3.findAllMatchIn(input))
  println(m.group(1))
{% endhighlight %}

If not, invalid matches must be rejected a posteriori using ad hoc logic:

{% highlight scala %}
def isBetweenCRAndNL(i: Int): Boolean =
  i > 0 && i < input.length() && input.charAt(i - 1) == '\r' && input.charAt(i) == '\n'

for {
  m <- regex3.findAllMatchIn(input)
  if !isBetweenCRAndNL(m.start(1)) && !isBetweenCRAndNL(m.end(1))
} {
  println(m.group(1))
}
{% endhighlight %}
