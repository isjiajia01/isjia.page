/* isjia.page — "isJia" squashy-letter wordmark for the footer. Vanilla, no deps,
   no network. Replaces the text inside <a class="footer-wordmark"> with an SVG whose
   five slab letters (i s / J i a) sit in a box that the pointer squashes like balloons;
   idle, the splits drift on their own. Reduced motion = static resting pose; without JS
   the text link stays. Geometry and spring model adapted from the isjia-404 page. */
(function () {
  "use strict";
  var link = document.querySelector(".footer-wordmark");
  if (!link || !window.SVGElement) return;
  var label = (link.textContent || "isjia.page").trim();
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* vertices: [x, y] in the letter's own 0..1 box; the box corners get the big radius */
  var GLYPHS = {
    i: [[[0, 0], [1, 0], [1, 0.2], [0, 0.2]], [[0, 0.29], [1, 0.29], [1, 1], [0, 1]]],
    s: [[[0, 0], [1, 0], [1, 0.27], [0.28, 0.27], [0.28, 0.37], [1, 0.37],
      [1, 1], [0, 1], [0, 0.73], [0.72, 0.73], [0.72, 0.63], [0, 0.63]]],
    J: [[[0.3, 0], [1, 0], [1, 1], [0, 1], [0, 0.6], [0.3, 0.6]]],
    a: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0.4], [0.7, 0.4], [0.7, 0.28], [0, 0.28]],
      [[0.3, 0.58], [0.7, 0.58], [0.7, 0.7], [0.3, 0.7]]]
  };
  var IDS = ["i0", "s", "J", "i", "a"], NAMES = { i0: "i", s: "s", J: "J", i: "i", a: "a" };
  var REST = { c: 0.5, y: 0.5, d: 0.34 }, KEYS = ["c", "y", "d"];
  var pos = { c: REST.c, y: REST.y, d: REST.d }, vel = { c: 0, y: 0, d: 0 };

  var NS = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS(NS, "svg");
  svg.setAttribute("aria-hidden", "true");
  var paths = {};
  IDS.forEach(function (id) {
    var p = document.createElementNS(NS, "path");
    p.setAttribute("fill-rule", "evenodd");
    svg.appendChild(p); paths[id] = p;
  });
  link.setAttribute("aria-label", label);
  link.classList.add("is-glyphs");
  link.textContent = "";
  link.appendChild(svg);

  var W = 0, H = 0, R = 24, RN = 18, GAP = 6, PAD = 0;

  function poly(pts, bx, by, bw, bh) {
    var n = pts.length, P = pts.map(function (q) {
      var corner = (q[0] === 0 || q[0] === 1) && (q[1] === 0 || q[1] === 1);
      return { x: bx + q[0] * bw, y: by + q[1] * bh, r: corner ? R : RN };
    }), d = "";
    for (var i = 0; i < n; i++) {
      var a = P[(i + n - 1) % n], v = P[i], b = P[(i + 1) % n];
      var l1 = Math.hypot(a.x - v.x, a.y - v.y) || 1e-6, l2 = Math.hypot(b.x - v.x, b.y - v.y) || 1e-6;
      var t = Math.min(v.r, l1 / 2, l2 / 2);
      var x1 = v.x + (a.x - v.x) / l1 * t, y1 = v.y + (a.y - v.y) / l1 * t;
      var x2 = v.x + (b.x - v.x) / l2 * t, y2 = v.y + (b.y - v.y) / l2 * t, K = 0.5523;
      d += (i ? "L" : "M") + x1.toFixed(1) + " " + y1.toFixed(1) +
        "C" + (x1 + (v.x - x1) * K).toFixed(1) + " " + (y1 + (v.y - y1) * K).toFixed(1) + " " +
        (x2 + (v.x - x2) * K).toFixed(1) + " " + (y2 + (v.y - y2) * K).toFixed(1) + " " + x2.toFixed(1) + " " + y2.toFixed(1);
    }
    return d + "Z";
  }
  function draw(id, x, y, w, h) {
    paths[id].setAttribute("d", GLYPHS[NAMES[id]].map(function (p) { return poly(p, x, y, w, h); }).join(""));
  }
  function render() {
    var g = GAP, iw = W - 2 * PAD, ih = H - 2 * PAD, p = PAD;
    var th = (ih - g) * pos.y, bh = ih - th - g, by = p + th + g;       // top row / bottom row
    var tw = (iw - g) * pos.c * 0.45, sx = p + tw + g;                    // narrow i | s
    var jw = (iw - g) * pos.c, rx = p + jw + g, rw = iw - g - jw;        // J | i + a
    var iw2 = (rw - g) * pos.d, aw = rw - g - iw2;
    draw("i0", p, p, tw, th); draw("s", sx, p, iw - tw - g, th);
    draw("J", p, by, jw, bh); draw("i", rx, by, iw2, bh); draw("a", rx + iw2 + g, by, aw, bh);
  }

  function measure() {
    var b = svg.getBoundingClientRect(); W = b.width; H = b.height; if (!W || !H) return;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    var k = Math.max(0.5, Math.min(1, W / 900));       // smaller radii and gaps on narrow screens
    R = 28 * k; RN = 21 * k; GAP = Math.max(4, 8 * k);
    render();
  }

  /* input: pointer inside the box steers the splits; 2.5 s after it leaves, idle drift resumes */
  var ptr = null, lastInput = -1e9, idleW = 1, raf = 0, visible = true, prev = 0;
  function onPtr(e) {
    var b = svg.getBoundingClientRect();
    ptr = { u: (e.clientX - b.left) / b.width, v: (e.clientY - b.top) / b.height };
    lastInput = performance.now(); link.classList.add("is-live"); kick();
  }
  svg.addEventListener("pointermove", onPtr, { passive: true });
  svg.addEventListener("pointerdown", onPtr, { passive: true });
  svg.addEventListener("pointerleave", function () { link.classList.remove("is-live"); });

  function wave(t, s) { return 0.5 * Math.sin(t * 0.37 + s) + 0.3 * Math.sin(t * 0.61 + s * 2.1) + 0.2 * Math.sin(t * 1.03 + s * 3.7); }
  function frame(now) {
    raf = 0;
    var dt = Math.min(0.033, (now - prev) / 1000); prev = now;
    var t = now / 1000, idling = !ptr || now - lastInput > 2500;
    idleW += ((idling ? 1 : 0) - idleW) * Math.min(1, dt * (idling ? 0.6 : 4));
    var A = ptr ? { c: 0.5 + (ptr.u - 0.5) * 1.05, y: 0.5 + (ptr.v - 0.5) * 1.05, d: 0.34 } : REST;
    var tt = t * 0.35, r = 0.3;
    var B = { c: 0.5 + r * wave(tt, 0), y: 0.5 + r * wave(tt, 1.7), d: 0.34 + 0.1 * wave(tt * 0.8, 2.9) };
    var k = 90 * (1 - idleW * 0.59), damp = 2 * (1 - 0.35 * 0.9) * Math.sqrt(k);
    KEYS.forEach(function (key) {
      var m = key === "c" ? Math.min(0.49, 90 / Math.max(1, W)) : key === "d" ? 0.18 : Math.min(0.49, 70 / Math.max(1, H));
      var tg = Math.min(1 - m, Math.max(m, A[key] + (B[key] - A[key]) * idleW));
      vel[key] += ((tg - pos[key]) * k - vel[key] * damp) * dt;
      pos[key] = Math.min(1 - m * 0.6, Math.max(m * 0.6, pos[key] + vel[key] * dt));
    });
    render();
    if (visible) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!reduce && visible && !raf) { prev = performance.now(); raf = requestAnimationFrame(frame); } }

  measure();
  if (window.ResizeObserver) new ResizeObserver(measure).observe(svg);
  if (window.IntersectionObserver) new IntersectionObserver(function (es) {
    visible = es[0].isIntersecting; if (visible) kick();
  }).observe(svg);
  kick();
})();
