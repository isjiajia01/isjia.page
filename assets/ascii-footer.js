/* isjia.page — ASCII wordmark for the footer. Vanilla, no deps, no network.
   Replaces the text inside <a class="footer-wordmark"> with a canvas that draws
   the word from ASCII characters. Hover: characters near the pointer scramble
   and brighten, then settle back. Without JS (or reduced motion) the text link
   / a static drawing remains. Adapted from the AsciiFooter component. */
(function () {
  "use strict";
  var link = document.querySelector(".footer-wordmark");
  if (!link || !HTMLCanvasElement) return;
  var brand = (link.textContent || "isjia.page").trim();
  var RAMP = " .:-=+*#%@", STRETCH = 1.3, LV = 24;
  var BASE = [124, 74, 85], HOT = [248, 246, 235];          // wine -> bone
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var MONO = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace';
  var SANS = '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, "Segoe UI", "Helvetica Neue", Arial, sans-serif';

  var cv = document.createElement("canvas");
  link.setAttribute("aria-label", brand);
  link.classList.add("is-ascii");
  link.textContent = "";
  link.appendChild(cv);
  var pb = document.createElement("div"); pb.className = "footer-pb"; pb.setAttribute("aria-hidden", "true");
  pb.innerHTML = "<div></div><div></div><div></div><div></div>";
  if (link.parentNode) link.parentNode.appendChild(pb);
  var ctx = cv.getContext("2d");
  if (!ctx) return;

  var rnd = function (i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  var dpr = Math.min(2, window.devicePixelRatio || 1);
  var W = 0, H = 0, cw = 0, gw = 0, gh = 0, cells = [], atlas = null, raf = 0, visible = true;
  var px = -1e4, py = -1e4, inside = false, auto = !reduce, dirty = true, last = performance.now(), t0 = last;

  function build() {
    W = cv.clientWidth; if (!W) return;
    cw = Math.max(4, W / 200); var ch = cw * 1.5;
    var m = document.createElement("canvas"); m.width = W; m.height = 10;
    var mx = m.getContext("2d");
    mx.font = "800 100px " + SANS;
    var fs = 100 * (W * 0.985) / mx.measureText(brand).width;
    mx.font = "800 " + fs + "px " + SANS;
    var mt = mx.measureText(brand);
    var asc = mt.actualBoundingBoxAscent * STRETCH, desc = mt.actualBoundingBoxDescent * STRETCH;
    H = Math.ceil(asc + desc + ch * 2);
    cv.width = W * dpr; cv.height = H * dpr; cv.style.height = H + "px";
    m.height = H; mx = m.getContext("2d");
    mx.font = "800 " + fs + "px " + SANS;
    mx.save(); mx.scale(1, STRETCH);
    mx.fillText(brand, (W - mt.width) / 2, (ch + asc) / STRETCH); mx.restore();
    var d = mx.getImageData(0, 0, W, H).data; cells = [];
    for (var y = 0; y < H; y += ch) for (var x = 0; x < W; x += cw) {
      var s = 0, n = 0;
      for (var yy = 0; yy < ch; yy += 2) for (var xx = 0; xx < cw; xx += 2) {
        var qx = Math.floor(x + xx), qy = Math.floor(y + yy);
        if (qx < W && qy < H) { s += d[(qy * W + qx) * 4 + 3]; n++; }
      }
      var cov = n ? s / n / 255 : 0; if (cov < 0.04) continue;
      var i = cells.length;
      cells.push({ x: x + cw / 2, y: y + ch / 2, cov: cov, gi: Math.min(RAMP.length - 1, Math.round(cov * (RAMP.length - 1))),
        heat: 0, wait: 0, delay: rnd(i) * 0.35, seed: rnd(i + 7) });
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    gw = Math.ceil(cw * 1.4); gh = Math.ceil(ch * 1.15);
    // glyph atlas: each ramp char pre-drawn in LV shades between BASE and HOT
    atlas = document.createElement("canvas");
    atlas.width = RAMP.length * gw * dpr; atlas.height = LV * gh * dpr;
    var ax = atlas.getContext("2d"); ax.scale(dpr, dpr);
    ax.font = "500 " + Math.round(cw * 1.35) + "px " + MONO; ax.textAlign = "center"; ax.textBaseline = "middle";
    for (var r = 0; r < LV; r++) {
      var k = r / (LV - 1);
      ax.fillStyle = "rgb(" + BASE.map(function (b, j) { return Math.round(b + (HOT[j] - b) * k); }).join(",") + ")";
      for (var g = 1; g < RAMP.length; g++) ax.fillText(RAMP[g], g * gw + gw / 2, r * gh + gh / 2);
    }
    dirty = true;
  }

  function frame(now) {
    raf = 0;
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (auto && !reduce) { var k = (now - t0) / 1000; px = W * (0.5 + 0.42 * Math.sin(k * 0.5)); py = H * (0.5 + 0.2 * Math.sin(k)); inside = true; }
    var active = inside, r = Math.max(110, W * 0.12), t = now / 1000, n1 = RAMP.length - 1;
    for (var i = 0; i < cells.length; i++) {
      var c = cells[i], hot = false;
      if (inside) {
        var kk = Math.max(0, 1 - Math.hypot(c.x - px, c.y - py) / r);
        if (kk > 0) { hot = true; c.wait += dt; if (c.wait > c.delay * (1 - kk)) c.heat = Math.min(1, c.heat + dt * 6 * kk); }
        else c.wait = 0;
      }
      if (!hot && c.heat > 0) c.heat = Math.max(0, c.heat - dt * (1.4 + c.seed * 1.6));
      if (c.heat > 0.001) active = true;
    }
    if (active || dirty) {
      dirty = false; ctx.clearRect(0, 0, W, H);
      var tick14 = t * 14, tick9 = t * 9, sh = t * 6;
      for (var j = 0; j < cells.length; j++) {
        var q = cells[j], gi = q.gi, lv = 0.3 + q.cov * 0.15, A = 0.4 + q.cov * 0.45;
        if (q.heat > 0.02) {
          if (q.heat < 0.98 || (((tick9 + q.seed * 10) | 0) % 7 === 0)) gi = 1 + (((tick14 + q.seed * 40) | 0) % n1);
          var sw = Math.sin((q.x + q.y * 0.6) / 46 - sh), shim = sw > 0 ? Math.pow(sw, 6) * 0.45 * q.heat : 0;
          lv = lv + (1 - lv) * q.heat * (1 - shim); A = A + (1 - A) * q.heat;
        }
        var row = Math.max(0, Math.min(LV - 1, Math.round(lv * (LV - 1))));
        ctx.globalAlpha = A > 1 ? 1 : A;
        ctx.drawImage(atlas, gi * gw * dpr, row * gh * dpr, gw * dpr, gh * dpr, q.x - gw / 2, q.y - gh / 2, gw, gh);
      }
      ctx.globalAlpha = 1;
    }
    if (!reduce && visible) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }

  function pos(e) {
    auto = false; var b = cv.getBoundingClientRect();
    px = e.clientX - b.left; py = e.clientY - b.top; inside = true; dirty = true; if (reduce) { frame(performance.now()); } else kick();
  }
  cv.addEventListener("pointermove", pos);
  cv.addEventListener("pointerdown", pos);
  cv.addEventListener("pointerleave", function () { inside = false; px = py = -1e4; });

  build();
  if (window.ResizeObserver) new ResizeObserver(build).observe(cv);
  if (window.IntersectionObserver) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) kick(); }).observe(cv);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
  kick();
})();
