// any link that is not part of the current domain is modified

(function () {
  var links = document.links;
  for (var i = 0; i < links.length; i++) {
    if (links[i].hostname != window.location.hostname && links[i].target == "") {
      links[i].target = '_blank';
    }
  }
})();

$(document).ready(function () {
  var index, store;

  $('pre code').each(function(i, block) {
    hljs.highlightBlock(block);
  });

  $(".show-snippet-link").click(function (e) {
    e.preventDefault();
    var language = $(this).data("language");
    $(".snippet").hide();
    $(".snippet-" + language).show();
    $(".show-snippet-tab").removeClass("active");
    $(this.parentNode).addClass("active");
  });

  function switchSearchBox() {
    if ($("#search-box").is(":visible")) {
      $("#search-box").fadeOut('fast');
    } else {
      $("#search-box").fadeIn('fast');
      $("#search-term").val("").focus();
      $("#search-results").empty().hide();
    }
  }

  // show search view when icon is clicked
  $("#search-icon").on("click", function (e) {
    e.stopPropagation();
    $(this).blur();
    switchSearchBox();
  });

  $("#search-term").on('keyup', function (e) {
    if (e.keyCode == 27) {
      switchSearchBox();
      return;
    }
    if (index) {
      var query = this.value;
      var result = index.search(query);
      var resultDiv = $("#search-results");
      resultDiv.empty();
      if (result.length == 0) {
        resultDiv.append("<p class='csmall'>No results</p>");
      } else {
        resultDiv.append("<p class='csmall'>Results</p>");
        for (var i in result.slice(0, 9)) {
          var ref = result[i].ref;
          var searchItem = "<p><a href='" + store[ref].href + "'>" + store[ref].title + "</a></p>";
          resultDiv.append(searchItem);
        }
        resultDiv.show();
      }
    }
  });

  // hide search-box when clicked outside it
  $(document).click(function (event) {
    if (!$(event.target).closest('#search-box').length) {
      if ($("#search-box").is(":visible")) {
        $("#search-box").fadeOut('fast');
      }
    }
  });

  $(".navbar-toggle").on("click", function (e) {
    // check if menu is collapsed and hide search window as well
    var btn = $(this);
    window.setTimeout(function () {
      // delayed execution to allow Bootstrap code to do its thing first
      if (btn.hasClass("collapsed")) {
        $("#search-box").fadeOut();
      }
    }, 0);
  });

  // load search index
  $.getJSON('/search_data.json', function (response) {
    // Create index
    index = lunr.Index.load(response.index);
    // Create store
    store = response.store;
  });
});

hljs.initHighlightingOnLoad();

// Setup benchmark charts
onloadFunctions.push(function setupBenchmarkCharts() {
  var benchmarkDivs = document.querySelectorAll("div[data-benchmarks]");
  if (benchmarkDivs.length === 0)
    return;

  var Configs = [
    "es2015 prod yes-opt no-gcc Chrome",
    "es2015 prod yes-opt no-gcc Firefox",
    "es2015 prod yes-opt no-gcc Node.js",
    "es5.1 dev no-opt no-gcc Chrome",
    "es5.1 dev no-opt no-gcc Firefox",
    "es5.1 dev no-opt no-gcc Node.js",
    "es5.1 dev yes-opt no-gcc Chrome",
    "es5.1 dev yes-opt no-gcc Firefox",
    "es5.1 dev yes-opt no-gcc Node.js",
    "es5.1 prod no-opt no-gcc Chrome",
    "es5.1 prod no-opt no-gcc Firefox",
    "es5.1 prod no-opt no-gcc Node.js",
    "es5.1 prod no-opt yes-gcc Chrome",
    "es5.1 prod no-opt yes-gcc Firefox",
    "es5.1 prod no-opt yes-gcc Node.js",
    "es5.1 prod yes-opt no-gcc Chrome",
    "es5.1 prod yes-opt no-gcc Firefox",
    "es5.1 prod yes-opt no-gcc Node.js",
    "es5.1 prod yes-opt yes-gcc Chrome",
    "es5.1 prod yes-opt yes-gcc Firefox",
    "es5.1 prod yes-opt yes-gcc Node.js",
    "js Node.js"
  ];

  var RawData = {
    bounce: [1.17, 4.15, 0.97, 4.63, 8.15, 4.54, 2.98, 1.32, 2.09, 4.04, 6.24, 3.78, 3.16, 4.12, 3.00, 2.18, 1.04, 1.05, 1.10, 1.46, 1.16, NaN],
    brainfuck: [3.86, 7.69, 3.46, 9.27, 17.79, 8.92, 6.08, 7.08, 5.73, 6.65, 15.21, 6.31, 6.24, 11.17, 5.99, 3.80, 4.93, 3.41, 3.42, 4.22, 3.26, NaN],
    cd: [3.41, 41.57, 3.44, 4.89, 6.90, 4.75, 3.81, 4.82, 3.69, 4.23, 6.20, 4.09, 3.70, 5.59, 3.60, 3.19, 4.39, 3.24, 3.19, 4.29, 3.12, NaN],
    deltablue: [1.41, 62.36, 1.40, 4.24, 10.20, 4.19, 3.03, 4.35, 3.03, 2.60, 8.25, 2.51, 2.40, 6.07, 2.36, 1.34, 3.05, 1.11, 1.09, 3.38, 1.02, 0.8],
    gcbench: [3.81, 121.06, 3.40, 3.54, 8.96, 3.18, 3.64, 6.86, 3.20, 3.46, 7.17, 3.21, 2.78, 5.25, 2.57, 3.69, 7.04, 3.29, 1.31, 1.53, 1.57, NaN],
    json: [1.61, 9.89, 1.31, 1.93, 3.78, 1.52, 1.64, 3.01, 1.34, 1.85, 3.30, 1.39, 1.62, 3.02, 1.25, 1.51, 3.15, 1.20, 1.51, 2.80, 1.21, NaN],
    kmeans: [2.68, 18.97, 2.54, 4.49, 7.02, 4.29, 3.38, 4.90, 3.20, 3.38, 6.22, 3.25, 3.13, 4.73, 2.97, 2.58, 3.73, 2.41, 2.58, 3.86, 2.47, NaN],
    list: [2.43, 3.80, 2.36, 2.38, 6.41, 2.36, 2.41, 5.78, 2.43, 2.37, 6.44, 2.37, 2.42, 6.51, 2.38, 2.43, 5.77, 2.37, 2.42, 6.52, 2.44, NaN],
    mandelbrot: [0.85, 0.92, 0.85, 0.85, 0.92, 0.85, 0.85, 0.93, 0.85, 0.85, 0.93, 0.85, 0.85, 0.97, 0.85, 0.85, 0.93, 0.85, 0.85, 0.96, 0.85, NaN],
    nbody: [1.19, 4.84, 1.12, 2.56, 3.35, 2.50, 1.54, 1.77, 1.45, 2.20, 2.79, 2.18, 2.32, 2.14, 2.30, 1.16, 1.26, 1.11, 1.16, 1.26, 1.11, NaN],
    permute: [3.11, 154.25, 2.98, 4.84, 11.26, 4.70, 3.28, 5.25, 2.88, 3.56, 10.17, 3.31, 3.52, 6.49, 3.31, 2.76, 4.47, 2.58, 2.78, 4.13, 2.54, NaN],
    queens: [14.06, 24.95, 18.30, 13.72, 33.58, 14.10, 3.94, 16.42, 4.38, 12.63, 31.42, 13.54, 11.36, 26.33, 11.17, 3.76, 16.87, 3.92, 3.78, 15.39, 3.94, NaN],
    richards: [1.74, 4.03, 1.70, 3.18, 7.15, 3.11, 2.04, 3.82, 1.86, 3.21, 7.29, 3.00, 2.70, 4.23, 2.87, 1.90, 3.49, 1.70, 1.81, 2.77, 1.70, 1.89],
    sha512: [11.08, 159.16, 10.27, 91.23, 102.92, 87.97, 16.59, 17.77, 15.64, 74.94, 99.72, 69.34, 81.23, 87.01, 75.85, 11.29, 15.68, 10.02, 11.06, 11.44, 10.23, NaN],
    sha512Int: [4.83, 8.45, 4.14, 19.98, 13.16, 18.88, 9.36, 10.72, 8.56, 12.15, 11.80, 11.48, 10.47, 9.73, 10.00, 4.54, 3.50, 4.01, 4.59, 3.30, 4.04, NaN],
    tracer: [1.11, 38.16, 1.08, 3.00, 3.84, 2.88, 1.44, 1.61, 1.44, 2.69, 3.31, 2.46, 2.64, 3.00, 2.57, 1.13, 1.42, 1.10, 1.10, 1.35, 1.09, 1.63]
  };

  var Data = {};
  for (var benchmarkName in RawData) {
    var times = RawData[benchmarkName];
    var benchmarkData = {};
    for (var i = 0; i < Configs.length; i++)
      benchmarkData[Configs[i]] = times[i];
    Data[benchmarkName] = benchmarkData;
  }

  function setupBenchmarkGraph(container, benchmarks, configs, configNames) {
    var series = [];
    for (var i = 0; i < configs.length; i++) {
      var config = configs[i], name = configNames[i];
      var data = benchmarks.map(function(b) { return Data[b][config]; });
      series.push({ name: name, data: data });
    }

    $(container).highcharts({
      chart: {
        type: "column",
        style: {fontSize: "18px"},
      },
      title: {
        text: null,
      },
      xAxis: {
        categories: benchmarks,
        title: {
          text: null,
        },
        labels: {
          style: {fontSize: "18px"},
        },
      },
      yAxis: {
        min: 0.0,
        max: container.dataset.yAxisMax,
        title: {
          text: "Normalized execution time wrt. JVM",
          align: "high",
        },
        labels: {
          overflow: "justify",
          style: {fontSize: "16px"},
        },
        tickInterval: 1.0,
      },
      plotOptions: {
        bar: {
          dataLabels: {
            enabled: true,
          },
        },
      },
      legend: {
        layout: "vertical",
        align: "right",
        verticalAlign: "top",
        x: -20,
        y: 30,
        floating: true,
        borderWidth: 1,
        backgroundColor: "rgba(255, 255, 255, 0.0)",
        shadow: true,
        reversed: false,
        itemStyle: {fontSize: "18px"},
      },
      credits: {
        enabled: false,
      },
      series: series,
    });
  }

  for (var benchmarkDivsIdx = 0; benchmarkDivsIdx < benchmarkDivs.length; benchmarkDivsIdx++) {
    var benchmarkDiv = benchmarkDivs[benchmarkDivsIdx];

    try {
      var dataset = benchmarkDiv.dataset;
      var benchmarks = dataset.benchmarks.split(" ");
      var configs = dataset.configs.split(";");
      var configNames = dataset.confignames;
      if (configNames)
        configNames = configNames.split(";")
      else
        configNames = configs;

      setupBenchmarkGraph(benchmarkDiv, benchmarks, configs, configNames);
    } catch (e) {
      var errorP = document.createElement("p")
      errorP.textContent = e.toString()
      benchmarkDiv.appendChild(errorP)
    }
  }
});

$(document).ready(function () {
  onloadFunctions.forEach(function(f) { f() });
});
