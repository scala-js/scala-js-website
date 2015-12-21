---
layout: community
title: Hall of Fame
---

The Hall of Fame highlights occasions where the Scala.js project has contributed to other, larger projects.

### Node.js/V8: Integer Arithmetic Bug

Prior to Node.js 0.10.29, comparing `Int.MaxValue` with `Int.MinValue` could yield a wrong result.
Notably:

{% highlight javascript %}
$ node
> 2147483647 > -2147483648
false
{% endhighlight %}

This [Node.js bug](https://github.com/nodejs/node-v0.x-archive/issues/7528) was discovered by a [test](https://github.com/scala/scala/blob/v2.11.7/test/files/run/range-unit.scala) in Scala's partest suite that we run for Scala.js.

### Google Closure Compiler: Bad String Constant Folding

The Google Closure Compiler (GCC) applied a wrong algorithm to convert number literals to strings during constant folding:
Instead of a conversion conforming to the ECMAScript standard, GCC used Java's implementation of `toString`.
For example, GCC constant folded the following code:

{% highlight javascript %}
alert('A number: ' + 1.2323919403474454e+21);
{% endhighlight %}

into:

{% highlight javascript %}
alert("A number: 1.2323919403474454E21");
{% endhighlight %}

Whereas the following would be correct:

{% highlight javascript %}
alert("A number: 1.2323919403474454e+21");
{% endhighlight %}

This [GCC bug](https://github.com/google/closure-compiler/issues/1262) was discovered while making [improvements](https://github.com/scala-js/scala-js/pull/2007) to Scala.js' constant folder.

### React: Dependency on Inheritance of Static Members

In the initial plans for React 0.14, React checked for the static flag `isReactClass` on classes extending `React.Component`.
In ECMAScript 6, such static members are inherited by subclasses:

{% highlight javascript %}
class Foo {}
Foo.x = 5;
class Bar extends Foo{}
Bar.x // -> 5
{% endhighlight %}

While this behavior is specified in ECMAScript 6, there is no reliable way to reproduce it in pure ECMAScript 5.
This would have essentially meant that React would not work on some fully ECMAScript 5 compliant platforms, a notable example being Internet Explorer 10 and earlier.

After the discussion on the [Scala.js bug](https://github.com/scala-js/scala-js/issues/1900), the React team changed the design and is now using a [non-static method now](https://github.com/facebook/react/commit/83644185f4388834c0c482c7522a5f2f476d84a2).
