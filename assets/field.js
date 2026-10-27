/* isjia.page — hero dot field.
   Self-hosted, no dependencies, one canvas.
   Dots are laid on a 17px grid; a flow field sets their brightness, the pointer
   pushes them away, and a click sends a ring through the grid.
   Without this file the hero keeps the CSS dot field (.field::before).
   Motion stops for prefers-reduced-motion, when the tab is hidden, and when the
   hero is out of view; fills are batched so a frame costs a handful of paths. */
(function () {
  "use strict";

  var canvas = document.querySelector(".field-canvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  var hero = canvas.closest(".hero") || canvas.parentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)");

  var STEP = 17;
  var REACH = 190;
  var BASE = [124, 74, 85];
  var HOT = [224, 163, 177];
  var CREAM = [248, 246, 235];

  var W = 0, H = 0, dpr = 1, cols = 0, rows = 0, ox = 0, oy = 0;
  var mouse = null, ripples = [], t0 = 0;
  var raf = 0, onScreen = true, ready = false;

  function measure() {
    var r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.round(r.width);
    H = Math.round(r.height);
    if (!W || !H) return;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(W / STEP) + 1;
    rows = Math.ceil(H / STEP) + 1;
    ox = (W - (cols - 1) * STEP) / 2;
    oy = (H - (rows - 1) * STEP) / 2;
    ready = true;
  }

  /* Colour ramp: wine → rose → cream, as in the hero's CSS accent. */
  function tone(e) {
    var c;
    if (e < 0.6) {
      var a = e / 0.6;
      c = [BASE[0] + (HOT[0] - BASE[0]) * a,
           BASE[1] + (HOT[1] - BASE[1]) * a,
           BASE[2] + (HOT[2] - BASE[2]) * a];
    } else {
      var b = (e - 0.6) / 0.4;
      c = [HOT[0] + (CREAM[0] - HOT[0]) * b,
           HOT[1] + (CREAM[1] - HOT[1]) * b,
           HOT[2] + (CREAM[2] - HOT[2]) * b];
    }
    return c;
  }

  /* 13 colour steps × 5 alpha steps = 65 buckets, so a frame fills ~65 paths
     instead of several thousand. */
  var COLOR_STEPS = 13, ALPHA_STEPS = 5;
  var buckets = [];
  for (var i = 0; i < COLOR_STEPS * ALPHA_STEPS; i++) buckets.push([]);

  function frame(now) {
    raf = 0;
    if (!ready) return;
    ctx.clearRect(0, 0, W, H);

    var motion = !reduce.matches;
    var t = motion ? (now - t0) / 1000 : 4;
    var edge = motion ? Math.min(1, t / 1.8) : 1;
    var pupil = (1 - Math.pow(1 - edge, 3)) * Math.hypot(W, H) * 0.6;
    var settled = edge >= 1;
    var maxD = Math.hypot(W, H) * 0.6;
    var cx = W / 2, cy = H * 0.42;

    for (var b = 0; b < buckets.length; b++) buckets[b].length = 0;

    for (var x = 0, i2 = 0; i2 < cols; i2++) {
      x = ox + i2 * STEP;
      var speed = 60 + ((i2 * 73) % 90);
      var len = 7 + ((i2 * 37) % 11);
      var period = (rows + len) * STEP;
      var head = (t * speed + ((i2 * 977) % period)) % period;

      for (var j = 0; j < rows; j++) {
        var y = oy + j * STEP;
        var dc = Math.hypot(x - cx, y - cy);
        var shown = dc <= pupil;
        if (!shown) continue;

        var e = 0, dx = 0, dy = 0;

        if (motion && shown) {
          /* the flow itself: two slow crossed waves, squared for contrast */
          var n = Math.sin(x * 0.011 + t * 0.7) * Math.cos(y * 0.015 - t * 0.5)
                + 0.6 * Math.sin((x - y) * 0.005 + t * 0.35);
          e = Math.max(0, n - 0.28) / 1.15;

          if (mouse) {
            var mx = x - mouse.x, my = y - mouse.y;
            var d = Math.hypot(mx, my);
            if (d < REACH) {
              var k = 1 - d / REACH;
              k = k * k;
              if (k > e) e = k;
              if (d > 0.01) {
                dx = (mx / d) * k * 14;
                dy = (my / d) * k * 14;
              }
            }
          }

          for (var q = 0; q < ripples.length; q++) {
            var age = (now - ripples[q].t) / 1000;
            if (age > 1.8) continue;
            var ring = Math.abs(Math.hypot(x - ripples[q].x, y - ripples[q].y) - age * 560);
            if (ring < 30) {
              var kr = (1 - ring / 30) * (1 - age / 1.8);
              if (kr > e) e = kr;
            }
          }
        } else if (motion) {
          /* outside the reveal: still carry the flow, so the disc grows out of it */
          var n0 = Math.sin(x * 0.011 + t * 0.7) * Math.cos(y * 0.015 - t * 0.5)
                 + 0.6 * Math.sin((x - y) * 0.005 + t * 0.35);
          e = Math.max(0, n0 - 0.35) / 1.25 * 0.6;
        }

        if (motion && !settled) {
          var gap = pupil - dc;
          if (gap < 80) {
            var ke = 1 - gap / 80;
            if (ke > e) e = ke;
          }
        }
        e = Math.max(0, Math.min(1, e));

        var a = 0.5 + e * 0.5;
        var r = 1.15 + e * 2.15;
        var ci = Math.min(COLOR_STEPS - 1, (e * COLOR_STEPS) | 0);
        var ai = Math.min(ALPHA_STEPS - 1, (a * ALPHA_STEPS) | 0);
        buckets[ci * ALPHA_STEPS + ai].push(x + dx, y + dy, r);
      }
    }

    for (var b2 = 0; b2 < buckets.length; b2++) {
      var list = buckets[b2];
      if (!list.length) continue;
      var ci2 = (b2 / ALPHA_STEPS) | 0;
      var ai2 = b2 % ALPHA_STEPS;
      var col = tone((ci2 + 0.5) / COLOR_STEPS);
      ctx.fillStyle = "rgba(" + (col[0] | 0) + "," + (col[1] | 0) + "," + (col[2] | 0) +
                      "," + (((ai2 + 0.5) / ALPHA_STEPS) * 0.9).toFixed(3) + ")";
      ctx.beginPath();
      for (var p = 0; p < list.length; p += 3) {
        ctx.moveTo(list[p] + list[p + 2], list[p + 1]);
        ctx.arc(list[p], list[p + 1], list[p + 2], 0, 6.2832);
      }
      ctx.fill();
    }
    if (motion) schedule();
  }

  function schedule() {
    if (raf) return;
    if (!onScreen || document.hidden) return;
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (!ready) measure();
    if (!ready) return;
    if (!t0) t0 = performance.now();
    if (reduce.matches) {
      /* one still frame, no loop, no listeners */
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      frame(performance.now());
      return;
    }
    schedule();
  }

  function onMove(e) {
    if (!fine.matches) return;
    var r = canvas.getBoundingClientRect();
    var px = e.clientX - r.left, py = e.clientY - r.top;
    if (px < 0 || py < 0 || px > r.width || py > r.height) {
      mouse = null;
      return;
    }
    mouse = { x: px, y: py };
  }

  function onLeave() { mouse = null; }

  function onClick(e) {
    if (!fine.matches || reduce.matches) return;
    /* decorative only: leave links and buttons alone */
    if (e.target.closest("a, button, input, label")) return;
    var r = canvas.getBoundingClientRect();
    ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() });
    if (ripples.length > 4) ripples.shift();
  }

  measure();
  document.documentElement.classList.add("field-on");

  var io = "IntersectionObserver" in window
    ? new IntersectionObserver(function (entries) {
        onScreen = entries[0].isIntersecting;
        if (onScreen) schedule();
      }, { rootMargin: "120px" })
    : null;
  if (io) io.observe(hero);

  window.addEventListener("resize", function () {
    measure();
    if (reduce.matches) frame(performance.now());
    else schedule();
  }, { passive: true });

  window.addEventListener("pointermove", onMove, { passive: true });
  hero.addEventListener("pointerleave", onLeave, { passive: true });
  hero.addEventListener("click", onClick);
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) schedule();
  });
  if (reduce.addEventListener) {
    reduce.addEventListener("change", start);
    fine.addEventListener("change", function () { mouse = null; });
  }

  start();
  schedule();
})();
