# isjia.page — App 宣传站规则

纯静态站：手写 HTML + 一份 `assets/style.css`。**无构建、无 JS 框架、无依赖、无 analytics。** 托管：GitHub Pages（仓库 `isjiajia01/isjia.page`），推到 main 即上线。**正式域名为 `app.isjia.page`（App 家族统一域名，路径式 `/<app>/`，不得拆成每 App 一个子域名）**；根域名 `isjia.page` 留给个人站。页面品牌文字仍为 “isjia.page”，不改。改动前先 `git status`；推送/发布需用户确认。

## 一、锁死（不得改动，除非用户明确要求）

**站点形态**
- 不引入构建工具、框架、npm 依赖、JS、第三方脚本、字体、tracker、CDN 资源。`style.css` 注释写明 "No build step, no JS"。
- 不改 `CNAME`（`app.isjia.page`）、`robots.txt` 的 `Allow: /`、404 的 `noindex`。
- 目录结构固定：`/<app>/index.html` + `/<app>/privacy/index.html`，URL 一律带尾斜杠；`/support/` 是唯一支持中心（全部 App 的 FAQ 都在这一页，用 `#<app>` 锚点）。不要给每个 App 另建 support 页。
- 图标固定为 `assets/icons/<app>-256.png`；**所有页面的 favicon / apple-touch-icon 一律用 `solis-256.png`**（这是站点图标，不是 App 图标，别"修正"成各 App 自己的）。

**视觉系统**
- 设计 token（`:root` 的颜色、`--radius`、字体栈、暗色模式变量）不改。品牌色 `--accent` 为橙色；`--app-accent` 仅用于单 App 微调。
- 不为单个 App 页写私有 CSS / 内联大段样式；新组件进 `style.css`，沿用现有类（`app-hero`、`feature-list`、`panel`、`cta-band`、`chip`、`qa` 等）。
- 保留 `prefers-color-scheme`、`prefers-reduced-motion`、skip link、`aria-*` 等无障碍与暗色支持。

**事实与法务（最容易出错）**
- 站点定位口径：独立开发者 Jiajia Zhang，Denmark；“No accounts, no ads, no tracking”。联系邮箱唯一：`isjiajiazhang@gmail.com`；X：`@jjmakesapps`。不得换邮箱、不得加新联系渠道。
- 隐私政策是承诺性文本：**不得为了“好看”弱化或扩写数据收集声明**。每个 App 的隐私页必须与该 App 真实行为一致（权限、网络请求、购买）；App 行为变了先改隐私页并更新 `Last updated`，再改宣传页和 support FAQ。
- 价格、IAP 形态（免费/一次性/订阅）、平台与系统版本、版本号、审核状态，必须来自 App Store Connect / 对应 App 项目的真实状态，不得凭印象写。已出现的数字：Ordbro Pro $3.99、Slip Pro $11.99/yr（7 天试用）/ $19.99 终身、Hairspring TV $2.99。
- 各 App 的 App Store ID 不得改动或猜测：Solis `6770580536`、Punctum `6819719995`、ThreadLite `6811009081?mt=12`、Span `6818993580`、Wayfinder `6823482560`。Ordbro / Slip / Hairspring 尚未上架，**没有 ID 就不要放 Download 链接**，不要编造。
- 商标声明（页脚 `.fine`：Apple … not affiliated）与 “ThreadLite 不隶属 OpenAI/Google” 之类免责声明必须保留。
- 不使用未经验证的绝对化承诺（参见 ThreadLite 对 ⌘F/VoiceOver 的措辞："designed to be preserved… not independently verified"）。

**一致性清单（新增/改动 App 时必须同步，缺一不可）**
1. `/<app>/index.html`、`/<app>/privacy/index.html`
2. `index.html`：卡片、icon-row、`ld+json` ItemList、hero/section 里的 App 数量文案（现为 "Eight"）
3. `support/index.html`：目录 `#support-list`、对应 `<section id="<app>">`、页脚链接、`<title>/description/og` 中的 App 名单
4. `sitemap.xml`（app 页 priority 0.8 monthly；privacy 0.4 yearly）
5. `assets/icons/<app>-256.png`
6. 各页的 canonical / og:url 用绝对地址 `https://app.isjia.page/...`，页面内链接用相对路径

## 二、可以改（日常维护，不必请示）

- 文案润色、错别字、FAQ 增补（前提：符合上面的事实规则）。
- 状态字段随审核推进更新：Availability（"In App Review" → "On the App Store · version x.y"）、卡片 badge（`badge live` 等）、版本号。上架后补 App Store 按钮与 `support` 的 App Store chip。
- 隐私页 `Last updated` —— 仅当内容实际改变时更新。
- `sitemap.xml` 的 `changefreq/priority` 微调。
- 新增 App 页（复制 `span/` 为模板，按“一致性清单”走完）。
- `style.css` 内向后兼容的小调整（间距、响应式修复），改后在亮/暗色、窄屏各看一眼。

## 三、已知待核对（发现，非本次修改）

- `ordbro` 页写 "macOS 1.0 in App Review"、`slip` "0.1.0 in App Review"、`hairspring` "In preparation"：审核通过后需更新页面与 support（chip、价格表述）。
- 隐私页日期不一致（Punctum 6 Oct，其他 23–24 Oct）属正常，只在内容变更时才动。

## 四、验证（最小）

- 本地 `python3 -m http.server` 预览，抽查首页、改动页、`/support/#app`、暗色模式。
- `grep -rn "isjiajiazhang@gmail.com"` 邮箱一致；`grep -rn 'apps.apple.com'` ID 与上表一致；新增页面后检查 sitemap 与首页卡片均已更新。
