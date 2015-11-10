---
layout: doc
title: "From ES6 to Scala: Advanced"
---

Scala is a feature rich language that is easy to learn but takes time to master. Depending on your programming
background, typically you start by writing Scala as you would've written the language you know best (JavaScript, Java or
C# for example) and gradually learn more and more idiomatic Scala paradigms to use. In this section we cover some of the
more useful design patterns and features, to get you started quickly.

## Pattern matching

In the Basics part we already saw simple examples of _pattern matching_ as a replacement for JavaScript switch
statement. However, it can be used for much more, for example checking the type of input.

{% columns %}
{% column 6 ES6 %}
{% highlight javascript %}
function printType(o) {
  switch (typeof o) {
    case "string":
      console.log(`It's a string: ${o}`); 
      break;
    case "number":
      console.log(`It's a number: ${o}`); 
      break;
    case "boolean":
      console.log(`It's a boolean: ${o}`); 
      break;
    default:
      console.log(`It's something else`);
  }
}
{% endhighlight %}
{% endcolumn %}
        
{% column 6 Scala %}
{% highlight scala %}
def printType(o: Any) {
  o match {
    case s: String =>
      println(s"It's a string: $s")
    case i: Int =>
      println(s"It's an int: $i")
    case b: Boolean =>
      println(s"It's a boolean: $b")
    case _ =>
      println("It's something else")
}
{% endhighlight %}
{% endcolumn %}
{% endcolumns %}

Pattern matching uses something called _partial functions_ which means it can be used in place of regular functions, for
example in a call to `filter` or `map`. You can also add a _guard clause_ in the form of an `if`, to limit the match. If
you need to match to a variable, use backticks to indicate that.

{% columns %}
{% column 6 ES6 %}
{% highlight javascript %}
function parse(str, magicKey) {
  let res = [];
  for(let c of str) {
    if (c === magicKey)
      res.push("magic");
    else if (c.match(/\d/))
      res.push("digit");
    else if (c.match(/\w/))
      res.push("letter");
    else if (c.match(/\s/))
      res.push(" ");
    else 
      res.push("char");
  }
  return res;
}
const r = parse("JB/007", '/');
// [letter, letter, magic, digit, digit, digit]
{% endhighlight %}
{% endcolumn %}
        
{% column 6 Scala %}
{% highlight scala %}
def parse(str: String, magicKey: Char)= {
  str.map {
    case c if c == magicKey =>
      "magic"
    case c if c.isDigit =>
      "digit"
    case c if c.isLetter =>
      "letter"
    case c if c.isWhitespace =>
      " "
    case c =>
      "char"
  }
}
val r = parse("JB/007", '/')
// Seq(letter, letter, magic, digit, digit, digit)
{% endhighlight %}
{% endcolumn %}
{% endcolumns %}

#### Destructuring

Where pattern matching really shines is at destructuring. This means matching to a more complex pattern and extracting
values inside that structure. ES6 also supports destructuring (yay!) in assignments and function parameters, but not
in matching.

{% columns %}
{% column 6 ES6 %}
{% highlight javascript %}
const person = {first: "James", last: "Bond", 
  age: 42};
const {first, last, age: years} = person;
// first = "James", last = "Bond", years = 42
const seq = [1, 2, 3, 4, 5];
const [a, b, , ...c] = seq;
// a = 1, b = 2, c = [4, 5]

const seq2 = [a, b].concat(c); // [1, 2, 4, 5]
{% endhighlight %}
{% endcolumn %}
        
{% column 6 Scala %}
{% highlight scala %}
case class Person(first: String, last: String, 
  age: Int)
val person = Person("James", "Bond", 42)
val Person(first, last, years) = person
// first = "James", last = "Bond", years = 42
val seq = Seq(1, 2, 3, 4, 5)
val Seq(a, b, _, c @ _*) = seq 
// a = 1, b = 2, c = Seq(4, 5)

val seq2 = Seq(a, b) ++ c // Seq(1, 2, 4, 5)
{% endhighlight %}
{% endcolumn %}
{% endcolumns %}

In Scala the destructuring and rebuilding have nice symmetry making it easy to remember how to do it. Use `_` to skip
values in destructuring.

In pattern matching the use of destructuring results in clean, simple and understandable code.

{% columns %}
{% column 6 ES6 %}
{% highlight javascript %}
function ageSum(persons, family) {
  return persons.filter(p => p.last === family)
    .reduce((a, p) => a + p.age, 0);
}
const persons = [
  {first: "James", last: "Bond", age: 42},
  {first: "Hillary", last: "Bond", age: 35},
  {first: "James", last: "Smith", age: 55}
];

ageSum(persons, "Bond") == 77;
{% endhighlight %}
{% endcolumn %}
        
{% column 6 Scala %}
{% highlight scala %}
def ageSum(persons: Seq[Person], 
           family: String): Int = {
  persons.collect {
    case Person(_, last, age) if last == family => 
      age
  }.sum
}
val persons = Seq(
  Person("James", "Bond", 42),
  Person("Hillary", "Bond", 35),
  Person("James", "Smith", 55)
)

ageSum(persons, "Bond") == 77
{% endhighlight %}
{% endcolumn %}
{% endcolumns %}

We could've implemented the Scala function using a `filter` and `foldLeft`, but it is more understandable using
{% scaladoc collect collection.Seq@collect[B](pf:PartialFunction[A,B]):Seq[B] %} and pattern matching. It would be read
as "Collect every person with a last name equaling `family` and extract the age of those persons. Then sum up the ages."

Another good use case for pattern matching is regular expressions (also in ES6!). Let's extract a date in different
formats.

{% columns %}
{% column 6 ES6 %}
{% highlight javascript %}
function convertToDate(d) {
  const YMD = /(\d{4})-(\d{1,2})-(\d{1,2})/
  const MDY = /(\d{1,2})\/(\d{1,2})\/(\d{4})/
  const DMY = /(\d{1,2})\.(\d{1,2})\.(\d{4})/
  {
    const [, year, month, day] = YMD.exec(d) || [];
    if (year !== undefined)
      return {year: parseInt(year), 
              month: parseInt(month), 
              day: parseInt(day)};
    else {
      const [, month, day, year] = 
        MDY.exec(d) || [];
      if (year !== undefined)
        return {year: parseInt(year), 
                month: parseInt(month), 
                day: parseInt(day)};
      else {
        const [, day, month, year] = 
          DMY.exec(d) || [];
        if (year !== undefined)
          return {year: parseInt(year), 
                  month: parseInt(month), 
                  day: parseInt(day)};
      }
    }
  }
  throw "Invalid date!";
}
convertToDate("2015-10-9"); // {year:2015,month:10,day:9}
convertToDate("10/9/2015"); // {year:2015,month:10,day:9}
convertToDate("9.10.2015"); // {year:2015,month:10,day:9}
convertToDate("10 Nov 2015") // exception
{% endhighlight %}
{% endcolumn %}
        
{% column 6 Scala %}
{% highlight scala %}
case class Date(year: Int, month: Int, day: Int)

def convertToDate(d: String): Date = {
  val YMD = """(\d{4})-(\d{1,2})-(\d{1,2})""".r
  val MDY = """(\d{1,2})/(\d{1,2})/(\d{4})""".r
  val DMY = """(\d{1,2})\.(\d{1,2})\.(\d{4})""".r
  d match {
    case YMD(year, month, day) => 
      Date(year.toInt, month.toInt, day.toInt)
    case MDY(month, day, year) =>
      Date(year.toInt, month.toInt, day.toInt)
    case DMY(day, month, year) =>
      Date(year.toInt, month.toInt, day.toInt)
    case _ => 
      throw new Exception("Invalid date!")
  }
}

convertToDate("2015-10-9") // = Date(2015,10,9)
convertToDate("10/9/2015") // = Date(2015,10,9)
convertToDate("9.10.2015") // = Date(2015,10,9)
convertToDate("10 Nov 2015") // exception
{% endhighlight %}
{% endcolumn %}
{% endcolumns %}

Here we use triple-quoted strings that allow us to write regex without escaping special characters. The string is
converted into a {% scaladoc util.matching.Regex %} object with the `.r` method. Because regex extracts strings, we need
to convert matched groups to integers ourselves.

## Implicits

Being type safe is great in Scala, but sometimes the type system can be a bit prohibitive when you want to do something
else, like add methods to existing classes. To allow you to do this in a type safe manner, Scala provides _implicits_.
You can think of implicits as something that's available in the scope when you need it, and the compiler can
automatically provide it. For example we can provide a function to automatically convert a JavaScript {% jsdoc Date %}
into a Scala/Java `Date`.

{% columns %}
{% column 9 Scala %}
{% highlight scala %}
import scalajs.js

implicit def convertFromJSDate(d: js.Date): java.util.Date = {
  new java.util.Date(d.getMilliseconds())
}

implicit def convertToJSDate(d: java.util.Date): js.Date = {
  new js.Date(d.getTime)
}

case class Person(name: String, joined: js.Date)

val p = Person("James Bond", new java.util.Date)
{% endhighlight %}
{% endcolumn %}
{% endcolumns %}

When these implicit conversion functions are in lexical scope, you can use JS and Scala dates interchangeably. Outside
the scope they are not visible and you must use correct types or provide conversion yourself.

#### Implicit conversions for "monkey patching" 

Monkey patching -term became famous among Ruby developers and it has been adopted into JavaScript to describe
a way of extending existing classes with new methods. It has several pitfalls in dynamic languages and is generally
not a recommended practice. Especially dangerous is to patch JavaScript's host objects like `String` or `DOM.Node`. This
technique is, however, commonly used to provide support for new JavaScript functionality missing from older JS engines.
The practice is known as _polyfilling_ or _shimming_.

In Scala providing extension methods via implicits is _perfectly safe_ and even a _recommended_ practice. Scala
standard library does it all the time. For example did you notice the `.r` or `.toInt` functions that were used on
strings in the regex example? Both are extension methods coming from implicit classes.

Let's use the `convertToDate` we defined before and add a `toDate` extension method to `String` by defining an _implicit
class_.

{% columns %}
{% column 6 ES6 %}
{% highlight javascript %}
String.prototype.toDate = function() {
  return convertToDate(this);
}
"2015-10-09".toDate; // = {year:2015,month:10,day:9}
{% endhighlight %}
{% endcolumn %}
        
{% column 6 Scala %}
{% highlight scala %}
implicit class StrToDate(val s: String) 
  extends AnyVal {
  def toDate = convertToDate(s)
}
"2015-10-09".toDate // = Date(2015,10,9)
{% endhighlight %}
{% endcolumn %}
{% endcolumns %}

Note that the JavaScript version modifies the global `String` class (dangerous!), whereas the Scala version only
introduces a conversion from `String` to a custom `StrToDate` class providing an additional method. Implicit classes are
_safe_ because they are lexically scoped, meaning the `StrToDate` is not available in other parts of the program unless
explicitly imported. The `toDate` method is not added to the `String` class in any way, instead the compiler generates
appropriate code to call it when required. Basically `"2010-10-09".toDate` is converted into `new
StrToDate("2010-10-09").toDate` which is then inlined/optimized (due to the use of Value Class) to
`convertToDate("2010-10-09")` at the call site.

Scala IDEs are also smart enough to know what implicit extension methods are in scope and will show them to you next
to the other methods.

![Extension method in IDE]({{site.baseurl}}/assets/img/implicitIDE.png)

Implicit extension methods are safe and easy to refactor. If you, say, rename or remove a method, the compiler will
immediately give errors in places where you use that method. IDEs provide great tools for automatically renaming all
instances when you make the change, keeping your code base operational. You can even do complex changes like add new
method parameters or reorder them and the IDE can take care of the refactoring for you, safely and automatically, thanks
to strict typing.

Finally we'll make DOM's `NodeList` behave like a regular Scala collection to make it easier to work with them. Or to be
more accurate, we are extending `DOMList[T]` which provides a type for the nodes. `NodeList` is actually just a
`DOMList[Node]`.

{% columns %}
{% column 12 Scala %}
{% highlight scala %}
implicit class NodeListSeq[T <: Node](nodes: DOMList[T]) extends IndexedSeq[T] {
  override def foreach[U](f: (T) => U): Unit = {
    for (i <- 0 until nodes.length) {
      f(nodes(i))
    }
  }
  override def length: Int = nodes.length

  override def apply(idx: Int): T = nodes(idx)
}
{% endhighlight %}
{% endcolumn %}
{% endcolumns %}

Defining just those three functions we now have access to all the usual collection functionality like `map`, `filter`,
`find`, `slice`, `foldLeft`, etc. This makes working with `NodeList`s a lot easier and safer. The implicit class makes
use of Scala generics, providing implementation for all types that extend `Node`.

{% columns %}
{% column 12 Scala %}
{% highlight scala %}
// cast to correct element type
val images = dom.document.querySelectorAll("img").asInstanceOf[NodeListOf[HTMLImageElement]]
// get all image source URLs
val urls = images.map(i => i.src)
// filter images that have "class" attribute set
val withClass = images.filter(i => i.className.nonEmpty)
// set an event listener to 10 widest images
images.sortBy(i => -i.width).take(10).foreach { i =>
  i.onclick = (e: MouseEvent) => println("Image clicked!")
}
{% endhighlight %}
{% endcolumn %}
{% endcolumns %}

## Futures

Writing asynchronous JavaScript code used to be painful due to the number of callbacks required to handle chained
asynchronous calls. This is affectionately known as _callback hell_. Then came the various Promise libraries that
alleviated this issue a lot, but were not fully compatible with each other. ES6 standardizes the {% jsdoc Promise %}
interface so that all implementations (ES6's own included) can happily coexist.

In Scala a similar concept is the {% scaladoc concurrent.Future %}. On the JVM, futures can be used for both parallel
and asynchronous processing, but under Scala.js only the latter is possible. Like the `Promise` a `Future` is a
placeholder object for a value that may not yet exist. Both `Promise` and `Future` can complete successfully, providing
a value, or fail with an error/exception. Let's look at a typical use case of fetching data from server using Ajax.

{% columns %}
{% column 6 ES6 %}
{% highlight javascript %}
// using jQuery

$.ajax("http://api.openweathermap.org/" +
  "data/2.5/weather?q=Tampere").then(
   (data, textStatus, jqXHR) =>
      console.log(data)
);
{% endhighlight %}
{% endcolumn %}
        
{% column 6 Scala %}
{% highlight scala %}
import org.scalajs.dom
import dom.ext.Ajax

Ajax.get("http://api.openweathermap.org/" +
  "data/2.5/weather?q=Tampere").foreach { 
  xhr =>
    println(xhr.responseText)
}               
{% endhighlight %}
{% endcolumn %}
{% endcolumns %}

The JavaScript code above is using jQuery to provide similar helper for making Ajax calls returning promises as is
available in the Scala.js DOM library.

Comparison between Scala `Future` and JavaScript `Promise` methods.

<table class="table table-bordered" markdown="1">
  <thead>
    <tr><th>{% scaladoc concurrent.Future %}</th><th>{% jsdoc Promise %}</th><th>Notes</th></tr>
  </thead>
  <tbody>
    <tr><td><code>foreach(func)</code></td><td><code>then(func)</code></td><td>Does not return a new promise.</td></tr>
    <tr><td><code>map(func)</code></td><td><code>then(func)</code></td><td>Return value of <code>func</code> is wrapped in a new promise.</td></tr>
    <tr><td><code>flatMap(func)</code></td><td><code>then(func)</code></td><td><code>func</code> must return a promise.</td></tr>
    <tr><td><code>recover(func)</code></td><td><code>catch(func)</code></td><td>Handle error. Return value of <code>func</code> is wrapped in a new promise.</td></tr>
    <tr><td><code>recoverWith(func)</code></td><td><code>catch(func)</code></td><td>Handle error. <code>func</code> must return a promise.</td></tr>
    <tr><td><code>onComplete(func)</code></td><td><code>then(func, err)</code></td><td>Callback for handling both success and failure cases.</td></tr>
    <tr><td><code>onSuccess(func)</code></td><td><code>then(func)</code></td><td>Callback for handling only success cases.</td></tr>
    <tr><td><code>onFailure(func)</code></td><td><code>catch(func)</code></td><td>Callback for handling only failure cases.</td></tr>
    <tr><td><code>transform(func, err)</code></td><td><code>then(func, err)</code></td><td>Combines <code>map</code> and <code>recover</code> into a single function.</td></tr>
    <tr><td><code>filter(predicate)</code></td><td>N/A</td><td>Creates a new future by filtering the value of the current future with a predicate.</td></tr>
    <tr><td><code>zip(that)</code></td><td>N/A</td><td>Zips the values of <code>this</code> and <code>that</code> future, and creates a new future holding the tuple of their results.</td></tr>
    <tr><td><code>Future.successful(value)</code></td><td><code>Promise.resolve(value)</code></td><td>Returns a successful future containing <code>value</code></td></tr>
    <tr><td><code>Future.failed(exception)</code></td><td><code>Promise.reject(value)</code></td><td>Returns a failed future containing <code>exception</code></td></tr>
    <tr><td><code>Future.sequence(iterable)</code></td><td><code>Promise.all(iterable)</code></td><td>Returns a future that completes when all of the promises in the iterable argument have completes.</td></tr>
    <tr><td><code>Future.firstCompletedOf(iterable)</code></td><td><code>Promise.race(iterable)</code></td><td>Returns a future that completes as soon as one of the promises in the iterable completes.</td></tr>
  </tbody>
</table>

#### Futures from callbacks

Even though ES6 brought the standard promise API to browsers, all asynchronous functions still require the use of
callbacks. To convert a callback into a `Future` in Scala you need to use a `Promise`. Wait, what? Yes, in addition to
`Future`, Scala also has a `Promise` class which actually implements the `Future` trait.

As an example, let's convert the `onload` event of an `img` tag into a `Future`.


{% columns %}
{% column 6 ES6 %}
{% highlight javascript %}
function onLoadPromise(img) {
  if (img.complete) {
    return Promise.resolve(img.src);
  } else {
    const p = new Promise( (success) => {
      img.onload = (e) => {
        success(img.src);
      };
    });
    return p;
  }
}

const img = document.querySelector("#mapimage");
onLoadPromise(img).then( url => 
  console.log(`Image ${url} loaded`) 
);
{% endhighlight %}
{% endcolumn %}
        
{% column 6 Scala %}
{% highlight scala %}
def onLoadFuture(img: HTMLImageElement) = {
  if (img.complete) {
    Future.successful(img.src)
  } else {
    val p = Promise[String]()
    img.onload = (e: Event) => {
      p.success(img.src)
    }
    p.future
  }
}

val img = dom.document.querySelector("#mapimage")
  .asInstanceOf[HTMLImageElement]
onLoadFuture(img).foreach { url =>
  println(s"Image $url loaded")
}
{% endhighlight %}
{% endcolumn %}
{% endcolumns %}

Because image might have already loaded when we create the promise, we must check for that separately and just return a
completed future in that case. 

Next we'll add an `onloadF` extension method to the {% domdoc raw.HTMLImageElement %} class, to make it really easy to
use the futurized version.

{% columns %}
{% column 12 Scala %}
{% highlight scala %}
implicit class HTMLImageElementOps(val img: HTMLImageElement) extends AnyVal {
  def onloadF = onLoadFuture(img)
}

val img = dom.document.querySelector("#mapimage").asInstanceOf[HTMLImageElement]
img.onloadF.foreach { url =>
  println(s"Image $url loaded")
}
{% endhighlight %}
{% endcolumn %}
{% endcolumns %}

While we are playing with DOM images, let's create a future that completes once all the images on the page have
completed loading. Here we'll take advantage of the `NodeListSeq` extension class to provide us with the `map` method
on the {% domdoc raw.NodeList %} returned from {% domdoc querySelectorAll raw.Document@querySelectorAll(selectors:String):org.scalajs.dom.raw.NodeList %}.

{% columns %}
{% column 12 Scala %}
{% highlight scala %}
val images = dom.document.querySelectorAll("img").asInstanceOf[NodeListOf[HTMLImageElement]]
val loaders = images.map(i => i.onloadF)

Future.sequence(loaders).foreach { urls =>
  println(s"All ${urls.size} images loaded!")
}
{% endhighlight %}
{% endcolumn %}
{% endcolumns %}
