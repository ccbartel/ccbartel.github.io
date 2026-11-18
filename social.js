// Recursos sociais (Supabase): contador de partidas, likes por aparelho e ranking.
// Ranking com APELIDO (decisao dele 2026-11-17): o apelido pode ser do aparelho (bg_device + token secreto bg_dtok, so o hash
// fica no servidor) ou da conta Google (opcional: guarda apelido e recorde em qualquer aparelho). Nome e foto do Google nunca aparecem.
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
    // apelido do aparelho: so no navegador (nomes "Speedy"/"Maria Turbo" fingem estar em uso)
    if (fn === "my_device_name") { var fn0 = null; try { fn0 = localStorage.getItem("bg_fake_dev_name"); } catch (e) {} return Promise.resolve(fn0 ? [{name: fn0, can_change_at: null}] : []); }
    if (fn === "set_device_name") { var n = String(body.p_name || "").trim(); var c = n.length < 3 || n.length > 16 ? "len" : /^(maria ?turbo|speedy)$/i.test(n) ? "taken" : /porra|fuck/i.test(n) ? "bad" : "ok";
      if (c === "ok") try { localStorage.setItem("bg_fake_dev_name", n); } catch (e) {} return Promise.resolve(c); }
    if (fn === "submit_score_device") { console.info("[ranking] (teste local, nao grava) pontuacao do aparelho:", body.p_game, body.p_score); return Promise.resolve(1); }
    if (fn === "top_scores") { var me0 = null; try { me0 = localStorage.getItem("bg_fake_dev_name"); } catch (e) {}
      return Promise.resolve([{rank: 1, name: "MariaTurbo", score: 2380, is_me: false}].concat(me0 ? [{rank: 2, name: me0, score: 1835, is_me: true}] : [], [{rank: me0 ? 3 : 2, name: "Speedy", score: 1420, is_me: false}])); }
    return _rpc(fn, body); }; }
  // token secreto do aparelho: prova que o apelido do aparelho e deste navegador (o servidor guarda so o hash)
  function dtok() {
    var k = "bg_dtok", t = null;
    try { t = localStorage.getItem(k); } catch (e) {}
    if (!t || t.length < 32) { t = Array.prototype.map.call(crypto.getRandomValues(new Uint8Array(24)), function (b) { return ("0" + b.toString(16)).slice(-2); }).join(""); try { localStorage.setItem(k, t); } catch (e) {} }
    return t;
  }

  // ---- login Google (supabase-js carregado so quando o jogo precisa do ranking) ----
  // Botao oficial do Google Identity Services (janela mostra "Bartel Games", nao sai da pagina) + signInWithIdToken com nonce;
  // sem Client ID ou se o GIS falhar, volta ao redirect OAuth do Supabase (reserva).
  var GSI_CLIENT_ID = "517130945498-dhisrma92ccd9h4kqrtrq5n4monhmtu7.apps.googleusercontent.com"; // Client ID PUBLICO do cliente Web "Bartel Games Web" (projeto bartel-games-515023)
  var sbP = null, client = null, session = null, me = null, subs = [], dev = null, devP = null; // dev = apelido do aparelho {name, canChangeAt}
  var FAKE = LOCAL && /[?&]fakeauth=1/.test(location.search); // teste visual no PC: finge uma conta (nada vai ao banco)
  var fireT = 0, fakeName = ""; // teste: comeca sem apelido
  // fora do callback do onAuthStateChange: chamar o supabase la dentro trava o lock do auth (o envio da pontuacao ficava preso)
  function fire() { clearTimeout(fireT); fireT = setTimeout(function () { var u = user(); for (var i = 0; i < subs.length; i++) { try { subs[i](u); } catch (e) { console.error("[ranking] erro no aviso de login", e); } } }, 0); }
  // quem aparece no ranking: conta Google (kind "google") ou apelido do aparelho (kind "device"); sem nenhum = null
  function user() {
    if (FAKE) return {kind: "google", name: fakeName, avatar: null, ready: true, id: "fake", custom: !!fakeName, canChangeAt: null};
    if (session) return {kind: "google", name: me ? me.name : "", avatar: null, ready: !!me, id: session.user && session.user.id, custom: !!(me && me.custom), canChangeAt: me ? me.canChangeAt : null};
    if (dev && dev.name) return {kind: "device", name: dev.name, avatar: null, ready: true, id: "dev:" + device(), custom: true, canChangeAt: dev.canChangeAt};
    return null;
  }
  function loadDev() {
    if (devP) return devP;
    devP = rpc("my_device_name", {p_device: device(), p_token: dtok()}).then(function (r) { var x = r && r[0]; dev = x ? {name: x.name, canChangeAt: x.can_change_at} : null; fire(); return dev; },
      function (e) { console.warn("[ranking] apelido do aparelho indisponivel", e); dev = null; return null; });
    return devP;
  }
  function loadMe() {
    if (!client || !session) return;
    // ao entrar com Google: o apelido e as pontuacoes do aparelho passam para a conta (se a conta ja tem apelido, vale o da conta)
    var claim = dev && dev.name ? client.rpc("claim_device", {p_device: device(), p_token: dtok()}).then(function (r) { if (r && r.error) console.error("[ranking] claim_device falhou", r.error); else { dev = null; devP = null; } }, function () {}) : Promise.resolve();
    claim.then(function () { return client.rpc("my_name"); }).then(function (r) { if (r && r.error) console.error("[ranking] my_name falhou", r.error); var x = r && r.data && r.data[0]; me = {name: x ? x.name || "" : "", avatar: x ? x.avatar : null, custom: !!(x && x.custom), canChangeAt: x ? x.can_change_at : null}; fire(); }, function (e) { console.error("[ranking] my_name falhou", e); me = {name: "", avatar: null}; fire(); });
  }
  function sb() {
    if (sbP) return sbP;
    sbP = import(SBJS).then(function (m) {
      client = m.createClient(BASE, KEY, {auth: {persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "pkce", storageKey: "bg_auth"}});
      client.auth.onAuthStateChange(function (ev, s) {
        if (ev === "SIGNED_IN" && !session && s) setTimeout(function () { event(null, "login"); }, 0);
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
    dev: loadDev, // carrega o apelido do aparelho (sem baixar o supabase-js)
    user: user,
    on: function (cb) { subs.push(cb); },
    // botao de login: o oficial do Google (GIS) quando houver Client ID; senao o nosso botao com redirect
    button: function (box, fallbackBtn) {
      box.appendChild(fallbackBtn);
      gsi().then(function () {
        var w = Math.min(320, Math.max(200, box.clientWidth || 240)), d = document.createElement("div");
        // iframe do GIS: com color-scheme escuro na pagina o iframe ganha fundo branco opaco (cantos brancos); light + recorte arredondado
        d.style.cssText = "color-scheme:light;border-radius:999px;overflow:hidden;display:inline-block;line-height:0;background:transparent";
        google.accounts.id.renderButton(d, {type: "standard", theme: "outline", size: "large", shape: "pill", text: "signin_with", logo_alignment: "left", width: w, locale: document.documentElement.lang || "en"});
        box.replaceChild(d, fallbackBtn);
      }).catch(function () {});
    },
    // nome de usuario escolhido (opcional, unico, 1 troca a cada 24 h): devolve ok | len | bad | taken | wait | off
    setName: function (name) {
      if (!FAKE && !session) return rpc("set_device_name", {p_device: device(), p_token: dtok(), p_name: name}).then(function (code) { if (code === "ok") { devP = null; return loadDev().then(function () { return code; }); } return code; },
        function (e) { console.error("[ranking] set_device_name falhou", e); return "off"; });
      if (FAKE) { var n = String(name || "").trim(); var c = (n.length < 3 || n.length > 16 ? "len" : (/^(maria l\.?|speedy)$/i.test(n) ? "taken" : (/porra|fuck/i.test(n) ? "bad" : "ok"))); if (c === "ok") { fakeName = n; fire(); } return Promise.resolve(c); }
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

  // ---- uso anonimo dos jogos (pedido dele 2026-11-18): sem nome, e-mail nem conta; so o ID anonimo do aparelho ----
  var EV = {t0: 0, ended: false, game: null};
  function evBase() {
    var ref = ""; try { if (document.referrer) { var h = new URL(document.referrer).hostname.toLowerCase(); if (h && h !== location.hostname) ref = h.replace(/^www\./, "").slice(0, 80); } } catch (e) {}
    var mob = false; try { mob = matchMedia("(pointer:coarse)").matches; } catch (e) {}
    return {lang: String(document.documentElement.lang || "").slice(0, 2).toLowerCase(), mobile: mob, ref: ref};
  }
  function event(game, kind, d) {
    d = d || {}; game = game || EV.game; if (!game) return Promise.resolve(false);
    var b = evBase(), body = {p_game: game, p_kind: kind, p_device: device(), p_mode: d.mode || null, p_secs: d.secs == null ? null : Math.round(d.secs),
      p_score: d.score == null ? null : Math.round(d.score), p_reason: d.reason || null, p_lang: b.lang || null, p_mobile: b.mobile, p_ref: b.ref || null};
    if (LOCAL) { console.info("[uso] (teste local, nao grava)", kind, JSON.stringify(body)); return Promise.resolve(true); }
    return rpc("log_event", body).catch(function () { return false; });
  }

  window.BG_SOCIAL = {
    event: event,
    game: function (g) { if (g) EV.game = g; return EV.game; },
    // fim de partida: o jogo manda pontuacao e motivo; a duracao e medida aqui (desde o play)
    end: function (game, mode, score, reason) { EV.ended = true; return event(game, "end", {mode: mode, score: score, reason: reason, secs: EV.t0 ? (performance.now() - EV.t0) / 1000 : null}); },
    device: device, compact: compact, auth: auth,
    // nome exibido da conta logada (o mesmo do ranking); sem login = "" (o apelido livre saiu)
    name: function () { var u = user(); return u ? u.name || "" : ""; },
    stats: function (games) { return rpc("get_stats", {p_games: games, p_device: device()}); },
    play: function (game, mode) {
      try { window.dispatchEvent(new Event("bg-play")); } catch (e) {}
      EV.game = game; if (EV.ended) event(game, "replay", {mode: mode}); EV.ended = false; EV.t0 = performance.now(); event(game, "start", {mode: mode});
      return rpc("record_play", {p_game: game}).catch(function () {});
    },
    like: function (game) { return rpc("toggle_like", {p_game: game, p_device: device()}).then(function (r) { return r[0]; }); },
    // so com login (o servidor recusa sem conta); em localhost finge sucesso
    submit: function (game, mode, score, day) {
      if (LOCAL) { console.info("[ranking] (teste local, nao grava) pontuacao enviada:", game, mode, score); return Promise.resolve(2); } // 2 = a posicao do jogador no ranking falso local
      if (!session && dev && dev.name) return rpc("submit_score_device", {p_device: device(), p_token: dtok(), p_game: game, p_mode: mode, p_score: score, p_day: day || null}).then(function (r) { console.info("[ranking] pontuacao enviada (aparelho):", game, mode, score, "posicao", r); return r; });
      return sb().then(function (c) {
        if (!session) throw new Error("login");
        return c.rpc("submit_score", {p_game: game, p_mode: mode, p_score: score, p_day: day || null}).then(function (r) {
          if (r.error) { console.error("[ranking] submit_score falhou", r.error); throw r.error; }
          console.info("[ranking] pontuacao enviada:", game, mode, score, "posicao", r.data); return r.data;
        });
      });
    },
    top: function (game, mode, day, limit) {
      var body = {p_game: game, p_mode: mode, p_day: day || null, p_limit: limit || 10, p_device: device()};
      if (FAKE) return Promise.resolve([{rank: 1, name: "MariaTurbo", score: 2380, is_me: false, avatar: null, tag: ""}].concat(fakeName ? [{rank: 2, name: fakeName, score: 1835, is_me: true, avatar: null, tag: ""}] : [],
        [{rank: fakeName ? 3 : 2, name: "Speedy", score: 1420, is_me: false, avatar: null, tag: ""}, {rank: fakeName ? 4 : 3, name: "Lukas_M", score: 610, is_me: false, avatar: null, tag: ""}])); // so teste local
      if (!session) return rpc("top_scores", body); // sem conta: nao precisa baixar o supabase-js
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
