// Candy Line: curtir (barra do topo) e ranking (Jogar e Desafio do dia) sobre o ../social.js (BG_SOCIAL).
// Tudo e opcional: sem rede ou sem Supabase o jogo segue igual (timeouts curtos, falhas silenciosas, botoes somem ou mostram "offline").
(function () {
  var GAME = "candy-line";
  function T(k, f) { return window.CL_I18N ? window.CL_I18N.t(k, f) : k; }
  function S() { return window.BG_SOCIAL || null; }
  function lim(p, ms) { return Promise.race([p, new Promise(function (_, r) { setTimeout(function () { r(new Error("timeout")); }, ms || 5000); })]); }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function clean(v) { return String(v || "").replace(/[^\p{L}\p{N} ]/gu, "").replace(/\s+/g, " ").trim().slice(0, 14); }
  function today() { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

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
  var pend = null;            // ultima partida ranqueavel desta sessao: {mode, score, day, n, rank, sent}
  var dlg, body, title, view = {mode: "play", day: null, n: 0};

  function send(p) {
    if (!S()) return Promise.reject(new Error("offline"));
    if (/[?&]cols=4\b/.test(location.search)) return Promise.reject(new Error("teste 4x3 fora do ranking"));
    return lim(S().submit(GAME, p.mode, p.score, p.day), 4000).then(function (rank) {
      p.sent = true; p.rank = +rank || null; if (p.mode === "play") lsSet("cl_rank_play", "1"); return p.rank;
    });
  }
  function ended(last) {
    if (!last || (last.mode !== "play" && last.mode !== "daily")) { pend = null; return; }
    pend = {mode: last.mode, score: last.score | 0, day: last.mode === "daily" ? today() : null, n: last.daily || 0, rank: null, sent: false};
    if (S() && S().name()) send(pend).catch(function () {});
  }
  function titleFor(v) { return v.mode === "daily" ? T("rankDaily", String(v.n)) : T("rankPlay"); }
  function mine() { return pend && pend.mode === view.mode && pend.day === view.day ? pend : null; }

  function nickForm(after) {
    body.replaceChildren();
    var f = el("form", "nk"), lab = el("label", null, T("nickAsk")), inp = el("input"), hint = el("small", null, T("nickHint")), ok = el("button", "rbtn", T("nickOk"));
    inp.maxLength = 14; inp.autocomplete = "nickname"; inp.placeholder = T("nick"); inp.value = S() ? S().name() : ""; inp.id = "rank-nick";
    lab.htmlFor = "rank-nick"; ok.type = "submit";
    inp.addEventListener("input", function () { var c = inp.value.replace(/[^\p{L}\p{N} ]/gu, "").slice(0, 14); if (c !== inp.value) inp.value = c; });
    f.append(lab, inp, hint, ok);
    f.addEventListener("submit", function (e) {
      e.preventDefault(); var v = clean(inp.value); if (!v) { inp.focus(); return; }
      if (S()) S().name(v); after();
    });
    body.append(f); setTimeout(function () { inp.focus(); }, 30);
  }

  function list() {
    body.replaceChildren(el("p", "rmsg", T("rankLoad")));
    if (!S()) { body.replaceChildren(el("p", "rmsg", T("rankOff"))); return; }
    var me = mine(), myName = S().name();
    lim(S().top(GAME, view.mode, view.day, 10), 4000).then(function (rows) {
      body.replaceChildren();
      if (me && me.rank) body.append(el("p", "ryou", T("rankYou", String(me.rank))));
      if (!rows || !rows.length) { body.append(el("p", "rmsg", T("rankEmpty"))); }
      else {
        var ol = el("ol"), hit = false;
        rows.forEach(function (r) {
          var li = el("li");
          if (!hit && me && me.rank && +r.rank === me.rank && r.name === clean(myName || "Player")) { li.className = "me"; hit = true; }
          li.append(el("span", "rp", String(r.rank)), el("span", "rn", r.name), el("span", "rs", String(r.score)));
          ol.append(li);
        });
        body.append(ol);
      }
      if (myName) {
        var ch = el("button", "rbtn sec", T("nickChange")); ch.type = "button";
        ch.addEventListener("click", function () { nickForm(renamed); });
        body.append(ch);
      }
    }).catch(function () { body.replaceChildren(el("p", "rmsg", T("rankOff"))); });
  }
  function offline() { body.replaceChildren(el("p", "rmsg", T("rankOff"))); }
  function renamed() {
    var me = mine(), job;
    if (me) job = send(me);
    else if (view.mode === "play" && lsGet("cl_rank_play")) { var best = 0; try { best = +JSON.parse(lsGet("cl_best")) || 0; } catch (e) {} job = best > 0 ? send({mode: "play", score: best, day: null}) : null; }
    body.replaceChildren(el("p", "rmsg", T("rankLoad")));
    (job || Promise.resolve()).catch(function () {}).then(list);
  }
  function open(mode, n) {
    if (!dlg) return;
    var me = pend && pend.mode === mode ? pend : null;
    view = {mode: mode, day: mode === "daily" ? (me ? me.day : today()) : null, n: n || (me ? me.n : 0)};
    title.textContent = titleFor(view);
    if (!dlg.open) dlg.showModal();
    me = mine();
    function go() { body.replaceChildren(el("p", "rmsg", T("rankLoad"))); send(me).then(list, offline); }
    if (me && !me.sent && S() && !S().name()) nickForm(go);
    else if (me && !me.sent) go();
    else list();
  }

  function init() {
    dlg = document.getElementById("rank");
    if (dlg) {
      body = dlg.querySelector(".rbody"); title = dlg.querySelector("h1");
      dlg.addEventListener("keydown", function (e) { e.stopPropagation(); });   // digitar "1" no apelido nao responde no jogo
      dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); }); // toque fora fecha
    }
    initLike();
  }
  window.CL_RANK = {open: open, ended: ended, ok: function () { return !!S(); }};
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
