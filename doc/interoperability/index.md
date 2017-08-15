---
layout: doc
title: Interoperability
---

A key feature of Scala.js is its interoperability with JavaScript code, which
far exceeds that of many other languages targeting JavaScript. Except of course
for languages that translate almost literally to JavaScript (e.g.,
[TypeScript](http://www.typescriptlang.org/) and
[CoffeeScript](http://coffeescript.org/)).

See for yourself: on the right, Scala.js natively talks to the DOM API, and we
can hardly notice the border between the two languages.

{% columns %}
{% column 6 ES6 %}
{% highlight javascript %}
var xhr = new XMLHttpRequest();

xhr.open("GET",
  "https://api.twitter.com/1.1/search/" +
  "tweets.json?q=%23scalajs"
);
xhr.onload = (e) => {
  if (xhr.status === 200) {
    var r = JSON.parse(xhr.responseText);
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

The following sections explain all the details:

* [JavaScript types as seen from Scala.js](types.html)
* [Write facade types for JavaScript APIs](facade-types.html)
* [Access to the JavaScript global scope (1.x only)](global-scope.html)
* [Export Scala.js APIs to JavaScript](export-to-javascript.html)
* [Write JavaScript classes in Scala.js](sjs-defined-js-classes.html)
