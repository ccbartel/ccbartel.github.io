// Conquistas do site (2026-11-21): guardadas SO no aparelho (localStorage bg_ach), contadas a partir dos avisos bg-play / bg-end
// do social.js e bg-post do mural. Aviso pequeno no topo quando ganha (nos jogos so na tela de fim, nunca no meio da partida).
// Perfil: janela "Minhas conquistas" (apelido, sequencia, partidas, jogos e as medalhas), aberta pelo resumo da home (window.BG_ACH.open).
(function () {
  var L = {
    en: {ttl: "My achievements", got: "New achievement!", of: "{a} of {b} achievements", plays: "games played", streak: "days in a row", games: "of 5 games tried", close: "Close", you: "You", locked: "Locked"},
    pt: {ttl: "Minhas conquistas", got: "Nova conquista!", of: "{a} de {b} conquistas", plays: "partidas", streak: "dias seguidos", games: "de 5 jogos experimentados", close: "Fechar", you: "Você", locked: "Bloqueada"},
    es: {ttl: "Mis logros", got: "¡Nuevo logro!", of: "{a} de {b} logros", plays: "partidas", streak: "días seguidos", games: "de 5 juegos probados", close: "Cerrar", you: "Tú", locked: "Bloqueado"},
    fr: {ttl: "Mes succès", got: "Nouveau succès !", of: "{a} sur {b} succès", plays: "parties", streak: "jours de suite", games: "jeux essayés sur 5", close: "Fermer", you: "Toi", locked: "Verrouillé"},
    de: {ttl: "Meine Erfolge", got: "Neuer Erfolg!", of: "{a} von {b} Erfolgen", plays: "Spiele", streak: "Tage in Folge", games: "von 5 Spielen ausprobiert", close: "Schließen", you: "Du", locked: "Gesperrt"},
    it: {ttl: "I miei traguardi", got: "Nuovo traguardo!", of: "{a} di {b} traguardi", plays: "partite", streak: "giorni di fila", games: "giochi provati su 5", close: "Chiudi", you: "Tu", locked: "Bloccato"}
  };
  // id (vai para os dados de uso), emoji, nome e como ganhar nos 3 idiomas principais (fr/de/it usam o ingles)
  var A = [
    ["first", "🎮", {en: ["First game", "Play any game"], pt: ["Primeira partida", "Jogue qualquer jogo"], es: ["Primera partida", "Juega cualquier juego"]}],
    ["all5", "🧭", {en: ["Explorer", "Try all 5 games"], pt: ["Explorador", "Jogue os 5 jogos"], es: ["Explorador", "Juega los 5 juegos"]}],
    ["streak3", "🔥", {en: ["On fire", "Play 3 days in a row"], pt: ["Pegando fogo", "Jogue 3 dias seguidos"], es: ["En llamas", "Juega 3 días seguidos"]}],
    ["streak7", "📅", {en: ["Faithful", "Play 7 days in a row"], pt: ["Fiel", "Jogue 7 dias seguidos"], es: ["Fiel", "Juega 7 días seguidos"]}],
    ["plays25", "⭐", {en: ["Getting good", "Play 25 games"], pt: ["Pegando o jeito", "Jogue 25 partidas"], es: ["Agarrando la mano", "Juega 25 partidas"]}],
    ["plays100", "🏆", {en: ["Veteran", "Play 100 games"], pt: ["Veterano", "Jogue 100 partidas"], es: ["Veterano", "Juega 100 partidas"]}],
    ["bp-win", "🫧", {en: ["Bubble champ", "Win a round of Bumpets"], pt: ["Campeão das bolhas", "Vença uma rodada de Bumpets"], es: ["Campeón de burbujas", "Gana una ronda de Bumpets"]}],
    ["bp-goal3", "⚽", {en: ["Top scorer", "Score 3 goals in a Bumpets Soccer match"], pt: ["Artilheiro", "Faça 3 gols numa partida de Bumpets Soccer"], es: ["Goleador", "Mete 3 goles en una partida de Bumpets Soccer"]}],
    ["bp-race", "🏁", {en: ["First to the flag", "Win a race in Bumpets Race"], pt: ["Primeiro na chegada", "Vença uma corrida no Bumpets Race"], es: ["Primero en llegar", "Gana una carrera en Bumpets Race"]}],
    ["bp-zone", "🎯", {en: ["Zone boss", "Win a match in Bumpets Zone"], pt: ["Dono da zona", "Vença uma partida no Bumpets Zone"], es: ["Dueño de la zona", "Gana una partida en Bumpets Zone"]}],
    ["bp-all4", "🐾", {en: ["Bubble tour", "Play all 4 Bumpets games"], pt: ["Tour das bolhas", "Jogue os 4 Bumpets"], es: ["Tour de burbujas", "Juega los 4 Bumpets"]}],
    ["bp-mis", "✅", {en: ["On a mission", "Complete a Bumpets daily mission"], pt: ["Missão dada", "Cumpra uma missão do dia dos Bumpets"], es: ["Misión cumplida", "Cumple una misión del día de Bumpets"]}],
    ["geo-3", "🌍", {en: ["Globetrotter", "Get 3/3 in Geo Quiz"], pt: ["Viajante", "Faça 3/3 no Geo Quiz"], es: ["Trotamundos", "Haz 3/3 en Geo Quiz"]}],
    ["candy-10", "🍬", {en: ["Sweet tooth", "Fill 10 bags in Candy Line"], pt: ["Formiguinha", "Encha 10 pacotes no Candy Line"], es: ["Goloso", "Llena 10 bolsas en Candy Line"]}],
    ["burn-1000", "🚗", {en: ["Survivor", "Score 1,000 in Burnout City"], pt: ["Sobrevivente", "Faça 1.000 pontos no Burnout City"], es: ["Superviviente", "Haz 1.000 puntos en Burnout City"]}],
    ["drift-3000", "🚧", {en: ["Cone master", "Score 3,000 in Drift Trail"], pt: ["Mestre dos cones", "Faça 3.000 pontos no Drift Trail"], es: ["Maestro de los conos", "Haz 3.000 puntos en Drift Trail"]}],
    ["wall-post", "💬", {en: ["Community", "Post on a game's wall"], pt: ["Comunidade", "Publique no mural de um jogo"], es: ["Comunidad", "Publica en el muro de un juego"]}]
  ];
  var LG = String(document.documentElement.lang || "en").slice(0, 2), T = L[LG] || L.en;
  function nm(a) { var t = a[2][LG] || a[2].en; return t; }
  function get(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var got = get("bg_ach", {}), queue = [], isGame = !!document.querySelector("#topbar .tb-r"), playing = false;
  function streak() { var D = get("bg_days", []), d0 = new Date(new Date().toLocaleDateString("sv") + "T12:00:00"), n = 0, k = D.indexOf(d0.toLocaleDateString("sv")) >= 0 ? 0 : 1;
    for (; k < 400; k++) { if (D.indexOf(new Date(d0.getTime() - k * 864e5).toLocaleDateString("sv")) >= 0) n++; else break; } return n; }
  function gamesTried() { return get("bg_games", []); }
  function unlock(id) {
    if (got[id]) return; got[id] = Date.now(); put("bg_ach", got);
    try { window.BG_SOCIAL && window.BG_SOCIAL.event("site", "ach", {mode: id}); } catch (e) {}
    queue.push(id); if (!isGame || !playing) flush();
  }
  function check() {
    var p = +get("bg_plays", 0), g = gamesTried(), s = streak();
    if (p >= 1) unlock("first"); if (p >= 25) unlock("plays25"); if (p >= 100) unlock("plays100");
    if (g.length >= 5) unlock("all5"); if (s >= 3) unlock("streak3"); if (s >= 7) unlock("streak7");
  }
  var css = "#bg-ach-t{position:fixed;left:50%;top:calc(58px + env(safe-area-inset-top,0px));transform:translate(-50%,-160%);z-index:9500;display:flex;gap:10px;align-items:center;padding:10px 16px 10px 12px;" +
    "border-radius:16px;background:#13265a;border:1.5px solid #f7b60c;box-shadow:0 10px 30px #000a;color:#fff;font:600 14px/1.25 system-ui,sans-serif;cursor:pointer;transition:transform .4s cubic-bezier(.2,1.4,.4,1);max-width:calc(100vw - 24px)}" +
    "#bg-ach-t.on{transform:translate(-50%,0)}#bg-ach-t small,#bg-ach-t b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#bg-ach-t div{min-width:0}#bg-ach-t b{font-size:16px}#bg-ach-t i{font-style:normal;font-size:30px}#bg-ach-t small{display:block;color:#ffe27a;font-size:12px;text-transform:uppercase;letter-spacing:.04em}" +
    "#bg-ach{border:0;padding:0;margin:auto;width:min(520px,100vw);max-height:min(820px,100dvh);background:#0b1736;color:#fff;border-radius:18px;font-family:var(--font,system-ui,sans-serif)}#bg-ach::backdrop{background:#000a}" +
    "@media (max-width:600px){#bg-ach{width:100vw;max-height:100dvh;height:100dvh;border-radius:0}}" +
    "#bg-ach .hd{display:flex;align-items:center;gap:12px;padding:calc(14px + env(safe-area-inset-top,0px)) 16px 12px;border-bottom:1px solid #ffffff1a}" +
    "#bg-ach .hd .av{width:52px;height:52px;border-radius:50%;border:2px solid #f7b60c;background:#13265a;display:flex;align-items:center;justify-content:center;font-style:normal;font-size:28px;flex:none}#bg-ach .hd div{flex:1}#bg-ach .hd b{display:block;font:800 21px/1.15 var(--title,system-ui)}#bg-ach .hd span{color:#b9c6e8;font-size:14px}" +
    "#bg-ach .x{width:38px;height:38px;border-radius:50%;border:1.5px solid #ffffff38;background:#ffffff14;color:#fff;font-size:22px;cursor:pointer}" +
    "#bg-ach .st{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:14px 16px 4px}#bg-ach .st div{background:#ffffff0d;border:1px solid #ffffff17;border-radius:14px;padding:10px;text-align:center}" +
    "#bg-ach .st b{display:block;font:800 24px/1.1 var(--title,system-ui);color:#ffe27a}#bg-ach .st span{font-size:12px;color:#b9c6e8}" +
    "#bg-ach .gr{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;padding:12px 16px 18px}" +
    "#bg-ach .md{border-radius:14px;padding:10px;background:linear-gradient(160deg,#3a1f78,#13265a);border:1px solid #f7b60c66}#bg-ach .md i{font-style:normal;font-size:28px}" +
    "#bg-ach .md b{display:block;font:800 15px/1.2 var(--title,system-ui);margin-top:2px}#bg-ach .md span{font-size:12px;color:#c9d4f0;line-height:1.3}" +
    "#bg-ach .md.off{background:#ffffff08;border-color:#ffffff14;filter:grayscale(1);opacity:.55}";
  var styled = false;
  function style() { if (styled) return; styled = true; var s = document.createElement("style"); s.textContent = css; document.head.appendChild(s); }
  var tEl = null, tBusy = false;
  function flush() {
    if (tBusy || !queue.length) return; style(); tBusy = true;
    var a = A.filter(function (x) { return x[0] === queue[0]; })[0]; queue.shift(); if (!a) { tBusy = false; return flush(); }
    tEl = document.createElement("div"); tEl.id = "bg-ach-t"; tEl.setAttribute("role", "status");
    var i = document.createElement("i"); i.textContent = a[1]; var d = document.createElement("div"); var sm = document.createElement("small"); sm.textContent = T.got; var b = document.createElement("b"); b.textContent = nm(a)[0];
    d.appendChild(sm); d.appendChild(b); tEl.appendChild(i); tEl.appendChild(d); tEl.onclick = open; document.body.appendChild(tEl);
    requestAnimationFrame(function () { requestAnimationFrame(function () { tEl.classList.add("on"); }); });
    setTimeout(function () { if (tEl) tEl.classList.remove("on"); setTimeout(function () { if (tEl) tEl.remove(); tEl = null; tBusy = false; flush(); }, 450); }, 3200);
  }
  var dlg = null;
  function open() {
    style(); if (!dlg) { dlg = document.createElement("dialog"); dlg.id = "bg-ach"; document.body.appendChild(dlg); dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); }); }
    dlg.textContent = ""; var n = 0; for (var k in got) n++;
    var hd = document.createElement("div"); hd.className = "hd"; var av = document.createElement("i"); av.className = "av"; av.textContent = "🏅"; hd.appendChild(av); /* nao usar o rosto do site: pareceria a foto do jogador */
    var who = ""; try { who = window.BG_SOCIAL && window.BG_SOCIAL.name ? window.BG_SOCIAL.name() : ""; } catch (e) {} if (!who) try { who = localStorage.getItem("bg_fake_dev_name") || ""; } catch (e) {}
    var tx = document.createElement("div"); var b = document.createElement("b"); b.textContent = T.ttl; var sp = document.createElement("span"); sp.textContent = (who || T.you) + " · " + T.of.replace("{a}", n).replace("{b}", A.length);
    tx.appendChild(b); tx.appendChild(sp); hd.appendChild(tx);
    var x = document.createElement("button"); x.className = "x"; x.type = "button"; x.textContent = "×"; x.setAttribute("aria-label", T.close); x.onclick = function () { dlg.close(); }; hd.appendChild(x); dlg.appendChild(hd);
    var st = document.createElement("div"); st.className = "st";
    [[+get("bg_plays", 0), T.plays], [streak(), T.streak], [gamesTried().length, T.games]].forEach(function (v) { var c = document.createElement("div"), bb = document.createElement("b"), s2 = document.createElement("span"); bb.textContent = v[0]; s2.textContent = v[1]; c.appendChild(bb); c.appendChild(s2); st.appendChild(c); });
    dlg.appendChild(st);
    var gr = document.createElement("div"); gr.className = "gr";
    A.forEach(function (a) { var md = document.createElement("div"); md.className = "md" + (got[a[0]] ? "" : " off"); var i = document.createElement("i"); i.textContent = a[1]; var bb = document.createElement("b"); bb.textContent = nm(a)[0]; var s2 = document.createElement("span"); s2.textContent = nm(a)[1];
      md.title = got[a[0]] ? new Date(got[a[0]]).toLocaleDateString(LG) : T.locked; md.appendChild(i); md.appendChild(bb); md.appendChild(s2); gr.appendChild(md); });
    dlg.appendChild(gr); dlg.showModal();
  }
  var FAM = {"guess-the-flag": 1, "candy-line": 1, "burnout-city": 1, "drift-trail": 1, "bumpets": 1};
  addEventListener("bg-play", function (e) {
    playing = true; put("bg_plays", +get("bg_plays", 0) + 1);
    var g = e && e.detail && e.detail.game; if (g && FAM[g]) { var G = gamesTried(); if (G.indexOf(g) < 0) { G.push(g); put("bg_games", G); } }
    check();
  });
  addEventListener("bg-end", function (e) {
    playing = false; var d = (e && e.detail) || {}, g = d.game, sc = +d.score || 0, m = String(d.mode || "");
    if (g === "bumpets" && d.reason === "win") unlock("bp-win");
    if (g === "guess-the-flag" && m === "play" && sc >= 3) unlock("geo-3");
    if (g === "candy-line" && sc >= 10) unlock("candy-10");
    if (g === "burnout-city" && m !== "cones" && sc >= 1000) unlock("burn-1000");
    if ((g === "drift-trail" || m === "cones") && sc >= 3000) unlock("drift-3000");
    setTimeout(flush, 1800);
  });
  addEventListener("bg-post", function () { unlock("wall-post"); });
  // Bumpets (2026-11-22): o jogo avisa modo, vitoria, gols/zonas e missao cumprida
  addEventListener("bb-end", function (e) { var d = (e && e.detail) || {}, m = d.mode;
    if (m === "soccer" && d.val >= 3) unlock("bp-goal3"); if (m === "race" && d.win) unlock("bp-race"); if (m === "zone" && d.win) unlock("bp-zone"); if (d.mis) unlock("bp-mis");
    var M = get("bg_bpm", []); if (m && M.indexOf(m) < 0) { M.push(m); put("bg_bpm", M); } if (M.length >= 4) unlock("bp-all4"); });
  window.BG_ACH = {open: open, count: function () { var n = 0; for (var k in got) n++; return n; }, total: A.length};
  check();
})();
