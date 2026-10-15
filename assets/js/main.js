/* tunerapps — progressive enhancement only. The site works without this file. */
(function () {
  'use strict';

  // Category filters: <div data-filter-group="id"> buttons + <div data-filter-list="id"> items with data-cat.
  document.querySelectorAll('[data-filter-group]').forEach(function (group) {
    var list = document.querySelector('[data-filter-list="' + group.dataset.filterGroup + '"]');
    var count = document.querySelector('[data-filter-count="' + group.dataset.filterGroup + '"]');
    if (!list) return;
    var items = Array.prototype.slice.call(list.children);

    group.querySelectorAll('button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cat = btn.dataset.filter;
        group.querySelectorAll('button').forEach(function (b) {
          b.setAttribute('aria-pressed', String(b === btn));
        });
        var shown = 0;
        items.forEach(function (item) {
          var show = cat === 'All' || item.dataset.cat === cat;
          item.hidden = !show;
          if (show) shown++;
        });
        if (count) count.textContent = shown + (shown === 1 ? ' post' : ' posts');
      });
    });
  });

  // Screenshot galleries: arrow buttons scroll the strip.
  document.querySelectorAll('.gallery').forEach(function (g) {
    var strip = g.querySelector('.shots');
    var prev = g.querySelector('.prev');
    var next = g.querySelector('.next');
    if (!strip || !prev || !next) return;
    function update() {
      prev.hidden = strip.scrollLeft < 8;
      next.hidden = strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 8;
    }
    function go(dir) { strip.scrollBy({ left: dir * strip.clientWidth * 0.8, behavior: 'smooth' }); }
    prev.addEventListener('click', function () { go(-1); });
    next.addEventListener('click', function () { go(1); });
    strip.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  // Footer year.
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Hero dial: the needle settles on the sweet spot.
  var needle = document.querySelector('.dial-needle');
  if (needle && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var target = needle.style.left || '63%';
    needle.style.left = '20%';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { needle.style.left = target; });
    });
  }
})();
