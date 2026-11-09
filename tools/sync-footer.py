#!/usr/bin/env python3
"""isjia.page — regenerate the shared app list of every page footer.

The footer repeats the same eight app links on all 19 pages. That list lives
between a pair of marker comments inside <ul class="footer-apps">:

    <!-- footer:apps --> … <!-- /footer:apps -->

Only the text between the markers is rewritten. Everything else — the Site
nav, the Contact column, the wordmark, the legal row, scripts — stays exactly
as it is, so the script never fights another edit. Relative asset paths follow
each page's depth; pages listed under "absolutePathPages" (404.html, which
GitHub Pages serves for any missing URL) get root-absolute paths instead.

    python3 tools/sync-footer.py            # rewrite the pages
    python3 tools/sync-footer.py --check    # exit 1 if any page is out of date
"""

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "tools" / "footer.json"

APPS_START = "<!-- footer:apps -->"
APPS_END = "<!-- /footer:apps -->"


def load_manifest():
    with MANIFEST.open(encoding="utf-8") as fh:
        data = json.load(fh)
    if not data.get("apps"):
        raise SystemExit("footer.json: \"apps\" is empty")
    for app in data["apps"]:
        for key in ("slug", "name"):
            if not app.get(key):
                raise SystemExit("footer.json: app is missing %r: %r" % (key, app))
    return data


def render_apps(manifest, prefix):
    lines = [APPS_START]
    for app in manifest["apps"]:
        lines.append(
            '<li><a href="%s%s/"><img src="%sassets/icons/%s-56.png" alt=""'
            ' width="26" height="26" loading="lazy"><span>%s</span></a></li>'
            % (prefix, app["slug"], prefix, app["slug"], app["name"])
        )
    lines.append(APPS_END)
    return lines


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
    return splice(text, APPS_START, APPS_END, render_apps(manifest, prefix), rel_path)


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
        if APPS_START not in text:
            if '<footer class="site-footer">' in text:
                raise SystemExit(
                    "%s: has a footer but no %s marker" % (rel_path, APPS_START)
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
