// Candy Line: curtir (barra do topo) e ranking global sobre o ../social.js (BG_SOCIAL).
// Ranking com apelido (2026-11-17): apelido do aparelho SEM login, ou da conta Google (opcional, guarda em qualquer aparelho);
// so o apelido aparece; nome e foto do Google nunca; jogar nunca pede nada.
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
    "#rank .rme{display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;margin:0 0 10px;font-weight:700}#rank .rme .rn{flex:1 1 140px;min-width:0;overflow-wrap:anywhere}#rank .racts{display:flex;gap:2px;margin-left:auto;flex:none}" +
    "#rank .rname{display:flex;flex-direction:column;gap:8px;margin:0 0 10px}#rank .rname input{width:100%;height:46px;border-radius:12px;border:2px solid #ffffff55;background:#0003;color:inherit;font:700 18px/1 system-ui,sans-serif;padding:0 12px}" +
    "#rank .rname input:focus{outline:none;border-color:#ffd84d}#rank .rnmsg{margin:0;font-size:15px;opacity:.9}#rank .rnmsg.err{color:#ff8a8a;opacity:1;font-weight:700}#rank .rnbtns{display:flex;gap:8px}#rank .rnbtns .rbtn{margin-top:0;flex:1}" +
    "#rank .rout{border:0;background:none;color:inherit;opacity:.7;text-decoration:underline;cursor:pointer;font:600 13px/1 system-ui,sans-serif;padding:6px}" +
    "#rank .rav{flex:none;width:28px;height:28px;border-radius:50%;object-fit:cover;background:#ffffff26;display:inline-flex;align-items:center;justify-content:center;font:700 14px/1 system-ui,sans-serif}" +
    "#rank .rnh{margin:0;font-weight:800;font-size:18px}#rank .rgopt{display:flex;flex-direction:column;align-items:center;gap:8px;margin:0 0 10px;padding:10px 6px;border-radius:12px;background:#ffffff10;text-align:center}#rank .rgopt p{margin:0;font-size:14px;opacity:.85}" +
    "#bg-cta .cgo{border:0;border-radius:999px;background:#ffd84d;color:#1a1300;font:800 15px/1 system-ui,sans-serif;padding:12px 18px;cursor:pointer}" +
    "#bg-cta{position:fixed;left:50%;bottom:calc(var(--adH,60px) + 12px);transform:translate(-50%,20px);opacity:0;z-index:25;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px 10px;width:max-content;max-width:min(420px,calc(100vw - 20px));padding:10px 34px 10px 14px;border-radius:18px;border:1.5px solid #ffffff38;background:#141018f2;color:#fff;box-shadow:0 8px 24px #0009;transition:opacity .25s,transform .25s;pointer-events:none;font:600 14px/1.2 system-ui,-apple-system,'Segoe UI',sans-serif}" +
    "#bg-cta.top{bottom:auto;top:calc(var(--topH,48px) + 8px)}.gbox{display:flex;justify-content:center;min-height:44px}" +
    "#bg-cta.on{opacity:1;transform:translate(-50%,0);pointer-events:auto}#bg-cta .ct{flex:1 1 100%;text-align:center}" +
    "#bg-cta .cx{position:absolute;right:4px;top:4px;border:0;background:none;color:#fff;opacity:.7;font:700 20px/1 system-ui,sans-serif;cursor:pointer;padding:4px 8px}";
  var G = '<svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.7 1.2 9.2 3.6l6.9-6.9C35.9 2.4 30.4 0 24 0 14.6 0 6.6 5.4 2.7 13.3l8 6.2C12.6 13.6 17.8 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z"/><path fill="#FBBC05" d="M10.7 28.5c-.5-1.4-.8-2.9-.8-4.5s.3-3.1.8-4.5l-8-6.2C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l8-6.2z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.2 0-11.4-4.1-13.3-9.8l-8 6.2C6.6 42.6 14.6 48 24 48z"/></svg>';
  function gbox() { // caixa do login: botao oficial do Google (GIS) ou o nosso (redirect) de reserva
    var box = el("div", "gbox"), b = gbtn();
    if (S() && S().auth && S().auth.button) S().auth.button(box, b); else box.appendChild(b);
    return box;
  }
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
      if (st.liked && S().event) S().event(GAME, "like");
      lim(S().like(GAME), 4000).then(function (r) { if (r) { st.liked = !!r.liked; st.likes = +r.likes || 0; } draw(); })
        .catch(function () { st = prev; draw(); })
        .then(function () { busy = false; });
    });
  }

  // ---- ranking ----
  var PK = "bg_pend_" + GAME;
  var pend = null;            // ultima partida ranqueavel: {mode, score, day, n, rank, sent}
  var dlg, body, title, view = {mode: MODE, day: null, n: 0}, cta;
  document.addEventListener("pointerdown", function (e) { var g = e.target && e.target.closest ? e.target.closest(".gbox") : null; if (g && pend && !pend.sent) savePend(pend); }, true);
  function savePend(p) { lsSet(PK, JSON.stringify({mode: p.mode, score: p.score, day: p.day, n: p.n, t: Date.now()})); }
  function loadPend() { try { var p = JSON.parse(lsGet(PK)); if (p && Date.now() - p.t < 864e5) return {mode: p.mode, score: p.score | 0, day: p.day, n: p.n, rank: null, sent: false}; } catch (e) {} return null; }
  var sending = null;
  function send(p) {
    if (!S()) return Promise.reject(new Error("offline"));
    if (sending && sending.p === p) return sending.job;
    var job = lim(S().submit(GAME, p.mode, p.score, p.day), 8000).then(function (rank) { p.sent = true; p.rank = +rank || null; lsSet(PK, ""); return p.rank; },
      function (e) { console.error("[ranking] envio da pontuacao falhou", e); throw e; });
    sending = {p: p, job: job}; job.then(function () { sending = null; }, function () { sending = null; });
    return job;
  }
  function localBest() { var v = lsGet(BEST); try { v = JSON.parse(v); } catch (e) {} v = +v; return isFinite(v) && v > 0 ? Math.floor(v) : 0; }
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
  var editing = false;
  function header() {
    var u = user();
    if (u && !u.ready) return el("p", "rmsg", T("rankLoad"));
    if (!u || editing || !u.custom) { // sem apelido: escolher (sem login); com Google sem apelido: escolher antes de aparecer
      var wrap = el("div"); wrap.append(nameForm(u, !u || !u.custom));
      if (!u) wrap.append(gopt());
      return wrap;
    }
    var row = el("div", "rme"), ed = el("button", "rout red", "✏ " + T("rename")); ed.type = "button";
    ed.addEventListener("click", function () { editing = true; list(); });
    var acts = el("span", "racts"); acts.append(ed);
    if (u.kind === "google") { var out = el("button", "rout", T("logout")); out.type = "button"; out.addEventListener("click", function () { S().auth.signOut().then(list, list); }); acts.append(out); }
    row.append(avatar(null, u.name || T("player")), el("span", "rn", T("youAre", u.name || T("player"))), acts);
    if (u.kind !== "google") { var w2 = el("div"); w2.append(row, gopt()); return w2; }
    return row;
  }
  function gopt() { // Google opcional: guarda o apelido e o recorde em qualquer aparelho
    var b = el("div", "rgopt"); b.append(el("p", null, T("gKeep")), gbox()); return b;
  }
  // apelido: campo inline; o servidor valida (3-16, sem palavrao, unico; trocar = 1 vez a cada 24 h, a 1a escolha nao conta)
  function nameForm(u, need) {
    var f = el("form", "rname"), inp = el("input"), msg = el("p", "rnmsg", T("nameHint")), ok = el("button", "rbtn", T("save")), no = el("button", "rbtn sec", T(need ? "logout" : "cancel"));
    inp.maxLength = 16; inp.value = u && u.custom ? u.name : ""; inp.placeholder = T("pickName"); inp.autocomplete = "off"; inp.id = "bg-uname";
    inp.setAttribute("aria-label", T("rename")); ok.type = "submit"; no.type = "button";
    var row = el("div", "rnbtns"); row.append(ok); if (u) row.append(no); // sem conta e sem apelido nao ha o que cancelar
    if (need) f.append(el("p", "rnh", T("pickName")));
    f.append(inp, msg, row);
    no.addEventListener("click", function () { editing = false; if (need && u.kind === "google") S().auth.signOut().then(list, list); else list(); });
    f.addEventListener("submit", function (e) {
      e.preventDefault(); var v = inp.value.replace(/\s+/g, " ").trim();
      if (v.length < 3 || v.length > 16) { msg.textContent = T("nameLen"); msg.className = "rnmsg err"; return; }
      ok.disabled = true; msg.textContent = T("rankLoad"); msg.className = "rnmsg";
      S().auth.setName(v).then(function (code) {
        ok.disabled = false;
        if (code === "ok") { editing = false; setTimeout(list, 400); return; }
        msg.className = "rnmsg err";
        msg.textContent = code === "taken" ? T("nameTaken") : code === "bad" ? T("nameBad") : code === "len" ? T("nameLen") : code === "wait" ? T("nameWait") : code === "limit" ? T("nameLimit") : T("rankOff");
        inp.focus();
      });
    });
    setTimeout(function () { try { inp.focus(); } catch (e) {} }, 30);
    return f;
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
        var nm = el("span", "rn", r.name || T("player"));
        li.append(el("span", "rp", String(r.rank)), avatar(null, r.name || T("player")), nm, el("span", "rs", String(r.score)));
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
      var go = el("button", "cgo", T("joinBtn")); go.type = "button";
      go.addEventListener("click", function () { hideCta(); open(pend ? pend.mode : MODE, pend ? pend.n : 0); });
      cta.append(el("span", "ct", T("rankJoin")), go, x); document.body.appendChild(cta);
    }
    cta.classList.remove("top"); requestAnimationFrame(function () { cta.classList.add("on"); });
    clearInterval(cta._iv); var n = 0;
    cta._iv = setInterval(function () { placeCta(); if (++n > 40 || !cta.classList.contains("on")) clearInterval(cta._iv); }, 250); // os botoes do resultado entram aos poucos (Candy: depois do saquinho)
  }
  function hits(r) {
    var bs = document.querySelectorAll("#stage button, #stage a, #app button"), i, b;
    for (i = 0; i < bs.length; i++) { b = bs[i].getBoundingClientRect(); if (b.width < 2 || b.height < 2 || getComputedStyle(bs[i]).visibility === "hidden") continue;
      if (b.right > r.left && b.left < r.right && b.bottom > r.top && b.top < r.bottom) return true; }
    return false;
  }
  function placeCta() {
    if (!cta || !cta.classList.contains("on")) return;
    var wasTop = cta.classList.contains("top"); cta.classList.remove("top"); if (!hits(cta.getBoundingClientRect())) return;
    cta.classList.add("top"); if (!hits(cta.getBoundingClientRect())) return;
    cta.classList.remove("on"); // sem lugar livre: o convite continua no ranking (botao do trofeu)
  }
  function hideCta() { if (cta) cta.classList.remove("on"); }

  var bestSentFor = null, askedFor = null;
  function afterLogin(u) {
    if (!u) { bestSentFor = askedFor = null; if (dlg && dlg.open) list(); return; }
    hideCta();
    // conta sem apelido: abre na hora "Escolha seu apelido" (as pontuacoes ja vao para o servidor e aparecem quando o apelido for salvo)
    if (u.kind === "google" && u.ready && !u.custom && askedFor !== u.id && dlg) { askedFor = u.id; lsSet(PK + "_open", ""); var lp = loadPend(); open(lp ? lp.mode : view.mode, lp ? lp.n : view.n); }
    var p = loadPend(), job = null;
    if (p && !(pend && pend.sent)) { pend = p; job = send(p); }
    if (bestSentFor !== u.id) { // ao entrar: o recorde guardado no aparelho tambem vai para o ranking (o servidor guarda o maior)
      bestSentFor = u.id; var b = localBest();
      if (b > 0 && !(p && p.score >= b)) { var bp = {mode: MODE, score: b, day: null, n: 0, rank: null, sent: false}; job = (job || Promise.resolve()).catch(function () {}).then(function () { return send(bp); }); }
    }
    (job || Promise.resolve()).catch(function () {}).then(function () {
      if (lsGet(PK + "_open")) { lsSet(PK + "_open", ""); open(p ? p.mode : view.mode, p ? p.n : view.n); }
      else if (dlg && dlg.open) list();
    });
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
    if (S() && S().event) { S().game(GAME); S().event(GAME, "open"); }
    document.addEventListener("click", function (e) { var b = e.target && e.target.closest ? e.target.closest("[data-share]") : null; if (b && S() && S().event) S().event(GAME, "share"); }, true);
    window.addEventListener("bg-play", hideCta);
    // o aviso so vale na tela de resultado: qualquer botao do jogo (Jogar de novo, menu...) o esconde; compartilhar e ranking nao
    document.addEventListener("click", function (e) {
      var b = e.target && e.target.closest ? e.target.closest("button,a") : null;
      if (!b || !cta || (cta && cta.contains(b)) || b.hasAttribute("data-share") || b.getAttribute("aria-controls") === "rank" || b.closest("#topbar") || b.closest("dialog")) return;
      hideCta();
    }, true);
    if (S() && S().auth) {
      S().auth.on(afterLogin);
      if (S().auth.dev) S().auth.dev(); // apelido do aparelho (sem login)
      // so carrega o login se a pessoa ja entrou antes ou esta voltando do Google (quem nunca entrou nao baixa nada)
      if (lsGet("bg_auth") || /[?&]code=/.test(location.search) || /[?&]fakeauth=1/.test(location.search)) S().auth.ready().catch(function () {});
    }
  }
  window.CL_RANK = {open: open, ended: ended, ok: function () { return !!S(); }};
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
