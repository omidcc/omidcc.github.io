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
    '.feature', '.post-head > *', '.post-hero', '.post-body > *', '.stack > .eyebrow', '.stack > h2', '.prose > *', '.notfound > *', '.crumbs'
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

/* Aurora background: slow brand-colour light blobs and a dot grid that lights up around the pointer. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canvas = document.createElement('canvas');
  canvas.className = 'bg-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(canvas, document.body.firstChild);
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var w = 0, h = 0, dpr = 1;
  var px = -999, py = -999, tx = -999, ty = -999, active = 0;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (reduce) draw(6000);
  }
  window.addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; if (px < 0) { px = tx; py = ty; } active = 1; }, { passive: true });
  document.addEventListener('pointerleave', function () { active = 0; });
  window.addEventListener('resize', resize);

  // x, y = home position (0-1); r = radius (share of the longest side); c = colour; a = light / dark strength
  var blobs = [
    { x: 0.14, y: 0.18, r: 0.62, c: '47,111,104', l: 0.2, d: 0.26, sx: 0.00021, sy: 0.00017, ph: 0 },
    { x: 0.86, y: 0.30, r: 0.5, c: '227,163,62', l: 0.12, d: 0.12, sx: 0.00018, sy: 0.00023, ph: 1.7 },
    { x: 0.5, y: 0.62, r: 0.55, c: '127,179,169', l: 0.16, d: 0.14, sx: 0.00015, sy: 0.00019, ph: 3.1 },
    { x: 0.1, y: 0.92, r: 0.5, c: '30,74,69', l: 0.14, d: 0.3, sx: 0.00023, sy: 0.00014, ph: 4.6 },
    { x: 0.92, y: 0.88, r: 0.46, c: '47,111,104', l: 0.14, d: 0.2, sx: 0.00017, sy: 0.00021, ph: 5.4 }
  ];
  var GRID = 34;

  function draw(t) {
    var dark = document.documentElement.dataset.theme === 'dark';
    var R = Math.max(w, h);
    ctx.clearRect(0, 0, w, h);

    for (var i = 0; i < blobs.length; i++) {
      var b = blobs[i];
      var bx = w * (b.x + 0.09 * Math.sin(t * b.sx + b.ph));
      var by = h * (b.y + 0.09 * Math.cos(t * b.sy + b.ph));
      var g = ctx.createRadialGradient(bx, by, 0, bx, by, R * b.r);
      var a = dark ? b.d : b.l;
      g.addColorStop(0, 'rgba(' + b.c + ',' + a + ')');
      g.addColorStop(1, 'rgba(' + b.c + ',0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    // dot grid: faint everywhere, glowing near the pointer
    var base = dark ? 0.1 : 0.12;
    var rgb = dark ? '127,179,169' : '47,111,104';
    var reach = 170;
    for (var gx = GRID / 2; gx < w; gx += GRID) {
      for (var gy = GRID / 2; gy < h; gy += GRID) {
        var dx = gx - px, dy = gy - py;
        var near = active || reduce ? Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / reach) : 0;
        var r = 1 + near * 1.6;
        if (near > 0.02) {
          ctx.fillStyle = 'rgba(227,163,62,' + (0.15 + near * 0.65).toFixed(3) + ')';
        } else {
          ctx.fillStyle = 'rgba(' + rgb + ',' + base + ')';
        }
        ctx.beginPath();
        ctx.arc(gx, gy, r, 0, 6.2832);
        ctx.fill();
      }
    }
  }

  resize();
  if (reduce) return;
  var last = 0;
  function frame(t) {
    px += (tx - px) * 0.18;
    py += (ty - py) * 0.18;
    if (t - last > 20) { draw(t); last = t; }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
