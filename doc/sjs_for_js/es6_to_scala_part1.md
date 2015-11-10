---
layout: doc
title: "From ES6 to Scala: Basics"
---

This is a short introduction to the Scala language for those familiar with JavaScript ES6. We are comparing
to ES6 instead of earlier versions of JavaScript because ES6 contains many nice features and syntax changes that bring
it closer to Scala.

Best way to experiment with Scala is to use a Scala [REPL](https://lihaoyi.github.io/Ammonite/), or the worksheet
functionality in [Scala
IDE](https://github.com/scala-ide/scala-worksheet/wiki/Getting-Started) or [IntelliJ
IDEA](https://confluence.jetbrains.com/display/IntelliJIDEA/Working+with+Scala+Worksheet).

For more reading check out [Scala Exercises](http://scala-exercises.47deg.com/index.html), [Scala
School](https://twitter.github.io/scala_school/) and official [Scala Tutorials](http://docs.scala-lang.org/tutorials/).

## Scala language

Scala is a modern multi-paradigm programming language designed to express common programming patterns in a concise,
elegant, and type-safe way. It smoothly integrates features of _object-oriented_ and _functional languages_. Scala is a
pure object-oriented language in the sense that every value is an object. It is also a functional language in the sense
that every function is a value. 

The biggest difference to JavaScript is that Scala is _statically typed_. This means that it is equipped with an
expressive type system that enforces statically that abstractions are used in a safe and coherent manner, meaning the
compiler will catch many typical programming errors. If you have used other statically typed languages like Java or C#
before you may have noticed that type definitions are all over the place. This is not true with Scala where the compiler
can _infer_ most of the types automatically.

## Variables

Let's start with something simple, variables. Both Scala and ES6 support mutable and immutable variables.

{% columns %}
{% column 6 ES6 %}
{% highlight javascript %}
// mutable variable
let x = 5;
// immutable variable
const y = "Constant";
{% endhighlight %}
{% endcolumn %}
        
{% column 6 Scala %}
{% highlight scala %}            
// mutable variable
var x = 5
// immutable variable
val y = "Constant"
{% endhighlight %}
{% endcolumn %}
{% endcolumns %}

Note that the Scala compiler automatically infers the types for `x` and `y` from the values that are assigned. In Scala
both mutable and immutable variables must always be initialized when declared.

## Primitive types

Scala defines several primitive types, of which most have corresponding types in JavaScript as well. See the table below.

<table class="table table-bordered">
  <thead>
    <tr><th>Scala type</th><th>JavaScript type</th><th>Notes</th></tr>
  </thead>
  <tbody>
    <tr><td>String</td><td>string</td><td></td></tr>
    <tr><td>Boolean</td><td>boolean</td><td></td></tr>
    <tr><td>Char</td><td><i>N/A</i></td><td>16-bit Unicode code point</td></tr>
    <tr><td>Byte</td><td>number</td><td>integer, range (-128, 127)</td></tr>
    <tr><td>Short</td><td>number</td><td>integer, range (-32768, 32767)</td></tr>
    <tr><td>Int</td><td>number</td><td>integer, range (-2147483648, 2147483647)</td></tr>
    <tr><td>Long</td><td><i>N/A</i></td><td>64-bit integer</td></tr>
    <tr><td>Float</td><td>number</td><td>32-bit floating point</td></tr>
    <tr><td>Double</td><td>number</td><td>64-bit floating point, fully equivalent to JS number</td></tr>
    <tr><td>Unit</td><td>undefined</td><td></td></tr>
    <tr><td>Null</td><td>null</td><td></td></tr>
  </tbody>
</table>

In JavaScript all numbers are represented as 64-bit floating point internally, which may give surprising results when
making some calculations. In Scala calculations are always performed using the types of operands, so dividing an `Int`
with another `Int`, the result is rounded to an `Int`.

{% columns %}
{% column 6 ES6 %}
{% highlight javascript %}
const x = 5 / 3; // == 1.6666666666666667 
{% endhighlight %}
{% endcolumn %}
        
{% column 6 Scala %}
{% highlight scala %}
val x = 5 / 3 // == 1
val y = 5.0 / 3 // == 1.6666666666666667
val z = 5 / 3.0 // == 1.6666666666666667
{% endhighlight %}
{% endcolumn %}
{% endcolumns %}

Because in JavaScript every number is a `number` there is no need to do type conversions. In Scala, however, it is an
error if you try to assign a higher precision value to a lower precision variable. You must explicitly convert it using
an appropriate function.

{% columns %}
{% column 9 Scala %}
{% highlight scala %}
val x: Int = 3.5 // ERROR!
val y: Double = 3 // Ok!
val f: Float = 3.0 // ERROR! 3.0f would be ok
val z: Int = 3.5.toInt // Ok!
val a: Byte = z // ERROR!
val b: Byte = z.toByte // Ok!
{% endhighlight %}
{% endcolumn %}
{% endcolumns %}

Actually the numeric types `Int`, `Short`, `Byte` and `Float` also exist in JavaScript if you use [_typed
arrays_](https://developer.mozilla.org/en/docs/Web/JavaScript/Typed_arrays). These are not commonly used in regular
JavaScript code, but for some specific purposes, like WebGL, they are required.

## Functions

Defining functions is quite similar in both languages. You just replace the `function` keyword with `def` and add types
for function parameters and return type. In Scala you can omit the `return` keyword as the last expression in the
function is automatically used as the return value. Return type is usually automatically inferred by the Scala compiler
(when not using `return`), but it is good practice to define it to help catch potential type errors.

{% columns %}
{% column 6 ES6 %}
{% highlight javascript %}
function mult(x, y) {
   return x * y;
}
{% endhighlight %}
{% endcolumn %}
        
{% column 6 Scala %}
{% highlight scala %}            
def mult(x: Double, y: Double): Double = x * y
{% endhighlight %}
{% endcolumn %}
{% endcolumns %}

#### Anonymous functions

In functional programming you quite often need to provide a function as a parameter, but you don't need it elsewhere so
it can be anonymous. Both languages support the nice "fat arrow" notation for defining anonymous functions conveniently.

{% columns %}
{% column 6 ES6 %}
{% highlight javascript %}
const f = (x, y) => x + y;

const p = ["Fox", "jumped", "over", "me"];
const l = p.map(s => s.length)
  .reduce((a, b) => a + b, 0); // == 15
{% endhighlight %}
{% endcolumn %}
        
{% column 6 Scala %}
{% highlight scala %}
val f = (x: Double, y: Double) => x + y
         
val p = Array("Fox", "jumped", "over", "me")
val l = p.map(s => s.length)
  .foldLeft(0)((a, b) => a + b) // == 15
{% endhighlight %}
{% endcolumn %}
{% endcolumns %}

#### Default, named and rest parameters

You can also define default values for parameters if they are not supplied when the function is called. For variable
number of parameters, you can access those as a `Seq`. Named parameters work just as you would expect in Scala, whereas
in ES6 you need to supply them with the object notation.

{% columns %}
{% column 6 ES6 %}
{% highlight javascript %}
// default value
function mult(x, y = 42.0) { return x * y; }

// variable number of parameters
function sum(first, ...rest) {
  return first + rest.reduce((a, b) => a + b, 0);
}

const s = sum(5, 4, 3, 2, 1); // == 15

// named parameters
function vec({x = 0, y = 0, z = 0}) {
  return new Vec(x, y, z);
}

const v = vec({x: 8, z: 42}); // Vec(8, 0, 42)
{% endhighlight %}
{% endcolumn %}

{% column 6 Scala %}
{% highlight scala %}            
// default value
def mult(x: Double, y: Double = 42.0): Double =
  x * y


// variable number of parameters
def sum(first: Double, rest: Double*): Double =
  first + rest.foldLeft(0.0)((a, b) => a + b) 

val s = sum(5, 4, 3, 2, 1) // == 15

// named parameters (works directly)
def vec(x: Int = 0, y: Int = 0, z: Int = 0): Vec =
  new Vec(x, y, z)
  
val v = vec(8, z = 42) // Vec(8, 0, 42)
{% endhighlight %}
{% endcolumn %}
{% endcolumns %}

Again, Scala compiler can infer all the required types in the code above, including the parameters for the anonymous
function given to the `foldLeft` function.

## `if`, `while`, `for`, `match` control structures

As you would expect, Scala has the regular `if-else` and `while` control structures found in most programming
languages. The big difference to JavaScript is that `if` statements are actually expressions returning a value. In
JavaScript you have the special `a ? b : c` construct to achieve the same result.

{% columns %}
{% column 6 ES6 %}
{% highlight javascript %}
const res = (name === "") ? 0 : 1;
{% endhighlight %}
{% endcolumn %}
        
{% column 6 Scala %}
{% highlight scala %}
val res = if (name.isEmpty) 0 else 1
{% endhighlight %}
{% endcolumn %}
{% endcolumns %}

The `for` construct in Scala is quite different from the for-loop in JavaScript and also much more powerful. You can use
it to iterate over numerical ranges or collections in both languages:

{% columns %}
{% column 6 ES6 %}
{% highlight javascript %}
let x = 0;
for (let i = 0; i < 100; i++)
  x += i*i;
  
const p = ["Fox", "jumped", "over", "me"];
for (let s of p) {
  console.log(`Word ${s}`);
}
{% endhighlight %}
{% endcolumn %}
        
{% column 6 Scala %}
{% highlight scala %}
var x = 0
for (i <- 0 until 100)
  x += i*i
  
val p = Array("Fox", "jumped", "over", "me")
for (s <- p) {
  println(s"Word $s")
}
{% endhighlight %}
{% endcolumn %}
{% endcolumns %}

In case you have nested for-loops, you can easily combine them into one _for-comprehension_ in Scala. Inside the `for`
you can even filter using `if` expressions. In Scala a _for-comprehension_ is just syntactic sugar for a series of
`flatMap`, `map` and `withFilter` calls making it _very_ handy when dealing with Scala collections.

{% columns %}
{% column 6 ES6 %}
{% highlight javascript %}
function findPairs(n, sum) {
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      if (i + j == sum)
        console.log(`Found pair ${i}, ${j}`);
    }
  }
};
findPairs(20, 31);
{% endhighlight %}
{% endcolumn %}
        
{% column 6 Scala %}
{% highlight scala %}
def findPairs(n: Int, sum: Int): Unit = {
  for { 
    i <- 0 until n
    j <- i until n if i + j == sum 
  } println(s"Found pair $i, $j")
}
findPairs(20, 31)
{% endhighlight %}
{% endcolumn %}
{% endcolumns %}

The code above also serves as an example for _string interpolation_ (in Scala) and _template strings_ (in ES6). Both
make it easier to construct strings using variables or function calls. In Scala you don't need to enclose the variable
in {} if it's just a simple variable name. For more complex cases you'll need to use the `s"Length = ${data.length}"`
syntax.

Finally the `match` construct provides _pattern matching_ capabilities in Scala. Pattern matching is a complex topic
covered in more detail in the advanced section of this article, so here we just focus on the simple use cases like
replacing JavaScript `switch`/`case` with it.

{% columns %}
{% column 6 ES6 %}
{% highlight javascript %}
const animal = "Dog";
let description;
switch(animal) {
  case "Cat":
  case "Lion":
  case "Tiger":
    description = "It's feline!";
    break;
  case "Dog":
  case "Wolf":
    description = "It's canine!";
    break;
  default:
    description = "It's something else";
}
console.log(description);
{% endhighlight %}
{% endcolumn %}
        
{% column 6 Scala %}
{% highlight scala %}
val animal = "Dog"
val description = animal match {
  case "Cat" | "Lion" | "Tiger" =>
    "It's feline!"
  case "Dog" | "Wolf" =>
    "It's canine!"
  case _ =>
    "It's something else"
}
println(description)
{% endhighlight %}
{% endcolumn %}
{% endcolumns %}

In Scala you can use the `|`-operator to match multiple choices and there is no need (nor support) for `break`, as cases
never fall through like they do in JavaScript. For the default case, use the ubiquitous `_` syntax (it has many many
more uses in Scala!) As with `if`, a `match` is an expression returning a value that you can directly assign to a
variable.

## Classes

Being an object-oriented language, Scala naturally supports classes with inheritance. In addition to basic classes Scala
also has:

* `case class`es for conveniently storing data
* `object`s for singletons
* `trait`s for defining interfaces and mixins

A simple class hierarchy can be achieved in both languages.

{% columns %}
{% column 6 ES6 %}
{% highlight javascript %}
class Shape {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  
  move(dx, dy) {
    this.x += dx;
    this.y += dy;
  }
  
  draw() {
    console.log(`Shape at ${this.x}, ${this.y}`);
  }
};

class Circle extends Shape {
  constructor(x, y, r) {
    super(x, y);
    this.r = r;
  }

  draw() {
    console.log(`Circle at ${this.x}, ${this.y} with radius ${this.r}`);
  }
}

const c = new Circle(5, 5, 42);
const r = c.r; // == 42

{% endhighlight %}
{% endcolumn %}
        
{% column 6 Scala %}
{% highlight scala %}
// use var to make coordinates mutable
abstract class Shape(var x: Int, var y: Int) {
  def move(dx: Int, dy: Int) {
    x += dx
    y += dy
  }
  
  def draw() {
    println(s"Shape at $x, $y")
  }
}
  
// r is immutable but accessible outside class  
class Circle(x: Int, y: Int, val r: Int) 
  extends Shape(x, y) {
  override def draw() {
    println(s"Circle at $x, $y with radius $r")
  }
}  

val c = new Circle(5, 5, 42)
val r = c.r // == 42
{% endhighlight %}
{% endcolumn %}
{% endcolumns %}

Even though Scala has the concept of `this` it is not that often used in your own code.

#### Case classes

When reading Scala application code you will probably encounter more `case class`es than regular `class`es. This is due
to their special features that make them so useful. First of all you don't need to use `new` keyword when instantiating
them and all constructor parameters are automatically available as public fields. Case classes also have default
implementations for `toString` and equality making them convenient to use as data objects.

JavaScript doesn't quite have a similar construct, but whenever you would use the regular object notation, consider
using a case class instead.

{% columns %}
{% column 6 ES6 %}
{% highlight javascript %}
const person = {first: "James", last: "Bond"};
{% endhighlight %}
{% endcolumn %}
        
{% column 6 Scala %}
{% highlight scala %}            
case class Person(first: String, last: String)

val person = Person("James", "Bond")
{% endhighlight %}
{% endcolumn %}
{% endcolumns %}

Case classes enforce type safety and prevent constructing invalid objects with missing fields.

Scala compiler automatically generates a proper `equals` method for case classes, making comparing them trivial. In ES6
you would typically go for a library like [lodash](https://lodash.com/docs#isEqual) to avoid writing the complex
comparison code yourself.

{% columns %}
{% column 6 ES6 %}
{% highlight javascript %}
const o1 = {a: 1, x: "test"};
const o2 = {a: 1, x: "test"};

if (o1 != o2) {
  // this doesn't work as expected
  console.log("They are not equal!");
}

if (_.isEqual(o1, o2)) {
  console.log("They are equal!");
}
{% endhighlight %}
{% endcolumn %}
        
{% column 6 Scala %}
{% highlight scala %}
case class AX(a: Int, x: String)

val o1 = AX(1, "test")
val o2 = AX(1, "test")
if (o1 == o2) {
  println("They are equal!")
}
{% endhighlight %}
{% endcolumn %}
{% endcolumns %}

Fields in case classes are immutable by default (unless you define them with `var` modifier) so you cannot make changes
to instances. Instead of modifying the instance you make a copy and modify one or more fields during the copy. Scala
provides a suitable `copy` function for each case class automatically. In ES6 you can use `Object.assign` to achieve the
same result.

{% columns %}
{% column 6 ES6 %}
{% highlight javascript %}
const o1 = {a: 1, x: "test"};

// start with empty object to prevent 
// modification of o1
const o2 = Object.assign({}, o1, {a: 42}); 
{% endhighlight %}
{% endcolumn %}
        
{% column 6 Scala %}
{% highlight scala %}
case class AX(a: Int, x: String)

val o1 = AX(1, "test")
val o2 = o1.copy(a = 42)
{% endhighlight %}
{% endcolumn %}
{% endcolumns %}

Finally case classes can be used nicely in _pattern matching_ which is covered in the advanced section.

#### Objects

An `object` is a special class with only a single instance: a singleton. JavaScript also has a singleton design pattern
(or actually several) even though the language itself does not have direct support for the concept. Singletons are
useful for putting stuff in a shared namespace without polluting the global scope. Scala singletons are lazy in the
sense that they are initialized only when first accessed. In JavaScript you can achieve lazyness, but typically it's
not done as it makes things complicated.

{% columns %}
{% column 6 ES6 %}
{% highlight javascript %}
const RandomGen = {
    _privateMethod() {
        console.log("I am private");
    },
    
    _rnd() { return Math.random() },
    
    publicMethod() {
        console.log("The public can see me!");
        this._privateMethod();
    },
    
    name: "RandomGen",
    
    getRandomNumber() { return this._rnd() }
}

const r = RandomGen.getRandomNumber();
{% endhighlight %}
{% endcolumn %}
        
{% column 6 Scala %}
{% highlight scala %}
import scala.util.Random

object RandomGen {
  private def privateMethod() {
    println("I am private")
  }
  
  private val rnd = new Random()
  
  def publicMethod() {
    println("The public can see me!")
    privateMethod()
  }
  
  val name = "RandomGen"
  
  def getRandomNumber: Double = rnd.nextDouble()
}

val r = RandomGen.getRandomNumber
{% endhighlight %}
{% endcolumn %}
{% endcolumns %}

As you can see, defining singleton objects in Scala is quite trivial thanks to the native support in the language.

Another common use for `object`s in Scala is using them as _companion objects_ for classes to store static variables
and methods shared by all instances of the class.

#### Traits

Scala `trait`s are similar to the mixin design pattern in JavaScript by allowing developer to define behaviors for class
composition. Because of Scala's strict type system, traits are commonly used to describe common _interfaces_ for a group
of implementation classes. JavaScript itself has no need for interfaces, but some extensions like TypeScript support
them for the same purpose as Scala.

{% columns %}
{% column 6 ES6 %}
{% highlight javascript %}
class Circle extends Shape {
  constructor(x, y, r) {
    super(x, y);
    this.r = r;
  }

  draw() {
    console.log(`Circle at ${this.x}, ${this.y} with radius ${this.r}`);
  }
}

const Clickable = {
  onClick() { console.log("Clicked!"); }
};

class ClickableCircle extends Circle {}
Object.assign(ClickableCircle.prototype, Clickable);

const cc = new ClickableCircle(0, 0, 42);
cc.onClick();
{% endhighlight %}
{% endcolumn %}
        
{% column 6 Scala %}
{% highlight scala %}
class Circle(x: Int, y: Int, val r: Int) 
  extends Shape(x, y) {
  override def draw() {
    println(s"Circle at $x, $y with radius $r")
  }
}  

trait Clickable {
  def onClick() { println("Clicked!") }
}

class ClickableCircle(x: Int, y: Int, r: Int) 
  extends Circle(x, y, r) with Clickable

val cc = new ClickableCircle(0, 0, 42)
cc.onClick()            
{% endhighlight %}
{% endcolumn %}
{% endcolumns %}

Note that there are many ways for defining mixins in JavaScript, using `Object.assign` is just one of them supported by
ES6.

## `Option`, the type safe `undefined`

The notorious `undefined` type in JavaScript can be a blessing or a curse. On the other hand it makes life easy by
allowing you to drop function parameters or leave variables undefined. But then it also masks many errors and makes
you write extra code to check for `undefined`. Quite often `undefined` is used to make a distinction between an
existing value (of any type) and a missing value.

Scala doesn't have `undefined` (it does have `null` but its use is discouraged), but instead it has an 
{% scaladoc Option %} trait for representing optional values. In Scala.js the `undefined` type exists to support
interoperability with JS libraries, but even there it is recommended to use `Option` whenever possible.

`Option[A]` is a container for an optional value of type `A`. If the value of type `A` is present, the `Option[A]` is an
instance of `Some[A]`, containing the present value of type `A`. If the value is absent, the `Option[A]` is the object
`None`.

{% columns %}
{% column 6 ES6 %}
{% highlight javascript %}
function log(msg, context) {
  let s;
  if (context !== undefined)
    s = `[${context}] ${msg}`;
  else 
    s = msg;  
  console.log(s);
};

// produces: First message
log("First message"); 
// produces: [debug] Second message
log("Second message", "debug"); 
{% endhighlight %}
{% endcolumn %}
        
{% column 6 Scala %}
{% highlight scala %}
def log(msg: String, context: Option[String] = None) {
  val s = context match {
    case Some(c) => s"[$c] $msg"
    case None => msg
  }
  println(s)
}

log("First message")
log("Second message", Some("debug"))
{% endhighlight %}
{% endcolumn %}
{% endcolumns %}

Pattern matching works nicely with `Option`, but there are more powerful ways to use it. Let's rewrite the previous
function another way giving us the same result.

{% columns %}
{% column 9 Scala %}
{% highlight scala %}
def log(msg: String, context: Option[String] = None) {
  val s = context.map(c => s"[$c] $msg").getOrElse(msg)
  println(s)
}
{% endhighlight %}
{% endcolumn %}
{% endcolumns %}

Whoa, quite a reduction in code size! Next let's see how we can process a sequence of option values.

{% columns %}
{% column 6 ES6 %}
{% highlight javascript %}
const data = [1, 2, 3, undefined, 5, undefined, 7];
const res = data.filter((x) => x !== undefined);
{% endhighlight %}
{% endcolumn %}
        
{% column 6 Scala %}
{% highlight scala %}
val data = Array(Some(1), Some(2), Some(3), 
  None, Some(5), None, Some(7))
val res = data.filter(x => x.isDefined)
{% endhighlight %}
{% endcolumn %}
{% endcolumns %}

`Option` provides many _collection like_ methods like `map`, `filter` and `flatMap`, which are discussed in the [next
chapter](es6_to_scala_part2.html).
