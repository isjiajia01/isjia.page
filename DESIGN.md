# DESIGN.md — app.isjia.page visual redesign (2026-10)

## Overview
Reference studied: xevonlabs.dev (black atmosphere, giant centered sans headline, capsule nav, glass product cards, icon dock, closing CTA). Borrowed: composition, hierarchy, restraint, product-first imagery. Not borrowed: brand, copy, assets, JS scroll-reveal.
Direction: **petrol orbits on cool paper**. The light theme uses cool blue-grey; inset dark product stages use a dot-matrix grid, teal glow and orbit rings. In dark mode stages blend into the page. The hero combines a heavy sans headline, one serif-italic phrase and three real iPhone screens.

## Background and brand composition
- **Hero statement**: the capsule + dot is gone. "An independent developer, shipping solo" is now `.byline`: a plain line with two accent hairlines (editorial dateline), hairlines hidden <480px. Same words.
- **Background = orbits, not blur blobs.** Page: `.sky` (fixed, CSS only, existing markup) = cool accent wash from the top + three concentric-hairline orbit systems, each carrying one slow planet. Hero: `.orbits` inside `.stage` = three hairline rings with planets + a rotating tick dial around the headline (astrolabe/sundial, tying the background to Solis). Colours derive from `--accent`/`--ink` via `color-mix` and stage `--st-*` values.
- **Motion (no-preference only)**: planets/dial rotate 90–260 s per turn, wash breathes opacity 0.72→1 over 14–16 s; no flicker, all `pointer-events:none`, `aria-hidden`. Reduce: every animation off (global rule), page is fully visible and static; nothing depends on scroll/JS.
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
- Display (h1, h2): `--sans`, 700/650, letter-spacing −0.035em, tight leading. Hero h1 clamp(34px, 8.8vw, 96px), two lines (sans / serif italic).
- Emphasis phrase (`.dim` in hero): `--serif`, italic, weight 500, accent colour — the single brand flourish.
- Body 17px/1.65 sans (unchanged). Eyebrows: sentence-case `.tag` kept small; no new all-caps.

## Shared dark surfaces
Stage-local custom properties on `.stage, .shot-stage, .cta-band, .card.feature, .media`: `--st-bg #0a1317`, `--st-card #0f1c22`, `--st-ink #e9f1f3`, `--st-muted #8ea5ad`, `--st-line #22343b`, `--st-accent #5fb6c4`.

## Components (all in assets/style.css)
| Component | Use |
|---|---|
| `.nav` pill | Glass capsule nav on every page (CSS only; markup unchanged). |
| `.stage` | Hero panel: radius 32, dot grid + glow, centered h1/lede/actions, `.phones` trio, `.dock` icon links. |
| `.phones` / `.phone` | Real iPhone screenshots in a bezel (CSS border + shadow, never stretched: width set, height auto, `aspect-ratio` from file). Bottom fade mask. |
| `.bento` + `a.card` modifiers | 12-col grid. `.feature` (Solis, 2 phones), `.wide`/`.half` with `.media` image well on top, `.plain` (Span, Hairspring: large icon plate, no fake UI). |
| `.shot-stage` | Reusable on app pages: stage with 1–4 `.phone` or one `.wide-shot`. |
| `.rules` | Principles as a hairline-divided 3×2 list (replaces boxed numbered tiles; numbers removed — not a real sequence). |
| `.cta-band` | Dark stage closer. |

## Scroll reveal
Homepage product cards, principles and section headings, plus closing CTA bands, gently enter from 96.5% scale and 20px lower while fading in. CSS `view()` timelines complete after 180px of entry (120px for short headings/rules); scrolling back reverses the entrance. Independent `translate`/`scale` properties preserve hover transforms. Animation is gated by `@supports` and normal-motion screen media; unsupported browsers, print and reduced motion show all content immediately. No JavaScript or persistent hidden state.

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
