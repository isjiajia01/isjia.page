#!/usr/bin/env python3
"""isjia.page — regenerate the shared footer of every page from tools/footer.json.

The footer repeats the same app list, the same hidden extra pile icons
(.footer-pile-extra) and the same no-JS pile fallback on all 19 pages. Each of
those lives between a pair of marker comments in the page:

    <!-- footer:apps --> … <!-- /footer:apps -->   inside <ul class="footer-apps">
    <!-- footer:pile --> … <!-- /footer:pile -->   extras <ul> + <div class="footer-pile">

Only the text between the markers is rewritten. Everything else — the brand
column, the "Site" links, the trademark line, scripts — stays exactly as it is,
so the script never fights another edit. Relative asset paths follow each page's
depth; pages listed under "absolutePathPages" (404.html, which GitHub Pages
serves for any missing URL) get root-absolute paths instead.

    python3 tools/sync-footer.py            # rewrite the pages
    python3 tools/sync-footer.py --check    # exit 1 if any page is out of date

The no-JS pile is a laid-out heap of discs, settled here once from the seed in
the manifest and emitted as absolutely positioned <i> elements; the CSS that
places them lives in assets/style.css (.pile-css). The geometry below mirrors
that CSS: DISC_R px discs in a PILE_WIDTH x PILE_HEIGHT box, which CSS draws as
60px discs in 1440x200 and scales by 0.75 under 560px.
"""

import argparse
import json
import math
import random
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "tools" / "footer.json"

APPS_START = "<!-- footer:apps -->"
APPS_END = "<!-- /footer:apps -->"
PILE_START = "<!-- footer:pile -->"
PILE_END = "<!-- /footer:pile -->"

# Mirrors .pile-css in assets/style.css (disc diameter 2 * DISC_R = 60px).
PILE_WIDTH = 1440
PILE_HEIGHT = 200
DISC_R = 30

# pile.js asks a 56px footer preview for its 256px sibling; extras are cut the
# same way here so both heaps are drawn from the same sources.
PREVIEW_SUFFIX = re.compile(r"-56(\.[a-z]+)$", re.I)


def pile_src(src):
    """The source pile.js would load for a footer preview."""
    return PREVIEW_SUFFIX.sub(r"-256\1", src)


def num(value):
    """A weight as it is written into the markup: 1.6 stays 1.6, 2.0 becomes 2."""
    return ("%g" % float(value))


def load_manifest():
    with MANIFEST.open(encoding="utf-8") as fh:
        data = json.load(fh)
    if not data.get("apps"):
        raise SystemExit("footer.json: \"apps\" is empty")
    for app in data["apps"]:
        for key in ("slug", "name"):
            if not app.get(key):
                raise SystemExit("footer.json: app is missing %r: %r" % (key, app))
    for extra in data.get("extras", []):
        if not extra.get("src"):
            raise SystemExit("footer.json: extra is missing \"src\": %r" % (extra,))
    if "seed" not in data.get("pile", {}):
        raise SystemExit("footer.json: \"pile.seed\" is required")
    return data


# ---------- app list ----------


def render_apps(manifest, prefix):
    lines = [APPS_START]
    for app in manifest["apps"]:
        weight = app.get("weight")
        weight_attr = "" if weight in (None, 1) else ' data-weight="%s"' % num(weight)
        lines.append(
            '<li><a href="%s%s/"><img src="%sassets/icons/%s-56.png" alt=""'
            ' width="28" height="28" loading="lazy"%s><span>%s</span></a></li>'
            % (prefix, app["slug"], prefix, app["slug"], weight_attr, app["name"])
        )
    lines.append(APPS_END)
    return lines


# ---------- no-JS pile: extras, then the laid-out heap ----------


def pile_kinds(manifest):
    """One entry per disc source, with the share of the heap it gets."""
    kinds = [
        {
            "src": "assets/icons/%s-256.png" % app["slug"],
            "weight": app.get("weight") or 1,
        }
        for app in manifest["apps"]
    ]
    kinds += [
        {"src": pile_src(extra["src"]), "weight": extra.get("weight") or 1}
        for extra in manifest.get("extras", [])
    ]
    return kinds


def disc_count():
    """The count pile.js targets for this strip width (0.62 packing, capped)."""
    n = math.floor(0.62 * PILE_WIDTH * PILE_HEIGHT / (math.pi * DISC_R * DISC_R))
    return max(8, min(n, 96))


def shares(n, weights):
    """How many discs of each kind: weight shares, leftovers by largest remainder."""
    total = sum(weights)
    raw = [n * w / total for w in weights]
    counts = [math.floor(v) for v in raw]
    used = sum(counts)
    order = sorted(range(len(weights)), key=lambda i: (counts[i] - raw[i], i))
    for i in order:
        if used >= n:
            break
        counts[i] += 1
        used += 1
    return counts


def deal(n, weights, rng):
    """Deal the shares in rounds (at most one of each kind per round), then shuffle."""
    left = shares(n, weights)
    out = []
    while len(out) < n:
        round_indexes = [i for i, c in enumerate(left) if c > 0]
        if not round_indexes:
            break
        for i in round_indexes:
            left[i] -= 1
        rng.shuffle(round_indexes)
        out.extend(round_indexes)
    rng.shuffle(out)
    return out


def settle(kinds, seed):
    """Lay out a heap once: seeded scatter, then gravity and contact separation."""
    rng = random.Random(seed)
    n = disc_count()
    mix = deal(n, [k["weight"] for k in kinds], rng)
    band = PILE_HEIGHT * 2.2
    bodies = [
        {
            "x": rng.uniform(DISC_R, PILE_WIDTH - DISC_R),
            "y": PILE_HEIGHT - DISC_R - rng.uniform(0, band),
        }
        for _ in range(n)
    ]
    # discs are allowed to rest into each other a little, so the heap reads as
    # overlapping discs rather than a lattice
    gap = 2 * DISC_R - 5
    for _ in range(220):
        for body in bodies:
            body["y"] += 10.0
        for _ in range(2):
            for i in range(n):
                p = bodies[i]
                for j in range(i + 1, n):
                    q = bodies[j]
                    dx, dy = q["x"] - p["x"], q["y"] - p["y"]
                    d2 = dx * dx + dy * dy
                    if d2 >= gap * gap or d2 < 1e-9:
                        continue
                    d = math.sqrt(d2)
                    push = (gap - d) / 2.0
                    p["x"] -= dx / d * push
                    p["y"] -= dy / d * push
                    q["x"] += dx / d * push
                    q["y"] += dy / d * push
        for body in bodies:
            body["y"] = min(body["y"], PILE_HEIGHT - DISC_R)
            body["x"] = min(max(body["x"], DISC_R), PILE_WIDTH - DISC_R)

    heap = []
    for body, kind in zip(bodies, (kinds[i] for i in mix)):
        heap.append(
            {
                "src": kind["src"],
                # --y is measured from the box floor, like CSS `bottom`
                "x": round(body["x"] - PILE_WIDTH / 2),
                "y": round(PILE_HEIGHT - DISC_R - body["y"]),
                "r": rng.randint(-180, 180),
            }
        )
    return heap


def render_pile(manifest, prefix):
    extras = manifest.get("extras", [])
    extra_items = []
    for extra in extras:
        weight = extra.get("weight")
        weight_attr = "" if weight in (None, 1) else ' data-weight="%s"' % num(weight)
        extra_items.append(
            '<li><img src="%s%s" alt=""%s></li>' % (prefix, extra["src"], weight_attr)
        )
    lines = [
        PILE_START,
        '<ul class="footer-pile-extra" aria-hidden="true" hidden>%s</ul>'
        % "".join(extra_items),
        '<div class="footer-pile" aria-hidden="true"><noscript><div class="pile-css">',
    ]
    for disc in settle(pile_kinds(manifest), manifest["pile"]["seed"]):
        lines.append(
            '  <i style="--x:%d;--y:%d;--r:%d;background-image:url(%s%s)"></i>'
            % (disc["x"], disc["y"], disc["r"], prefix, disc["src"])
        )
    lines.append("</div></noscript></div>")
    lines.append(PILE_END)
    return lines


# ---------- pages ----------


def page_prefix(rel_path, manifest):
    """Asset prefix for a page: "" at the root, "../" per directory, "/" for 404."""
    if rel_path in manifest.get("absolutePathPages", []):
        return "/"
    depth = len(Path(rel_path).parent.parts)
    return "../" * depth


def splice(text, start, end, lines, rel_path):
    """Replace the block between the two markers, keeping the page's indentation."""
    if text.count(start) != 1 or text.count(end) != 1:
        raise SystemExit(
            "%s: expected exactly one %s and one %s" % (rel_path, start, end)
        )
    at = text.index(start)
    line_start = text.rfind("\n", 0, at) + 1
    indent = text[line_start:at]
    if indent.strip():
        raise SystemExit("%s: %s must start its own line" % (rel_path, start))
    stop = text.index(end, at) + len(end)
    body = "\n".join(indent + line for line in lines)
    return text[:line_start] + body + text[stop:]


def synced(text, rel_path, manifest):
    prefix = page_prefix(rel_path, manifest)
    text = splice(text, APPS_START, APPS_END, render_apps(manifest, prefix), rel_path)
    return splice(text, PILE_START, PILE_END, render_pile(manifest, prefix), rel_path)


def pages():
    return sorted(p for p in ROOT.rglob("*.html") if ".git" not in p.parts)


def main(argv):
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument(
        "--check",
        action="store_true",
        help="report pages that are out of date and exit 1 instead of rewriting them",
    )
    args = parser.parse_args(argv)
    manifest = load_manifest()

    stale, touched, skipped = [], 0, 0
    for path in pages():
        rel_path = path.relative_to(ROOT).as_posix()
        text = path.read_text(encoding="utf-8")
        if APPS_START not in text and PILE_START not in text:
            if '<footer class="site-footer">' in text:
                raise SystemExit(
                    "%s: has a footer but no %s / %s markers" % (rel_path, APPS_START, PILE_START)
                )
            skipped += 1
            continue
        want = synced(text, rel_path, manifest)
        if want == text:
            continue
        stale.append(rel_path)
        if not args.check:
            path.write_text(want, encoding="utf-8")
            touched += 1

    if args.check:
        if stale:
            print("out of date (run python3 tools/sync-footer.py):")
            for rel_path in stale:
                print("  " + rel_path)
            return 1
        print("footer in sync (%d pages)" % (len(pages()) - skipped))
        return 0

    print(
        "footer synced: %d pages rewritten, %d already current, %d without a footer"
        % (touched, len(pages()) - touched - skipped, skipped)
    )
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
