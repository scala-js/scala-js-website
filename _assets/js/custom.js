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

$(document).ready(function () {
  onloadFunctions.forEach(function(f) { f() });
});
