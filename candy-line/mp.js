// Candy Line: corrida AO VIVO de pacotes (2 a 4 jogadores, mesma semente = mesmas grades para todos).
// Rede: RPC do servidor (BG_SOCIAL.mp.call: o servidor confere o ritmo e declara o vencedor pela hora dele)
// + Supabase Realtime no canal da sala (broadcast "pk" = pacote confirmado, "st" = estado mudou; presence = quem esta conectado).
// Ajustes faceis: as constantes abaixo (o servidor tem as mesmas em src/supabase/2026-11-17_candy_mp.sql).
(function () {
  var MIN_GOAL = 4, MAX_GOAL = 99, DEF_GOAL = 12, ALONE_S = 30, DROP_S = 20, MAXP = 4, BACK_S = 20;
  var GOALS = [4, 12, 25, 50, 99];
  var GAME = "candy-line", URL_ = "https://bartelgames.com.br/candy-line/";
  var COL = ["#ff4096", "#3d8bff", "#2fbf5b", "#f7a400"]; // cor de cada vaga (rosa, azul, verde, amarelo)
  function T(k, f) { return window.CL_I18N ? window.CL_I18N.t(k, f) : k; }
  function S() { return window.BG_SOCIAL; }
  function G() { return window.CL_GAME; }
  function h(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function btn(cls, txt, fn) { var b = h("button", cls, txt); b.type = "button"; b.addEventListener("click", fn); return b; }
  function lsGet(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function lsSet(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function toast(msg) {
    var d = document.getElementById("toast");
    if (!d) { d = document.createElement("div"); d.id = "toast"; d.setAttribute("role", "status"); document.body.appendChild(d); }
    d.textContent = msg; d.classList.add("on"); clearTimeout(d._t); d._t = setTimeout(function () { d.classList.remove("on"); }, 2600);
  }
  function ev(kind, d) { try { S() && S().event(GAME, kind, d || {}); } catch (e) {} }

  var card, bar, cd, badge;
  var st = {phase: "off", code: null, view: null, off: 0, rtt: 1e9, ch: null, chCode: null, online: null, live: {}, flash: {},
    pollT: 0, raceRound: 0, want: 0, sent: 0, sending: false, joinT: 0, waitMore: 0, logged: {}, pendCode: null, netBad: 0, t0: 0, goT: 0};

  // ---------- rede ----------
  function call(fn, body) {
    var t0 = Date.now();
    return S().mp.call(fn, body || {}).then(function (v) {
      var t1 = Date.now(), rtt = t1 - t0;
      if (v && v.now && rtt <= st.rtt * 1.5 + 30) { st.off = v.now - (t0 + t1) / 2; st.rtt = Math.min(st.rtt, rtt); }
      st.netBad = 0; netShow(); return v;
    }, function (e) { st.netBad++; netShow(); throw e; });
  }
  function sNow() { return Date.now() + st.off; }
  function bc(type, payload) { try { if (st.ch) st.ch.send({type: "broadcast", event: type, payload: payload || {}}); } catch (e) {} }
  function chan(v) {
    if (st.chCode === v.code) return;
    drop(); st.chCode = v.code; st.online = null;
    S().mp.channel(v.code, v.me).then(function (ch) {
      if (st.chCode !== v.code) { S().mp.drop(ch); return; }
      st.ch = ch;
      ch.on("broadcast", {event: "pk"}, function (m) { var p = m.payload || {}; if (!p.pid || !(p.n >= 0)) return;
        if (!(st.live[p.pid] >= p.n)) { st.live[p.pid] = p.n; st.flash[p.pid] = Date.now(); bars(); }
        if (st.view && p.n >= st.view.goal) poll(0); });
      ch.on("broadcast", {event: "st"}, function () { poll(0); });
      ch.on("presence", {event: "sync"}, function () { var s = ch.presenceState(), o = {}; for (var k in s) o[k] = 1; st.online = o; bars(); if (st.phase === "lobby" || st.phase === "quick") renderLobby(); });
      ch.subscribe(function (status) {
        if (status === "SUBSCRIBED") { ch.track({pid: v.me, at: Date.now()}).catch(function () {}); bc("st"); }
        st.chOk = status === "SUBSCRIBED"; netShow();
      });
    }).catch(function (e) { console.warn("[ao vivo] canal falhou", e); st.chCode = null; });
  }
  function drop() { if (st.ch) { try { st.ch.untrack(); } catch (e) {} S().mp.drop(st.ch); } st.ch = null; st.chCode = null; st.online = null; }
  function poll(ms) {
    clearTimeout(st.pollT);
    st.pollT = setTimeout(function () {
      if (!st.code || st.phase === "off") return;
      call("mp_state", {p_code: st.code}).then(apply, function () {}).then(function () { poll(pollMs()); });
    }, ms);
  }
  function pollMs() { return st.phase === "race" ? 4000 : st.phase === "count" ? 2500 : 2000; }
  function netShow() { if (!badge) return; badge.classList.toggle("hide", !(st.code && st.phase !== "off" && (st.netBad >= 2 || (st.ch && st.chOk === false)))); }
  function save() { if (st.code) lsSet("cl_mp", {code: st.code, t: Date.now()}); }

  // ---------- estado vindo do servidor ----------
  function meP(v) { v = v || st.view; if (!v) return null; for (var i = 0; i < v.players.length; i++) if (v.players[i].pid === v.me) return v.players[i]; return null; }
  function byPid(pid) { var v = st.view; if (!v) return null; for (var i = 0; i < v.players.length; i++) if (v.players[i].pid === pid) return v.players[i]; return null; }
  function nOf(p) { var n = Math.max(p.n, st.live[p.pid] || 0); if (st.view && p.pid === st.view.me) n = Math.max(n, st.want); return Math.min(n, st.view ? st.view.goal : n); }
  function apply(v) {
    if (!v) return;
    if (!v.ok) { fail(v.err); return; }
    if (st.view && (v.round !== st.view.round)) st.live = {};
    st.view = v; st.code = v.code; save(); chan(v);
    for (var i = 0; i < v.players.length; i++) { var q = v.players[i]; if (q.n > (st.live[q.pid] || 0)) st.live[q.pid] = q.n; }
    var me = meP(v);
    if (!me || (me.left && v.state !== "playing")) { out(T("mpErrNf")); return; }
    if (v.state === "lobby") {
      if (st.phase === "podium" && v.round > st.raceRound && !me.ready) { renderPodium(); return; }
      if (st.phase === "race" || st.phase === "count") { G().wait(); bar.classList.add("hide"); }
      var ph = v.quick ? "quick" : "lobby";
      if (st.phase !== ph) { st.phase = ph; st.joinT = Date.now(); st.waitMore = 0; G().wait(); }
      renderLobby();
    } else if (v.state === "playing") {
      if (me.in) {
        if (me.away > DROP_S || me.left) { out(T("mpErrDropped")); return; }
        if (st.phase !== "race" && st.phase !== "count") count(v); else bars();
      } else if (st.phase === "podium") renderPodium();
      else out(T("mpMissed"));
    } else if (v.state === "done") {
      if (!me.in && st.phase !== "podium") { out(T("mpMissed")); return; }
      if (st.phase === "race" || st.phase === "count") finish(v); else if (st.phase !== "podium") { st.phase = "podium"; st.raceRound = v.round; G().wait(); renderPodium(); } else renderPodium();
    }
  }
  function fail(err) {
    var m = {name: "mpNeed", nf: "mpErrNf", full: "mpErrFull", started: "mpErrStarted", dropped: "mpErrDropped", rate: "mpErrRate", few: "mpNeed2", host: "mpErrNf"}[err] || "mpErrNet";
    if (err === "few") { toast(T("mpNeed2")); return; }
    if (err === "name") { st.code = null; lsSet("cl_mp", null); home(); return; }
    if (st.phase === "code" && (err === "nf" || err === "full" || err === "started")) { var e = card.querySelector(".mperr"); if (e) e.textContent = T(m); return; }
    out(T(m));
  }
  // sai da sala local (sem avisar o servidor: para quem caiu ou foi recusado)
  function out(msg) { if (msg) toast(msg); reset(); G().menu(); }
  function reset() { clearTimeout(st.pollT); drop(); lsSet("cl_mp", null); st.code = null; st.view = null; st.phase = "off"; st.live = {}; st.want = st.sent = 0; st.sending = false; hideCard(); bar.classList.add("hide"); cd.classList.add("hide"); netShow(); }
  function leave() { var c = st.code; if (c) { bc("st"); call("mp_leave", {p_code: c}).catch(function () {}); } reset(); G().menu(); }

  // ---------- cartao (todas as telas do modo ao vivo) ----------
  function showCard(kids, cls) {
    var key = st.phase + "|" + (cls || ""), same = key === st.cardKey && !card.classList.contains("hide"); st.cardKey = key;
    var foc = same && document.activeElement && card.contains(document.activeElement) ? document.activeElement.textContent : null;
    card.className = "a mpc " + (cls || ""); card.replaceChildren.apply(card, kids); card.classList.remove("hide");
    if (same) { card.classList.add("still"); card.style.animation = "none"; if (foc) { var bs = card.querySelectorAll("button"); for (var i = 0; i < bs.length; i++) if (bs[i].textContent === foc) { try { bs[i].focus({preventScroll: true}); } catch (e) {} } } return; } // atualizacao da mesma tela: sem pular de novo
    card.style.animation = ""; void card.offsetWidth;
    var f = card.querySelector("[data-focus]") || card.querySelector("button"); setTimeout(function () { try { f && f.focus({preventScroll: true}); } catch (e) {} }, 60);
  }
  function hideCard() { card.classList.add("hide"); }
  function title(txt) { var t = h("div", "mpt"); t.append(h("span", "mpi", "\u{1F3C1}"), document.createTextNode(" " + txt)); return t; }
  function user() { return S() && S().auth ? S().auth.user() : null; }
  function home() {
    st.phase = "home"; G().wait();
    var u = user(), kids = [title(T("mpT"))];
    if (!u || !u.custom || !u.name) {
      kids.push(h("p", "mps", T("mpNeed")), btn("mpb pri", T("mpPick"), function () { pickName(); }), btn("mpx", T("back"), function () { reset(); G().menu(); }));
      showCard(kids); return;
    }
    var you = h("p", "mpyou"); you.append(h("span", "mpav", (u.name || "?").charAt(0).toUpperCase()), h("span", null, T("mpYou", u.name)));
    var q = btn("mpb pri", "", function () { quick(); }); q.append(h("b", null, T("mpQuick")), h("small", null, T("mpQuickSub", String(DEF_GOAL))));
    var c = btn("mpb", "", function () { create(); }); c.append(h("b", null, T("mpCreate")), h("small", null, T("mpCreateSub")));
    var j = btn("mpb", "", function () { codeCard(); }); j.append(h("b", null, T("mpCode")), h("small", null, T("mpCodeSub")));
    kids.push(you, q, c, j, btn("mpx", T("back"), function () { reset(); G().menu(); }));
    showCard(kids);
  }
  function pickName() {
    var d = document.getElementById("rank"); if (!d || !window.CL_RANK) return;
    window.CL_RANK.open("play");
    d.addEventListener("close", function () { setTimeout(function () { if (st.phase !== "home") return; var u = user(); if (st.pendCode && u && u.custom) { var c = st.pendCode; st.pendCode = null; join(c); } else home(); }, 300); }, {once: true});
  }
  function create() {
    st.phase = "create"; var g = Math.min(MAX_GOAL, Math.max(MIN_GOAL, lsGet("cl_mp_goal") || DEF_GOAL));
    var val = h("div", "mpgv", String(g)), chips = h("div", "mpch");
    function set(n) { g = Math.min(MAX_GOAL, Math.max(MIN_GOAL, n)); val.textContent = String(g); [].forEach.call(chips.children, function (c) { c.classList.toggle("on", +c.dataset.g === g); }); }
    function hold(d) { var b = btn("mpst", d > 0 ? "+" : "−", function () {}); var iv = 0, to = 0;
      function stop() { clearTimeout(to); clearInterval(iv); }
      b.setAttribute("aria-label", d > 0 ? "+1" : "-1");
      b.addEventListener("pointerdown", function (e) { e.preventDefault(); set(g + d); to = setTimeout(function () { iv = setInterval(function () { set(g + d); }, 70); }, 380); });
      b.addEventListener("pointerup", stop); b.addEventListener("pointerleave", stop); b.addEventListener("pointercancel", stop);
      b.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); set(g + d); } });
      return b; }
    GOALS.forEach(function (n) { var c = btn("mpchip", String(n), function () { set(n); }); c.dataset.g = n; chips.append(c); });
    var row = h("div", "mpgr"); row.append(hold(-1), val, hold(1));
    var go = btn("mpb pri mpgo", T("mpMake"), function () {
      go.disabled = true; lsSet("cl_mp_goal", g);
      call("mp_create", {p_goal: g}).then(function (v) { go.disabled = false; if (v && v.ok) { ev("mp_create", {mode: "code", score: v.goal}); st.joinT = Date.now(); } apply(v); }, function () { go.disabled = false; toast(T("mpErrNet")); });
    });
    showCard([title(T("mpCreate")), h("p", "mps", T("mpGoal")), row, chips, h("p", "mpsm", T("mpPacks")), go, btn("mpx", T("back"), home)]);
    set(g);
  }
  function codeCard(pre) {
    st.phase = "code";
    var f = h("form", "mpf"), inp = h("input", "mpin"), er = h("p", "mperr", "");
    inp.maxLength = 5; inp.autocomplete = "off"; inp.setAttribute("autocapitalize", "characters"); inp.spellcheck = false; inp.setAttribute("aria-label", T("mpCodeAsk")); inp.placeholder = "ABCD"; inp.value = pre || ""; inp.setAttribute("data-focus", "");
    inp.addEventListener("input", function () { var p = inp.selectionStart; inp.value = inp.value.toUpperCase().replace(/[^A-Z]/g, ""); er.textContent = ""; try { inp.setSelectionRange(p, p); } catch (e) {} });
    var go = h("button", "mpb pri mpgo", T("mpJoin")); go.type = "submit";
    f.append(inp, er, go);
    f.addEventListener("submit", function (e) { e.preventDefault(); var c = inp.value.trim(); if (c.length < 4) { er.textContent = T("mpErrNf"); return; } join(c); });
    showCard([title(T("mpCode")), h("p", "mps", T("mpCodeAsk")), f, btn("mpx", T("back"), home)]);
  }
  function join(c, how) {
    var go = card.querySelector(".mpgo"); if (go) go.disabled = true;
    call("mp_join", {p_code: c}).then(function (v) { if (go) go.disabled = false; if (v && v.ok) { ev("mp_join", {mode: how || "code"}); st.joinT = Date.now(); } apply(v); poll(1500); },
      function () { if (go) go.disabled = false; toast(T("mpErrNet")); });
  }
  function quick() {
    st.phase = "quickgo";
    call("mp_quick", {}).then(function (v) { if (v && v.ok) { ev("mp_join", {mode: "quick"}); st.joinT = Date.now(); st.waitMore = 0; } apply(v); poll(1500); }, function () { toast(T("mpErrNet")); home(); });
  }
  function invite() {
    var link = URL_ + "?sala=" + st.code, text = T("mpInvTxt", st.code);
    try { S().event(GAME, "share", {mode: "live"}); } catch (e) {}
    if (navigator.share) { navigator.share({title: T("title"), text: text, url: link}).catch(function () {}); return; }
    var all = text + " " + link;
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(all).then(function () { toast(T("copied")); }, function () { prompt("", all); }); else prompt("", all);
  }
  function plist(v, showReady) {
    var ol = h("ol", "mppl"), act = v.players.filter(function (p) { return !p.left; });
    for (var s = 0; s < MAXP; s++) {
      var p = null; for (var i = 0; i < act.length; i++) if (act[i].slot === s) p = act[i];
      var li = h("li", p ? "" : "empty");
      if (p) {
        var av = h("span", "mpav", (p.name || "?").charAt(0).toUpperCase()); av.style.background = COL[s];
        li.append(av, h("span", "mpn", p.name));
        if (p.pid === v.host) li.append(h("span", "mptag", "\u{1F451}"));
        if (p.pid === v.me) li.classList.add("me");
        var off = st.online ? !st.online[p.pid] && p.away > 3 : p.away > 6;
        if (off) { li.classList.add("off"); li.append(h("span", "mpst2", T("mpOff"))); }
        else if (showReady && !p.ready) { li.classList.add("off"); li.append(h("span", "mpst2", "…")); }
      } else li.append(h("span", "mpav e", "+"), h("span", "mpn", T("mpEmpty")));
      ol.append(li);
    }
    return ol;
  }
  function renderLobby() {
    var v = st.view; if (!v) return;
    var me = meP(v), ready = v.players.filter(function (p) { return !p.left && p.ready; }), kids;
    if (v.quick) {
      var alone = ready.length < 2, waited = (Date.now() - st.joinT) / 1000 - st.waitMore;
      if (alone && waited > ALONE_S) {
        kids = [title(T("mpNobody")), h("p", "mps", T("mpNobodySub")),
          btn("mpb pri", T("mpInvite"), invite), btn("mpb", T("mpSolo"), function () { var c = st.code; call("mp_leave", {p_code: c}).catch(function () {}); reset(); G().solo(); }),
          btn("mpx", T("mpKeep"), function () { st.waitMore = (Date.now() - st.joinT) / 1000; renderLobby(); })];
        showCard(kids, "quick"); return;
      }
      var head = h("p", "mps mpsrch"); head.append(document.createTextNode(T("mpSearch")), h("span", "mpdots", ""));
      var left = Math.ceil((v.lobby_at + 15000 - sNow()) / 1000);
      var info = h("p", "mpsm", ready.length >= 2 ? (left > 0 ? T("mpStartsIn", String(left)) : T("mpStarting")) : T("mpGoalIs", String(v.goal)));
      kids = [title(T("mpQuick")), head, plist(v, true), info, btn("mpb", T("mpInvite"), invite), btn("mpx", T("mpLeave"), leave)];
      showCard(kids, "quick"); return;
    }
    var code = h("div", "mpcode"); code.append(h("small", null, T("mpRoomCode")), h("b", null, v.code));
    kids = [title(T("mpRoom")), code, h("p", "mpsm", T("mpGoalIs", String(v.goal))), plist(v, v.round > 1)];
    var host = byPid(v.host);
    if (me && v.host === v.me) {
      var sb = btn("mpb pri mpgo", T("mpStart"), function () { sb.disabled = true; call("mp_start", {p_code: v.code}).then(function (r) { sb.disabled = false; if (r && r.ok) bc("st"); apply(r); }, function () { sb.disabled = false; toast(T("mpErrNet")); }); });
      if (ready.length < 2) { sb.disabled = true; sb.classList.add("dis"); }
      kids.push(sb, h("p", "mpsm", ready.length < 2 ? T("mpNeed2") : ""));
    } else kids.push(h("p", "mps", T("mpWaitHost", host ? host.name : "")));
    var row = h("div", "mprow"); row.append(btn("mpb half", T("mpInvite"), invite), btn("mpb half", T("mpLeave"), leave));
    kids.push(row);
    showCard(kids, "lobby");
  }

  // ---------- contagem e corrida ----------
  function count(v) {
    st.phase = "count"; st.raceRound = v.round; var me = meP(v); st.want = st.sent = me ? me.n : 0; st.sending = false;
    hideCard(); G().wait(); bar.classList.remove("hide"); bars();
    var start = v.start_at - st.off, last = -1;
    if (!st.logged["s" + v.code + v.round]) { st.logged["s" + v.code + v.round] = 1; ev("mp_start", {mode: v.quick ? "quick" : "code", score: v.goal}); }
    function step() {
      if (st.phase !== "count") { cd.classList.add("hide"); return; }
      var left = (start - Date.now()) / 1000;
      if (left <= 0) { go(v); return; }
      var n = Math.ceil(left); if (n > 3) n = 3;
      if (n !== last) { last = n; fancy(cd, String(n)); pop(cd); try { G().tick(n); } catch (e) {} }
      requestAnimationFrame(step);
    }
    if (start - Date.now() <= 0) go(v); else { cd.classList.remove("hide"); step(); }
  }
  function go(v) {
    st.phase = "race"; st.goT = Date.now(); var me = meP(v);
    if (Date.now() - (v.start_at - st.off) < 1500) { fancy(cd, T("mpGo")); cd.classList.remove("hide"); pop(cd); setTimeout(function () { cd.classList.add("hide"); }, 700); } else cd.classList.add("hide");
    try { S().play(GAME, "live"); } catch (e) {}
    G().race({seed: v.seed, goal: v.goal, progress: me ? me.n : 0});
    bars(); poll(pollMs());
  }
  function pack(n) { // chamado pelo jogo a cada pacote completado
    if (st.phase !== "race") return;
    st.want = Math.max(st.want, n); st.flash[st.view.me] = Date.now(); bars(); flush();
  }
  function flush() {
    if (st.sending || st.sent >= st.want || !st.code || st.phase !== "race") return;
    st.sending = true; var n = st.sent + 1, c = st.code;
    call("mp_pack", {p_code: c, p_n: n}).then(function (v) {
      st.sending = false;
      if (!v) return;
      if (v.ok) { var me = meP(v); st.sent = Math.max(st.sent, me ? me.n : n); bc("pk", {pid: v.me, n: st.sent}); if (v.state === "done") bc("st"); apply(v); flush(); return; }
      if (v.err === "fast" || v.err === "seq") { if (v.err === "seq" && v.n >= 0) st.sent = v.n; setTimeout(flush, 700); return; }
      fail(v.err);
    }, function () { st.sending = false; setTimeout(flush, 1200); });
  }
  function finish(v) {
    st.phase = "podium"; st.raceRound = v.round; snap(v); G().lock(); poll(3000); // foto do podio JA: a revanche de outro jogador zera o progresso no servidor
    var me = meP(v), win = v.winner === v.me;
    if (!st.logged["e" + v.code + v.round]) { st.logged["e" + v.code + v.round] = 1;
      ev("mp_end", {mode: v.quick ? "quick" : "code", score: me ? me.n : 0, reason: win ? (me && me.n >= v.goal ? "win" : "alone") : "lose", secs: st.goT ? (Date.now() - st.goT) / 1000 : null}); }
    setTimeout(function () { if (st.phase === "podium") { G().wait(); bar.classList.add("hide"); renderPodium(); [].forEach.call(card.querySelectorAll("button"), function (b) { b.disabled = true; setTimeout(function () { b.disabled = false; }, 700); }); } /* 0,7 s sem toque: quem ainda arrastava nao aperta Revanche sem querer */ }, win ? 1300 : 900);
  }
  function snap(v) { st.podium = {round: v.round, winner: v.winner, goal: v.goal, list: v.players.filter(function (p) { return p.in; }).map(function (p) { return {pid: p.pid, name: p.name, slot: p.slot, n: nOf(p), t: p.t || 9e15, left: p.left, away: p.away}; })}; }
  function renderPodium() {
    var v = st.view; if (!v) return;
    var me = meP(v), round = st.raceRound;
    var ps = v.players.filter(function (p) { return p.in || (v.round > round && p.n === 0); });
    // depois da revanche o servidor zera o progresso: o podio mostra o que ficou guardado no navegador
    var keep = st.podium && st.podium.round === round ? st.podium : null;
    if (v.round === round && v.state === "done") { snap(v); keep = st.podium; }
    if (!keep) { keep = {round: round, winner: v.winner, goal: v.goal, list: ps.map(function (p) { return {pid: p.pid, name: p.name, slot: p.slot, n: nOf(p), t: p.t || 9e15, left: p.left, away: p.away}; })}; }
    keep.list.forEach(function (q) { var p = byPid(q.pid); if (p) { q.left = p.left; q.away = p.away; } }); // quem saiu depois da chegada ganha o rotulo
    var L = keep.list.slice().sort(function (a, b) { return (b.pid === keep.winner) - (a.pid === keep.winner) || b.n - a.n || a.t - b.t; });
    var win = keep.winner === v.me, wp = null; for (var i = 0; i < L.length; i++) if (L[i].pid === keep.winner) wp = L[i];
    var others = L.filter(function (p) { return p.pid !== v.me && !p.left && p.away <= DROP_S; }).length;
    var head = win ? (wp && wp.n < keep.goal ? T("mpAlone") : T("mpWin")) : T("mpWon", wp ? wp.name : "?");
    var t = h("div", "mpt big" + (win ? " win" : "")); t.textContent = head;
    var ol = h("ol", "mppod"), MED = ["\u{1F947}", "\u{1F948}", "\u{1F949}", "4"];
    L.forEach(function (p, k) {
      var li = h("li", (p.pid === v.me ? "me " : "") + (k === 0 ? "first" : "")); li.style.animationDelay = (0.12 + k * 0.12) + "s";
      var av = h("span", "mpav", (p.name || "?").charAt(0).toUpperCase()); av.style.background = COL[p.slot] || COL[0];
      li.append(h("span", "mpmed", MED[k]), av, h("span", "mpn", p.name));
      if (p.left || p.away > DROP_S) li.append(h("span", "mpst2", p.left ? T("mpLeft") : T("mpOut")));
      li.append(h("span", "mppk", p.n + "/" + keep.goal)); ol.append(li);
    });
    var kids = [t, ol];
    if (v.state === "playing" && !(me && me.in)) kids.push(h("p", "mps", T("mpMissed")));
    else {
      var askers = v.round > round ? v.players.filter(function (p) { return p.ready && p.pid !== v.me && !p.left; }) : [];
      if (askers.length) kids.push(h("p", "mps mpre", T("mpWantsRe", askers.map(function (p) { return p.name; }).join(", "))));
      if (others > 0 || askers.length) {
        var rb = btn("mpb pri mpgo", "↻ " + T("mpRematch"), function () { rb.disabled = true; call("mp_rematch", {p_code: v.code, p_round: round}).then(function (r) { rb.disabled = false; if (r && r.ok) bc("st"); apply(r); }, function () { rb.disabled = false; toast(T("mpErrNet")); }); });
        kids.push(rb);
      }
    }
    kids.push(btn("mpx", T("mpLeave"), leave));
    if (win) { var cf = h("div", "mpconf"); for (var c = 0; c < 14; c++) { var im = h("img"); im.src = "assets/c" + (c % 6) + ".png"; im.alt = ""; im.style.left = (4 + Math.random() * 88) + "%"; im.style.animationDelay = (Math.random() * 1.2) + "s"; im.style.animationDuration = (1.8 + Math.random() * 1.2) + "s"; cf.append(im); } kids.push(cf); }
    showCard(kids, "pod");
  }

  // ---------- barra dos jogadores no topo da partida ----------
  function bars() {
    var v = st.view; if (!v || (st.phase !== "race" && st.phase !== "count" && st.phase !== "podium")) return;
    var ps = v.players.filter(function (p) { return p.in; }).sort(function (a, b) { return a.slot - b.slot; });
    if (bar.children.length !== ps.length || bar.dataset.r !== String(v.round)) {
      bar.replaceChildren(); bar.dataset.r = String(v.round);
      ps.forEach(function (p) {
        var c = h("div", "mpchip2"); c.dataset.pid = p.pid;
        var av = h("span", "mpav", (p.name || "?").charAt(0).toUpperCase()); av.style.background = COL[p.slot] || COL[0];
        var tx = h("span", "mpcx"); tx.append(h("span", "mpcn", p.name), h("span", "mpcv", ""));
        var tr = h("span", "mptr"); tr.append(h("i"));
        c.append(av, tx, tr, h("span", "mpcs", "")); bar.append(c);
      });
      bar.className = "n" + ps.length;
    }
    ps.forEach(function (p) {
      var c = bar.querySelector('[data-pid="' + p.pid + '"]'); if (!c) return;
      var n = nOf(p);
      c.querySelector(".mpcv").textContent = n + "/" + v.goal;
      c.querySelector(".mptr i").style.width = Math.round(100 * n / v.goal) + "%";
      c.classList.toggle("me", p.pid === v.me);
      var off = p.left || p.away > DROP_S ? 2 : (p.pid !== v.me && ((st.online && !st.online[p.pid] && p.away > 2) || p.away > 7)) ? 1 : 0;
      c.classList.toggle("off", off > 0);
      c.querySelector(".mpcs").textContent = off === 2 ? (p.left ? T("mpLeft") : T("mpOut")) : off === 1 ? T("mpOff") : "";
      c.classList.toggle("lead", v.state === "done" && v.winner === p.pid);
      var f = st.flash[p.pid];
      if (f && f !== +c.dataset.f) { c.dataset.f = f; c.classList.remove("fl"); void c.offsetWidth; c.classList.add("fl"); }
    });
  }

  // ---------- texto grande (mesmo estilo dourado do jogo) ----------
  function fancy(el, s) { for (var i = 0; i < el.children.length; i++) el.children[i].textContent = s; }
  function pop(el) { el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop"); }

  // ---------- inicio ----------
  function build() {
    var hud = document.getElementById("hud");
    card = h("div", "a mpc hide"); card.id = "mpc"; card.setAttribute("role", "dialog"); card.setAttribute("aria-live", "polite"); hud.append(card);
    bar = h("div", "hide"); bar.id = "mpbar"; bar.setAttribute("aria-live", "polite"); hud.append(bar);
    cd = h("div", "a fancy hide"); cd.id = "mpcd"; cd.append(h("span", "l0"), h("span", "l1"), h("span", "l2")); cd.setAttribute("aria-live", "assertive"); hud.append(cd);
    badge = h("div", "hide", T("mpReconn")); badge.id = "mpnet"; hud.append(badge);
    window.addEventListener("online", function () { if (st.code) poll(0); });
    document.addEventListener("visibilitychange", function () { if (!document.hidden && st.code) poll(0); });
    try { S().auth.on(function () { if (st.phase === "home") home(); }); } catch (e) {}
  }
  function nameReady() { // apelido do aparelho (sem baixar o supabase-js) ou conta Google
    var s = S(); if (!s) return Promise.resolve(null);
    return Promise.race([Promise.all([s.auth.dev(), s.auth.ready ? s.auth.ready().catch(function () {}) : null]), new Promise(function (r) { setTimeout(r, 4000); })]).then(function () { return user(); });
  }
  var API = {
    open: function () { if (!card) build(); if (st.code) { apply(st.view); return; } G().wait(); showCard([title(T("mpT")), h("p", "mps", T("rankLoad"))]); st.phase = "home"; nameReady().then(function () { if (st.phase === "home") home(); }); },
    pack: pack,
    active: function () { return st.phase !== "off"; },
    // chamado pelo jogo depois do 1o menu: link ?sala=XXXX ou volta para a sala em ate 20 s (recarregou a pagina / caiu)
    boot: function () {
      if (!card) build();
      var c = null; try { var u = new URL(location.href); c = (u.searchParams.get("sala") || "").toUpperCase().replace(/[^A-Z]/g, ""); if (u.searchParams.has("sala")) { u.searchParams.delete("sala"); history.replaceState(null, "", u.pathname + u.search + u.hash); } } catch (e) {}
      var sv = lsGet("cl_mp");
      if (c && c.length >= 4) {
        G().wait(); st.phase = "home"; showCard([title(T("mpT")), h("p", "mps", T("rankLoad"))]);
        nameReady().then(function (u) { if (u && u.custom) join(c, "link"); else { st.pendCode = c; home(); } });
      } else if (sv && sv.code && Date.now() - sv.t < BACK_S * 1000) {
        G().wait(); st.phase = "home"; showCard([title(T("mpT")), h("p", "mps", T("mpReconn"))]);
        nameReady().then(function () { call("mp_join", {p_code: sv.code}).then(function (v) { if (v && v.ok) st.joinT = Date.now(); else if (v && v.err === "dropped") { out(T("mpErrDropped")); return; } apply(v); poll(1500); }, function () { out(T("mpErrNet")); }); });
      } else lsSet("cl_mp", null);
    }
  };
  window.CL_MP = API;
})();
