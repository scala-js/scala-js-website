---
layout: doc
title: "From ES6 to Scala: Advanced"
---

Scala is a feature rich language that is easy to learn but takes time to master. Depending on your programming
background, typically you start by writing Scala as you would've written the language you know best (JavaScript, Java or
C# for example) and gradually learn more and more idiomatic Scala paradigms to use. In this section we cover some of the
more useful design patterns and features, to get you started quickly.

## Pattern matching

In the Basics part we already saw simple examples of *pattern matching* as a replacement for JavaScript's `switch`
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
def printType(o: Any): Unit = {
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

Pattern matching uses something called *partial functions* which means it can be used in place of regular functions, for
example in a call to `filter` or `map`. You can also add a *guard clause* in the form of an `if`, to limit the match. If
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
def parse(str: String, magicKey: Char): String = {
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
const person = {first: "James", last: "Bond", age: 42};
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
case class Person(first: String, last: String, age: Int)
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

  const [, year, month, day] = YMD.exec(d) || [];
  if (year !== undefined) {
    return {
      year: parseInt(year),
      month: parseInt(month),
      day: parseInt(day)
    };
  } else {
    const [, month, day, year] = MDY.exec(d) || [];
    if (year !== undefined) {
      return {
        year: parseInt(year),
        month: parseInt(month),
        day: parseInt(day)
      };
    } else {
      const [, day, month, year] = DMY.exec(d) || [];
      if (year !== undefined) {
        return {
          year: parseInt(year),
          month: parseInt(month),
          day: parseInt(day)
        };
      }
    }
  }
  throw new Error("Invalid date!");
}
convertToDate("2015-10-9"); //{year:2015,month:10,day:9}
convertToDate("10/9/2015"); //{year:2015,month:10,day:9}
convertToDate("9.10.2015"); //{year:2015,month:10,day:9}
convertToDate("10 Nov 2015"); // exception
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
converted into a {% scaladoc util.matching.Regex %} object with the `.r` method. Because regexes extract strings, we need
to convert matched groups to integers ourselves.

## Functions revisited

We covered the basic use functions in [Part 1](es6-to-scala-part1.html), but Scala, being a functional programming
language, provides much more when it comes to functions. Let's explore some of the more advanced features and how they
compare to JavaScript.

#### Higher-order functions

Scala, as JavaScript, allows the definition of higher-order functions. These are functions that take other functions as
parameters, or whose result is a function. Higher-order functions should be familiar to JavaScript developers, because
they often appear in form of functions that take callbacks as parameters.

Typically higher-order functions are used to pass specific functionality to a general function, like in the case of
`Array.prototype.filter` in ES6 or `Seq.filter` in Scala. We can use this to build a function to calculate a minimum and
maximum from a sequence of values, using a function to extract the target value.

{% columns %}
{% column 6 ES6 %}
{% highlight javascript %}
function minmaxBy(arr, f) {
  return arr.reduce(
    ([min, max], e) => {
      const v = f(e);
      return [Math.min(min, v), Math.max(max, v)]
    }, 
    [Number.MAX_VALUE, Number.MIN_VALUE]
  )
}
const [youngest, oldest] = minmaxBy(persons, e => e.age);
{% endhighlight %}
{% endcolumn %}

{% column 6 Scala %}
{% highlight scala %}
def minmaxBy[T](seq: Seq[T], f: T => Int): (Int, Int) = {
  seq.foldLeft((Int.MaxValue, Int.MinValue)) {
    case ((min, max), e) =>
      val v = f(e)
      (math.min(min, v), math.max(max, v))
  }
}
val (youngest, oldest) = minmaxBy[Person](persons, _.age)
{% endhighlight %}
{% endcolumn %}
{% endcolumns %}

#### Call-by-Name

In some cases you want to *defer* the evaluation of a parameter value until when it's actually used in the function. For
this purpose Scala offers *call-by-name* parameters. This can be useful when dealing with an expensive computation that
is only optionally used by the function. In JavaScript the closest thing to this is to wrap a value in an anonymous
function with no arguments and pass *that* as a parameter, but that's more verbose and error-prone. You need to remember
to both wrap the value and call the function.

{% columns %}
{% column 6 ES6 %}
{% highlight javascript %}
function compute(value, cPos, cNeg) {
  if (value >= 0)
    return cPos();
  else
    return cNeg();
}

compute(x, () => expCalc(), () => expCalc2());
{% endhighlight %}
{% endcolumn %}

{% column 6 Scala %}
{% highlight scala %}
def compute(value: Int, cPos: => Int, cNeg: => Int) = {
  if (value >= 0)
    cPos
  else
    cNeg
}

compute(x, expCalc, expCalc2)
{% endhighlight %}
{% endcolumn %}
{% endcolumns %}

#### Recursive functions

Recursive functions can be very expressive, but they may also cause spurious stack overflows if the recursion gets too
deep. Scala automatically optimizes recursive functions that are *tail recursive*, allowing you to use them without
fear of overflowing the stack. To make sure your function is actually tail recursive, use the `@tailrec` annotation,
which will cause the Scala compiler to report an error if your function is not tail recursive.

Before ES6, JavaScript did not support tail call optimization, nor optimizing tail recursive functions. If you use a
smart ES6 transpiler, it can actually convert a tail recursive function into a `while` loop, but there are no checks
available to help you to verify the validity of tail recursion.

{% columns %}
{% column 6 ES6 %}
{% highlight javascript %}
function fib(n) {
  function fibIter(n, next, prev) {
    if (n === 0) {
      return prev;
    } else {
      return fibIter(n - 1, next + prev, next);
    }
  };
  return fibIter(n, 1, 0);
}
{% endhighlight %}
{% endcolumn %}

{% column 6 Scala %}
{% highlight scala %}
def fib(n: Int): Int = {
  @tailrec 
  def fibIter(n: Int, next: Int, prev: Int): Int = {
    if (n == 0)
      prev
    else
      fibIter(n - 1, next + prev, next)
  }
  fibIter(n, 1, 0)
}
{% endhighlight %}
{% endcolumn %}
{% endcolumns %}


#### Partially applied functions

In Scala you can call a function with only some of its arguments and get back a function taking those missing arguments.
You do this by using `_` in place of the actual parameter. In JavaScript you can achieve the same by using the
`Function.prototype.bind` function (although it limits you to providing parameters from left to right). For example we
can define a function to create HTML tags by wrapping content within start and end tags.

{% columns %}
{% column 6 ES6 %}
{% highlight javascript %}
function tag(name, content) {
  return `<${name}>${content}</${name}>` 
}

const div = tag.bind(null, "div");
const p = tag.bind(null, "p");
const html = div(p("test")); // <div><p>test</p></div>
{% endhighlight %}
{% endcolumn %}

{% column 6 Scala %}
{% highlight scala %}
def tag(name: String, content: String) = {
  s"<$name>$content</$name>"
}

val div = tag("div", _: String)
val p = tag("p", _: String)
val html = div(p("test")) // <div><p>test</p></div>
{% endhighlight %}
{% endcolumn %}
{% endcolumns %}

#### Multiple parameter lists

Scala allows a function to be defined with multiple parameter lists. In Scala this is quite common as it provides some
powerful secondary benefits besides the usual currying functionality. JavaScript does not directly support multiple
parameter lists in its syntax, but you can emulate it by returning a chain of functions, or by using libraries like
[lodash](https://lodash.com/docs#curry) that do it for you.

Let's use currying to define the `tag` function from previous example.

{% columns %}
{% column 6 ES6 %}
{% highlight javascript %}
function tag(name) {
  return (content) => `<${name}>${content}</${name}>`; 
}

const div = tag("div");
const p = tag("p");
const html = div(p("test")); // <div><p>test</p></div>
{% endhighlight %}
{% endcolumn %}

{% column 6 Scala %}
{% highlight scala %}
def tag(name: String)(content: String): String = {
  s"<$name>$content</$name>"
}

val div = tag("div") _
val p = tag("p") _
val html = div(p("test")) // <div><p>test</p></div>
{% endhighlight %}
{% endcolumn %}
{% endcolumns %}

Multiple parameter lists also helps with *type inference*, meaning we don't need to tell the compiler the types
explicitly. For example we can rewrite the `minmaxBy` function as curried, which allows us to leave the `Person` type
out when calling it, as it is automatically inferred from the first parameter. This is why methods like `foldLeft` are
defined with multiple parameter lists.

{% columns %}
{% column 9 Scala %}
{% highlight scala %}
def minmaxBy[T](seq: Seq[T])(f: T => Int): (Int, Int) = {
  seq.foldLeft((Int.MaxValue, Int.MinValue)) {
    case ((min, max), e) =>
      val v = f(e)
      (math.min(min, v), math.max(max, v))
  }
}
val (youngest, oldest) = minmaxBy(persons)(_.age)
{% endhighlight %}
{% endcolumn %}
{% endcolumns %}

## Implicits

Being type safe is great in Scala, but sometimes the type system can be a bit prohibitive when you want to do something
else, like add methods to existing classes. To allow you to do this in a type safe manner, Scala provides *implicits*.
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
the scope they are not visible and you must use correct types or explicitly convert between each other.

#### Implicit conversions for "monkey patching"

The monkey patching term became famous among Ruby developers and it has been adopted into JavaScript to describe
a way of extending existing classes with new methods. It has several pitfalls in dynamic languages and is generally
not a recommended practice. Especially dangerous is to patch JavaScript's host objects like `String` or `DOM.Node`. This
technique is, however, commonly used to provide support for new JavaScript functionality missing from older JS engines.
The practice is known as *polyfilling* or *shimming*.

In Scala providing extension methods via implicits is *perfectly safe* and even a *recommended* practice. The Scala
standard library does it all the time. For example did you notice the `.r` or `.toInt` functions that were used on
strings in the regex example? Both are extension methods coming from implicit classes.

Let's use the `convertToDate` we defined before and add a `toDate` extension method to `String` by defining an *implicit
class*.

{% columns %}
{% column 6 ES6 %}
{% highlight javascript %}
String.prototype.toDate = function() {
  return convertToDate(this);
}
"2015-10-09".toDate(); // = {year:2015,month:10,day:9}
{% endhighlight %}
{% endcolumn %}

{% column 6 Scala %}
{% highlight scala %}
implicit class StrToDate(val s: String) {
  def toDate = convertToDate(s)
}
"2015-10-09".toDate // = Date(2015,10,9)
{% endhighlight %}
{% endcolumn %}
{% endcolumns %}

Note that the JavaScript version modifies the global `String` class (dangerous!), whereas the Scala version only
introduces a conversion from `String` to a custom `StrToDate` class providing an additional method. Implicit classes are
*safe* because they are lexically scoped, meaning the `StrToDate` is not available in other parts of the program unless
explicitly imported. The `toDate` method is not added to the `String` class in any way, instead the compiler generates
appropriate code to call it when required. Basically `"2010-10-09".toDate` is converted into `new
StrToDate("2010-10-09").toDate`.

Scala IDEs are also smart enough to know what implicit extension methods are in scope and will show them to you next
to the other methods.

<img src="{{site.baseurl}}/assets/img/implicitIDE.png" onload="this.width/=2;this.onload=null;"/>

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
  override def foreach[U](f: T => U): Unit = {
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

Defining just those three functions, we now have access to all the usual collection functionality like `map`, `filter`,
`find`, `slice`, `foldLeft`, etc. This makes working with `NodeList`s a lot easier and safer. The implicit class makes
use of Scala generics, providing implementation for all types that extend `Node`. Note that `NodeListSeq` [is available](https://github.com/scala-js/scala-js-dom/blob/28503dc40b75ac7ec77777e85424c5a96e0cf797/src/main/scala/org/scalajs/dom/ext/package.scala#L9-L10) as `PimpedNodeList` in the `scala-js-dom` library; just `import org.scalajs.dom.ext._` to use it.

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
asynchronous calls. This is affectionately known as *callback hell*. Then came the various `Promise` libraries that
alleviated this issue a lot, but were not fully compatible with each other. ES6 standardizes the {% jsdoc Promise %}
interface so that all implementations (ES6's own included) can happily coexist.

In Scala a similar concept is the {% scaladoc concurrent.Future %}. On the JVM, futures can be used for both parallel
and asynchronous processing, but under Scala.js only the latter is possible. Like a JavaScript `Promise`, a `Future` is a
placeholder object for a value that may not yet exist. Both `Promise` and `Future` can complete successfully, providing
a value, or fail with an error/exception. Let's look at a typical use case of fetching data from server using AJAX.

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

Here is a comparison between Scala's `Future` and JavaScript's `Promise` for the most commonly used methods.

<table class="table table-bordered" markdown="1">
  <thead>
    <tr><th>{% scaladoc concurrent.Future %}</th><th>{% jsdoc Promise %}</th><th>Notes</th></tr>
  </thead>
  <tbody>
    <tr><td><code>foreach(func)</code></td><td><code>then(func)</code></td><td>Executes <code>func</code> for its side-effects when the future completes.</td></tr>
    <tr><td><code>map(func)</code></td><td><code>then(func)</code></td><td>The result of <code>func</code> is wrapped in a new future.</td></tr>
    <tr><td><code>flatMap(func)</code></td><td><code>then(func)</code></td><td><code>func</code> must return a future.</td></tr>
    <tr><td><code>recover(func)</code></td><td><code>catch(func)</code></td><td>Handles an error. The result of <code>func</code> is wrapped in a new future.</td></tr>
    <tr><td><code>recoverWith(func)</code></td><td><code>catch(func)</code></td><td>Handles an error. <code>func</code> must return a future.</td></tr>
    <tr><td><code>filter(predicate)</code></td><td>N/A</td><td>Creates a new future by filtering the value of the current future with a predicate.</td></tr>
    <tr><td><code>zip(that)</code></td><td>N/A</td><td>Zips the values of <code>this</code> and <code>that</code> future, and creates a new future holding the tuple of their results.</td></tr>
    <tr><td><code>Future.successful(value)</code></td><td><code>Promise.resolve(value)</code></td><td>Returns a successful future containing <code>value</code></td></tr>
    <tr><td><code>Future.failed(exception)</code></td><td><code>Promise.reject(value)</code></td><td>Returns a failed future containing <code>exception</code></td></tr>
    <tr><td><code>Future.sequence(iterable)</code></td><td><code>Promise.all(iterable)</code></td><td>Returns a future that completes when all of the futures in the iterable argument have been completed.</td></tr>
    <tr><td><code>Future.firstCompletedOf(iterable)</code></td><td><code>Promise.race(iterable)</code></td><td>Returns a future that completes as soon as one of the futures in the iterable completes.</td></tr>
  </tbody>
</table>

Note that Scala has different functions corresponding to JavaScript's `then`, mainly `map` and `flatMap`.
`then` is not type-safe, because it will flatten promises "all the way down", even if that was not your intention.
In contrast, `map` never flattens, and `flatMap` always flattens once, tracking the appropriate static result type.

`foreach` is a slight variation of `map` that does not return a new future.
It is typically used instead of `map` to communicate the intent that the callback
is executed for its side-effects rather than its result value.

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
    const p = new Promise((success) => {
      img.onload = (e) => {
        success(img.src);
      };
    });
    return p;
  }
}

const img = document.querySelector("#mapimage");
onLoadPromise(img).then(url =>
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
    img.onload = { (e: Event) =>
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

Because the image might have already loaded when we create the promise, we must check for that separately and just return a
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
finished loading. Here we'll take advantage of the `NodeListSeq` extension class to provide us with the `map` method
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
