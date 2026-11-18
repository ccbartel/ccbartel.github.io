// Candy Line: curtir (barra do topo) e ranking global sobre o ../social.js (BG_SOCIAL).
// Ranking SO com login Google (2026-11-17): o nome e a foto vem da conta, calculados no servidor; jogar nunca pede login.
// Gerado por src/supabase/gera_social_ui.py a partir de social-ui.template.js (nao editar a copia do jogo).
(function () {
  var GAME = "candy-line", MODE = "play", BEST = "cl_best", TPLAY = "rankPlay";
  function T(k, f) { return window.CL_I18N ? window.CL_I18N.t(k, f) : k; }
  function S() { return window.BG_SOCIAL || null; }
  function lim(p, ms) { return Promise.race([p, new Promise(function (_, r) { setTimeout(function () { r(new Error("timeout")); }, ms || 5000); })]); }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function today() { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { if (v) localStorage.setItem(k, v); else localStorage.removeItem(k); } catch (e) {} }
  function user() { return S() && S().auth ? S().auth.user() : null; }

  // ---- estilo do login (botao padrao do Google + aviso no resultado) ----
  var css = ".gbtn{display:inline-flex;align-items:center;justify-content:center;gap:10px;height:44px;padding:0 16px 0 12px;border-radius:999px;border:1px solid #dadce0;background:#fff;color:#1f1f1f;font:600 15px/1 Roboto,system-ui,-apple-system,'Segoe UI',sans-serif;cursor:pointer;white-space:nowrap}" +
    ".gbtn:focus-visible{outline:3px solid #ffd84d;outline-offset:3px}.gbtn svg{flex:none}" +
    "#rank .rlog{display:flex;flex-direction:column;align-items:center;gap:10px;padding:10px 6px 12px;margin-bottom:8px;border-radius:12px;background:#ffffff10;text-align:center}" +
    "#rank .rlog p{margin:0;color:inherit;opacity:.9;font-size:15px}" +
    "#rank .rme{display:flex;align-items:center;gap:8px;margin:0 0 10px;font-weight:700}#rank .rme .rn{flex:1}" +
    "#rank .rout{border:0;background:none;color:inherit;opacity:.7;text-decoration:underline;cursor:pointer;font:600 13px/1 system-ui,sans-serif;padding:6px}" +
    "#rank .rav{flex:none;width:28px;height:28px;border-radius:50%;object-fit:cover;background:#ffffff26;display:inline-flex;align-items:center;justify-content:center;font:700 14px/1 system-ui,sans-serif}" +
    "#rank li .rtag{opacity:.6;font-size:12px;margin-left:4px}" +
    "#bg-cta{position:fixed;left:50%;bottom:calc(var(--adH,60px) + 12px);transform:translate(-50%,20px);opacity:0;z-index:25;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px 10px;width:max-content;max-width:min(420px,calc(100vw - 20px));padding:10px 34px 10px 14px;border-radius:18px;border:1.5px solid #ffffff38;background:#141018f2;color:#fff;box-shadow:0 8px 24px #0009;transition:opacity .25s,transform .25s;pointer-events:none;font:600 14px/1.2 system-ui,-apple-system,'Segoe UI',sans-serif}" +
    "#bg-cta.on{opacity:1;transform:translate(-50%,0);pointer-events:auto}#bg-cta .ct{flex:1 1 100%;text-align:center}" +
    "#bg-cta .cx{position:absolute;right:4px;top:4px;border:0;background:none;color:#fff;opacity:.7;font:700 20px/1 system-ui,sans-serif;cursor:pointer;padding:4px 8px}";
  var G = '<svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.7 1.2 9.2 3.6l6.9-6.9C35.9 2.4 30.4 0 24 0 14.6 0 6.6 5.4 2.7 13.3l8 6.2C12.6 13.6 17.8 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z"/><path fill="#FBBC05" d="M10.7 28.5c-.5-1.4-.8-2.9-.8-4.5s.3-3.1.8-4.5l-8-6.2C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l8-6.2z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.2 0-11.4-4.1-13.3-9.8l-8 6.2C6.6 42.6 14.6 48 24 48z"/></svg>';
  function gbtn() {
    var b = el("button", "gbtn"); b.type = "button"; b.innerHTML = G; b.appendChild(el("span", null, T("gLogin")));
    b.addEventListener("click", function () { if (pend && !pend.sent) savePend(pend); lsSet(PK + "_open", "1"); if (S()) S().auth.signIn().catch(function () {}); });
    return b;
  }

  // ---- curtir ----
  function initLike() {
    var b = document.getElementById("toplike"); if (!b || !S()) return;
    var st = {liked: false, likes: 0}, busy = false;
    function draw() { b.setAttribute("aria-pressed", st.liked ? "true" : "false"); b.querySelector(".lc").textContent = st.likes > 0 ? S().compact(st.likes) : ""; }
    lim(S().stats([GAME]), 4000).then(function (rows) {
      var r = rows && rows[0]; if (!r) return;
      st.liked = !!r.liked; st.likes = +r.likes || 0; draw(); b.hidden = false;
    }).catch(function () {});
    b.addEventListener("click", function () {
      if (busy) return; busy = true;
      var prev = {liked: st.liked, likes: st.likes};
      st.liked = !st.liked; st.likes = Math.max(0, st.likes + (st.liked ? 1 : -1)); draw();
      lim(S().like(GAME), 4000).then(function (r) { if (r) { st.liked = !!r.liked; st.likes = +r.likes || 0; } draw(); })
        .catch(function () { st = prev; draw(); })
        .then(function () { busy = false; });
    });
  }

  // ---- ranking ----
  var PK = "bg_pend_" + GAME;
  var pend = null;            // ultima partida ranqueavel: {mode, score, day, n, rank, sent}
  var dlg, body, title, view = {mode: MODE, day: null, n: 0}, cta;
  function savePend(p) { lsSet(PK, JSON.stringify({mode: p.mode, score: p.score, day: p.day, n: p.n, t: Date.now()})); }
  function loadPend() { try { var p = JSON.parse(lsGet(PK)); if (p && Date.now() - p.t < 864e5) return {mode: p.mode, score: p.score | 0, day: p.day, n: p.n, rank: null, sent: false}; } catch (e) {} return null; }
  function send(p) {
    if (!S()) return Promise.reject(new Error("offline"));
    return lim(S().submit(GAME, p.mode, p.score, p.day), 6000).then(function (rank) { p.sent = true; p.rank = +rank || null; lsSet(PK, ""); return p.rank; });
  }
  function ended(last) {
    if (!last || last.mode !== MODE) { pend = null; return; }
    pend = {mode: last.mode, score: last.score | 0, day: last.mode === "daily" ? today() : null, n: last.daily || 0, rank: null, sent: false};
    if (user()) send(pend).catch(function () {});
    else { savePend(pend); if (pend.score > 0) showCta(); }
  }
  function titleFor(v) { return v.mode === "daily" ? T("rankDaily", String(v.n)) : T(TPLAY); }
  function mine() { return pend && pend.mode === view.mode && pend.day === view.day ? pend : null; }
  function avatar(url, name) {
    if (url) { var i = el("img", "rav"); i.alt = ""; i.loading = "lazy"; i.referrerPolicy = "no-referrer"; i.src = url; return i; }
    return el("span", "rav", (name || "?").charAt(0).toUpperCase());
  }
  function header() {
    var u = user();
    if (u) {
      var row = el("div", "rme"), out = el("button", "rout", T("logout")); out.type = "button";
      out.addEventListener("click", function () { S().auth.signOut().then(list, list); });
      row.append(avatar(u.avatar, u.name), el("span", "rn", T("youAre", u.name || T("player"))), out);
      return row;
    }
    var box = el("div", "rlog"); box.append(el("p", null, T("rankLogin")), gbtn(), el("p", null, T("rankWhy")));
    return box;
  }
  function list() {
    if (!body) return;
    body.replaceChildren(header(), el("p", "rmsg", T("rankLoad")));
    if (!S()) { body.replaceChildren(el("p", "rmsg", T("rankOff"))); return; }
    var me = mine();
    lim(S().top(GAME, view.mode, view.day, 10), 6000).then(function (rows) {
      body.replaceChildren(header());
      if (me && me.rank) body.append(el("p", "ryou", T("rankYou", String(me.rank))));
      if (!rows || !rows.length) { body.append(el("p", "rmsg", T("rankEmpty"))); return; }
      var ol = el("ol");
      rows.forEach(function (r) {
        var li = el("li"); if (r.is_me) li.className = "me";
        var nm = el("span", "rn", r.name || T("player")); if (r.tag) nm.appendChild(el("span", "rtag", r.tag));
        li.append(el("span", "rp", String(r.rank)), avatar(r.avatar, r.name || T("player")), nm, el("span", "rs", String(r.score)));
        ol.append(li);
      });
      body.append(ol);
    }).catch(function () { body.replaceChildren(header(), el("p", "rmsg", T("rankOff"))); });
  }
  function open(mode, n) {
    if (!dlg) return;
    var me = pend && pend.mode === mode ? pend : null;
    view = {mode: mode, day: mode === "daily" ? (me ? me.day : today()) : null, n: n || (me ? me.n : 0)};
    title.textContent = titleFor(view);
    if (!dlg.open) dlg.showModal();
    hideCta();
    me = mine();
    if (me && !me.sent && user()) { body.replaceChildren(header(), el("p", "rmsg", T("rankLoad"))); send(me).then(list, list); }
    else list();
  }

  // ---- aviso no resultado: "entre para aparecer no ranking" ----
  function showCta() {
    if (!cta) {
      cta = el("div"); cta.id = "bg-cta"; cta.setAttribute("role", "status");
      var x = el("button", "cx", "×"); x.type = "button"; x.setAttribute("aria-label", T("close"));
      x.addEventListener("click", hideCta);
      cta.append(el("span", "ct", T("rankLogin")), gbtn(), x); document.body.appendChild(cta);
    }
    requestAnimationFrame(function () { cta.classList.add("on"); });
  }
  function hideCta() { if (cta) cta.classList.remove("on"); }

  function afterLogin(u) {
    if (!u) { if (dlg && dlg.open) list(); return; }
    hideCta();
    var p = loadPend();
    if (p && !(pend && pend.sent)) { pend = p; send(p).catch(function () {}).then(function () { if (lsGet(PK + "_open")) { lsSet(PK + "_open", ""); open(p.mode, p.n); } else if (dlg && dlg.open) list(); }); }
    else if (lsGet(PK + "_open")) { lsSet(PK + "_open", ""); open(view.mode, view.n); }
    else if (dlg && dlg.open) list();
  }
  function init() {
    var st = el("style"); st.textContent = css; document.head.appendChild(st);
    dlg = document.getElementById("rank");
    if (dlg) {
      body = dlg.querySelector(".rbody"); title = dlg.querySelector("h1");
      dlg.addEventListener("keydown", function (e) { e.stopPropagation(); });
      dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); }); // toque fora fecha
    }
    initLike();
    window.addEventListener("bg-play", hideCta);
    // o aviso so vale na tela de resultado: qualquer botao do jogo (Jogar de novo, menu...) o esconde; compartilhar e ranking nao
    document.addEventListener("click", function (e) {
      var b = e.target && e.target.closest ? e.target.closest("button,a") : null;
      if (!b || !cta || (cta && cta.contains(b)) || b.hasAttribute("data-share") || b.getAttribute("aria-controls") === "rank" || b.closest("#topbar") || b.closest("dialog")) return;
      hideCta();
    }, true);
    if (S() && S().auth) {
      S().auth.on(afterLogin);
      // so carrega o login se a pessoa ja entrou antes ou esta voltando do Google (quem nunca entrou nao baixa nada)
      if (lsGet("bg_auth") || /[?&]code=/.test(location.search) || /[?&]fakeauth=1/.test(location.search)) S().auth.ready().catch(function () {});
    }
  }
  window.CL_RANK = {open: open, ended: ended, ok: function () { return !!S(); }};
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
