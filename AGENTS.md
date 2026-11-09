# isjia.page — App 宣传站规则

纯静态站：手写 HTML + 一份 `assets/style.css`。**无构建、无 JS 框架、无依赖、无 analytics。** 托管：GitHub Pages（仓库 `isjiajia01/isjia.page`），推到 main 即上线。**正式域名为 `app.isjia.page`（App 家族统一域名，路径式 `/<app>/`，不得拆成每 App 一个子域名）**；根域名 `isjia.page` 留给个人站。页面品牌文字仍为 “isjia.page”，不改。改动前先 `git status`；推送/发布需用户确认。

## 一、锁死（不得改动，除非用户明确要求）

**站点形态**
- 不引入构建工具、框架、npm 依赖、JS、第三方脚本、字体、tracker、CDN 资源。`style.css` 头注释写明无构建；页面里的脚本只有既有的 `assets/field.js`（首页 hero 点阵）与 `assets/lenis.min.js`，页脚不加载任何脚本。
- `tools/sync-footer.py`（python3 stdlib，无依赖）只是页脚 App 列表的生成器，不是构建步骤：19 页仍是提交进仓库的静态 HTML，Pages 不跑它，只在改页脚时手动跑（见第二节“页脚同步”）。
- **页脚图标堆已于 2026-11-09 按用户要求整体移除**：`assets/pile.js` 已删除，`.footer-pile` / `.footer-pile-extra` / `.pile-css` / `<noscript>` 堆与相关 CSS、脚本标签全部清掉。不要再加回 canvas、物理引擎、图标堆或 `<noscript>` 兜底堆。页脚现在是纯 CSS 的高屏“幕布”（结构见第二节“页脚同步”），不依赖任何 JS，也不要为它新增脚本。
- 现有的 `assets/field.js`（首页 hero 点阵）与 `assets/lenis.min.js` 早于页脚改版，仍在仓库里引用；本页脚不追认也不扩大它们。
- 不改 `CNAME`（`app.isjia.page`）、`robots.txt` 的 `Allow: /`、404 的 `noindex`。
- 目录结构固定：`/<app>/index.html` + `/<app>/privacy/index.html`，URL 一律带尾斜杠；`/support/` 是唯一支持中心（全部 App 的 FAQ 都在这一页，用 `#<app>` 锚点）。不要给每个 App 另建 support 页。
- 图标固定为 `assets/icons/<app>-256.png`（真实 App 图标，不画假 SVG）；**所有页面的 favicon / apple-touch-icon 一律用站点 JJ 标记**（`assets/favicon.svg`、`favicon-32.png`、`apple-touch-icon.png`、`brand-jj.svg`，别"修正"成各 App 自己的）。

**视觉系统**
- 设计 token（`:root` 的颜色、`--radius`、字体栈）不改。站点为**单一深色主题**（酒红黑 `#100a0c`、骨白文字、玫瑰 `--accent #e0a3b1`、酒红 `#7c4a55`），不再随 `prefers-color-scheme` 切换；`--app-accent` 取自该 App 真实图标的强调色，只用于单 App 页。
- 不为单个 App 页写私有 CSS / 内联大段样式（只有 `<body style="--app-accent: …">` 一处变量）；新组件进 `style.css`，沿用现有类（`detail-hero`、`screens`、`feature-grid`、`facts`、`support-band`、`panel`、`chip`、`qa` 等）。
- 保留 `prefers-reduced-motion`、skip link、`aria-*` 等无障碍支持；不引入网络字体（系统字体栈），不新增 JS（CSS 实现图标悬浮说明与平台筛选）。

**事实与法务（最容易出错）**
- 站点定位口径：独立开发者 Jiajia Zhang，Denmark；“No accounts, no ads, no tracking”。联系邮箱唯一：`isjiajiazhang@gmail.com`；X：`@jjmakesapps`。不得换邮箱、不得加新联系渠道。
- 隐私政策是承诺性文本：**不得为了“好看”弱化或扩写数据收集声明**。每个 App 的隐私页必须与该 App 真实行为一致（权限、网络请求、购买）；App 行为变了先改隐私页并更新 `Last updated`，再改宣传页和 support FAQ。
- 价格、IAP 形态（免费/一次性/订阅）、平台与系统版本、版本号、审核状态，必须来自 App Store Connect / 对应 App 项目的真实状态，不得凭印象写。已出现的数字：Ordbro Pro $3.99、Slip Pro $11.99/yr（7 天试用）/ $19.99 终身。（Hairspring 已于 2026-10-27 按用户要求从站点整体移除：页面、图标、support、sitemap、OG 都已清掉，不要再加回来。）
- 各 App 的 App Store ID 不得改动或猜测：Solis `6770580536`、Punctum `6819719995`、ThreadLite `6811009081?mt=12`、Span `6818993580`、Wayfinder `6823482560`。Ordbro / Slip 尚未上架，**没有 ID 就不要放 Download 链接**，不要编造。
- 商标声明（页脚 `.fine`：Apple … not affiliated）与 “ThreadLite 不隶属 OpenAI/Google” 之类免责声明必须保留。
- 不使用未经验证的绝对化承诺（参见 ThreadLite 对 ⌘F/VoiceOver 的措辞："designed to be preserved… not independently verified"）。

**一致性清单（新增/改动 App 时必须同步，缺一不可）**
1. `/<app>/index.html`、`/<app>/privacy/index.html`
2. `index.html`：卡片、icon-row、`ld+json` ItemList、"The shelf · 09" 的数字、筛选用 pill 的计数（数据在卡片的 `data-plat`）
3. `support/index.html`：目录 `#support-list`、对应 `<section id="<app>">`、页脚链接、`<title>/description/og` 中的 App 名单
4. `sitemap.xml`（app 页 priority 0.8 monthly；privacy 0.4 yearly）
5. `assets/icons/<app>-256.png`
6. `tools/footer.json` 加一条 App，然后 `python3 tools/sync-footer.py`（19 页页脚的 App 列表一起更新）
7. 各页的 canonical / og:url 用绝对地址 `https://app.isjia.page/...`，页面内链接用相对路径

**页脚同步（`tools/footer.json` + `tools/sync-footer.py`）**
19 页页脚是同一个纯 CSS 的高屏“幕布”（`min-height: 100svh`，滚到底等于露出一整屏），从上到下：
- 三列：左 = Site 导航竖排大写列表；中 = `CONTACT` 标题 + 邮箱 + `@jjmakesapps`；右 = 8 个 App 的图标 + 名字两列网格（`.footer-apps`）。
- 整行大字号 wordmark `isjia.page`（`.footer-wordmark`，链接到 me.isjia.page；`clamp(64px, 21.4vw, 315px)` 随视口缩放，390px 与 320px 都不横向溢出）。
- 底部行：左 `© 2026 …` + “Small apps, built in Denmark.”，右 “No accounts, no ads, no tracking.” + 商标声明（`.fine`）。

背景只有 CSS 渐变（酒红/玫瑰光晕，光晕压在大字后面、到法务行前衰减，保证 `.fine` 的 `--faint` 对比度仍在 4.5:1 以上），不用图片、不用脚本、不做 sticky-reveal。

只有 **App 列表**由脚本生成，夹在一对标记注释之间：
- `<ul class="footer-apps">` 内：`<!-- footer:apps -->` … `<!-- /footer:apps -->`

规则：**只改标记之间的东西会被覆盖**；标记之外（Site 导航、Contact 列、wordmark、版权与法务行、脚本标签）脚本一律不碰，可以照常手改。Site 链接各页不同（首页 = Support / Email / X；support 与 404 = All apps / Support / X；App 页 = All apps / Support / Privacy / Email / X），所以不进 manifest；404 的路径由 `absolutePathPages` 决定（根绝对路径 `/…`）。

新增 App（只改一个文件）：
1. 在 `tools/footer.json` 的 `apps` 数组里加一项，顺序即页脚顺序：`{ "slug": "<app>", "name": "显示名" }`。`slug` 必须与 `/<app>/` 目录、`assets/icons/<app>-56.png` 一致。
2. 跑 `python3 tools/sync-footer.py`（纯 stdlib，无依赖；把 19 页的 App 列表重写成 manifest 的样子）。
3. 跑 `python3 tools/sync-footer.py --check`：退出码 0 才算同步（提交前自查用；有落后页面会列出文件名并非零退出）。
4. 删 App 就是删掉 `apps` 里那一条再跑一次。

## 二、可以改（日常维护，不必请示）

- 文案润色、错别字、FAQ 增补（前提：符合上面的事实规则）。
- 状态字段随审核推进更新：Availability（"In App Review" → "On the App Store · version x.y"）、卡片 badge（`badge live` 等）、版本号。上架后补 App Store 按钮与 `support` 的 App Store chip。
- 隐私页 `Last updated` —— 仅当内容实际改变时更新。
- `sitemap.xml` 的 `changefreq/priority` 微调。
- 新增 App 页（复制 `span/` 为模板，按“一致性清单”走完，包括 `tools/footer.json` + `python3 tools/sync-footer.py`）。
- `tools/footer.json` 增删 App，跑 `python3 tools/sync-footer.py`（见上“页脚同步”）。
- `style.css` 内向后兼容的小调整（间距、响应式修复），改后在 1440 与 390 各看一眼；改完把 19 页的 `style.css?v=N` 一起 +1（当前 `?v=18`）。

## 三、已知待核对（发现，非本次修改）

- `ordbro` 页写 "macOS 1.0 in App Review"、`slip` "0.1.0 in App Review"：审核通过后需更新页面与 support（chip、价格表述）。
- 隐私页日期不一致（Punctum 6 Oct，其他 23–24 Oct）属正常，只在内容变更时才动。
- `DESIGN.md` 的 Round 7（页脚图标堆）与 Round 8（signature + tray）页脚记录已过时，等设计文档更新；本仓库改版时未动 `DESIGN.md`。

## 四、验证（最小）

- 本地 `python3 -m http.server` 预览，抽查首页、改动页、`/support/#app`、暗色模式；改过页脚先跑 `python3 tools/sync-footer.py --check`（退出码 0）。
- 页脚：1440 与 390 滚到底各看一眼（三列 / 堆叠、wordmark 不被裁切、`.fine` 可读），390 不得横向溢出（`document.documentElement.scrollWidth === innerWidth`）；`grep -rni 'pile' *.html assets tools` 只应命中 Wayfinder 文案里的 “pile of tabs”。
- `grep -rn "isjiajiazhang@gmail.com"` 邮箱一致；`grep -rn 'apps.apple.com'` ID 与上表一致；新增页面后检查 sitemap 与首页卡片均已更新。
