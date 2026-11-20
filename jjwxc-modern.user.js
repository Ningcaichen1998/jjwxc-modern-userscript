// ==UserScript==
// @name         晋江文学城手机版·现代化界面改造
// @namespace    https://wap.jjwxc.net/
// @version      1.4.2
// @description  现代化改造 wap.jjwxc.net：卡片化界面、深色模式（跟随系统/手动浅色/深色）、章节列表优化；可选去除 APP、反馈、高级搜索、千字收益榜、晋江论坛、小书喵悦读、本书霸王票读者排行、评论区、收藏支持安利栏、打开App引导图等入口；支持解除复制/右键限制、自定义悬浮按钮透明度；支持每日自动签到一次（登录后自动完成，可手动签到）。
// @author       WorkBuddy
// @license      MIT
// @downloadURL  https://cdn.jsdelivr.net/gh/Ningcaichen1998/jjwxc-modern-userscript@main/jjwxc-modern.user.js
// @updateURL    https://cdn.jsdelivr.net/gh/Ningcaichen1998/jjwxc-modern-userscript@main/jjwxc-modern.user.js
// @supportURL   https://github.com/Ningcaichen1998/jjwxc-modern-userscript
// @match        https://wap.jjwxc.net/*
// @match        http://wap.jjwxc.net/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// @connect      my.jjwxc.net
// @connect      jjwxc.net
// @run-at       document-start
// @noframes
// ==/UserScript==

(function () {
    'use strict';

    /* ================= 配置 ================= */

    var STORE_KEY = 'jjjModernCfg';

    var DEFAULT_CFG = {
        modernize:   true,   // 现代化界面
        theme:       'auto', // 主题：auto=跟随系统 / light=浅色 / dark=深色
        fabOpacity:  100,    // 悬浮设置按钮不透明度（20-100）
        unblock:     false,  // 解除复制/右键限制
        rmApp:       true,   // 去除 APP 按钮
        rmFeedback:  true,   // 去除 反馈 按钮
        rmAdvSearch: true,   // 去除 高级搜索 按钮
        rmIncome:    true,   // 去除 千字收益榜 按钮
        rmForum:     true,   // 去除 晋江论坛 按钮
        rmCat:       true,   // 去除 小书喵悦读 按钮
        rmKingRank:  true,   // 去除 本书霸王票读者排行
        rmComment:   true,   // 去除 评论区
        rmActionBar: true,   // 去除 收藏支持安利栏
        rmOpenApp:   true,   // 去除 open_app_img（打开App引导图）
        autoSign:    true,   // 每日自动签到（每天最多一次）
        signSilent:  false   // 签到成功时不弹提示（静默模式）
    };

    function loadCfg() {
        var cfg = {};
        var k;
        for (k in DEFAULT_CFG) cfg[k] = DEFAULT_CFG[k];
        try {
            var raw = storeGet(STORE_KEY, null);
            if (raw) {
                var obj = JSON.parse(raw);
                for (k in DEFAULT_CFG) {
                    if (Object.prototype.hasOwnProperty.call(obj, k)) {
                        /* 按字段类型规范化：布尔转布尔、数字转 Number、字符串保留 */
                        if (typeof DEFAULT_CFG[k] === 'boolean') cfg[k] = !!obj[k];
                        else if (typeof DEFAULT_CFG[k] === 'number') cfg[k] = Number(obj[k]);
                        else cfg[k] = obj[k];
                    }
                }
            }
        } catch (e) { /* 忽略损坏的配置 */ }
        return cfg;
    }

    function saveCfg(cfg) {
        storeSet(STORE_KEY, JSON.stringify(cfg));
    }

    /* GM 存储兜底（无 GM 环境回落 localStorage） */
    function storeGet(k, d) {
        try {
            if (typeof GM_getValue === 'function') return GM_getValue(k, d);
        } catch (e) {}
        try {
            var v = localStorage.getItem(k);
            return v === null ? d : v;
        } catch (e) { return d; }
    }
    function storeSet(k, v) {
        try {
            if (typeof GM_setValue === 'function') { GM_setValue(k, v); return; }
        } catch (e) {}
        try { localStorage.setItem(k, v); } catch (e) {}
    }

    var cfg = loadCfg();

    function addStyle(css) {
        var s = document.createElement('style');
        s.setAttribute('data-jjj-modern', '');
        s.textContent = css;
        (document.head || document.documentElement).appendChild(s);
        return s;
    }

    /* ================= 一、现代化样式 ================= */

    var MODERN_CSS = [
        ':root{',
        '  --jjj-bg:#f3f4f6;--jjj-card:#ffffff;--jjj-text:#27292e;--jjj-text2:#82868e;',
        '  --jjj-line:rgba(0,0,0,.08);--jjj-primary:#d43a47;--jjj-primary-weak:rgba(212,58,71,.09);',
        '  --jjj-link:#c2454f;--jjj-radius:14px;',
        '  --jjj-shadow:0 1px 2px rgba(16,17,20,.04),0 8px 24px rgba(16,17,20,.06);',
        '}',
        ':root[data-jj-theme="dark"]{',
        '  --jjj-bg:#131417;--jjj-card:#1e2025;--jjj-text:#e3e5e9;--jjj-text2:#9298a2;',
        '  --jjj-line:rgba(255,255,255,.09);--jjj-primary:#e0515d;--jjj-primary-weak:rgba(224,81,93,.14);',
        '  --jjj-link:#e58087;',
        '  --jjj-shadow:0 1px 2px rgba(0,0,0,.35),0 8px 24px rgba(0,0,0,.30);',
        '}',
        'html{-webkit-text-size-adjust:100%}',
        'body{',
        '  margin:0 auto!important;max-width:800px;',
        '  padding:10px 10px 30px!important;',
        '  background:var(--jjj-bg)!important;color:var(--jjj-text)!important;',
        '  font-family:system-ui,-apple-system,"PingFang SC","HarmonyOS Sans SC","MiSans","Hiragino Sans GB","Microsoft YaHei",sans-serif!important;',
        '  font-size:15px!important;line-height:1.65!important;',
        '  -webkit-tap-highlight-color:transparent;',
        '}',
        'a,a:link,a:visited{color:var(--jjj-link);text-decoration:none!important;-webkit-transition:opacity .15s ease;transition:opacity .15s ease}',
        'a:active{opacity:.55}',
        'a img{border-radius:6px}',
        '/* ---- 卡片化模块 ---- */',
        '.module,.b.module{',
        '  background:var(--jjj-card)!important;',
        '  border:1px solid var(--jjj-line)!important;',
        '  border-radius:var(--jjj-radius)!important;',
        '  box-shadow:var(--jjj-shadow)!important;',
        '  padding:12px!important;margin:10px 0!important;',
        '  overflow:hidden;',
        '}',
        '/* ---- 原绿色标题条 -> 现代标题 ---- */',
        '.big.o,h2.big.o,.big.o a:link,.big.o a:visited,.big.o strong,.big.o span{',
        '  color:var(--jjj-text)!important;background:none!important;',
        '}',
        '.big.o,h2.big.o{',
        '  margin:4px 0 10px!important;padding:1px 0 1px 10px!important;',
        '  font-size:16px!important;font-weight:700!important;line-height:1.45!important;',
        '  border-left:4px solid var(--jjj-primary);border-radius:2px;',
        '}',
        '/* ---- 原蓝色描边小标题（榜单等） ---- */',
        '.bo{',
        '  margin:6px 0 10px!important;border:none!important;',
        '  background:var(--jjj-primary-weak)!important;',
        '  border-radius:10px!important;padding:7px 10px!important;',
        '  font-weight:600;color:var(--jjj-text)!important;',
        '}',
        '/* ---- 顶部导航菜单：胶囊标签 ---- */',
        '#menu_list{display:flex!important;flex-wrap:wrap;gap:6px;line-height:2.1}',
        '#menu_list br{display:none!important}',
        '#menu_list a{',
        '  display:inline-block!important;',
        '  padding:1px 12px!important;margin:0!important;',
        '  background:var(--jjj-primary-weak)!important;',
        '  color:var(--jjj-link)!important;',
        '  border-radius:999px!important;',
        '  font-size:13.5px!important;line-height:2!important;',
        '}',
        '/* ---- 搜索区 ---- */',
        '#autoComplete,input[type="text"],input[name="kw"]{',
        '  height:auto!important;box-sizing:border-box;',
        '  padding:7px 1.9em 7px 10px!important;',
        '  border:1px solid var(--jjj-line)!important;',
        '  border-radius:10px!important;',
        '  background:var(--jjj-bg)!important;color:var(--jjj-text)!important;',
        '  font-size:14px!important;outline:none!important;',
        '}',
        '#autoComplete:focus,input[type="text"]:focus{border-color:var(--jjj-primary)!important}',
        '#mclear{margin-left:-24px!important;opacity:.6}',
        'input[type="submit"],button,input[type="button"]:not(#mclear){',
        '  border:none!important;border-radius:10px!important;',
        '  padding:6px 16px!important;margin:2px!important;',
        '  background:var(--jjj-primary)!important;color:#fff!important;',
        '  font-size:14px!important;cursor:pointer;',
        '}',
        'input[type="radio"]{accent-color:var(--jjj-primary)}',
        '/* ---- 表格与分隔线 ---- */',
        'table{border-collapse:collapse}',
        'td{border-right:1px solid var(--jjj-line)!important;padding:3px 8px!important}',
        'td:nth-child(2){border-right:none!important}',
        'hr{border:none!important;border-top:1px solid var(--jjj-line)!important;margin:10px 0}',
        'ul li{line-height:1.75}',
        '/* ---- 页脚 ---- */',
        '.ft{',
        '  margin-top:16px!important;padding:14px 12px 2px!important;',
        '  border-top:none!important;text-align:center;',
        '  color:var(--jjj-text2)!important;font-size:12px!important;line-height:1.8!important;',
        '}',
        '.ft font{color:var(--jjj-text2)!important}',
        '.ft a,.ft a:link,.ft a:visited{color:var(--jjj-text2)!important}',
        '/* ---- 书籍详情页 ---- */',
        '#novelintro{color:var(--jjj-text2)!important}',
        '#chapter_list_box a{display:block!important;padding:5px 2px!important;border-bottom:1px dashed var(--jjj-line)}',
        '#chapter_list_box br{display:none!important}',
        '#chapter_list_box a[style*="text-align:center"]{border-bottom:none!important;font-weight:600!important}',
        'img.pic,.pic img{border-radius:8px}',
        '/* ---- 正文阅读页 ---- */',
        '.content_ul{font-size:17px!important;line-height:1.95!important}',
        '/* ---- 其它 ---- */',
        ':focus-visible{outline:2px solid var(--jjj-primary);outline-offset:2px}',
        '::-webkit-scrollbar{width:8px;height:8px}',
        '::-webkit-scrollbar-thumb{background:rgba(130,134,142,.4);border-radius:4px}',
        '::-webkit-scrollbar-track{background:transparent}',
        '::selection{background:rgba(212,58,71,.22)}'
    ].join('\n');

    var UNBLOCK_CSS = [
        '*{',
        '  -webkit-user-select:text!important;-moz-user-select:text!important;',
        '  -ms-user-select:text!important;-khtml-user-select:text!important;',
        '  user-select:text!important;',
        '}'
    ].join('\n');

    var modernStyleEl = null;
    var unblockStyleEl = null;

    /* ---- 主题：auto=跟随系统 / light / dark ---- */
    var mqDark = null;
    var panelVarsEl = null;   // 设置面板 .jjj-vars 元素（用于同步深色）
    var fabEl = null;         // 悬浮齿轮按钮元素（用于设置透明度）

    function isSystemDark() {
        if (typeof matchMedia !== 'function') return false;
        if (!mqDark) mqDark = matchMedia('(prefers-color-scheme: dark)');
        return !!(mqDark && mqDark.matches);
    }

    function isDarkValue() {
        return cfg.theme === 'dark' || (cfg.theme !== 'light' && isSystemDark());
    }

    function applyTheme() {
        var v = isDarkValue() ? 'dark' : 'light';
        if (document.documentElement) document.documentElement.setAttribute('data-jj-theme', v);
        if (panelVarsEl) panelVarsEl.setAttribute('data-jj-theme', v);
    }

    function applyFabOpacity() {
        if (!fabEl) return;
        var v = Number(cfg.fabOpacity);
        if (!isFinite(v)) v = 100;
        if (v < 20) v = 20;
        if (v > 100) v = 100;
        fabEl.style.opacity = String(v / 100);
    }

    function applyModern(on) {
        if (on) {
            if (!modernStyleEl) modernStyleEl = addStyle(MODERN_CSS);
            else modernStyleEl.disabled = false;
        } else if (modernStyleEl) {
            modernStyleEl.disabled = true;
        }
    }

    function applyUnblock(on) {
        if (on) {
            if (!unblockStyleEl) unblockStyleEl = addStyle(UNBLOCK_CSS);
            else unblockStyleEl.disabled = false;
            try {
                document.oncontextmenu = null;
                document.onselectstart = null;
                document.ondragstart = null;
                if (document.body) {
                    document.body.oncontextmenu = null;
                    document.body.onselectstart = null;
                    document.body.removeAttribute('oncontextmenu');
                    document.body.removeAttribute('onselectstart');
                }
            } catch (e) {}
        } else {
            if (unblockStyleEl) unblockStyleEl.disabled = true;
        }
    }

    /* ================= 二、页面元素清理 ================= */

    /* 每个清理器返回 true 表示该 <a> 需要删除 */
    var REMOVERS = {
        rmApp: function (a) {
            var h = a.getAttribute('href') || '';
            return /^\/download\//.test(h);
        },
        rmFeedback: function (a) {
            var h = a.getAttribute('href') || '';
            return h === '/help' && a.textContent.trim() === '反馈';
        },
        rmAdvSearch: function (a) {
            var h = a.getAttribute('href') || '';
            return h === '/assort' && a.textContent.indexOf('高级搜索') !== -1;
        },
        rmIncome: function (a) {
            var h = a.getAttribute('href') || '';
            return h.indexOf('/my/novelincome') !== -1;
        },
        rmForum: function (a) {
            var h = a.getAttribute('href') || '';
            return /bbs\.jjwxc\.net/i.test(h);
        },
        rmCat: function (a) {
            var h = a.getAttribute('href') || '';
            return /children\.php/i.test(h);
        }
    };

    /* 区块清理器：非链接类的整块内容（幂等，可重复执行） */
    var BLOCK_REMOVERS = {
        /* 本书霸王票读者排行：详情页 /book2/xxx 的排行区块 */
        rmKingRank: function () {
            var anchors = [];
            var ks = document.getElementById('kingSort');
            if (ks) anchors.push(ks);
            var tds = document.querySelectorAll('td');
            for (var i = 0; i < tds.length; i++) {
                var t = tds[i].textContent.trim();
                if (t === '本书霸王票读者排行' || t.indexOf('本书霸王票读者排行') === 0) {
                    anchors.push(tds[i]);
                }
            }
            for (var j = 0; j < anchors.length; j++) {
                var table = closestTag(anchors[j], 'TABLE');
                if (table) {
                    var block = table.parentElement;
                    if (block && block.tagName === 'DIV') block.remove();
                    else table.remove();
                } else if (anchors[j].tagName === 'TD' && anchors[j].parentElement) {
                    anchors[j].parentElement.remove();
                }
            }
        },
        /* 评论区：正文阅读页评论表单 + 最新评论列表 */
        rmComment: function () {
            var forms = document.querySelectorAll('form[name="review"]');
            for (var i = 0; i < forms.length; i++) {
                var ul = forms[i].parentElement;
                forms[i].remove();
                if (ul && ul.tagName === 'UL' && !ul.textContent.trim() && !ul.querySelector('li,form')) {
                    ul.remove();
                }
            }
            var lists = document.querySelectorAll('#comment_list_new');
            for (var j = 0; j < lists.length; j++) {
                lists[j].remove();
            }
        },
        /* 收藏支持安利栏：详情页 /book2/xxx 的收藏/霸王票/灌溉营养液/空投月石/看书评/安利TA/书签/分享 整条操作栏 */
        rmActionBar: function () {
            var anchors = [];
            var links = document.querySelectorAll('a.novel_data_div');
            for (var i = 0; i < links.length; i++) anchors.push(links[i]);
            var share = document.getElementById('shareButton');
            if (share) anchors.push(share);
            for (var j = 0; j < anchors.length; j++) {
                var li = closestTag(anchors[j], 'LI');
                if (li && li.textContent.indexOf('收藏') !== -1 && li.textContent.indexOf('霸王票') !== -1) {
                    li.remove();
                }
            }
        },
        /* open_app_img：详情页作者信息区的「打开App」引导图（含 jjwxc:// 深链） */
        rmOpenApp: function () {
            var imgs = document.querySelectorAll('img.open_app_img, img[data-launche-app-url]');
            for (var i = 0; i < imgs.length; i++) {
                imgs[i].remove();
            }
        }
    };

    /* 向上查找指定标签的祖先元素（兼容旧浏览器） */
    function closestTag(el, tag) {
        var node = el;
        tag = String(tag).toUpperCase();
        while (node && node.tagName !== tag) node = node.parentElement;
        return node;
    }

    function anyCleanerOn() {
        for (var k in REMOVERS) if (cfg[k]) return true;
        for (var b in BLOCK_REMOVERS) if (cfg[b]) return true;
        return false;
    }

    /* 智能删除链接：顺带清理相邻的【】括号与 &nbsp; 间隔，不留残渣 */
    function removeLinkSmart(a) {
        var prev = a.previousSibling;
        var next = a.nextSibling;
        if (prev && prev.nodeType === 3) {
            var t = prev.textContent.replace(/【[ \t\u00A0]*$/, '');
            prev.textContent = /^[ \t\u00A0\s]*$/.test(t) ? '' : t;
            if (!prev.textContent) prev.remove();
        }
        if (next && next.nodeType === 3) {
            var t2 = next.textContent.replace(/^[ \t\u00A0]*】/, '');
            next.textContent = /^[ \t\u00A0\s]*$/.test(t2) && !t2 ? '' : t2;
        }
        a.remove();
    }

    function cleanElements() {
        if (!anyCleanerOn() || !document.querySelectorAll) return;
        var links = document.querySelectorAll('a');
        for (var i = 0; i < links.length; i++) {
            var a = links[i];
            for (var key in REMOVERS) {
                if (cfg[key] && REMOVERS[key](a)) {
                    removeLinkSmart(a);
                    break;
                }
            }
        }
        /* 「千字收益榜/晋江论坛/小书喵悦读」容器：内容清空后整块移除 */
        var boxes = document.querySelectorAll('div[style*="keep-all"]');
        for (var j = 0; j < boxes.length; j++) {
            var d = boxes[j];
            if (!d.querySelector('a') && !d.textContent.replace(/[【】\s\u00A0]/g, '')) {
                d.remove();
            }
        }
        /* 区块清理器 */
        for (var bk in BLOCK_REMOVERS) {
            if (cfg[bk]) BLOCK_REMOVERS[bk]();
        }
    }

    /* 动态渲染兜底：页面有 AJAX 内容，防抖后重跑清理（幂等） */
    var moPending = false;
    function watchDom() {
        if (typeof MutationObserver !== 'function') return;
        var mo = new MutationObserver(function () {
            if (moPending) return;
            moPending = true;
            setTimeout(function () {
                moPending = false;
                cleanElements();
            }, 300);
        });
        mo.observe(document.documentElement, { childList: true, subtree: true });
    }

    /* ================= 三、每日自动签到 ================= */

    /*
     * 原理：晋江有两套登录体系——
     *   wap 手机版：cookie sid（格式 readerid_xxx），签到入口 /my/signinIndex（服务端渲染）
     *   PC 版：cookies readerid + ubuntu，签到入口 my.jjwxc.net/backend/signin.php
     * 签到状态都记录在 .jjwxc.net 域 cookie user_signin_days（格式 YYYYMMDD_readerid_1）。
     * 本脚本运行在 wap 站：优先判断 sid 登录态，走 wap 签到页（同域带 cookie）；
     * 若浏览器同时有 PC 登录态则用 PC 接口。本地 GM 存储做"每天最多请求一次"兜底。
     */

    var SIGN_STORE_KEY = 'jjjSignState';
    var SIGN_URL_PC = 'https://my.jjwxc.net/backend/signin.php';
    var SIGN_URL_WAP = 'https://wap.jjwxc.net/my/signIn';   /* 正确端点：signIn（抓包证实），JSON 响应 */

    function getCookie(name) {
        try {
            var m = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
            return m ? decodeURIComponent(m[1]) : null;
        } catch (e) { return null; }
    }

    /* 当前 readerid：wap 登录态从 sid 解析（格式 readerid_xxx），PC 登录态直接读 */
    function getReaderId() {
        var sid = getCookie('sid');
        if (sid) {
            var m = sid.match(/^(\d+)_/);
            if (m) return m[1];
        }
        return getCookie('readerid');
    }

    /* 登录态：wap 的 sid 或 PC 的 readerid+ubuntu，任一存在即可 */
    function isSignedIn() {
        var sid = getCookie('sid');
        if (sid && /^\d+_/.test(sid)) return true;
        return !!(getCookie('readerid') && getCookie('ubuntu'));
    }

    /* 是否具备 PC 签到接口所需的完整登录态 */
    function hasPcSession() {
        return !!(getCookie('readerid') && getCookie('ubuntu'));
    }

    function todayStr() {
        var d = new Date();
        var m = d.getMonth() + 1, day = d.getDate();
        return d.getFullYear() +
            (m < 10 ? '0' + m : '' + m) +
            (day < 10 ? '0' + day : '' + day);
    }

    function loadSignState() {
        try {
            var raw = storeGet(SIGN_STORE_KEY, null);
            if (raw) {
                var obj = JSON.parse(raw);
                if (obj && typeof obj === 'object') return obj;
            }
        } catch (e) {}
        return {};
    }

    function saveSignState(st) {
        storeSet(SIGN_STORE_KEY, JSON.stringify(st));
    }

    /* 官方 cookie 是否显示今天已签到（同名 cookie 可能多份：逐个检查） */
    function serverSignedToday() {
        var readerid = getReaderId();
        if (!readerid) return false;
        var found = [];
        try {
            var pairs = document.cookie.split(';');
            for (var i = 0; i < pairs.length; i++) {
                var p = pairs[i];
                var eq = p.indexOf('=');
                if (eq === -1) continue;
                if (p.slice(0, eq).replace(/^\s+|\s+$/g, '') !== 'user_signin_days') continue;
                found.push(decodeURIComponent(p.slice(eq + 1).trim()));
            }
        } catch (e) {}
        var today = todayStr();
        for (var j = 0; j < found.length; j++) {
            var parts = found[j].split('_');
            if (parts.length >= 3 && parts[0] === today && parts[1] === readerid && parts[2] === '1') {
                return true;
            }
        }
        return false;
    }

    /* 签到状态汇总（供 UI 展示） */
    function signStatusInfo() {
        if (!isSignedIn()) {
            return { code: 'guest', text: '未登录', tip: '登录晋江账号后可自动签到' };
        }
        var today = todayStr();
        if (serverSignedToday()) {
            return { code: 'done', text: '今日已签', tip: '官方确认：今日已签到' };
        }
        var st = loadSignState();
        if (st.date === today && st.ok) {
            return { code: 'done', text: '今日已签', tip: '本脚本今日已完成签到' };
        }
        if (st.date === today) {
            return { code: 'tried', text: '已尝试', tip: st.msg || '今日已请求过，结果未确认' };
        }
        return { code: 'none', text: '未签到', tip: '开启自动签到后，打开页面即自动完成' };
    }

    /* 发起签到请求：
     * 正确端点（抓包证实）：GET /my/signIn（注意大小写）+ Referer /my/signinIndex
     *   + X-Requested-With: XMLHttpRequest，返回 JSON：code=200 签到成功（含
     *   signdays 连续天数 / coins 月石），重复签到也返回 code=200 + "当天已经签到"
     * wap 登录态（sid）：GM_xmlhttpRequest 直连本域 /my/signIn（TM 自动带 cookie）
     * PC 登录态（readerid+ubuntu）：走 PC 接口 my.jjwxc.net/backend/signin.php
     */
    function requestSign(cb) {
        if (hasPcSession() && typeof GM_xmlhttpRequest === 'function') {
            GM_xmlhttpRequest({
                method: 'GET',
                url: SIGN_URL_PC,
                timeout: 15000,
                headers: { 'Referer': 'https://wap.jjwxc.net/' },
                onload: function (res) {
                    verifySignResponse(res.finalUrl || '', res.responseText || '', cb);
                },
                onerror: function () { cb({ ok: false, msg: '网络错误，签到请求失败' }); },
                ontimeout: function () { cb({ ok: false, msg: '签到请求超时' }); }
            });
            return;
        }
        if (typeof GM_xmlhttpRequest === 'function') {
            GM_xmlhttpRequest({
                method: 'GET',
                url: SIGN_URL_WAP + '?autoSign=' + Date.now(),
                timeout: 15000,
                headers: {
                    'Referer': 'https://wap.jjwxc.net/my/signinIndex',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                onload: function (res) {
                    verifySignResponse(res.finalUrl || '', res.responseText || '', cb);
                },
                onerror: function () { cb({ ok: false, msg: '网络错误，签到请求失败' }); },
                ontimeout: function () { cb({ ok: false, msg: '签到请求超时' }); }
            });
            return;
        }
        if (typeof fetch === 'function') {
            fetch(SIGN_URL_WAP + '?autoSign=' + Date.now(), {
                method: 'GET',
                credentials: 'include',
                redirect: 'follow',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            }).then(function (res) {
                var finalUrl = res.redirected ? (res.url || '') : '';
                return res.text().then(function (body) {
                    verifySignResponse(finalUrl, body, cb);
                });
            }).catch(function () {
                cb({ ok: false, msg: '网络错误，签到请求失败' });
            });
            return;
        }
        cb({ ok: false, msg: '当前环境不支持签到请求' });
    }

    /* 校验签到结果：登录跳转=失效；user_signin_days=成功；其余=已请求未确认 */
    /* 校验签到结果：
     * wap 端点返回 JSON：{"code":200,"message":"签到成功"/"当天已经签到...","data":{signdays,coins}}
     * 兼容 PC 端点的 302/HTML 响应。 */
    function verifySignResponse(finalUrl, body, cb) {
        setTimeout(function () {
            var url = finalUrl || '';
            /* 登录失效：302 到登录页 */
            if (url.indexOf('login') !== -1 || body.indexOf('login.php') !== -1 || body.indexOf('/my/login') !== -1) {
                cb({ ok: false, msg: '登录已过期，请先重新登录晋江' });
                return;
            }
            /* wap JSON 端点：code=200 即成功（含重复签到的幂等响应） */
            var json = null;
            if (body && body.charAt(0) === '{') {
                try { json = JSON.parse(body); } catch (e) { json = null; }
            }
            if (json && json.code === 200) {
                var d = json.data || {};
                var extra = '';
                if (d.signdays) extra = '，已连签 ' + d.signdays + ' 天';
                if (d.coins) extra += '，得 ' + d.coins + ' 月石';
                cb({ ok: true, msg: decodeMsg(json.message) + extra });
                return;
            }
            if (json && json.code !== undefined) {
                cb({ ok: false, msg: decodeMsg(json.message) || ('签到失败（code ' + json.code + '）') });
                return;
            }
            /* PC 端点等无 JSON：以官方 cookie 为准 */
            if (serverSignedToday()) {
                cb({ ok: true, msg: '' });
                return;
            }
            setTimeout(function () {
                if (serverSignedToday()) cb({ ok: true, msg: '' });
                else cb({ ok: false, tried: true, msg: '已发送签到请求，请以官网页面为准' });
            }, 400);
        }, 250);
    }

    /* 解码 JSON 里的 \\uXXXX 转义（晋江 message 常用） */
    function decodeMsg(s) {
        if (typeof s !== 'string') return '';
        try {
            return s.replace(/\\u([0-9a-fA-F]{4})/g, function (_, h) {
                return String.fromCharCode(parseInt(h, 16));
            });
        } catch (e) { return s; }
    }

    /* 执行签到：manual=true 为手动触发（无视静默提示） */
    function doSign(manual) {
        if (!isSignedIn()) {
            toastMsg('签到：请先登录晋江账号');
            return;
        }
        if (serverSignedToday()) {
            var stOk = { date: todayStr(), reader: getReaderId() || '', ok: true, msg: '' };
            saveSignState(stOk);
            updateSignUI();
            toastMsg('今天已经签到过了');
            return;
        }
        toastMsg('正在签到…');
        var reader = getReaderId() || '';
        requestSign(function (r) {
            saveSignState({
                date: todayStr(),
                reader: reader,
                ok: !!r.ok,
                tried: !!r.tried,
                msg: r.msg || ''
            });
            updateSignUI();
            if (r.ok) {
                var okMsg = r.msg ? ('签到成功：' + r.msg) : '签到成功，明天见 ✓';
                if (manual || !cfg.signSilent) toastMsg(okMsg);
            } else {
                toastMsg('签到：' + (r.msg || '未知结果'));
            }
        });
    }

    /* 执行签到：manual=true 为手动触发（无视静默提示） */
    function autoSignOnce() {
        if (!cfg.autoSign) return;
        if (!isSignedIn()) return;                       /* 未登录：不请求 */
        if (serverSignedToday()) {                       /* 官方已确认：同步本地状态即可 */
            var st = loadSignState();
            if (st.date !== todayStr() || !st.ok) {
                saveSignState({ date: todayStr(), reader: getReaderId() || '', ok: true, msg: '' });
                updateSignUI();
            }
            return;
        }
        var local = loadSignState();
        if (local.date === todayStr()) {
            if (local.ok) return;        /* 今日已确认成功 */
            if (local.retried) return;   /* 今日已重试过一次 */
            /* 未确认/失败（如旧版误判、登录过期后重新登录）：允许重试一次 */
        }
        var reader = getReaderId() || '';
        requestSign(function (r) {
            saveSignState({
                date: todayStr(),
                reader: reader,
                ok: !!r.ok,
                tried: !!r.tried,
                retried: !!(local.date === todayStr() && !local.ok),
                msg: r.msg || ''
            });
            updateSignUI();
            if (r.ok && !cfg.signSilent) toastMsg('自动签到成功，明天见 ✓');
            else if (!r.ok && r.msg) toastMsg('自动签到：' + r.msg);
        });
    }

    /* 签到提示（复用面板 toast，面板未就绪时静默降级） */
    function toastMsg(msg) {
        if (panelApi && typeof panelApi.toast === 'function') panelApi.toast(msg);
    }

    /* 刷新面板中的签到状态显示 */
    function updateSignUI() {
        if (panelApi && typeof panelApi.updateSign === 'function') panelApi.updateSign(signStatusInfo());
    }

    /* ================= 四、设置面板（Shadow DOM 隔离） ================= */

    var PANEL_ITEMS = [
        { key: 'modernize',   label: '现代化界面',        desc: '卡片化 / 深色模式 / 圆角阴影' },
        { key: 'unblock',     label: '解除复制限制',      desc: '允许选中文字、右键菜单' },
        { sec: '隐藏页面元素' },
        { key: 'rmApp',       label: 'APP 按钮' },
        { key: 'rmFeedback',  label: '反馈 按钮' },
        { key: 'rmAdvSearch', label: '高级搜索 按钮' },
        { key: 'rmIncome',    label: '千字收益榜 按钮' },
        { key: 'rmForum',     label: '晋江论坛 按钮' },
        { key: 'rmCat',       label: '小书喵悦读 按钮' },
        { key: 'rmKingRank',  label: '本书霸王票读者排行', desc: '书籍详情页的霸王票排行区块' },
        { key: 'rmComment',   label: '评论区',             desc: '阅读页评论表单 + 最新评论列表' },
        { key: 'rmActionBar', label: '收藏支持安利栏',     desc: '收藏/霸王票/营养液/空投月石/书评/安利/书签/分享' },
        { key: 'rmOpenApp',   label: '打开App引导图',      desc: '详情页作者信息区的 open_app_img 竖条图' },
        { sec: '每日签到' },
        { key: 'autoSign',    label: '每日自动签到',        desc: '打开晋江页面即自动签到，每天最多一次' },
        { key: 'signSilent',  label: '签到成功静默',        desc: '开启后签到成功不弹提示' },
        { key: '__signBtn',   label: '手动签到',            desc: '立即执行一次签到请求' }
    ];

    var GEAR_SVG = '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"></circle><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.09a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55h.09a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.09a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1z"></path></svg>';

    var PANEL_CSS = [
        ':host{font-family:system-ui,-apple-system,"PingFang SC","Microsoft YaHei",sans-serif}',
        '*{box-sizing:border-box;padding:0;margin:0}',
        '.jjj-vars{',
        '  --p-bg:#ffffff;--p-text:#27292e;--p-text2:#82868e;--p-line:#f0f0f3;',
        '  --p-accent:#d43a47;--p-accent-weak:rgba(212,58,71,.09);--p-soft:#fafafa;',
        '}',
        '.jjj-vars[data-jj-theme="dark"]{',
        '  --p-bg:#1e2025;--p-text:#e3e5e9;--p-text2:#9298a2;--p-line:#2a2d33;',
        '  --p-accent:#e0515d;--p-accent-weak:rgba(224,81,93,.15);--p-soft:#23262b;',
        '}',
        '.fab{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom));width:44px;height:44px;border-radius:50%;',
        '  background:rgba(255,255,255,.88);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);',
        '  border:1px solid rgba(0,0,0,.08);box-shadow:0 4px 18px rgba(0,0,0,.14);',
        '  display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:2147483000;',
        '  transition:transform .15s ease;color:#5a5e66;user-select:none;-webkit-user-select:none}',
        '.fab:hover{transform:scale(1.1) rotate(30deg)}',
        '.fab:active{transform:scale(.95)}',
        '.mask{position:fixed;inset:0;background:rgba(0,0,0,.28);z-index:2147483001;display:none}',
        '.mask.show{display:block}',
        '.panel{position:fixed;right:16px;bottom:calc(72px + env(safe-area-inset-bottom));',
        '  width:min(302px,calc(100vw - 32px));background:var(--p-bg);border-radius:16px;',
        '  box-shadow:0 12px 44px rgba(0,0,0,.22);border:1px solid rgba(0,0,0,.05);',
        '  z-index:2147483002;display:none;overflow:hidden;',
        '  color:var(--p-text);max-height:calc(100vh - 120px);overflow-y:auto}',
        '.panel.show{display:block;animation:jjjpop .18s ease}',
        '@keyframes jjjpop{from{opacity:0;transform:translateY(10px) scale(.97)}to{opacity:1;transform:none}}',
        '.head{display:flex;align-items:center;justify-content:space-between;',
        '  padding:13px 16px 11px;font-size:15px;font-weight:700;',
        '  background:var(--p-accent-weak);color:var(--p-text)}',
        '.head .close{cursor:pointer;font-size:20px;line-height:1;color:var(--p-text2);',
        '  width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:8px}',
        '.head .close:hover{background:var(--p-line)}',
        '.row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 16px}',
        '.row+.row,.sec+.row{border-top:1px solid var(--p-line)}',
        '.row .t{font-size:14px;color:var(--p-text);line-height:1.35}',
        '.row .d{font-size:11.5px;color:var(--p-text2);margin-top:2px}',
        '.sec{padding:10px 16px 4px;font-size:11.5px;color:var(--p-text2);background:var(--p-soft);font-weight:600}',
        '.foot{padding:9px 16px 12px;font-size:11px;color:var(--p-text2);background:var(--p-soft);line-height:1.6}',
        '.sw{position:relative;width:42px;height:24px;flex:none}',
        '.sw input{opacity:0;width:0;height:0;position:absolute}',
        '.knob{position:absolute;inset:0;background:#d5d7db;border-radius:999px;transition:.2s;cursor:pointer}',
        '.knob::before{content:"";position:absolute;width:18px;height:18px;border-radius:50%;',
        '  background:#fff;top:3px;left:3px;transition:.2s;box-shadow:0 1px 3px rgba(0,0,0,.3)}',
        '.sw input:checked+.knob{background:var(--p-accent)}',
        '.sw input:checked+.knob::before{transform:translateX(18px)}',
        '.seg{display:flex;background:var(--p-soft);border-radius:8px;padding:2px;gap:2px;flex:none;border:1px solid var(--p-line)}',
        '.seg button{font-size:12px;padding:4px 10px;border-radius:6px;border:none;background:transparent;color:var(--p-text2);cursor:pointer;line-height:1.4}',
        '.seg button.on{background:var(--p-accent);color:#fff}',
        '.range{flex:none;width:118px;accent-color:var(--p-accent);cursor:pointer;margin:0}',
        '.signbtn{flex:none;font-size:13px;padding:7px 18px;border-radius:10px;border:none;',
        '  background:var(--p-accent);color:#fff;cursor:pointer;line-height:1.4;font-weight:600}',
        '.signbtn:active{opacity:.8}',
        '.signbtn[disabled]{opacity:.5;cursor:default}',
        '.toast{position:fixed;left:50%;bottom:calc(84px + env(safe-area-inset-bottom));',
        '  transform:translateX(-50%) translateY(8px);background:rgba(30,32,36,.93);color:#fff;',
        '  font-size:13px;padding:8px 16px;border-radius:999px;opacity:0;pointer-events:none;',
        '  transition:.25s ease;z-index:2147483003;white-space:nowrap}',
        '.toast.show{opacity:1;transform:translateX(-50%) translateY(0)}'
    ].join('\n');

    var panelApi = null;   // { open() }

    function buildPanel() {
        if (panelApi || !document.body) return;

        var host = document.createElement('div');
        host.setAttribute('data-jjj-panel', '');
        document.body.appendChild(host);
        var root = host.attachShadow({ mode: 'open' });

        var html = ['<div class="jjj-vars">'];
        html.push('<style>' + PANEL_CSS + '</style>');
        html.push('<div class="fab" id="fab" title="界面改造设置">' + GEAR_SVG + '</div>');
        html.push('<div class="mask" id="mask"></div>');
        html.push('<div class="panel" id="panel">');
        html.push('<div class="head">界面改造设置<span class="close" id="close">×</span></div>');
        for (var i = 0; i < PANEL_ITEMS.length; i++) {
            var it = PANEL_ITEMS[i];
            if (it.sec) {
                html.push('<div class="sec">' + it.sec + '</div>');
                continue;
            }
            /* 手动签到：渲染为按钮行 */
            if (it.key === '__signBtn') {
                html.push('<div class="row"><div><div class="t">' + it.label + '</div>' +
                    '<div class="d" id="signStatusText">状态读取中…</div></div>' +
                    '<button type="button" class="signbtn" id="signNowBtn">签到</button></div>');
                continue;
            }
            html.push('<div class="row"><div><div class="t">' + it.label + '</div>' +
                (it.desc ? '<div class="d">' + it.desc + '</div>' : '') +
                '</div><label class="sw"><input type="checkbox" data-key="' + it.key + '"' +
                (cfg[it.key] ? ' checked' : '') + '><span class="knob"></span></label></div>');
            /* 现代化界面之后插入主题三选一 + 按钮透明度 */
            if (it.key === 'modernize') {
                html.push('<div class="row"><div><div class="t">主题模式</div>' +
                    '<div class="d">浅色 / 深色 / 跟随系统</div></div>' +
                    '<div class="seg" id="themeSeg">' +
                    '<button data-theme="auto">自动</button>' +
                    '<button data-theme="light">浅色</button>' +
                    '<button data-theme="dark">深色</button>' +
                    '</div></div>');
                html.push('<div class="row"><div><div class="t">按钮透明度</div>' +
                    '<div class="d">悬浮齿轮按钮的不透明度</div></div>' +
                    '<input type="range" class="range" id="fabOpacityRange" min="20" max="100" step="1" value="' +
                    (typeof cfg.fabOpacity === 'number' ? cfg.fabOpacity : 100) + '"></div>');
            }
        }
        html.push('<div class="foot">提示：重新开启「隐藏元素」即时生效；关闭后刷新页面即可恢复对应按钮。</div>');
        html.push('</div>');
        html.push('<div class="toast" id="toast"></div>');
        html.push('</div>');
        root.innerHTML = html.join('');

        var $ = function (id) { return root.getElementById(id); };
        var fab = $('fab'), mask = $('mask'), panel = $('panel'),
            close = $('close'), toast = $('toast');
        var toastTimer = null;

        /* 主题：面板变量元素引用 + 三选一按钮 */
        panelVarsEl = root.querySelector('.jjj-vars');
        applyTheme();
        /* 悬浮按钮透明度 */
        fabEl = $('fab');
        applyFabOpacity();
        var opacityRange = $('fabOpacityRange');
        if (opacityRange) {
            opacityRange.addEventListener('input', function () {
                cfg.fabOpacity = Number(opacityRange.value);
                saveCfg(cfg);
                applyFabOpacity();
            });
        }
        var themeSeg = $('themeSeg');
        var themeBtns = themeSeg ? themeSeg.querySelectorAll('button') : [];
        function refreshThemeSeg() {
            for (var bi = 0; bi < themeBtns.length; bi++) {
                themeBtns[bi].classList.toggle('on', themeBtns[bi].getAttribute('data-theme') === cfg.theme);
            }
        }
        refreshThemeSeg();
        for (var bi2 = 0; bi2 < themeBtns.length; bi2++) {
            (function (btn) {
                btn.addEventListener('click', function () {
                    var t = btn.getAttribute('data-theme');
                    if (!t || t === cfg.theme) return;
                    cfg.theme = t;
                    saveCfg(cfg);
                    applyTheme();
                    refreshThemeSeg();
                    showToast(t === 'dark' ? '已切换到深色模式' : (t === 'light' ? '已切换到浅色模式' : '已切换为跟随系统'));
                });
            })(themeBtns[bi2]);
        }

        function showToast(msg) {
            toast.textContent = msg;
            toast.classList.add('show');
            clearTimeout(toastTimer);
            toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
        }

        function togglePanel(show) {
            var s = (typeof show === 'boolean') ? show : !panel.classList.contains('show');
            panel.classList.toggle('show', s);
            mask.classList.toggle('show', s);
        }

        fab.addEventListener('click', function () { togglePanel(); });
        mask.addEventListener('click', function () { togglePanel(false); });
        close.addEventListener('click', function () { togglePanel(false); });
        root.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') togglePanel(false);
        });

        root.querySelectorAll('input[type="checkbox"]').forEach(function (input) {
            input.addEventListener('change', function () {
                var key = input.getAttribute('data-key');
                cfg[key] = input.checked;
                saveCfg(cfg);

                if (key === 'modernize') {
                    applyModern(cfg.modernize);
                    showToast(cfg.modernize ? '现代化界面：已开启' : '现代化界面：已关闭');
                } else if (key === 'unblock') {
                    applyUnblock(cfg.unblock);
                    showToast(cfg.unblock ? '已解除复制/右键限制' : '已恢复限制（复制需刷新生效）');
                } else if (key === 'autoSign') {
                    showToast(cfg.autoSign ? '每日自动签到：已开启' : '每日自动签到：已关闭');
                    if (cfg.autoSign) autoSignOnce();
                } else if (key === 'signSilent') {
                    showToast(cfg.signSilent ? '签到成功后将不再提示' : '签到成功后会弹窗提示');
                } else {
                    if (cfg[key]) {
                        cleanElements();
                        showToast('已隐藏：' + labelOf(key));
                    } else {
                        showToast('已保存，刷新页面后恢复「' + labelOf(key) + '」');
                    }
                }
            });
        });

        function labelOf(key) {
            for (var i = 0; i < PANEL_ITEMS.length; i++) {
                if (PANEL_ITEMS[i].key === key) return PANEL_ITEMS[i].label;
            }
            return key;
        }

        /* ---- 签到区 ---- */
        var signBtnEl = $('signNowBtn');
        var signStatusEl = $('signStatusText');
        if (signBtnEl) {
            signBtnEl.addEventListener('click', function () {
                var info = signStatusInfo();
                if (info.code === 'guest') {
                    window.open('https://wap.jjwxc.net/login/', '_blank');
                    return;
                }
                signBtnEl.setAttribute('disabled', '');
                doSign(true);
                setTimeout(function () { signBtnEl.removeAttribute('disabled'); }, 5000);
            });
        }

        panelApi = {
            open: function () { togglePanel(true); },
            toast: showToast,
            updateSign: function (info) {
                if (signStatusEl) signStatusEl.textContent = info.text + ' · ' + info.tip;
                if (signBtnEl) {
                    if (info.code === 'done') {
                        signBtnEl.textContent = '已签到';
                        signBtnEl.setAttribute('disabled', '');
                    } else if (info.code === 'guest') {
                        signBtnEl.textContent = '去登录';
                        signBtnEl.removeAttribute('disabled');
                    } else {
                        signBtnEl.textContent = '签到';
                        signBtnEl.removeAttribute('disabled');
                    }
                }
            }
        };
        /* 面板就绪后：刷新签到状态 */
        updateSignUI();
    }

    function openPanel() {
        buildPanel();
        if (panelApi) panelApi.open();
    }

    /* ================= 启动 ================= */

    /* document-start：尽早应用主题与样式，避免闪烁 */
    applyTheme();
    applyModern(cfg.modernize);
    if (cfg.unblock) applyUnblock(true);

    /* 系统深色模式变化时，若主题为「自动」则实时跟随 */
    if (typeof matchMedia === 'function') {
        try {
            var mqChange = matchMedia('(prefers-color-scheme: dark)');
            var onMqChange = function () { if (cfg.theme === 'auto') applyTheme(); };
            if (mqChange.addEventListener) mqChange.addEventListener('change', onMqChange);
            else if (mqChange.addListener) mqChange.addListener(onMqChange);
        } catch (e) {}
    }

    function onReady() {
        applyTheme();
        if (cfg.unblock) applyUnblock(true);
        cleanElements();
        buildPanel();
        watchDom();
        /* 每日自动签到：页面就绪后延迟执行，避开页面加载高峰 */
        setTimeout(autoSignOnce, 1500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onReady);
    } else {
        onReady();
    }

    /* Tampermonkey 菜单 */
    try {
        if (typeof GM_registerMenuCommand === 'function') {
            GM_registerMenuCommand('⚙️ 打开设置面板', openPanel);
            GM_registerMenuCommand('✅ 立即签到', function () {
                openPanel();
                doSign(true);
            });
            GM_registerMenuCommand('↩️ 恢复默认设置', function () {
                cfg = {};
                for (var k in DEFAULT_CFG) cfg[k] = DEFAULT_CFG[k];
                saveCfg(cfg);
                location.reload();
            });
        }
    } catch (e) {}

})();
