// any link that is not part of the current domain is modified

(function() {
  var links = document.links;
  for (var i = 0; i < links.length; i++) {
    if (links[i].hostname != window.location.hostname && links[i].target == "" ) {
      links[i].target = '_blank';
    }
  }
})();

hljs.initHighlightingOnLoad();
