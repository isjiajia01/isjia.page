/* Image skeletons (Skullet-style shimmer). Marks each <img> loaded so the CSS placeholder drops away. */
(function () {
  function done(img) { img.classList.add('is-loaded'); }
  document.querySelectorAll('img').forEach(function (img) {
    if (img.complete) { done(img); return; }
    img.addEventListener('load', function () { done(img); }, { once: true });
    img.addEventListener('error', function () { done(img); }, { once: true });
  });
})();
