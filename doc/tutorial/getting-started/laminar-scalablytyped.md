---
layout: doc
title: Getting Started with Laminar and ScalablyTyped
---

In this second tutorial, we learn how to develop UIs in Scala.js with [Laminar](https://laminar.dev/) and how to integrate JavaScript libraries with [ScalablyTyped](https://scalablytyped.org/).

We start here with the project setup developed in the previous tutorial about [Setting up Scala.js with Vite](./scalajs-vite.html).
To follow along this tutorial, either use the result of the previous tutorial, or checkout [the scalajs-vite-end-state branch](https://github.com/sjrd/scalajs-sbt-vite-laminar-chartjs-example/tree/scalajs-vite-end-state) of the accompanying repo.

If you prefer to navigate the end result for this tutorial directly, checkout [the laminar-scalablytyped-end-state branch](https://github.com/sjrd/scalajs-sbt-vite-laminar-chartjs-example/tree/laminar-scalablytyped-end-state) instead.

## Prerequisites

Make sure to install [the prerequisites](./index.html#prerequisites) before continuing further.

## Introducing Laminar

[Laminar](https://laminar.dev/) is a Scala.js library to build UIs using Functional Reactive Programming (FRP).
FRP is a hybrid model between imperative and functional programming.
It is particularly well suited to developing UIs in Scala, as we can reason about relationships between immutable values while dealing with the changing nature of the UI.
We will elaborate on this point later.

To start off, we add a dependency on Laminar in our `build.sbt`:

{% highlight diff %}
     libraryDependencies += "org.scala-js" %%% "scalajs-dom" % "2.2.0",
+
+    // Depend on Laminar
+    libraryDependencies += "com.raquo" %%% "laminar" % "0.14.2",
   )
{% endhighlight %}

Once that is done, start the incremental compiler:

{% highlight shell %}
$ sbt
[...]
sbt:livechart> ~fastLinkJS
[...]
{% endhighlight %}

If sbt was already running, run `reload` for the changes in `build.sbt` to take effect, then start the incremental compiler with `~fastLinkJS`.

Additionally, start Vite's development server if it wasn't already running:

{% highlight shell %}
$ npm run dev
[...]
{% endhighlight %}

We can now change the contents of `src/main/scala/livechart/LiveChart.scala` to use Laminar instead of vanilla DOM APIs.

At the top, we use the following import:

{% highlight scala %}
import com.raquo.laminar.api.L.{*, given}
{% endhighlight %}

That import brings all the Laminar features we want into scope.

We replace the contents of the main `def LiveChart` method with a call to Laminar's `renderOnDomContentLoaded` method.
This method bootstraps Laminar by installing a Laminar `Element` in an existing DOM element:

{% highlight scala %}
@main
def LiveChart(): Unit =
  renderOnDomContentLoaded(
    dom.document.getElementById("app"),
    Main.appElement()
  )
{% endhighlight %}

and we then define `Main.appElement` as follows:

{% highlight scala %}
object Main:
  def appElement(): Element =
    div(
      a(href := "https://vitejs.dev", target := "_blank",
        img(src := "/vite.svg", className := "logo", alt := "Vite logo"),
      ),
      a(href := "https://developer.mozilla.org/en-US/docs/Web/JavaScript", target := "_blank",
        img(src := javascriptLogo, className := "logo vanilla", alt := "JavaScript logo"),
      ),
      h1("Hello Laminar!"),
      div(className := "card",
        button(tpe := "button"),
      ),
      p(className := "read-the-docs",
        "Click on the Vite logo to learn more",
      ),
    )
  end appElement
end Main
{% endhighlight %}

Instead of using HTML tags in a big string, we use Laminar functions corresponding to every kind of DOM element.
In the parameters, we can specify both attributes, using the `:=` operator, and child elements.

Every reference is type-checked.
If we misspell `button` as `buton`, or if we try to put an integer in `target := 0`, the compiler will flag it as an error.

### Code of the button

Now, we have not yet replicated the behavior of the button.
Previously the code using the DOM API was the following:

{% highlight scala %}
def setupCounter(element: dom.Element): Unit =
  var counter = 0

  def setCounter(count: Int): Unit =
    counter = count
    element.innerHTML = s"count is $counter"

  element.addEventListener("click", e => setCounter(counter + 1))
  setCounter(0)
end setupCounter
{% endhighlight %}

In Laminar, we do not use event listeners to directly mutate the attributes of DOM elements.
Instead, we use `Var`s and `Signal`s to model *time-varying* values.

Let us isolate the button definition in a separate method, and illustrate how to write its behavior using Laminar:

{% highlight scala %}
  def counterButton(): Element =
    val counter = Var(0)
    button(
      tpe := "button",
      "count is ",
      child.text <-- counter,
      onClick --> { event => counter.update(c => c + 1) },
    )
  end counterButton
{% endhighlight %}

We declare `counter` as a `Var[Int]` initialized with `0`.
We then use it in two *bindings*:

* In `child.text <-- counter`, we declare a text child of the button whose content will always reflect the value of `counter`.
  As the value of `counter` changes over time, so does the text in the button.
* In `counter.update(c => c + 1)`, we schedule an update of the value of `counter`, to be increased by 1.
  We schedule that as a result of the `onClick -->` event of the button.

We do not need to explicitly set the `innerHTML` attribute of the button.
That is taken care of by the `<--` binding.

Unlike frameworks based on a virtual DOM, Laminar bindings directly target the DOM element to update.
With a virtual DOM, when the value of `counter` changes, we would build an entirely new VDOM representation for the button (and perhaps its parents), and the framework would later diff it and identify which DOM `HTMLButtonElement` to update.
In Laminar, however, the `<--` binding remembers the precise instance of `HTMLButtonElement` to update, and directly modifies its text.
This is more efficient than going through the VDOM indirection.

Beside `:=`, the two binding arrows `<--` and `-->` are the only symbolic operators that Laminar defines.
`:=` is a static binding.
It can be seen as a `<--` with a time-immutable value on the right.
The left arrow `<--` makes data flow from the right to the left; it is usually used with DOM attributes on the left and *signals* on the right.
The right arrow `-->` makes data flow from the left to the right; it is usually used with DOM *events* on the left and *observers* on the right.
It helps to visualize the UI as being "on the left" and the application data model as being "on the right".

## `Var`s, `Signal`s, and Functional Reactive Programming

Before going further, let us look more closely at what *are* `Var`s and `Signal`s.

Consider the following three definitions:

{% highlight scala %}
val intVar: Var[Int] = Var(1)
val intSignal: Signal[Int] = intVar.signal
val times2Signal: Signal[Int] = intSignal.map(_ * 2)
{% endhighlight %}

The first definition is a `Var` containing an `Int`, like the `counter` we used before.
It is initialized with the value `1`, but its value can evolve over time.

A `Var` is a read-write container.
Often, we want to give access to its value in a read-only way, which is what `intVar.signal` does.

A `Signal` is a read-only view of some time-varying value.
`Signal`s are similar to Scala immutable collections.
Whereas collections give values as functions of *indices*, signals give them as functions of *time*.
As time progresses, the value in a `Signal` can change.

Like collections, we can manipulate signals with the typical higher-order functions.
For example, we use `map` here to get another `times2Signal: Signal` whose time-varying value is always twice that of `intSignal`.

We can visualize those relationships in a diagram.

![Diagram of Vars and Signals](./vars-and-signals.svg)

We can schedule updates to `intVar` by using its `update` method.
When we schedule `intVar.update(_ + 2)` (equivalently, `.update(x => x + 2)`), we increase its time-varying value by 2.
Automatically, the time-varying values in `intSignal` and `times2Signal` change to maintain the relationships.

`Var`s and `Signal`s are the core concepts of **Functional Reactive Programming** (FRP).
This paradigm is a hybrid between functional programming, in which we manipulate immutable values, and imperative programming, where time plays a role.
Unlike imperative programming, when we change the value behind a `Var` that was used to compute derived `Signal`s, the latter are automatically updated.
This ensures that *relationships* between `Var`s and `Signal`s are maintained at all times.
Thanks to these properties, we can reason about our program in a very similar way that we do when using only immutable values, as is the case in functional programming.

## Chart data in Laminar - the Model

We can now start developing our live chart application in earnest.
The first thing we need is a *model* for the data that we want to edit and render.
We will focus on a bar chart with string labels and numeric values.
Therefore, an immutable model of our data can look like the following:

{% highlight scala %}
final class DataItemID

case class DataItem(id: DataItemID, label: String, value: Double)

object DataItem:
  def apply(): DataItem = DataItem(DataItemID(), "?", Math.random())
end DataItem

type DataList = List[DataItem]
{% endhighlight %}

In addition to a `label` and a `value`, we include an `id: DataItemID` in our `DataItem` class.
The ID will serve to uniquely identify rows of our table even if they happen to have the same label and value.
Think about a delete button on each row: if we click it, we would like the corresponding row to be removed, not another one with the same content.

Since we want our chart to be editable, we will need to change the table data over time.
For that purpose, we put the entire `DataList` in a `Var`, as follows:

{% highlight scala %}
val dataVar: Var[DataList] = Var(List(DataItem(DataItemID(), "one", 1.0)))
val dataSignal = dataVar.signal
{% endhighlight %}

We also define two functions that will add a new random item, and remove a specific item (given its ID):

{% highlight scala %}
def addDataItem(item: DataItem): Unit =
  dataVar.update(data => data :+ item)

def removeDataItem(id: DataItemID): Unit =
  dataVar.update(data => data.filter(_.id != id))
{% endhighlight %}

## Chart data in Laminar - Rendering as a table

Before rendering our data in a real chart, let us focus on rendering the *table* view of that data.

{% highlight scala %}
def appElement(): Element =
  div(
    h1("Live Chart"),
    renderDataTable(),
  )
end appElement

def renderDataTable(): Element =
  table(
    thead(tr(th("Label"), th("Value"), th("Action"))),
    tbody(
      children <-- dataSignal.map(data => data.map { item =>
        renderDataItem(item.id, item)
      }),
    ),
    tfoot(tr(td(button("+", onClick --> (_ => addDataItem(DataItem())))))),
  )
end renderDataTable

def renderDataItem(id: DataItemID, item: DataItem): Element =
  tr(
    td(item.label),
    td(item.value),
    td(button("🗑️", onClick --> (_ => removeDataItem(id)))),
  )
end renderDataItem
{% endhighlight %}

Let us pick apart the above.
First, the bottommost function, `renderDataItem`, takes one `DataItem` and renders a table row (`tr`) for that item.
The row contains the `label` and the `value` as text, and a Remove `button`.
Recall from our initial example with a `counter` that `onClick --> (event => action)` performs the given `action` on every click event.
Since we do not care about the properties of the event, we use `_` instead.
The action is to call `removeDataItem(id)`, which will schedule an update to the root `dataVar`, filtering out the data item with the given `id`.

Similarly, in `renderDataTable`, the footer of the table contains a `button` whose action is to add a new random data item to the chart data.

In the `tbody` element, we have to render a row for every item in the chart data list.
The list `dataSignal` is a time-varying `Signal[List[DataItem]]`.
From that, we have to derive a `Signal[List[Element]]`.
We do so with two nested `map`s: the outer one is `Signal.map`, while the inner one is `List.map`:

{% highlight scala %}
dataSignal.map(data => data.map { item =>
  renderDataItem(item.id, item)
})
{% endhighlight %}

`data` is of type `List[DataItem]`, and `item` is of type `DataItem`.

Finally, to render the `Signal[List[Element]]` as children of the `tbody` node, we use Laminar's `children <--` binder:

{% highlight scala %}
tbody(
  children <-- dataSignal.map(data => data.map { item =>
    renderDataItem(item.id, item)
  }),
),
{% endhighlight %}

As the value in the `Signal[List[Element]]` changes over time, so will the list of actual DOM children of the `tbody` node.

[See it in action and fiddle with the code in Scribble](https://scribble.ninja/u/sjrd/dihfmcxjlbvlayinfcvwyiirvgb)

## Splitting

When you play with the Scribble above, you may notice a suboptimal behavior:

1. Select something within one row of the table.
1. Click the Add button, or the Remove button of some other row.
1. The selection gets lost.

This is a symptom of a deeper issue with our existing code.
Every time one item changes, we recreate an entirely new `List[Element]`.
Even for items that stay the same, we discard the old `tr` element and create a new one.

As long as all we have is text within the rows, the only issues we may encounter are the selection issue and suboptimal performance.
However, if we put form fields in the rows, the experience will significantly degrade.

We would like to *reuse* the `tr` elements for the `DataItem`s that were already rendered before.
Ideally, for any given `id: DataItemID`, we would like the same rendered `tr` to be reused.

This is exactly what Laminar's `split` method provides.
Let us amend the binding for `children` as follows:

{% highlight scala %}
children <-- dataSignal.split(_.id) { (id, initial, itemSignal) =>
  renderDataItem(id, itemSignal)
},
{% endhighlight %}

`split` can be applied on a `Signal[List[T]]` and returns a `Signal[List[U]]`.
Whereas `map` would systematically create new output values, `split` reuses the output values for the inputs whose `_.id` is the same as before.
In other words, `_.id` is the *key* used by `split` to find previously rendered elements.

For input elements whose key (or ID) existed before, it reuses a previously computed element.
For new input elements, with an unknown key, it calls the 3-parameter function with the following arguments:

1. `id: DataItemID`: the key of the newly found input element.
1. `initial: DataItem`: the input element with that ID, as found the first time.
1. `itemSignal: Signal[DataItem]`: a signal of all the `DataItem`s that will be found with the same `id` in the future, starting with `initial` itself.

The `id` is the only field taken into account to reuse an output element.
Therefore, if a future input contains a different `DataItem` with the same `id`, it will return the same output element.
That `DataItem` will then become the new value of the time-varying `itemSignal`.
This is why we now pass `itemSignal` to `renderDataItem`, which we amend to accept a `Signal[DataItem]`:

{% highlight diff %}
-  def renderDataItem(id: DataItemID, item: DataItem): Element =
+  def renderDataItem(id: DataItemID, itemSignal: Signal[DataItem]): Element =
     tr(
-      td(item.label),
-      td(item.value),
+      td(child.text <-- itemSignal.map(_.label)),
+      td(child.text <-- itemSignal.map(_.value)),
       td(button("🗑️", onClick --> (_ => removeDataItem(id)))),
     )
   end renderDataItem
{% endhighlight %}

We cannot directly read `item.label` or `item.value` anymore.
Instead, we use `map` to get time-varying views of the label and value, which we bind to the text of the `td` elements using `child.text <--`.
You may recall that we had done something very similar in our initial `counter` example:

{% highlight scala %}
    button(
      ...
      "count is ",
      child.text <-- counter,
      ...
    )
{% endhighlight %}

We now have optimal reuse of `tr` elements based on the `id` of the input `DataItem`s.

[See it in action and fiddle with the code in Scribble](https://scribble.ninja/u/sjrd/cwhugissosbhkucvskpwbqedrntp)

## The actual chart

We had promised a bar chart, but all we have so far is a DOM `table`.
It is time to introduce [Chart.js](https://www.chartjs.org/), a JavaScript library that draws beautiful charts.
In order to get static types and bindings for Chart.js, we use [ScalablyTyped](https://scalablytyped.org/).
ScalablyTyped can read TypeScript type definition files and produce corresponding [Scala.js facade types](/doc/interoperability/facade-types.html).

### Build setup

We set up our new dependencies as follows.

In `project/plugins.sbt`, we add a dependency on ScalablyTyped:

{% highlight scala %}
addSbtPlugin("org.scalablytyped.converter" % "sbt-converter" % "1.0.0-beta40")
{% endhighlight %}

In `package.json`, we add dependencies on Chart.js, its TypeScript type definitions, and on the TypeScript compiler, which is required by ScalablyTyped:

{% highlight diff %}
+  "dependencies": {
+    "chart.js": "2.9.4"
+  },
   "devDependencies": {
-    "vite": "^3.2.3"
+    "vite": "^3.2.3",
+    "typescript": "4.6.2",
+    "@types/chart.js": "2.9.29"
   }
{% endhighlight %}

Finally, in `build.sbt`, we configure ScalablyTyped on our project:

{% highlight diff %}
 lazy val livechart = project.in(file("."))
   .enablePlugins(ScalaJSPlugin) // Enable the Scala.js plugin in this project
+  .enablePlugins(ScalablyTypedConverterExternalNpmPlugin)
   .settings(
     scalaVersion := "3.2.1",
     [...]
     // Depend on Laminar
     libraryDependencies += "com.raquo" %%% "laminar" % "0.14.2",
+
+    // Tell ScalablyTyped that we manage `npm install` ourselves
+    externalNpm := baseDirectory.value,
   )
{% endhighlight %}

For these changes to take effect, we have to perform the following steps:

1. Stop sbt and Vite, if they are running
1. Run `npm install` to install the new npm dependencies
1. Restart sbt and the `~fastLinkJS` task (this will take a while the first time, as ScalablyTyped performs its magic)
1. Restart `npm run dev`
1. Possibly re-import the project in your IDE of choice

### Implementing the chart

We can now render our chart.
First, we define the Chart.js configuration that we will use:

{% highlight scala %}
  val chartConfig =
    import typings.chartJs.mod.*
    new ChartConfiguration {
      `type` = ChartType.bar
      data = new ChartData {
        datasets = js.Array(new ChartDataSets {
          label = "Value"
          borderWidth = 1
        })
      }
      options = new ChartOptions {
        scales = new ChartScales {
          yAxes = js.Array(new CommonAxe {
            ticks = new TickOptions {
              beginAtZero = true
            }
          })
        }
      }
    }
  end chartConfig
{% endhighlight %}

At the top, we import the facade types for Chart.js generated by ScalablyTyped:

{% highlight scala %}
import typings.chartJs.mod.*
{% endhighlight %}

This gives us access to types like `ChartConfiguration` and `ChartType`.

Inside the `ChartConfiguration`, we provide a number of Chart.js-related options to make our chart look the way we want:

* the type of chart as a bar chart: `type = ChartType.bar`,
* a unique dataset with the label `"Value"`, and
* the `y` axis' start value as `0`.

All of these configuration options are type-checked, using the static types provided by ScalablyTyped.
If written in JavaScript, the above configuration would read as:

{% highlight javascript %}
{
  type: "bar",
  data: {
    datasets: [{
      label: "Value",
      borderWidth: 1
    }]
  },
  options: {
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    }
  }
}
{% endhighlight %}

We now amend our `appElement()` method to also call a new `renderDataChart()` function:

{% highlight diff %}
  def appElement(): Element =
     div(
       h1("Live Chart"),
       renderDataTable(),
+      renderDataChart(),
     )
   end appElement
{% endhighlight %}

The implementation of `renderDataChart()` is rather large.
We show it in its entirety first, then we will pick it apart.

{% highlight scala %}
  def renderDataChart(): Element =
    import scala.scalajs.js.JSConverters.*
    import typings.chartJs.mod.*

    var optChart: Option[Chart] = None

    canvas(
      // Regular properties of the canvas
      width := "100%",
      height := "200px",

      // onMountUnmount callback to bridge the Laminar world and the Chart.js world
      onMountUnmountCallback(
        // on mount, create the `Chart` instance and store it in optChart
        mount = { nodeCtx =>
          val domCanvas: dom.HTMLCanvasElement = nodeCtx.thisNode.ref
          val chart = Chart.apply.newInstance2(domCanvas, chartConfig)
          optChart = Some(chart)
        },
        // on unmount, destroy the `Chart` instance
        unmount = { thisNode =>
          for (chart <- optChart)
            chart.destroy()
          optChart = None
        }
      ),

      // Bridge the FRP world of dataSignal to the imperative world of the `chart.data`
      dataSignal --> { data =>
        for (chart <- optChart) {
          chart.data.labels = data.map(_.label).toJSArray
          chart.data.datasets.get(0).data = data.map(_.value).toJSArray
          chart.update()
        }
      },
    )
  end renderDataChart
{% endhighlight %}

We create a Laminar `canvas()` element.
We give it a `width` and `height` using Laminar's `:=`, as we did before.

For its actual content, we want Chart.js to take over.
For that, we have to create an instance of `Chart` referencing the DOM `HTMLCanvasElement`.
In order to bridge the world of Laminar `Element`s and Chart.js, we use `onMountUnmountCallback`.

That function takes one callback executed when the element is attached to a DOM tree, and one when it is removed.
When the element is mounted, we want to create the instance of `Chart`.
When it is unmounted, we want to call the `destroy()` method of Chart.js to release its resources.

The `mount` callback receives a `nodeCtx`, which, among other things, gives us a handle to the underlying `HTMLCanvasElement`.
We name it `domCanvas`, and use it together with the `chartConfig` defined above to create an instance of Chart.js' `Chart` class:

{% highlight scala %}
val domCanvas: dom.HTMLCanvasElement = nodeCtx.thisNode.ref
val chart = Chart.apply.newInstance2(domCanvas, chartConfig)
{% endhighlight %}

We store the resulting `chart` instance in a local `var optChart: Option[Chart]`.
We will use it later to update the `chart`'s imperative data model when our FRP `dataSignal` changes.

In order to achieve that, we use a `dataSignal -->` binder.
Once the `canvas` gets mounted, every time the value of `dataSignal` changes, the callback is executed.

{% highlight scala %}
dataSignal --> { data =>
  for (chart <- optChart) {
    chart.data.labels = data.map(_.label).toJSArray
    chart.data.datasets.get(0).data = data.map(_.value).toJSArray
    chart.update()
  }
},
{% endhighlight %}

In the callback, we get access to the `chart: Chart` instance and update its data model.
This `-->` binder allows to bridge the FRP world of `dataSignal` with the imperative world of Chart.js.

Note that we put the `-->` binder as an argument to the Laminar `canvas` element.
This may seem suspicious, as neither `dataSignal` nor the callback have any direct relationship to the DOM canvas element.
We do this to tie the lifetime of the binder to the lifetime of the `canvas` element.
When the latter gets unmounted, we release the binder connection, possibly allowing resources to be reclaimed.

In general, every binder must be *owned* by a Laminar element.
It only gets *activated* when that element is mounted.
This prevents memory leaks.

Our application now properly renders the data model as a chart.
When we add or remove data items, the chart is automatically updated, thanks to the connection established by the `dataSignal -->` binder.

## Editing labels

The last touch to our application is to allow direct editing of the `label` and `value` of data items.

Recall our earlier function generating a table row for a `Signal[DataItem]`:

{% highlight scala %}
  def renderDataItem(id: DataItemID, itemSignal: Signal[DataItem]): Element =
    tr(
      td(child.text <-- itemSignal.map(_.label)),
      td(child.text <-- itemSignal.map(_.value)),
      td(button("🗑️", onClick --> (_ => removeDataItem(id)))),
    )
  end renderDataItem
{% endhighlight %}

Instead of using a `child.text` for the label, we now use an `<input>` element.
Its value should at all times reflect the time-varying value within `itemSignal.map(_.label)`.
Conversely, if we change the value from the UI, the data model should be updated accordingly.

{% highlight scala %}
  def renderDataItem(id: DataItemID, itemSignal: Signal[DataItem]): Element =
    tr(
      td(
        input(
          typ := "text",
          value <-- itemSignal.map(_.label),
          onInput.mapToValue --> { (newLabel: String) =>
            dataVar.update { data =>
              data.map { item =>
                if item.id == id then item.copy(label = newLabel) else item
              }
            }
          },
        )
      ),
      td(child.text <-- itemSignal.map(_.value)),
      td(button("🗑️", onClick --> (_ => removeDataItem(id)))),
    )
  end renderDataItem
{% endhighlight %}

Similarly to `child.text <-- itemSignal.map(_.label)`, we now use `value <--`.
When the contents of the `Signal` changes over time, the `value` is automatically updated.
In the other direction, we use `onInput.mapToValue -->` to execute a callback every time the user updates the value from the UI.
Within the callback, we schedule an update to our `dataVar`.

With these changes, we can already edit the labels of our data items.
Once again, as the chart directly feeds from the `dataVar`, any changes there are automatically reflected.
We do not have to touch the chart rendering method.

We can improve our code a bit through a few refactorings.

A callback directly feeding into `someVar.update` is a common pattern.
Laminar provides a dedicated method on `Var` for that:

{% highlight diff %}
         input(
           typ := "text",
           value <-- itemSignal.map(_.label),
-          onInput.mapToValue --> { (newLabel: String) =>
-            dataVar.update { data =>
+          onInput.mapToValue --> dataVar.updater[String] { (data, newLabel) =>
             data.map { item =>
               if item.id == id then item.copy(label = newLabel) else item
             }
-            }
           },
         )
{% endhighlight %}

Now, we can see another pattern emerging, not related to Laminar, but to our own model.
We change a single `DataItem` in our model by `map`ping over the `data` list and transforming a single element based on its `id`.
We can refactor this pattern as a separate method.
We make that method generic in the type of value, as we will reuse it later for the `Double` values of data items.

{% highlight scala %}
  def renderDataItem(id: DataItemID, itemSignal: Signal[DataItem]): Element =
    ...
          onInput.mapToValue --> makeDataItemUpdater[String](id, {
            (item, newLabel) =>
              item.copy(label = newLabel)
          }),
    ...
  end renderDataItem

  def makeDataItemUpdater[A](id: DataItemID,
      f: (DataItem, A) => DataItem): Observer[A] =
    dataVar.updater { (data, newValue) =>
      data.map { item =>
        if item.id == id then f(item, newValue) else item
      }
    }
  end makeDataItemUpdater
{% endhighlight %}

As a final refactoring step, we notice the following pattern:

{% highlight scala %}
        input(
          typ := "text",
          value <-- someSignalOfString,
          onInput.mapToValue --> someObserverOfString,
        )
{% endhighlight %}

It represents an `input` text whose `value` is linked to `Signal[String]`, which can be updated through some `Observer[String]`.
We can define a separate method for this pattern as follows:

{% highlight scala %}
  def renderDataItem(id: DataItemID, itemSignal: Signal[DataItem]): Element =
    ...
      td(
        inputForString(
          itemSignal.map(_.label),
          makeDataItemUpdater(id, { (item, newLabel) =>
            item.copy(label = newLabel)
          })
        )
      ),
    ...
  end renderDataItem

  def inputForString(valueSignal: Signal[String],
      valueUpdater: Observer[String]): Input =
    input(
      typ := "text",
      value <-- valueSignal,
      onInput.mapToValue --> valueUpdater,
    )
  end inputForString
{% endhighlight %}

Consider what this method represents.
It takes data model values as arguments, and returns a Laminar element manipulating those values.
This is what many UI frameworks call a *component*.
In Laminar, components are nothing but methods manipulating time-varying data and returning Laminar elements.

## Editing values

To finish our application, we must be able to edit *values* as well as labels.
We start with a "component" method building an `Input` that manipulates `Double` values.

{% highlight scala %}
  def inputForDouble(valueSignal: Signal[Double],
      valueUpdater: Observer[Double]): Input =
    val strValue = Var[String]("")
    input(
      typ := "text",
      value <-- strValue.signal,
      onInput.mapToValue --> strValue,
      valueSignal --> strValue.updater[Double] { (prevStr, newValue) =>
        if prevStr.toDoubleOption.contains(newValue) then prevStr
        else newValue.toString
      },
      strValue.signal --> { valueStr =>
        valueStr.toDoubleOption.foreach(valueUpdater.onNext)
      },
    )
  end inputForDouble
{% endhighlight %}

It is more complicated than the one for `String`s because of the need for parsing and formatting.
This complexity perhaps better highlights the benefit of encapsulating it in a dedicated method (or component).

We leave it to the reader to understand the details of this method.
We point out that we use an intermediate, local `Var[String]` to hold the actual text of the `input` element.
We then write separate transformations to link that `Var[String]` to the string representation of the `Double` signal and updater.

Finally, we update our `renderDataItem` method to use our new double input:

{% highlight scala %}
  def renderDataItem(id: DataItemID, itemSignal: Signal[DataItem]): Element =
    tr(
      td(
        inputForString(
          itemSignal.map(_.label),
          makeDataItemUpdater(id, { (item, newLabel) =>
            item.copy(label = newLabel)
          })
        )
      ),
      td(
        inputForDouble(
          itemSignal.map(_.value),
          makeDataItemUpdater(id, { (item, newValue) =>
            item.copy(value = newValue)
          })
        )
      ),
      td(button("🗑️", onClick --> (_ => removeDataItem(id)))),
    )
  end renderDataItem
{% endhighlight %}

## Conclusion

That concludes our tutorial on Laminar and ScalablyTyped.

We saw how to use Laminar for UI development in Scala.js.
We discovered the Functional Reactive Programming (FRP) model used by Laminar.
This model is particularly suited to UI development in Scala.
With its time-varying values, it offers a balance between the changing world of UIs and the reasoning about immutable data that we favor in Scala.
We mentioned how to define "components" in Laminar as mere methods manipulating `Signal`s and `Observer`s.

Finally, we saw how to integrate JavaScript libraries in a Scala.js application, using ScalablyTyped.
