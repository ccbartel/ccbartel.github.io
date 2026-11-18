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
  // Botao oficial do Google Identity Services (janela mostra "Bartel Games", nao sai da pagina) + signInWithIdToken com nonce;
  // sem Client ID ou se o GIS falhar, volta ao redirect OAuth do Supabase (reserva).
  var GSI_CLIENT_ID = "517130945498-dhisrma92ccd9h4kqrtrq5n4monhmtu7.apps.googleusercontent.com"; // Client ID PUBLICO do cliente Web "Bartel Games Web" (projeto bartel-games-515023)
  var sbP = null, client = null, session = null, me = null, subs = [];
  var FAKE = LOCAL && /[?&]fakeauth=1/.test(location.search); // teste visual no PC: finge uma conta (nada vai ao banco)
  var fireT = 0, fakeName = "João S.";
  // fora do callback do onAuthStateChange: chamar o supabase la dentro trava o lock do auth (o envio da pontuacao ficava preso)
  function fire() { clearTimeout(fireT); fireT = setTimeout(function () { var u = user(); for (var i = 0; i < subs.length; i++) { try { subs[i](u); } catch (e) { console.error("[ranking] erro no aviso de login", e); } } }, 0); }
  function user() {
    if (FAKE) return {name: fakeName, avatar: null, ready: true, id: "fake", custom: fakeName !== "João S.", canChangeAt: null};
    return session ? {name: me ? me.name : "", avatar: me ? me.avatar : null, ready: !!me, id: session.user && session.user.id, custom: !!(me && me.custom), canChangeAt: me ? me.canChangeAt : null} : null;
  }
  function loadMe() {
    if (!client || !session) return;
    client.rpc("my_name").then(function (r) { if (r && r.error) console.error("[ranking] my_name falhou", r.error); var x = r && r.data && r.data[0]; me = {name: x ? x.name || "" : "", avatar: x ? x.avatar : null, custom: !!(x && x.custom), canChangeAt: x ? x.can_change_at : null}; fire(); }, function (e) { console.error("[ranking] my_name falhou", e); me = {name: "", avatar: null}; fire(); });
  }
  function sb() {
    if (sbP) return sbP;
    sbP = import(SBJS).then(function (m) {
      client = m.createClient(BASE, KEY, {auth: {persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "pkce", storageKey: "bg_auth"}});
      client.auth.onAuthStateChange(function (ev, s) {
        var had = !!session; session = s || null; if (!session) me = null;
        if (session && (!had || !me)) setTimeout(loadMe, 0);
        fire();
      });
      return client.auth.getSession().then(function (r) {
        session = (r && r.data && r.data.session) || null; if (session && !me) loadMe(); fire();
        try { var u = new URL(location.href); if (u.searchParams.has("code")) { u.searchParams.delete("code"); history.replaceState(null, "", u.pathname + u.search + u.hash); } } catch (e) {}
        return client;
      });
    });
    sbP.catch(function (e) { console.error("[ranking] supabase-js nao carregou", e); sbP = null; });
    return sbP;
  }
  function redirectLogin() {
    return sb().then(function (c) { return c.auth.signInWithOAuth({provider: "google", options: {redirectTo: location.origin + location.pathname}}); });
  }
  // ---- Google Identity Services ----
  var gsiP = null, gsiNonce = null;
  function hex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join(""); }
  function gsi() {
    if (!GSI_CLIENT_ID || FAKE) return Promise.reject(new Error("sem GIS"));
    if (gsiP) return gsiP;
    gsiP = new Promise(function (res, rej) {
      var sc = document.createElement("script"); sc.src = "https://accounts.google.com/gsi/client"; sc.async = true;
      sc.onload = function () { res(); }; sc.onerror = function () { rej(new Error("gsi nao carregou")); };
      document.head.appendChild(sc); setTimeout(function () { rej(new Error("gsi demorou")); }, 6000);
    }).then(function () {
      var raw = hex(crypto.getRandomValues(new Uint8Array(16)));
      return crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw)).then(function (h) {
        gsiNonce = raw;
        google.accounts.id.initialize({client_id: GSI_CLIENT_ID, nonce: hex(h), ux_mode: "popup", itp_support: true, use_fedcm_for_prompt: true,
          callback: function (r) {
            sb().then(function (c) { return c.auth.signInWithIdToken({provider: "google", token: r.credential, nonce: gsiNonce}); })
              .then(function (x) { if (x && x.error) throw x.error; })
              .catch(function (e) { console.error("[ranking] login Google (GIS) falhou, usando o redirect", e); redirectLogin(); });
          }});
      });
    });
    gsiP.catch(function (e) { console.warn("[ranking] GIS indisponivel:", e && e.message); });
    return gsiP;
  }
  var auth = {
    ready: function () { if (FAKE) { fire(); return Promise.resolve(null); } return sb(); },
    user: user,
    on: function (cb) { subs.push(cb); },
    // botao de login: o oficial do Google (GIS) quando houver Client ID; senao o nosso botao com redirect
    button: function (box, fallbackBtn) {
      box.appendChild(fallbackBtn);
      gsi().then(function () {
        var w = Math.min(320, Math.max(200, box.clientWidth || 240)), d = document.createElement("div");
        google.accounts.id.renderButton(d, {type: "standard", theme: "outline", size: "large", shape: "pill", text: "signin_with", logo_alignment: "left", width: w, locale: document.documentElement.lang || "en"});
        box.replaceChild(d, fallbackBtn);
      }).catch(function () {});
    },
    // nome de usuario escolhido (opcional, unico, 1 troca a cada 24 h): devolve ok | len | bad | taken | wait | off
    setName: function (name) {
      if (FAKE) { var n = String(name || "").trim(); var c = !n ? "ok" : (n.length < 3 || n.length > 16 ? "len" : (/^(maria l\.?|speedy)$/i.test(n) ? "taken" : (/porra|fuck/i.test(n) ? "bad" : "ok"))); if (c === "ok") { fakeName = n || "João S."; fire(); } return Promise.resolve(c); }
      return sb().then(function (c) { return c.rpc("set_username", {p_name: name}); }).then(function (r) {
        if (r.error) { console.error("[ranking] set_username falhou", r.error); return "off"; }
        if (r.data === "ok") loadMe(); return r.data;
      }, function (e) { console.error("[ranking] set_username falhou", e); return "off"; });
    },
    signIn: function () {
      if (FAKE) return Promise.resolve();
      return redirectLogin();
    },
    signOut: function () { if (FAKE) return Promise.resolve(); try { window.google && google.accounts && google.accounts.id.disableAutoSelect(); } catch (e) {} return sb().then(function (c) { return c.auth.signOut(); }).then(function () { session = null; me = null; fire(); }); }
  };
  if (GSI_CLIENT_ID && document.getElementById("rank")) sb(); // so nas paginas de jogo: com GIS o supabase-js precisa estar pronto quando o Google responder

  window.BG_SOCIAL = {
    device: device, compact: compact, auth: auth,
    // nome exibido da conta logada (o mesmo do ranking); sem login = "" (o apelido livre saiu)
    name: function () { var u = user(); return u ? u.name || "" : ""; },
    stats: function (games) { return rpc("get_stats", {p_games: games, p_device: device()}); },
    play: function (game) { try { window.dispatchEvent(new Event("bg-play")); } catch (e) {} return rpc("record_play", {p_game: game}).catch(function () {}); },
    like: function (game) { return rpc("toggle_like", {p_game: game, p_device: device()}).then(function (r) { return r[0]; }); },
    // so com login (o servidor recusa sem conta); em localhost finge sucesso
    submit: function (game, mode, score, day) {
      if (LOCAL) { console.info("[ranking] (teste local, nao grava) pontuacao enviada:", game, mode, score); return Promise.resolve(1); }
      return sb().then(function (c) {
        if (!session) throw new Error("login");
        return c.rpc("submit_score", {p_game: game, p_mode: mode, p_score: score, p_day: day || null}).then(function (r) {
          if (r.error) { console.error("[ranking] submit_score falhou", r.error); throw r.error; }
          console.info("[ranking] pontuacao enviada:", game, mode, score, "posicao", r.data); return r.data;
        });
      });
    },
    top: function (game, mode, day, limit) {
      var body = {p_game: game, p_mode: mode, p_day: day || null, p_limit: limit || 10};
      if (FAKE) return Promise.resolve([{rank: 1, name: "Maria L.", score: 2380, is_me: false, avatar: null, tag: ""}, {rank: 2, name: fakeName, score: 1835, is_me: true, avatar: null, tag: fakeName === "João S." ? "#A3F" : ""},
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
