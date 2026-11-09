/* isjia.page — footer icon pile.
   Self-hosted, no dependencies, one canvas, a ~200-line circle physics engine.
   When the footer scrolls into view, copies of the icons listed in the footer
   and of the site's own JJ disc drop into a heap at the bottom of the page.
   Which icons go in, and how much of the heap each one takes, is read from the
   footer markup (see "what goes in the heap" below), so adding or removing an
   app needs no edit here. The pointer is a solid ball that shoves them;
   with a mouse you can grab an icon and throw it; a click or tap on the heap
   pops the icons around it.
   Decorative only: the canvas is aria-hidden, never focusable, and ignores
   clicks that land on links. Without this file the footer keeps a still
   picture of the heap (<noscript>), and prefers-reduced-motion gets one
   settled, static frame with no interaction.
   The loop only runs while the footer is on screen and something is moving;
   a settled heap costs nothing. */
(function () {
  "use strict";

  var footer = document.querySelector(".site-footer");
  var spot = footer && footer.querySelector(".footer-pile");
  if (!spot || !window.requestAnimationFrame || !window.IntersectionObserver) return;

  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext && canvas.getContext("2d");
  if (!ctx) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  var GRAVITY = 2400;      // px/s²
  var DT = 1 / 120;        // fixed step
  var ITER = 4;            // contact passes per step
  var BOUNCE = 0.18;
  var FRICTION = 0.35;
  var MAX_V = 3200;

  /* ---------- what goes in the heap: read from the footer markup ---------- */

  // Nothing in this file lists the apps. Every icon in the footer's app column
  // (.footer-apps) is a kind, and so is every icon in the hidden extras list
  // (.footer-pile-extra) that carries marks which are not apps (the JJ disc).
  // The footer previews are 56px (<app>-56.png) but a disc is painted up to 120
  // device px across, so a source is asked for its site-standard 256px sibling;
  // names without the -56 suffix load as written.
  function pileSrc(src) {
    return src.replace(/-56(\.[a-z]+)$/i, "-256$1");
  }

  // data-weight on the <img>, its link or its list item sets that kind's share
  // of the heap; without one every kind takes an equal share.
  function weightOf(node) {
    for (var el = node; el && el !== footer; el = el.parentNode) {
      var w = parseFloat(el.getAttribute && el.getAttribute("data-weight"));
      if (w > 0) return w;
    }
    return 1;
  }

  function sources() {
    var nodes = footer.querySelectorAll(".footer-apps img, .footer-pile-extra img");
    var out = [];
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].src) out.push({ src: pileSrc(nodes[i].src), weight: weightOf(nodes[i]) });
    }
    return out;
  }

  var W = 0, H = 0, dpr = 1, floorTop = 0, R = 30, spriteR = 0;
  var bodies = [], pending = [], sprites = [];
  var onScreen = false, dropped = false, loaded = false, live = false;
  var raf = 0, last = 0, acc = 0, still = 0;
  var ptr = null, grab = null, down = null;

  canvas.className = "pile-canvas";
  canvas.setAttribute("aria-hidden", "true");
  footer.insertBefore(canvas, footer.firstChild);

  /* ---------- sizing ---------- */

  function targetCount() {
    var pileH = H - floorTop;
    var n = Math.floor(0.62 * W * pileH / (Math.PI * R * R));
    return Math.max(8, Math.min(n, W < 600 ? 36 : 96));
  }

  function measure() {
    var fr = footer.getBoundingClientRect();
    var sr = spot.getBoundingClientRect();
    var nextDpr = Math.min(window.devicePixelRatio || 1, 2);
    var nextW = Math.round(fr.width), nextH = Math.round(fr.height);
    if (!nextW || !nextH) return false;
    var changed = nextW !== W || nextH !== H || nextDpr !== dpr;
    W = nextW; H = nextH;
    floorTop = Math.round(sr.top - fr.top);
    R = W < 600 ? 22 : 30;
    if (nextDpr !== dpr || R !== spriteR) { dpr = nextDpr; if (loaded) buildSprites(); }
    if (changed) {
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
    }
    return changed;
  }

  /* ---------- sprites: each icon cropped to its artwork, cut into a disc ---------- */

  var images = [], weights = [];   // parallel: one entry per loaded kind
  function load() {
    if (images.length) return;
    var specs = sources();
    if (!specs.length) return;
    var left = specs.length;
    specs.forEach(function (spec, i) {
      var img = new Image();
      images[i] = img;
      weights[i] = spec.weight;
      img.decoding = "async";
      img.onload = img.onerror = function () {
        if (--left) return;
        // an icon that fails to load leaves the mix instead of leaving a hole
        var okImages = [], okWeights = [];
        images.forEach(function (im, j) {
          if (im.naturalWidth) { okImages.push(im); okWeights.push(weights[j]); }
        });
        images = okImages; weights = okWeights;
        if (!images.length) return;
        loaded = true;
        buildSprites();
        maybeDrop();
      };
      img.src = spec.src;
    });
  }

  function artBox(img) {
    // icons with a transparent margin (macOS-style) are cropped to their art
    var s = 64, c = document.createElement("canvas");
    c.width = c.height = s;
    var g = c.getContext("2d");
    g.drawImage(img, 0, 0, s, s);
    var a;
    try { a = g.getImageData(0, 0, s, s).data; } catch (e) { return [0, 0, 1]; }
    var x0 = s, y0 = s, x1 = -1, y1 = -1;
    for (var y = 0; y < s; y++) for (var x = 0; x < s; x++) {
      if (a[(y * s + x) * 4 + 3] > 200) {
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
    if (x1 < 0) return [0, 0, 1];
    var side = Math.max(x1 - x0 + 1, y1 - y0 + 1) / s;
    return [x0 / s, y0 / s, side];
  }

  function buildSprites() {
    spriteR = R;
    var pad = Math.ceil(R * 0.35);
    var half = R + pad, px = Math.ceil(half * 2 * dpr);
    sprites = images.map(function (img) {
      var b = artBox(img), iw = img.naturalWidth;
      var c = document.createElement("canvas");
      c.width = c.height = px;
      var g = c.getContext("2d");
      g.scale(dpr, dpr);
      g.translate(half, half);
      // soft, rotation-invariant shadow so overlapping discs separate
      g.shadowColor = "rgba(0, 0, 0, 0.6)";
      g.shadowBlur = R * 0.5;
      g.beginPath(); g.arc(0, 0, R - 0.5, 0, Math.PI * 2);
      g.fillStyle = "#100a0c"; g.fill();
      g.shadowColor = "transparent";
      g.save();
      g.clip();
      // a circle inscribed in a squircle: zoom just enough to hide the corners
      var zoom = 1.06, sz = R * 2 * zoom;
      g.drawImage(img, b[0] * iw, b[1] * iw, b[2] * iw, b[2] * iw, -sz / 2, -sz / 2, sz, sz);
      g.restore();
      g.beginPath(); g.arc(0, 0, R - 0.75, 0, Math.PI * 2);
      g.lineWidth = 1.5; g.strokeStyle = "rgba(248, 246, 235, 0.16)"; g.stroke();
      return { c: c, half: half };
    });
  }

  /* ---------- world ---------- */

  function rand(a, b) { return a + Math.random() * (b - a); }

  function makeBody(kind, x, y) {
    return { k: kind, x: x, y: y, vx: rand(-60, 60), vy: rand(0, 120), a: rand(0, Math.PI * 2), w: rand(-3, 3), r: R, still: 0 };
  }

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) { var j = (Math.random() * (i + 1)) | 0, t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  function shares(n) {
    // a kind's share of the heap is its weight over the weight of the whole
    // page, so adding, removing or reweighting a kind rebalances the mix on its
    // own; rounding leftovers go to the largest remainders so the counts total n
    var total = 0, raw = [], counts = [], used = 0, i;
    for (i = 0; i < weights.length; i++) total += weights[i];
    for (i = 0; i < weights.length; i++) {
      raw[i] = n * weights[i] / total;
      counts[i] = Math.floor(raw[i]);
      used += counts[i];
    }
    var order = counts.map(function (_, j) { return j; });
    order.sort(function (a, b) { return (raw[b] - counts[b]) - (raw[a] - counts[a]); });
    for (i = 0; used < n; i = (i + 1) % order.length) { counts[order[i]]++; used++; }
    return counts;
  }

  function kinds(n) {
    // deal the shares in rounds — at most one of each kind per round, in random
    // order — so copies of the same icon rarely land next to each other
    if (!weights.length) return [];
    var left = shares(n), out = [];
    while (out.length < n) {
      var round = [];
      for (var i = 0; i < left.length; i++) if (left[i] > 0) { round.push(i); left[i]--; }
      if (!round.length) break;
      out = out.concat(shuffle(round));
    }
    return shuffle(out);
  }

  function spawn(n, stagger) {
    // they pour in over the footer's top edge, already moving
    var ks = kinds(n);
    for (var i = 0; i < n; i++) {
      var b = makeBody(ks[i], rand(R, W - R), -R - rand(0, 160));
      b.vy = rand(500, 800);
      pending.push({ b: b, t: stagger ? i * (stagger / n) + rand(0, 60) : 0 });
    }
  }

  function settleNow() {
    // reduced motion: drop the heap off screen (a few ms of maths), draw it once
    bodies = []; pending = [];
    var n = targetCount(), ks = kinds(n), band = Math.max(H - floorTop, R * 4) * 2.2;
    for (var i = 0; i < n; i++) {
      var b = makeBody(ks[i], rand(R, W - R), H - R - rand(0, band));
      b.vx = b.vy = 0;
      bodies.push(b);
    }
    for (var s = 0; s < 900; s++) step(DT);
    bodies.forEach(function (b) { b.vx = b.vy = b.w = 0; });
    draw();
  }

  function fit() {
    // keep the heap inside a resized footer and in proportion to its width
    var want = targetCount(), have = bodies.length + pending.length;
    bodies.forEach(function (b) {
      b.r = R;
      if (b.x > W - R) b.x = W - R;
      if (b.y > H - R) b.y = H - R;
    });
    if (have > want) {
      pending.length = Math.max(0, pending.length - (have - want));
      bodies.sort(function (p, q) { return q.y - p.y; });
      bodies.length = Math.min(bodies.length, want);
    } else if (have < want && dropped) {
      spawn(want - have, 600);
    }
  }

  /* ---------- engine ---------- */

  function contact(p, q, nx, ny, overlap) {
    // p, q: bodies (q may be a static/kinematic stand-in with im = 0)
    var imp = p.im, imq = q.im, sum = imp + imq;
    if (!sum) return;
    var corr = Math.max(overlap - 0.3, 0) * 0.8 / sum;
    p.x -= nx * corr * imp; p.y -= ny * corr * imp;
    q.x += nx * corr * imq; q.y += ny * corr * imq;

    var rvx = q.vx - p.vx, rvy = q.vy - p.vy;
    var vn = rvx * nx + rvy * ny;
    if (vn >= 0) return;
    var jn = -(1 + BOUNCE) * vn / sum;
    p.vx -= jn * nx * imp; p.vy -= jn * ny * imp;
    q.vx += jn * nx * imq; q.vy += jn * ny * imq;

    // friction at the contact point spins the discs (solid disc: I = m r²/2)
    var tx = -ny, ty = nx;
    var vt = (q.vx - p.vx) * tx + (q.vy - p.vy) * ty - (p.w * p.r + q.w * q.r);
    var iip = imp * 2, iiq = imq * 2;
    var jt = -vt / (sum + iip + iiq);
    var lim = FRICTION * jn;
    if (jt > lim) jt = lim; else if (jt < -lim) jt = -lim;
    p.vx -= jt * tx * imp; p.vy -= jt * ty * imp;
    q.vx += jt * tx * imq; q.vy += jt * ty * imq;
    p.w -= jt * iip / p.r; q.w -= jt * iiq / q.r;
  }

  var WALL = { vx: 0, vy: 0, w: 0, r: 1, im: 0, x: 0, y: 0 };

  function step(dt) {
    var i, j, b, n = bodies.length;
    for (i = 0; i < n; i++) {
      b = bodies[i];
      b.im = b === grab ? 0 : 1;
      if (b === grab && ptr) {
        b.vx = (ptr.x + grab.ox - b.x) * 22;
        b.vy = (ptr.y + grab.oy - b.y) * 22;
        b.w *= 0.9;
      } else {
        b.vy += GRAVITY * dt;
        b.vx *= 0.999; b.vy *= 0.999; b.w *= 0.996;
      }
      var sp = b.vx * b.vx + b.vy * b.vy;
      if (sp > MAX_V * MAX_V) { var k = MAX_V / Math.sqrt(sp); b.vx *= k; b.vy *= k; }
      b.x += b.vx * dt; b.y += b.vy * dt; b.a += b.w * dt;
      if (b === grab) {
        b.x = Math.max(b.r, Math.min(W - b.r, b.x));
        b.y = Math.min(H - b.r, b.y);
      }
    }

    // the pointer only shoves while it moves, so a resting cursor can pick an icon up
    var hand = ptr && ptr.inside && !grab && ptr.r && Math.abs(ptr.vx) + Math.abs(ptr.vy) > 150 ? { x: ptr.x, y: ptr.y, vx: ptr.vx, vy: ptr.vy, w: 0, r: ptr.r, im: 0 } : null;

    for (var it = 0; it < ITER; it++) {
      for (i = 0; i < n; i++) {
        var p = bodies[i];
        for (j = i + 1; j < n; j++) {
          var q = bodies[j];
          var dx = q.x - p.x, dy = q.y - p.y, rr = p.r + q.r;
          if (dx > rr || dx < -rr || dy > rr || dy < -rr) continue;
          var d2 = dx * dx + dy * dy;
          if (d2 >= rr * rr || d2 < 1e-6) continue;
          var d = Math.sqrt(d2);
          contact(p, q, dx / d, dy / d, rr - d);
        }
        if (hand) {
          var hx = p.x - hand.x, hy = p.y - hand.y, hr = p.r + hand.r, h2 = hx * hx + hy * hy;
          if (h2 < hr * hr && h2 > 1e-6) { var hd = Math.sqrt(h2); contact(hand, p, hx / hd, hy / hd, hr - hd); }
        }
        // floor and side walls (no ceiling: thrown icons come back down)
        if (p.y > H - p.r) contact(p, WALL, 0, 1, p.y - (H - p.r));
        if (p.x < p.r) contact(p, WALL, -1, 0, p.r - p.x);
        if (p.x > W - p.r) contact(p, WALL, 1, 0, p.x - (W - p.r));
      }
    }
  }

  function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < bodies.length; i++) {
      var b = bodies[i], s = sprites[b.k];
      if (!s || b === grab) continue;
      paint(b, s);
    }
    if (grab && sprites[grab.k]) paint(grab, sprites[grab.k]);
  }

  function paint(b, s) {
    var c = Math.cos(b.a) * dpr, n = Math.sin(b.a) * dpr, k = b.r / R;
    ctx.setTransform(c * k, n * k, -n * k, c * k, b.x * dpr, b.y * dpr);
    ctx.drawImage(s.c, -s.half, -s.half, s.half * 2, s.half * 2);
  }

  /* ---------- loop ---------- */

  function frame(now) {
    raf = 0;
    if (!live || !onScreen) { last = 0; acc = 0; return; }
    var dt = Math.min((now - (last || now)) / 1000, 1 / 20);
    last = now;
    acc += dt;

    var elapsed = now - dropAt;
    for (var i = pending.length - 1; i >= 0; i--) {
      if (pending[i].t <= elapsed) { bodies.push(pending[i].b); pending.splice(i, 1); }
    }

    while (acc >= DT) { step(DT); acc -= DT; }
    if (ptr) { ptr.vx *= 0.8; ptr.vy *= 0.8; }
    draw();

    // sleep once everything has been still for ~3/4 s
    var moving = !!grab || pending.length > 0 || (ptr && ptr.inside && Math.abs(ptr.vx) + Math.abs(ptr.vy) > 5);
    for (var j = 0; !moving && j < bodies.length; j++) {
      var b = bodies[j];
      if (b.vx * b.vx + b.vy * b.vy > 64 || Math.abs(b.w) > 0.2) moving = true;
    }
    still = moving ? 0 : still + 1;
    if (still > 45) { last = 0; acc = 0; return; }
    raf = requestAnimationFrame(frame);
  }

  function wake() {
    if (!live || !onScreen || raf) return;
    still = 0;
    raf = requestAnimationFrame(frame);
  }

  var dropAt = 0;
  function maybeDrop() {
    if (!loaded || !onScreen || dropped) return;
    measure();
    dropped = true;
    if (reduce.matches) { settleNow(); return; }
    live = true;
    spawn(targetCount(), 900);
    dropAt = performance.now();
    wake();
  }

  /* ---------- input ---------- */

  function local(e) {
    var r = footer.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function hit(x, y) {
    for (var i = bodies.length - 1; i >= 0; i--) {
      var b = bodies[i], dx = x - b.x, dy = y - b.y;
      if (dx * dx + dy * dy < b.r * b.r) return b;
    }
    return null;
  }

  function onUi(e) {
    return e.target.closest && e.target.closest("a, button, input, select, textarea, summary, label");
  }

  function track(e) {
    var p = local(e), t = performance.now();
    if (!ptr) ptr = { x: p.x, y: p.y, vx: 0, vy: 0, t: t, r: 0, inside: true };
    var dt = Math.max((t - ptr.t) / 1000, 1 / 240);
    ptr.vx = ptr.vx * 0.5 + ((p.x - ptr.x) / dt) * 0.5;
    ptr.vy = ptr.vy * 0.5 + ((p.y - ptr.y) / dt) * 0.5;
    ptr.x = p.x; ptr.y = p.y; ptr.t = t; ptr.inside = true;
    ptr.r = e.pointerType === "touch" ? 30 : 22;
    return p;
  }

  function burst(x, y) {
    var reach = R * 5;
    bodies.forEach(function (b) {
      var dx = b.x - x, dy = b.y - y, d = Math.sqrt(dx * dx + dy * dy) || 1;
      if (d > reach) return;
      var f = (1 - d / reach) * 1500;
      b.vx += (dx / d) * f; b.vy += (dy / d) * f - f * 0.6;
      b.w += rand(-8, 8);
    });
  }

  footer.addEventListener("pointermove", function (e) {
    if (!live) return;
    var p = track(e);
    if (e.pointerType === "mouse" && !grab) {
      footer.classList.toggle("pile-grab", !onUi(e) && !!hit(p.x, p.y));
    }
    if (down && Math.abs(p.x - down.x) + Math.abs(p.y - down.y) > 6) down.moved = true;
    if (p.y > floorTop - R * 4 || grab) wake();
  });

  footer.addEventListener("pointerleave", function () {
    if (ptr) ptr.inside = false;
    footer.classList.remove("pile-grab");
  });

  footer.addEventListener("pointerdown", function (e) {
    if (!live || onUi(e) || e.button > 0) return;
    var p = track(e);
    down = { x: p.x, y: p.y, t: performance.now(), moved: false };
    var b = hit(p.x, p.y);
    if (b && e.pointerType === "mouse") {
      // grab: the icon follows the pointer and keeps its velocity on release
      e.preventDefault();
      grab = b; grab.ox = b.x - p.x; grab.oy = b.y - p.y;
      footer.classList.add("pile-grabbing");
      try { footer.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      wake();
    }
  });

  function release(e, cancelled) {
    var d = down; down = null;
    if (grab) {
      var b = grab; grab = null;
      footer.classList.remove("pile-grabbing");
      if (d && !d.moved && performance.now() - d.t < 350) {
        b.vy = -rand(900, 1300); b.vx = rand(-250, 250); b.w = rand(-10, 10);   // click: flick it up
      } else if (ptr) {
        b.vx = ptr.vx; b.vy = ptr.vy; b.w = ptr.vx / b.r * 0.3;              // drag: throw it
      }
      wake();
      return;
    }
    if (cancelled || !d || d.moved || !live) return;
    if (performance.now() - d.t > 400) return;
    var p = local(e);
    if (p.y > floorTop - R * 3) { burst(p.x, p.y); wake(); }   // tap or click on the heap
    if (e.pointerType !== "mouse" && ptr) ptr.inside = false;
  }

  footer.addEventListener("pointerup", function (e) { release(e, false); });
  footer.addEventListener("pointercancel", function (e) {
    release(e, true);
    if (ptr) ptr.inside = false;  // touch scroll took over
  });

  /* ---------- lifecycle ---------- */

  // physics only runs while the strip is on screen; the first drop waits until
  // a third of it is visible so the fall is actually seen
  new IntersectionObserver(function (entries) {
    var e = entries[entries.length - 1];
    onScreen = e.isIntersecting;
    if (!onScreen) return;
    if (e.intersectionRatio >= 0.33) maybeDrop();
    wake();
  }, { threshold: [0, 0.33, 0.66, 1] }).observe(spot);

  // fetch the icons a little before the footer arrives
  new IntersectionObserver(function (entries, io) {
    if (entries[0].isIntersecting) { io.disconnect(); load(); }
  }, { rootMargin: "800px 0px" }).observe(footer);

  var rt = 0;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      if (!measure() || !dropped) return;
      if (!live) { settleNow(); return; }
      fit();
      dropAt = performance.now();
      wake();
    }, 120);
  });

  function onReduce() {
    if (!reduce.matches || !live) return;
    live = false; grab = null;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    settleNow();
  }
  if (reduce.addEventListener) reduce.addEventListener("change", onReduce);

  measure();
})();
