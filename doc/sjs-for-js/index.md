---
layout: doc
title: Scala.js for JavaScript developers
---

Below you can see the same functionality implemented in JavaScript ES6 and Scala.js. See any differences?

{% columns %}
{% column 6 ES6 %}
{% highlight javascript %}
const xhr = new XMLHttpRequest();

xhr.open("GET",
  "https://api.twitter.com/1.1/search/" +
  "tweets.json?q=%23scalajs"
);
xhr.onload = (e) => {
  if (xhr.status === 200) {
    const r = JSON.parse(xhr.responseText);
    $("#tweets").html(parseTweets(r));
  }
};
xhr.send();
{% endhighlight %}
{% endcolumn %}

{% column 6 Scala.js %}
{% highlight scala %}
val xhr = new XMLHttpRequest()

xhr.open("GET",
  "https://api.twitter.com/1.1/search/" +
  "tweets.json?q=%23scalajs"
)
xhr.onload = { (e: Event) =>
  if (xhr.status == 200) {
    val r = JSON.parse(xhr.responseText)
    $("#tweets").html(parseTweets(r))
  }
}
xhr.send()
{% endhighlight %}
{% endcolumn %}
{% endcolumns %}

Even though Scala language comes from a very different background than JavaScript, typical Scala code is quite understandable
for JavaScript developers. This section will walk you through the differences and show you how to write basic Scala code. If you
have fallen in love with the new features in ES6 like _arrow functions_ or _destructuring_, you can find them all in Scala as well!

The walk-through has been split into three parts:

- [basics](es6-to-scala-part1.html)
- [collections](es6-to-scala-part2.html)
- [advanced](es6-to-scala-part3.html)

Each part has a lot of code examples comparing ES6 code to corresponding Scala code.

You may also find some of the [presentation videos](../../community/presentations.html) a nice way to familiarize yourself with Scala.
