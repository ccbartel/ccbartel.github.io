// Recursos sociais (Supabase): contador de partidas, likes por aparelho e ranking.
// Ranking SO com login Google (pedido do Cristiano 2026-11-17: sem apelido livre, sem palavrao, sem nome repetido).
// O nome exibido (primeiro nome + inicial) e calculado NO SERVIDOR a partir do perfil do Google; jogar nunca pede login.
// A chave abaixo e a chave PUBLICA do projeto (feita para ficar no navegador); as tabelas so aceitam as funcoes rpc.
(function () {
  var BASE = "https://yaznxsbhissyhvvyhweu.supabase.co";
  var URL_ = BASE + "/rest/v1/rpc/";
  var KEY = "sb_publishable_eWUCNrYZoIoBOsbw48UYDg_cDZAfsIa";
  var SBJS = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.119.0/+esm";
  function rpc(fn, body) {
    return fetch(URL_ + fn, {method: "POST", headers: {"apikey": KEY, "Content-Type": "application/json"}, body: JSON.stringify(body || {})})
      .then(function (r) { if (!r.ok) throw new Error(fn + " " + r.status); return r.json(); });
  }
  function device() {
    var k = "bg_device", d = null;
    try { d = localStorage.getItem(k); } catch (e) {}
    if (!d) {
      d = (crypto.randomUUID ? crypto.randomUUID() : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, function (c) { return (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16); }));
      try { localStorage.setItem(k, d); } catch (e) {}
    }
    return d;
  }
  function compact(n, lang) {
    try { return new Intl.NumberFormat(lang || document.documentElement.lang || "en", {notation: "compact", maximumFractionDigits: 1}).format(n); } catch (e) { return String(n); }
  }
  // testes no PC (localhost) nao gravam nada no banco de verdade
  var LOCAL = /^(localhost|127\.|\[::1\])/.test(location.hostname);
  if (LOCAL) { var _rpc = rpc; rpc = function (fn, body) {
    if (fn === "record_play") return Promise.resolve(0);
    if (fn === "toggle_like") return Promise.resolve([{liked: true, likes: 1}]);
    return _rpc(fn, body); }; }

  // ---- login Google (supabase-js carregado so quando o jogo precisa do ranking) ----
  var sbP = null, client = null, session = null, me = null, subs = [];
  var FAKE = LOCAL && /[?&]fakeauth=1/.test(location.search); // teste visual no PC: finge uma conta (nada vai ao banco)
  function fire() { for (var i = 0; i < subs.length; i++) { try { subs[i](user()); } catch (e) {} } }
  function user() {
    if (FAKE) return {name: "João S.", avatar: null, ready: true};
    return session ? {name: me ? me.name : "", avatar: me ? me.avatar : null, ready: !!me} : null;
  }
  function loadMe() {
    if (!client || !session) return;
    client.rpc("my_name").then(function (r) { var x = r && r.data && r.data[0]; me = {name: x ? x.name || "" : "", avatar: x ? x.avatar : null}; fire(); }, function () { me = {name: "", avatar: null}; fire(); });
  }
  function sb() {
    if (sbP) return sbP;
    sbP = import(SBJS).then(function (m) {
      client = m.createClient(BASE, KEY, {auth: {persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "pkce", storageKey: "bg_auth"}});
      client.auth.onAuthStateChange(function (ev, s) {
        var had = !!session; session = s || null; if (!session) me = null;
        if (session && (!had || !me)) loadMe(); fire();
      });
      return client.auth.getSession().then(function (r) {
        session = (r && r.data && r.data.session) || null; if (session) loadMe(); fire();
        // volta do Google: tira ?code= da barra de endereco
        try { var u = new URL(location.href); if (u.searchParams.has("code")) { u.searchParams.delete("code"); history.replaceState(null, "", u.pathname + u.search + u.hash); } } catch (e) {}
        return client;
      });
    });
    sbP.catch(function () { sbP = null; });
    return sbP;
  }
  var auth = {
    ready: function () { return FAKE ? Promise.resolve(null) : sb(); },
    user: user,
    on: function (cb) { subs.push(cb); },
    signIn: function () {
      if (FAKE) return Promise.resolve();
      return sb().then(function (c) { return c.auth.signInWithOAuth({provider: "google", options: {redirectTo: location.origin + location.pathname}}); });
    },
    signOut: function () { if (FAKE) return Promise.resolve(); return sb().then(function (c) { return c.auth.signOut(); }).then(function () { session = null; me = null; fire(); }); }
  };

  window.BG_SOCIAL = {
    device: device, compact: compact, auth: auth,
    // nome exibido da conta logada (o mesmo do ranking); sem login = "" (o apelido livre saiu)
    name: function () { var u = user(); return u ? u.name || "" : ""; },
    stats: function (games) { return rpc("get_stats", {p_games: games, p_device: device()}); },
    play: function (game) { try { window.dispatchEvent(new Event("bg-play")); } catch (e) {} return rpc("record_play", {p_game: game}).catch(function () {}); },
    like: function (game) { return rpc("toggle_like", {p_game: game, p_device: device()}).then(function (r) { return r[0]; }); },
    // so com login (o servidor recusa sem conta); em localhost finge sucesso
    submit: function (game, mode, score, day) {
      if (LOCAL) return Promise.resolve(1);
      return sb().then(function (c) {
        if (!session) throw new Error("login");
        return c.rpc("submit_score", {p_game: game, p_mode: mode, p_score: score, p_day: day || null}).then(function (r) { if (r.error) throw r.error; return r.data; });
      });
    },
    top: function (game, mode, day, limit) {
      var body = {p_game: game, p_mode: mode, p_day: day || null, p_limit: limit || 10};
      if (FAKE) return Promise.resolve([{rank: 1, name: "Maria L.", score: 2380, is_me: false, avatar: null, tag: ""}, {rank: 2, name: "João S.", score: 1835, is_me: true, avatar: null, tag: "#A3F"},
        {rank: 3, name: "João S.", score: 1420, is_me: false, avatar: null, tag: "#7C1"}, {rank: 4, name: "", score: 990, is_me: false, avatar: null, tag: "#0B2"}, {rank: 5, name: "Lukas M.", score: 610, is_me: false, avatar: null, tag: ""}]); // so teste local
      return sb().then(function (c) { return c.rpc("top_scores", body).then(function (r) { if (r.error) throw r.error; return r.data || []; }); }, function () { return rpc("top_scores", body); });
    }
  };

  // vitrine: "Played N times · ♥ N" embaixo de cada capa com data-game
  function portal() {
    var cards = document.querySelectorAll("[data-game]");
    if (!cards.length) return;
    var games = [].map.call(cards, function (c) { return c.getAttribute("data-game"); });
    window.BG_SOCIAL.stats(games).then(function (rows) {
      rows.forEach(function (r) {
        var el = document.querySelector('[data-game="' + r.game + '"] .meta');
        if (el) var L = window.SITE_I18N; el.textContent = L ? L.t("played", {p: compact(r.plays, L.tag), l: compact(r.likes, L.tag)}) : "Played " + compact(r.plays, "en") + " times · ♥ " + compact(r.likes, "en");
      });
    }).catch(function () {});
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", portal); else portal();
})();
