// Recursos sociais (Supabase): contador de partidas, likes por aparelho e ranking.
// A chave abaixo e a chave PUBLICA do projeto (feita para ficar no navegador); as tabelas so aceitam as funcoes rpc.
(function () {
  var URL_ = "https://yaznxsbhissyhvvyhweu.supabase.co/rest/v1/rpc/";
  var KEY = "sb_publishable_eWUCNrYZoIoBOsbw48UYDg_cDZAfsIa";
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
  function name(v) {
    try { if (v != null) localStorage.setItem("bg_name", v); return localStorage.getItem("bg_name") || ""; } catch (e) { return v || ""; }
  }
  function compact(n, lang) {
    try { return new Intl.NumberFormat(lang || document.documentElement.lang || "en", {notation: "compact", maximumFractionDigits: 1}).format(n); } catch (e) { return String(n); }
  }
  // testes no PC (localhost) nao gravam nada no banco de verdade
  var LOCAL = /^(localhost|127\.|\[::1\])/.test(location.hostname);
  if (LOCAL) { var _rpc = rpc; rpc = function (fn, body) {
    if (fn === "record_play") return Promise.resolve(0);
    if (fn === "toggle_like") return Promise.resolve([{liked: true, likes: 1}]);
    if (fn === "submit_score") return Promise.resolve(1);
    return _rpc(fn, body); }; }
  window.BG_SOCIAL = {
    device: device, name: name, compact: compact,
    stats: function (games) { return rpc("get_stats", {p_games: games, p_device: device()}); },
    play: function (game) { return rpc("record_play", {p_game: game}).catch(function () {}); },
    like: function (game) { return rpc("toggle_like", {p_game: game, p_device: device()}).then(function (r) { return r[0]; }); },
    submit: function (game, mode, score, day) { return rpc("submit_score", {p_game: game, p_mode: mode, p_device: device(), p_name: name() || "Player", p_score: score, p_day: day || null}); },
    top: function (game, mode, day, limit) { return rpc("top_scores", {p_game: game, p_mode: mode, p_day: day || null, p_limit: limit || 10, p_device: device()}); }
  };

  // vitrine: "Played N times · ♥ N" embaixo de cada capa com data-game
  function portal() {
    var cards = document.querySelectorAll("[data-game]");
    if (!cards.length) return;
    var games = [].map.call(cards, function (c) { return c.getAttribute("data-game"); });
    window.BG_SOCIAL.stats(games).then(function (rows) {
      rows.forEach(function (r) {
        var el = document.querySelector('[data-game="' + r.game + '"] .meta');
        if (el) el.textContent = "Played " + compact(r.plays, "en") + " times · ♥ " + compact(r.likes, "en");
      });
    }).catch(function () {});
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", portal); else portal();
})();
