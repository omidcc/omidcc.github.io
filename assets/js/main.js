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

  // Light/dark toggle. The head script already set data-theme (saved choice, else the device setting).
  var root = document.documentElement;
  var darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
  var toggles = document.querySelectorAll('.theme-toggle');
  function applyTheme(theme) {
    root.dataset.theme = theme;
    toggles.forEach(function (b) {
      b.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
    document.querySelectorAll('meta[name="theme-color"]').forEach(function (m, i) {
      if (i > 0) m.remove();
      else { m.removeAttribute('media'); m.setAttribute('content', theme === 'dark' ? '#0D1816' : '#F5F6F2'); }
    });
  }
  applyTheme(root.dataset.theme === 'dark' ? 'dark' : 'light');
  toggles.forEach(function (b) {
    b.addEventListener('click', function () {
      var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.classList.add('theme-anim');
      applyTheme(next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      setTimeout(function () { root.classList.remove('theme-anim'); }, 450);
    });
  });
  // Follow live changes of the device setting until the visitor picks a theme themselves.
  darkQuery.addEventListener('change', function (e) {
    var saved = null;
    try { saved = localStorage.getItem('theme'); } catch (err) {}
    if (!saved) applyTheme(e.matches ? 'dark' : 'light');
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

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Header shadow + scroll progress bar.
  var header = document.querySelector('.site-header');
  var bar = null;
  if (!reduce) {
    bar = document.createElement('div');
    bar.className = 'progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
  }
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY;
      if (header) header.classList.toggle('is-scrolled', y > 8);
      if (bar) {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
      }
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Scroll reveal: tag elements, stagger siblings, show when they enter the viewport.
  if (reduce || !('IntersectionObserver' in window)) return;
  var selectors = [
    '.hero-copy > *', '.dial-card', '.head-row', '.grid > *', '.step', '.about > *', '.team .head-row',
    '.contact-card', '.app-hero-copy > *', '.phones', '.gallery', '.details > div', '.privacy-card',
    '.feature', '.stack > .eyebrow', '.stack > h2', '.prose > *', '.notfound > *', '.crumbs'
  ];
  var seen = new Set();
  var targets = [];
  document.querySelectorAll(selectors.join(',')).forEach(function (el) {
    if (seen.has(el) || el.closest('[hidden]')) return;
    seen.add(el);
    var i = Array.prototype.indexOf.call(el.parentNode.children, el);
    el.style.setProperty('--d', Math.min(i, 6) * 80 + 'ms');
    el.setAttribute('data-reveal', '');
    targets.push(el);
  });
  // Once revealed, drop the helper attributes so hover transitions are not delayed or overridden.
  function cleanup(el) {
    var delay = parseInt(el.style.getPropertyValue('--d'), 10) || 0;
    setTimeout(function () {
      el.removeAttribute('data-reveal');
      el.classList.remove('is-in');
      el.style.removeProperty('--d');
    }, delay + 900);
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { var t = e.target; t.classList.add('is-in'); io.unobserve(t); cleanup(t); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  targets.forEach(function (el) { io.observe(el); });
})();
