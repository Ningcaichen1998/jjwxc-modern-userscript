# 晋江文学城手机版 · 现代化界面改造

一个油猴脚本（UserScript），为 [晋江文学城手机版](https://wap.jjwxc.net/) 带来现代化界面，并支持自定义隐藏不需要的页面元素，附带每日自动签到。

**当前版本：v1.4.2**（更新日志见文末）

## ✨ 功能特性

### 🎨 现代化界面
- 卡片化布局：圆角、阴影、细边框，替代原版"绿色标题条 + 灰色表格"的 WAP 风格
- 深色模式：支持三档切换——跟随系统 / 浅色 / 深色（设置面板内选择，深色可手动强制开启）
- 悬浮设置按钮透明度可调（设置面板内滑块，20%–100%）
- 正文限宽居中（最大 800px），大屏阅读更舒适
- 顶栏导航胶囊化，搜索框 / 按钮 / 输入框统一圆角风格
- 章节列表逐行条目化，去掉密密麻麻的换行堆叠
- 正文阅读页加大字号与行距（17px / 1.95）

### 🧹 页面元素清理（每个均可单独开关）
| 选项 | 效果 |
|---|---|
| APP 按钮 | 移除顶栏 `/download/` 下载入口 |
| 反馈 按钮 | 移除顶栏及页脚的"反馈"链接 |
| 高级搜索 按钮 | 移除搜索框旁的"高级搜索"链接 |
| 千字收益榜 按钮 | 移除首页"千字收益榜"入口 |
| 晋江论坛 按钮 | 移除首页"晋江论坛"入口 |
| 小书喵悦读 按钮 | 移除首页"小书喵悦读"入口 |
| 本书霸王票读者排行 | 移除书籍详情页的"本书霸王票读者排行"区块 |
| 评论区 | 移除正文阅读页的评论发布表单 + 最新评论列表 |
| 收藏支持安利栏 | 移除书籍详情页的收藏/霸王票/灌溉营养液/空投月石/看书评/安利TA/书签/分享整条操作栏 |
| 打开App引导图 | 移除详情页作者信息区的 open_app_img 竖条引导图（含 jjwxc:// 深链） |

### 🔓 附加能力
- 可选解除复制 / 右键限制（原站默认禁止选中文字）
- 移除按钮时智能清理相邻的 `【】` 括号，不留残渣
- MutationObserver 兜底：AJAX 动态插入的按钮同样会被清理

### 📅 每日自动签到（v1.4 新增，已实测可用）
- 打开任意晋江手机版页面即自动完成官方签到，**每天最多发起一次请求**，绝不重复
- 走官方签到接口 `GET /my/signIn`（与页面「去签到」按钮同一接口，JSON 响应），签到成功会提示**连续签到天数与获得的月石数**
- **双登录态适配**：自动识别手机版 `sid` 或 PC 版 `readerid`+`ubuntu` 任一登录态
- 双重防重：优先读取官方 `user_signin_days` 签到状态 cookie，本地 GM 存储再兜底一层；上次结果未确认时次日自动重试
- 设置面板「每日签到」区块：自动签到开关、成功静默开关、手动签到按钮 + 实时状态显示（未登录 / 未签到 / 今日已签）
- Tampermonkey 菜单「✅ 立即签到」可随时手动补签
- 未登录不发起请求；登录过期会明确提示重新登录

> ⚠️ 自动签到需先在浏览器中登录晋江账号（手机版或 PC 版任一均可）。签到结果以晋江官方接口返回为准，重复触发无害（服务端幂等）。

## 📦 安装

1. 安装 [Tampermonkey](https://www.tampermonkey.net/)（或 Violentmonkey）浏览器扩展
2. 点击下方任一链接安装脚本（**推荐加速链接，国内访问快**）：

   **🚀 加速链接（jsDelivr CDN，推荐）**
   [`https://cdn.jsdelivr.net/gh/Ningcaichen1998/jjwxc-modern-userscript@main/jjwxc-modern.user.js`](https://cdn.jsdelivr.net/gh/Ningcaichen1998/jjwxc-modern-userscript@main/jjwxc-modern.user.js)

   **🚀 jsDelivr 备用节点（默认节点被墙/污染时使用）**
   - Gcore：[`https://gcore.jsdelivr.net/gh/Ningcaichen1998/jjwxc-modern-userscript@main/jjwxc-modern.user.js`](https://gcore.jsdelivr.net/gh/Ningcaichen1998/jjwxc-modern-userscript@main/jjwxc-modern.user.js)
   - TestingCF：[`https://testingcf.jsdelivr.net/gh/Ningcaichen1998/jjwxc-modern-userscript@main/jjwxc-modern.user.js`](https://testingcf.jsdelivr.net/gh/Ningcaichen1998/jjwxc-modern-userscript@main/jjwxc-modern.user.js)

   **🚀 GitHub 反代镜像（绕过直连限制）**
   [`https://gh-proxy.com/https://raw.githubusercontent.com/Ningcaichen1998/jjwxc-modern-userscript/main/jjwxc-modern.user.js`](https://gh-proxy.com/https://raw.githubusercontent.com/Ningcaichen1998/jjwxc-modern-userscript/main/jjwxc-modern.user.js)

   **GitHub 直链（可能较慢）**
   [`https://raw.githubusercontent.com/Ningcaichen1998/jjwxc-modern-userscript/main/jjwxc-modern.user.js`](https://raw.githubusercontent.com/Ningcaichen1998/jjwxc-modern-userscript/main/jjwxc-modern.user.js)

   > 💡 脚本已内置 `@updateURL` 指向 jsDelivr 加速源，Tampermonkey 的「检查更新」也会走加速通道。
   > jsDelivr 各节点同步新版本可能有数分钟延迟；急用最新版可用「GitHub 反代镜像」或「GitHub 直链」。
   > 若上述链接均无法访问，可下载仓库中的 `jjwxc-modern.user.js`，在 Tampermonkey 中新建脚本粘贴保存。

3. 打开 [wap.jjwxc.net](https://wap.jjwxc.net/)，页面右下角出现 ⚙️ 悬浮按钮即安装成功

## 🚀 使用

- 点击页面右下角的 **⚙️ 齿轮按钮** 打开设置面板
- 每项功能独立开关，修改即时保存（GM 存储，跨页面生效）
- 隐藏类开关**开启即时生效**；关闭后需刷新页面恢复对应按钮
- 每日签到：登录晋江后打开页面即自动签到；也可在设置面板或 Tampermonkey 菜单手动触发
- 也可通过 Tampermonkey 扩展菜单 →「打开设置面板」/「立即签到」/「恢复默认设置」

## 🖥️ 兼容性

- 脚本管理器：Tampermonkey、Violentmonkey（Greasemonkey 未测试）
- 桌面浏览器：Chrome / Edge / Firefox
- 移动端：Kiwi Browser、Via 浏览器等支持用户脚本的浏览器（每日签到已在手机端实测通过 ✅）

## 📝 更新日志

### v1.4.2（2026-11-20）
- **修复签到请求未真正执行的问题**：此前请求打到 `/my/signinIndex`（签到日历展示页），并非签到动作本身
- 改打真正的官方签到接口 `GET /my/signIn`（JSON 响应），并带上与官方页面一致的 `Referer` / `X-Requested-With` 请求头
- 签到成功提示增加**连续签到天数与月石数**（解析自官方响应 `data.signdays` / `data.coins`）
- 接口返回非 200 时明确报错（透传官方 message），不再显示模糊结果
- 手机端实测签到成功 ✅

### v1.4.1（2026-11-20）
- 修复自动签到在手机版登录态下无法触发的问题：晋江手机版登录 cookie 是 `sid`（而非 PC 版的 `readerid`+`ubuntu`），此前被误判为未登录
- 登录判断自动识别两套登录体系；新增结果未确认时的自动重试

### v1.4.0（2026-11-20）
- 新增**每日自动签到**：打开页面即自动完成官方签到，每天最多一次；设置面板新增「每日签到」区块（自动签到开关 / 成功静默开关 / 手动签到按钮 / 实时状态）；Tampermonkey 菜单新增「立即签到」

### v1.3.0
- 新增去除「打开App引导图」；悬浮设置按钮透明度可调

### v1.2.x
- 深色模式三档切换（跟随系统 / 浅色 / 深色）；内置 jsDelivr 加速源 `@updateURL`；修复深色模式手动生效问题

### v1.1 / v1.0
- 卡片化布局、页面元素自定义清理（APP/反馈/高级搜索等 11 项开关）、解除复制限制

## 📄 License

[MIT](./LICENSE)
