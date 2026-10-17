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

/* Signal background: tuning-wave ribbons that lock together around a spark needle that follows the pointer. */
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
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (reduce) draw(4000);
  }

  var target = 0.5, needle = 0.5, havePointer = false, scrollY = 0;
  window.addEventListener('pointermove', function (e) { target = e.clientX / (w || 1); havePointer = true; }, { passive: true });
  window.addEventListener('scroll', function () { scrollY = window.scrollY; if (reduce) draw(4000); }, { passive: true });
  window.addEventListener('resize', resize);

  // y = vertical position (0-1), a = amplitude (px), f = cycles across the screen, s = drift speed, p = phase
  var lines = [
    { y: 0.24, a: 70, f: 0.9, s: 0.00018, p: 0.0, w: 1.4, o: 0.5 },
    { y: 0.46, a: 84, f: 1.2, s: -0.00014, p: 2.1, w: 1.6, o: 0.6 },
    { y: 0.68, a: 76, f: 0.8, s: 0.00016, p: 4.2, w: 1.4, o: 0.5 },
    { y: 0.88, a: 56, f: 1.1, s: -0.00012, p: 1.0, w: 1.2, o: 0.4 }
  ];

  function draw(t) {
    var dark = document.documentElement.dataset.theme === 'dark';
    var rgb = dark ? '127,179,169' : '47,111,104';
    var strength = dark ? 0.5 : 0.4;
    var count = w < 640 ? 3 : lines.length;
    var nx = reduce ? 0.62 : (havePointer ? needle : 0.5 + 0.28 * Math.sin(t * 0.0003));
    var cx = nx * w;
    var scroll = scrollY * 0.0017;
    ctx.clearRect(0, 0, w, h);
    var R = Math.max(w, h);
    var wa = ctx.createRadialGradient(w * (0.18 + 0.08 * Math.sin(t * 0.00021)), h * (0.22 + 0.08 * Math.cos(t * 0.00017)), 0, w * 0.2, h * 0.25, R * 0.6);
    wa.addColorStop(0, 'rgba(' + rgb + ',' + (dark ? 0.22 : 0.14) + ')');
    wa.addColorStop(1, 'rgba(' + rgb + ',0)');
    ctx.fillStyle = wa;
    ctx.fillRect(0, 0, w, h);
    var wb = ctx.createRadialGradient(w * (0.82 + 0.07 * Math.cos(t * 0.00019)), h * (0.78 + 0.07 * Math.sin(t * 0.00023)), 0, w * 0.8, h * 0.8, R * 0.55);
    wb.addColorStop(0, 'rgba(227,163,62,' + (dark ? 0.1 : 0.09) + ')');
    wb.addColorStop(1, 'rgba(227,163,62,0)');
    ctx.fillStyle = wb;
    ctx.fillRect(0, 0, w, h);

    for (var i = 0; i < count; i++) {
      var L = lines[i];
      var grad = ctx.createLinearGradient(0, 0, w, 0);
      var lo = Math.max(0, nx - 0.22), hi = Math.min(1, nx + 0.22);
      var base = (L.o * strength).toFixed(3), peak = Math.min(0.9, L.o * strength * 2.0).toFixed(3);
      grad.addColorStop(0, 'rgba(' + rgb + ',' + (L.o * strength * 0.35).toFixed(3) + ')');
      if (lo > 0) grad.addColorStop(lo, 'rgba(' + rgb + ',' + base + ')');
      grad.addColorStop(nx, 'rgba(' + rgb + ',' + peak + ')');
      if (hi < 1) grad.addColorStop(hi, 'rgba(' + rgb + ',' + base + ')');
      grad.addColorStop(1, 'rgba(' + rgb + ',' + (L.o * strength * 0.35).toFixed(3) + ')');
      ctx.strokeStyle = grad;
      ctx.lineWidth = L.w;
      ctx.beginPath();
      for (var x = 0; x <= w; x += 8) {
        var u = x / w;
        var d = (x - cx) / (w * 0.16);
        var lock = Math.exp(-d * d);                  // 1 at the needle, 0 far away
        var phase = L.p * (1 - lock) + t * L.s + scroll * (i % 2 ? -1 : 1) * 4;
        var wave = Math.sin(u * L.f * 6.2832 + phase);
        var y = L.y * h + L.a * wave * (1 - lock * 0.55);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // spark needle + glow where the signal locks
    var sg = ctx.createLinearGradient(0, 0, 0, h);
    sg.addColorStop(0, 'rgba(227,163,62,0)');
    sg.addColorStop(0.5, 'rgba(227,163,62,' + (dark ? 0.4 : 0.32) + ')');
    sg.addColorStop(1, 'rgba(227,163,62,0)');
    ctx.fillStyle = sg;
    ctx.fillRect(cx - 1, 0, 2, h);
    var gy = h * 0.5;
    var glow = ctx.createRadialGradient(cx, gy, 0, cx, gy, 170);
    glow.addColorStop(0, 'rgba(227,163,62,' + (dark ? 0.14 : 0.11) + ')');
    glow.addColorStop(1, 'rgba(227,163,62,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(cx - 170, gy - 170, 340, 340);
    ctx.fillStyle = 'rgba(227,163,62,0.9)';
    ctx.beginPath();
    ctx.arc(cx, gy, 4.5, 0, 6.2832);
    ctx.fill();
  }

  resize();
  if (reduce) return;
  var last = 0;
  function frame(t) {
    needle += (target - needle) * 0.06;
    if (t - last > 15) { draw(t); last = t; }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
