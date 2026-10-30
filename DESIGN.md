# DESIGN.md — app.isjia.page visual redesign (2026-10)

## Overview
Reference studied: xevonlabs.dev (black atmosphere, giant centered sans headline, capsule nav, glass product cards, icon dock, closing CTA). Borrowed: composition, hierarchy, restraint, product-first imagery. Not borrowed: brand, copy, assets, JS scroll-reveal.
Direction: **petrol orbits on cool paper**. The light theme uses cool blue-grey; inset dark product stages use a dot-matrix grid, teal glow and orbit rings. In dark mode stages blend into the page. The hero combines a heavy sans headline, one serif-italic phrase and three real iPhone screens.

## Background and brand composition
- **Hero statement**: the capsule + dot is gone. "An independent developer, shipping solo" is now `.byline`: a plain line with two accent hairlines (editorial dateline), hairlines hidden <480px. Same words.
- **Background = orbits, not blur blobs.** Page: `.sky` (fixed, CSS only, existing markup) = cool accent wash from the top + three concentric-hairline orbit systems, each carrying one slow planet. Hero: `.orbits` inside `.stage` = three hairline rings with planets + a rotating tick dial around the headline (astrolabe/sundial, tying the background to Solis). Colours derive from `--accent`/`--ink` via `color-mix` and stage `--st-*` values.
- **Motion (no-preference only)**: only the two inner hero rings rotate (90/150s); the viewport-sized background systems, outer ring, dial and glow are static. Navigation and dock use solid surfaces without backdrop filtering. This reduces animated surface area and scrolling backdrop sampling; it is not a measured FPS guarantee. Decorative layers remain `pointer-events:none` and `aria-hidden`. Reduced motion disables animation; no effect depends on JavaScript.
- **Logo**: `assets/brand-jj.svg`: two J eyes and a tilted `>` mouth on a petrol circle. Applied as the CSS background of `.brand .mark`; the 18 navigation markups retain their accessible "JJ" text. Hover, when motion is allowed: −9° tilt + 1.07 scale. All 19 pages use the matching site favicon.

## Round 3 (user override, 2026-10-24): palette, favicon, OG
User explicitly authorised overriding the earlier locks on **colour tokens** and **favicon**, and asked for a site OG image. Fonts, structure, copy facts, privacy text, Store IDs, CNAME/robots/noindex stay locked.
- **Palette "petrol"** (orange/brown removed; cool blue-green, no neon, no purple). Light: bg `#f5f8f9`, bg-soft `#e9eff1`, ink `#0f1b20`, ink-soft `#34454c`, muted `#566870` (5.45:1), line `#dbe4e7`/`#c3d0d5`, accent `#0a6a7a` (5.86:1 on bg, 6.26 on white), `--on-accent #fff`. Dark: bg `#0a1317`, bg-soft `#0f1a1f`, ink `#e9f1f3`, ink-soft `#c9d8dc`, muted `#8ea5ad` (7.27:1), card `#0f1c22`, line `#22343b`/`#30474f`, accent `#5fb6c4` (8.02:1), `--on-accent #071013` (8.21:1). Stages (`--st-*`) = dark values in both themes. New token `--on-accent` = text colour on accent hover fills (white in light, near-black in dark) — replaces hard-coded dark text that failed on the darker petrol accent.
- Hard-coded glows/orbits/dial/dock/bezel colours re-derived from the same RGB (accent 95,182,196; ink 233,241,243; bg 10,19,23). `theme-color` metadata follows bg. Product icons/screenshots untouched. Status badge green/amber kept (semantic).
- **Orbit vs text (mobile)**: `.sky` stars could cross the lede. `.stage .lede::before` = feathered patch of stage colour (96% → 0, inset −24/−44px) above the orbits and planets, so rings/stars never run through the lede; rings stay visible everywhere else, animation unchanged.
- **Favicon**: all 19 HTML pages use the site face mark: `assets/favicon.svg` (identical to brand-jj.svg), `assets/favicon-32.png`, `assets/apple-touch-icon.png` (180, opaque full-bleed plate) and root `/favicon.ico` (16/32/48, implicit default for crawlers; no `<link>`). Solis/App icons remain only as product icons. Privacy/404 heads changed only in icon links; body, Last updated and noindex unchanged.
- **OG**: `assets/og-home.png` 1200×630, rendered from a throw-away HTML kept in /tmp (not in the repo); design: JJ face, isjia.page, headline "Small apps that do / one thing properly.", subline "No accounts · No ads · No tracking", 8-icon dock, petrol orbit rings). Home + support use it (own title/description kept); app pages keep their product og:image.
- Acceptance: new static check (privacy bodies equal baseline, noindex kept, 19 pages' icon links resolve and are uniform, OG 1200×630 + full metadata, Store URLs unchanged); screenshots 1440 light/dark, 390 light/dark, 320; favicon loaded in browser; `git diff --check`.

## Preserved contracts
`--radius`, font stacks, "isjia.page" brand text, shared component classes, routes, canonical URLs, JSON-LD, support anchors, privacy bodies and Store IDs are preserved. Colour tokens and site favicons changed at the user's explicit request; home/support gained OG metadata.

## Typography (role split only)
- Display (h1, h2): `--sans`, weight 600, tight leading. Hero h1 clamp(42px, 7.2vw, 72px)/0.98, letter-spacing −0.035em, with the accent-coloured `.em` phrase.
- Emphasis phrase (`.em` span in hero h1): same `--sans` and weight as the headline, accent colour only (`color: var(--accent)`) — no serif, no italic.
- Body 17px/1.65 sans (unchanged). Eyebrows: sentence-case `.tag` kept small; no new all-caps.

## Shared dark surfaces
Stage-local custom properties on `.stage, .shot-stage, .cta-band, .card.feature, .media`: `--st-bg #090a10`, `--st-card #131622`, `--st-ink #f8fafc`, `--st-muted #8290a5`, `--st-line rgba(255, 255, 255, 0.08)`, `--st-accent #38bdf8`, `--st-accent-warm #fbbf24`.

## Components (all in assets/style.css)
| Component | Use |
|---|---|
| `.nav` pill | Solid capsule nav on every page; no scrolling backdrop blur (CSS only; markup unchanged). |
| `.stage` | Hero panel: radius 32, dot grid + glow, centered h1/lede/actions, `.phones` trio, `.dock` icon links. |
| `.phones` / `.phone` | Real iPhone screenshots in a bezel (CSS border + shadow, never stretched: width set, height auto, `aspect-ratio` from file). Bottom fade mask. |
| `.bento` + `a.card` modifiers | 12-col grid. `.feature` (Solis, 2 phones), `.wide`/`.half` with `.media` image well on top, `.plain` (Span, Hairspring: large icon plate, no fake UI). |
| `.shot-stage` | Reusable on app pages: stage with 1–4 `.phone` or one `.wide-shot`. |
| `.rules` | Principles as a hairline-divided 3×2 list (replaces boxed numbered tiles; numbers removed — not a real sequence). |
| `.cta-band` | Dark stage closer. |

## Scroll reveal
Homepage product cards, principles and section headings, plus closing CTA bands, enter from 94% scale and 28px lower while fading in. CSS `view()` timelines complete over 36vh of entry (24vh for short headings/rules), making the entrance more visible than the original fixed 180/120px distances. Scrolling back reverses the entrance. Animation requires support for both the timeline and range, plus normal-motion screen media; unsupported browsers, print and reduced motion show all content immediately. No JavaScript or persistent hidden state.

## Pointer and keyboard feedback
Card surfaces keep a static shadow and position during hover. A small direction arrow appears beside each name, while the image gently scales; the lead card's existing link arrow shifts. Mouse motion requires a fine, hover-capable pointer. Keyboard focus receives equivalent arrows/borders and image feedback. Brand tilt and dock lift have the same gating; reduced motion retains state changes without movement. No pointer tracking or extra compositor hints are added.

## Responsive
- ≥760px: product grid uses 12 columns with 12/7/5/4-column cards.
- <760px: product cards stack in one column.
- ≥560px: three hero phones; <560px: two phones, with the left one hidden, and the eight-icon dock uses a fixed 4×2 grid. No horizontal scroll at 320px.
- <760px: Span and Hairspring icon plates are 170px high to keep the mobile page compact. Navigation, hero and body widths retain their separate hierarchy.
- Reduced motion: no float/drift/orbit animation; hover transforms disabled; background rings stay as static art.

## Asset sources (read-only copies, optimized WebP via cwebp q70–80, in assets/shots/)
| File | Original | Notes |
|---|---|---|
| solis-today/sun/year/moon.webp | 10.01_Solis/Docs/AppStoreScreenshots/2026-10-09-release-1.0.2-34/en-US/01,03,04,05.png | 1290×2796 → 560w. Real in-app screens (App Store set). |
| slip-home.webp | 10.14_Slip/docs/app-store/screenshots/raw/en-US/01-home.png | real raw app capture, 1320×2868 → 560w; Slip product card and page. |
| slip-insights.webp | 10.14_Slip/docs/app-store/screenshots/raw/en-US/02-insights.png | real raw app capture, 1320×2868 → 560w; desktop hero uses a different screen from the Slip card. |
| punctum-clock.webp | 10.09_Punctum/Marketing/AppStoreAssets/punctum-header-21x9.png | marketing render of the dot-matrix clock. |
| threadlite-host.webp | 10.05_ThreadLite/AppStoreScreenshots/edited/en-US/01_host_status.png | App Store creative of the host app. |
| ordbro-web.webp | 10.10_Ordbro/appstore/screenshots/01-web.png | cropped to the page window. |
| wayfinder-palette.webp, wayfinder-palette-win.webp | 10.13_Wayfinder/wayfinder/design/store/mac/2-palette.jpg | store listing image; square crop for the home card, tight window crop for the product page. `design/screenshots/*` are prototype renders → excluded. |
No screenshots exist for Span or Hairspring → typographic plate cards only. No UI invented; no captions claim features beyond existing page copy.

## Fact boundary
Badges, prices, platforms, version/review status, Store links and all privacy text are unchanged. One copy fix: "Five rules" → "Six rules" (six were listed).

## Acceptance (smallest set)
1. Every listed app is linked from index (`#apps` cards + dock) and footer; sitemap, JSON-LD and support content preserved. Homepage copy uses “Different apps. One standard.” and “A growing family of apps” so future additions do not require count changes.
2. Every local `href`/`src` resolves; images show natural aspect (no stretch, `width:100%;height:auto` or `object-fit:cover` within fixed ratio).
3. 320/390/1440: `scrollWidth == innerWidth` on index, solis, wayfinder, support, a privacy page.
4. Light + dark screenshots readable; text contrast ≥4.5:1 (stage vars measured above).
5. Reduced motion respected; skip link, aria, focus visible preserved.
6. Email and App Store IDs unchanged; all 19 pages declare the JJ face favicon and Apple Touch Icon.
7. Round 2: hero has no pill/dot; normal-motion screenshots 20 s apart differ, reduce screenshots identical; 1440 light/dark and 390 hero show visible orbit background with readable text; logo reads as a face at 28/30 px in light and dark; same `.mark` on every nav; 320/390/1440 no horizontal overflow; static check 0 issues and `assets/brand-jj.svg` exists.

## Initial-layout verification (before palette/favicon changes)
Designer reported 36 Chromium light-mode combinations at 320/390/1440 across index, 8 app pages, support, a privacy page and 404, plus dark-mode spot checks on index, support, Span privacy, Wayfinder and Ordbro. Main independently checked index at 1440/light, 320/light and 390/dark; Solis at 390/light; support and Span privacy at 390/dark; Wayfinder at 1440/dark. These checks emulate reduced motion and found no horizontal overflow. After waiting for image decoding and enabling eager image loading in the inspection script, the final preview checks found no broken images. Static check `/tmp/isjia-static-check.py` reports 0 issues; all local href/src resolve. Not verified: Safari/WebKit rendering of `mask-image`/`color-mix`, real-device touch, and a full dark-mode matrix. Tag text uses `color-mix(accent 62%, ink)` ≈5.8:1 on white (plain accent was 3.0:1).

## Round 3 logo (user: mouth `u` → `>`)
`brand-jj.svg`/`favicon.svg`: petrol gradient plate (#2796a8 → #0a5260), light features #f1fafb (≈6.3:1 on the plate's lighter end), two J eyes (stroke 6.8) and a terminal-prompt `>` mouth (stroke 5.8, 10×16 chevron at (32.5,47), rotated −9° so the tip tilts up like a smirk). Both SVG marks use the chevron mouth (static check asserts). Checked at 30 px (nav), 32 and 16 px (favicon): eyes + chevron readable. The same mark appears in navigation, favicons and the OG image.

## Round 3 verified (2026-10-24)
Static check `/tmp/isjia-static-check-r3.py`: 19 pages, 0 issues (privacy bodies = baseline, noindex kept, icon links uniform and resolvable, OG 1200×630 + metadata, Store URLs unchanged, no old orange/cream values in CSS). Chromium: home 1440/390 light+dark, 320 light, support 390 dark, Solis 1440 light, Wayfinder privacy 390 light, 404: no overflow/broken images; motion screenshots differ, reduce identical; hover on `.cta` = white on #0a6a7a (6.26:1); `favicon.svg` requested by the browser. Not verified: Safari/WebKit, real-device apple-touch render, social-platform crawlers.

## Round 4 (user authorisation, 2026-10-26): 3D brand mark, palette "oxblood & bone"
User supplied `isjia-burgundy-satin.svg` as the personal mark, asked for a 3D version of it and then to "replace all of these assets on the site and retune the colours to match" — an explicit override of the colour-token lock. Structure, copy, facts, privacy text, Store IDs, CNAME/robots/noindex and fonts stay locked.

**The mark.** A three.js scene (throw-away, rendered at 4096 px in /tmp, not in the repo) turns the flat SVG into a satin-metal oxblood disc: bevelled rim, inner hairline lip, satin specular, and the JJ eyes + `>` mouth as ivory enamel inlays in real recesses (solid, not cut-outs, so they survive any background). Renders live in `~/Downloads/isjia-icon-v2/` (1024/512/180 PNG + `preview.png`) and `~/Downloads/isjia-3d-v2-4096.png`; the flat source stays `~/Downloads/isjia-burgundy-satin.svg`. Not used at runtime — the site carries flat vector + raster exports only.

**Icon assets.** Same five filenames as before, so no page markup changed.
- `assets/brand-jj.svg` = `assets/favicon.svg` (identical, static check asserts): flat mark for ≤32 px, same geometry as round 3 (two J eyes stroke 6.7, chevron mouth stroke 5.8 at (32.5,47) rotated −9°), plate = radial `#A06773 → #7A3B49 → #341A24`, strokes = user-space ivory gradient `#FFFDF8 → #F5EFE4 → #DFD5C5`, rim hairline `#FFE6D8` at 26%.
- `assets/favicon-32.png`: the flat SVG rasterised at 4× and downsampled (transparent outside the disc). Readable at 16 and 32 px.
- `favicon.ico`: flat mark at 16/32/48.
- `assets/apple-touch-icon.png`: the 3D render cropped to the disc, corners filled `#2a141c`, 180 px, opaque — the disc runs edge to edge under Apple's mask, no transparency fallback to black.
- **Cache busting.** Icon links carry `?v=2`. Browsers cache favicons per URL with no reliable expiry, so the oxblood mark would otherwise keep showing the petrol one; bump `?v` on all 21 pages whenever the artwork changes.
- **Single source.** All five files are generated by `../brand/export.py` (in `11.14_websites/`) from `brand/isjia-mark.svg` (flat shape authority) and `brand/isjia-mark-4096.png` (3D material authority), with checksums in `brand/out/manifest.txt`. `me.isjia.page` copies the same exports into `app/`, so both domains show one mark. Never hand-edit an export: change the master, rerun the script, copy from `brand/out/`.
- `assets/og-home.png`: rebuilt 1200×630 from a throw-away page in /tmp; same composition as round 3 (brand line, headline, "No accounts · No ads · No tracking", platform line) but the right-hand mark is the 3D render with concentric oxblood hairlines, and the dock now carries all nine icons.

**Palette "oxblood & bone"** (light is bone paper, dark is wine-black; stages are still the dark values in both themes).
- Light: bg `#f7f3ec`, bg-soft `#efe7dc`, ink `#1d1216`, ink-soft `#3a2b30`, muted `#6e5b61` (5.70:1), card `#fffdf9`, line `#e6dbcf`/`#d3c3b2`, accent `#7a2437` (8.89:1 on bg, 9.68 on card), accent-warm `#8a5d26`, `--on-accent #fdf8f1`.
- Dark: bg `#0e090b`, bg-soft `#171014`, card `#191215`, ink `#f7f2ea`, ink-soft `#d8cbcd`, muted `#a3929a` (6.72:1), accent `#e0919f` (8.21:1), accent-warm `#d6a05e`, `--on-accent #14090d`.
- Stages: `--st-bg #100a0d`, `--st-card #1a1216`, `--st-ink #f7f2ea`, `--st-muted #a3929a`, `--st-accent #e0919f`, `--st-accent-warm #d6a05e`. Hard-coded leftovers retuned to the same values: `.stage::before` glows (bronze 214,160,94 / rose 224,145,159), phone bezel `#0a0709`, shadows tinted with ink (45,25,32). `theme-color` on all 20 pages follows bg.
- The italic hero phrase (`.stage h1 .dim`) stays on `--st-accent-warm`, so it reads brass against the wine stage — the only second hue, and the same hue the icon's ivory picks up under warm light.

**On-page mark (the 3D render's one home).** `.cta-band h2::before` draws `assets/disc-192.png` at 96 px (72 px below 560 px) above the closing question, on all 11 pages that carry the band — the only placement large enough for the satin/bevel material to read. It is a CSS background like `.brand .mark`: decorative, no alt text, nothing for a screen reader, no motion, so reduced motion needs no special case. `.brand .mark` keeps the flat SVG at 30 px and the tab keeps the flat favicon; the 3D never appears below 48 px.

**Rejected in prototype:** putting a 64 px disc on the hero's `.r1` orbit. Rendered at 1440 it lands on "properly.", competes with the type, and replaces an astrolabe hairline dot (geometry) with a photographic object. The rings stay rings.

**Verified (Chromium, local `python3 -m http.server`).** Light + dark at 1440/390/320 on index, Solis, Span, support, DOT privacy and 404: `scrollWidth - innerWidth = 0` everywhere, no 4xx/5xx and no failed requests after forcing every image eager, `--accent`/`--bg` compute to the new tokens, all three icon links resolve, `favicon.svg` is the file the browser requests, nav mark reads as a face at 30 px in both themes, touch icon renders opaque at 180 px. Contrast measured on the final tokens (values above, ≥4.5:1 for every text pair touched).
**Not verified:** Safari/WebKit rendering of `color-mix`/`mask-image`, a real iOS home-screen install of the new touch icon, and social-crawler caches of the old OG image.

## Round 5 (user request, 2026-10-27): rebuild on the supplied prototype
User handed over a saved prototype (`~/Downloads/isjia.page 重构.html`: home + one app page + an icon sheet) and asked to refactor "the whole site" on it, with one explicit correction: **everything in the prototype was sample material — icons, screenshots and app behaviours must come from the real apps / LifeOS**, never from the mock SVGs in the file.

**What was taken from the prototype.** The composition and its rhythm: sticky translucent header, centred hero over a dot field, a row of the real app icons with a name card on hover/focus, the "No accounts ● No ads ● No tracking ● …" ticker, "The shelf · 09" with platform filter pills, a card per app (icon, status dot, category, name, one line, platforms, arrow), the hairline 01/02/03 values row, the two-card contact block (plain + wine gradient), the footer. App pages follow the prototype's detail page: back-link header, icon + category + big name + tagline + buttons, a real-screenshot figure, "What it does" with a 3-up feature grid, then notes and a details panel, a support band, "More from JJ", footer.

**What was deliberately not taken.** The prototype's fake icons and fake app UI (its Solis/Slip/… SVGs, the `[real screenshot goes here]` phone shell, the invented `#ffb547` per-app palette, Geist from fonts.gstatic.com, React/Babel runtime, canvas hero, hover-caption script). Real assets are the ones already in `assets/icons/` and `assets/shots/` (same sources as the table above); apps with no screenshots (Span, Hairspring, DOT) get an icon plate rather than invented UI.

**Theme: one dark theme.** Wine-black canvas `#100a0c`, bone text `#f8f6eb`, rose accent `#e0a3b1`, wine `#7c4a55`, cards `#171013`/`#1d1216`, hairlines `rgba(248,246,235,.08)`. Status colours keep their meaning: live `#5bd68a`, in review `#e8b45a`, coming soon `#a69b95`. `color-scheme: dark`; `prefers-color-scheme` no longer switches anything (the bone-paper light theme of rounds 3–4 is retired, as the prototype is a single dark design). `theme-color` is `#100a0c` on every page.
- **Per-app accent** (`--app-accent`, set inline on `<body>` of that app page only) is sampled from that app's own icon: Solis `#d9a566`, Punctum `#f0b04a`, ThreadLite `#e08b5e`, Span `#8fa6ff`, Wayfinder `#e0885f`, Ordbro `#7f9bff`, Slip `#8b93ff`, Hairspring `#e3cba6`, DOT `#f2b23c`. Used for the category eyebrow, feature glyphs, figure glow and the "Get …" button (dark text on the accent). The site accent stays rose.

**Type.** System fonts only (`-apple-system` / `system-ui` stack, `ui-monospace` for eyebrows, labels, statuses and platform lines) — no webfont shipped or fetched. Hero h1 `clamp(42px, 7.2vw, 104px)`/0.98/−0.045em/600; sections `clamp(34px, 4.6vw, 62px)`; body 17px/1.6. The unused Instrument Serif italic file was deleted; the prototype's single accent-coloured phrase replaces it.

**Components (all in `assets/style.css`, 925 lines).** `.site-header`/`.brand`/`.nav`, `.hero`+`.field` (CSS dot field, masked; no canvas), `.icon-row`/`.ico`/`.ico-pop`, `.ticker`, `.shelf-section`+`.pills`+`.card`, `.values`, `.contact-grid`/`.panel.wine`, `.detail-hero`/`.screens`/`.screen`/`.win`/`.icon-plate`, `.feature-grid`/`.feature`, `.detail-body`/`.notes`/`.facts`, `.support-band`, `.more-section`, `.page-head`, `.support-layout`/`.toc`/`.support-app`/`.qa`/`.chip`, `.legal`, `.lost`, `.site-footer`.

**No JavaScript added; Lenis removed.** The prototype's interactions were rebuilt in CSS where they carry meaning: the nine item captions are `:hover`/`:focus-visible` popovers (keyboard works, `aria-hidden` because the link already has an `aria-label`), the platform filter is a radio group + `label` pills with `:has()` filtering (browsers without `:has()` show all nine), the ticker is a duplicated-span marquee that pauses on hover and stops under reduced motion. `assets/lenis.min.js` is no longer referenced (file kept).

**Facts unchanged.** Prices, IAP shapes, versions, availability strings, App Store URLs (`6770580536`, `6819719995`, `6811009081?mt=12`, `6818993580`, `6823482560`; Ordbro/Slip/Hairspring/DOT still have none), platform/OS lines, support anchors, privacy text, CNAME, robots, 404 `noindex`, canonical/og URLs and JSON-LD are carried over verbatim. Old `.stage`/`.bento`/`.cta-band`/`.app-hero` markup is gone; the copy was re-cut only where the new layout needs a short label (feature card titles), from the same sentences.

**Privacy pages.** Shell swapped only (theme colour, header, footer, `.legal` wrapper around the body sections): the script asserted the visible text of `<main>` is byte-identical before and after for all nine pages.

**OG image.** `assets/og-home.png` rebuilt 1200×630 from a throw-away page in /tmp: same copy as the hero, rose accent phrase, dot field, the nine real icons and the 3D disc; no new assets on the site.

**Verified (headless Chromium 1248, local `python3 -m http.server`).** 21 pages × 320/390/1440: `scrollWidth == clientWidth`, no broken images, all local `href`/`src` resolve (`/tmp/isjia_proto/static_check.py`, 0 issues). Filter pills return exactly Solis·Punctum·Span·Slip·DOT (iPhone), Solis·Punctum·Hairspring (Watch/TV), ThreadLite·Wayfinder·Ordbro (Mac). Privacy text equality asserted per page; the five Store URLs are unchanged; one email address on the site. Screenshots reviewed at 1440 (home, Solis, Punctum, Span) and 390 (home, Solis, Ordbro, support, Solis privacy).
**Not verified:** Safari/WebKit rendering (`backdrop-filter`, `:has()`, `color-mix`, `animation-timeline`), real iOS home-screen icon, social-crawler cache of the new OG image, and hover popovers on a real trackpad.

**Detail pages are not one template (round 5, follow-up).** Every app page carries its own hero arrangement plus one section that only makes sense for that app, in the app's own accent:
| App | Hero | Signature section |
|---|---|---|
| Solis | one iPhone (Today) | `.shot-strip`: four labelled screens — Today / Sky / Year of light / Moon |
| Punctum | 21:9 dot-matrix shot | `.check-list`: "In the app" / "Around it" inventory (neutral bullets) |
| ThreadLite | host-app shot | `.check-list`: "It defers" / "It never touches", incl. the unverified ⌘F/VoiceOver caveat |
| Wayfinder | palette shot | `.step-list`: task → session → saved page → palette |
| Ordbro | page-translation shot | `.step-list`: translation only / bilingual / original |
| Slip | two iPhone screens | `.check-list`: "It does" / "It does not" (bank, notifications, upload, cloud sync) |
| Span | icon plate (no screenshots exist) | `.step-list`: sample day → you decide → read-only |
| Hairspring | icon plate | `.check-list`: "On Apple Watch" / "On Apple TV" (face names, screensaver caveat) |
| DOT | icon plate | `.step-list`: WeatherKit / Demo / your place, cached locally |

Wording that the signature section now carries was removed from that page's notes blocks (ThreadLite, Wayfinder, Span, Slip, Ordbro, Hairspring, DOT) so nothing is said twice; the underlying facts are the same sentences as before. New components, all in `style.css`: `.shot-strip`, `.check-list` (with a neutral variant for two-way inventories), `.step-list`.

## Round 6 (user request, 2026-10-27): Hairspring removed
User: "Hairspring 不打算用了，把有关它的全部内容都删除." Removed from the site, not archived in it:
- deleted `hairspring/index.html`, `hairspring/privacy/index.html`, `assets/icons/hairspring-256.png` (copies kept outside the repo in `/tmp/isjia_proto/removed-hairspring/` for this session only);
- home: icon row item, shelf card, JSON-LD item (renumbered 1–8), meta description, shelf count 09 → 08, pill counts Watch/TV 3 → 2, All 9 → 8;
- the eight app pages: "More from JJ" row and "See all eight apps";
- `support/`: title/description/og/twitter app list, TOC entry, FAQ section and footer link;
- `sitemap.xml`: both URLs; `assets/og-home.png` re-rendered with eight icons;
- `../check-sites.py` products tuple; `me.isjia.page` dictionaries + `lib/resume.ts` (eight → seven apps, Hairspring dropped from the lists) rebuilt into `out/`;
- `AGENTS.md`: price/ID/known-todo lines updated, plus a note not to re-add the app.

Counts after removal: 8 apps — iPhone 5, Apple Watch 2, Apple TV 2, Mac 3. Verified: 19 pages, 0 static issues, `scrollWidth == clientWidth` at 320/390/1440, sitemap parses, filters return 8/5/2/2/3, no remaining references outside this log and the AGENTS.md note.

**Hero dot field (same request, earlier in the session).** The prototype's animated field is back, as `assets/field.js` (self-hosted, no dependencies, ~250 lines): 17px grid, flow-field brightness, reveal from the centre over 1.8s, pointer repulsion within 190px, click ripple, wine → rose → cream ramp, batched fills (~65 paths per frame). It stops for `prefers-reduced-motion` (one still frame), when the hero is off-screen, and when the tab is hidden; without JS the CSS dot field still renders (`.field::before`, hidden only when the script marks `html.field-on`). This supersedes the "no JS added" line above for this one file.
