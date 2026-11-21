// Mural da comunidade (2026-11-21): botao na barra do topo de cada jogo -> janela com posts do jogo
// (ideia, critica, procuro parceiro com codigo de sala, conversa) e respostas. Autor = apelido do site.
// Servidor: RPCs post_list / post_add / post_report / post_delete (src/supabase/2026-11-21_mural.sql), via BG_SOCIAL.wall.
// Texto dos usuarios entra SEMPRE por textContent (nunca innerHTML).
(function () {
  var seg = (location.pathname.split("/").filter(Boolean)[0] || "").toLowerCase();
  var GAME = {"geo-quiz": "guess-the-flag", "bumpets-soccer": "bumpets", "bumpets-race": "bumpets"}[seg] || seg;
  if (!GAME) return;
  // como montar o link da sala de cada jogo online (sem entrada = o jogo nao tem sala, a opcao "parceiro" nao pede codigo)
  var ROOM = {"bumpets": function (c) { return location.origin + location.pathname + "#" + c; },
              "candy-line": function (c) { return location.origin + "/candy-line/?sala=" + c; }}[GAME];
  var TX = {
    en: {btn: "Community", ttl: "Community", all: "All", idea: "Idea", crit: "Feedback", mate: "Looking to play", chat: "Chat",
      ph: "Share an idea, give feedback or find someone to play with...", room: "Room code (optional)", post: "Post", rules: "Be kind. No swearing, no links, no personal info.",
      reply: "Reply", replies: "Replies", report: "Report", reported: "Reported. Thanks!", del: "Delete", delQ: "Delete this post?", more: "Load more", empty: "No posts yet. Be the first!",
      join: "Join room {c}", rph: "Write a reply...", send: "Send", close: "Close", err: "Could not load. Check your connection.",
      len: "Write 2 to 400 characters.", bad: "That text has a word that is not allowed.", link: "Links are not allowed.", wait: "Too many posts in a short time. Try again in a few minutes.",
      roomBad: "Room code: 3 to 8 letters or numbers.", gone: "That post is no longer available.", pick: "Choose a nickname to post", off: "Could not post. Try again."},
    pt: {btn: "Comunidade", ttl: "Comunidade", all: "Tudo", idea: "Ideia", crit: "Crítica", mate: "Procuro parceiro", chat: "Conversa",
      ph: "Dê uma ideia, faça uma crítica ou chame alguém para jogar...", room: "Código da sala (opcional)", post: "Publicar", rules: "Seja gentil. Sem palavrão, sem links, sem dados pessoais.",
      reply: "Responder", replies: "Respostas", report: "Denunciar", reported: "Denunciado. Obrigado!", del: "Apagar", delQ: "Apagar este post?", more: "Ver mais", empty: "Nenhum post ainda. Seja o primeiro!",
      join: "Entrar na sala {c}", rph: "Escreva uma resposta...", send: "Enviar", close: "Fechar", err: "Não deu para carregar. Confira sua conexão.",
      len: "Escreva de 2 a 400 caracteres.", bad: "Esse texto tem uma palavra que não é permitida.", link: "Links não são permitidos.", wait: "Muitos posts em pouco tempo. Tente de novo em alguns minutos.",
      roomBad: "Código da sala: 3 a 8 letras ou números.", gone: "Esse post não está mais disponível.", pick: "Escolha um apelido para publicar", off: "Não deu para publicar. Tente de novo."},
    es: {btn: "Comunidad", ttl: "Comunidad", all: "Todo", idea: "Idea", crit: "Crítica", mate: "Busco compañero", chat: "Charla",
      ph: "Comparte una idea, deja una crítica o busca a alguien para jugar...", room: "Código de sala (opcional)", post: "Publicar", rules: "Sé amable. Sin groserías, sin enlaces, sin datos personales.",
      reply: "Responder", replies: "Respuestas", report: "Denunciar", reported: "Denunciado. ¡Gracias!", del: "Borrar", delQ: "¿Borrar esta publicación?", more: "Ver más", empty: "Aún no hay publicaciones. ¡Sé el primero!",
      join: "Entrar a la sala {c}", rph: "Escribe una respuesta...", send: "Enviar", close: "Cerrar", err: "No se pudo cargar. Revisa tu conexión.",
      len: "Escribe de 2 a 400 caracteres.", bad: "Ese texto tiene una palabra no permitida.", link: "No se permiten enlaces.", wait: "Demasiadas publicaciones en poco tiempo. Inténtalo en unos minutos.",
      roomBad: "Código de sala: 3 a 8 letras o números.", gone: "Esa publicación ya no está disponible.", pick: "Elige un apodo para publicar", off: "No se pudo publicar. Inténtalo de nuevo."},
    fr: {btn: "Communauté", ttl: "Communauté", all: "Tout", idea: "Idée", crit: "Avis", mate: "Cherche partenaire", chat: "Discussion",
      ph: "Partage une idée, donne ton avis ou trouve quelqu'un pour jouer...", room: "Code du salon (facultatif)", post: "Publier", rules: "Sois gentil. Pas de grossièretés, pas de liens, pas d'infos personnelles.",
      reply: "Répondre", replies: "Réponses", report: "Signaler", reported: "Signalé. Merci !", del: "Supprimer", delQ: "Supprimer ce message ?", more: "Voir plus", empty: "Aucun message pour l'instant. Sois le premier !",
      join: "Rejoindre le salon {c}", rph: "Écris une réponse...", send: "Envoyer", close: "Fermer", err: "Chargement impossible. Vérifie ta connexion.",
      len: "Écris de 2 à 400 caractères.", bad: "Ce texte contient un mot interdit.", link: "Les liens ne sont pas autorisés.", wait: "Trop de messages en peu de temps. Réessaie dans quelques minutes.",
      roomBad: "Code du salon : 3 à 8 lettres ou chiffres.", gone: "Ce message n'est plus disponible.", pick: "Choisis un pseudo pour publier", off: "Publication impossible. Réessaie."},
    de: {btn: "Community", ttl: "Community", all: "Alle", idea: "Idee", crit: "Kritik", mate: "Suche Mitspieler", chat: "Plaudern",
      ph: "Teile eine Idee, gib Feedback oder finde jemanden zum Spielen...", room: "Raumcode (optional)", post: "Posten", rules: "Sei freundlich. Keine Schimpfwörter, keine Links, keine persönlichen Daten.",
      reply: "Antworten", replies: "Antworten", report: "Melden", reported: "Gemeldet. Danke!", del: "Löschen", delQ: "Diesen Beitrag löschen?", more: "Mehr laden", empty: "Noch keine Beiträge. Sei der Erste!",
      join: "Raum {c} beitreten", rph: "Schreib eine Antwort...", send: "Senden", close: "Schließen", err: "Laden fehlgeschlagen. Prüfe deine Verbindung.",
      len: "Schreib 2 bis 400 Zeichen.", bad: "Der Text enthält ein nicht erlaubtes Wort.", link: "Links sind nicht erlaubt.", wait: "Zu viele Beiträge in kurzer Zeit. Versuch es in ein paar Minuten.",
      roomBad: "Raumcode: 3 bis 8 Buchstaben oder Zahlen.", gone: "Dieser Beitrag ist nicht mehr verfügbar.", pick: "Wähle einen Spitznamen zum Posten", off: "Posten fehlgeschlagen. Versuch es erneut."},
    it: {btn: "Community", ttl: "Community", all: "Tutto", idea: "Idea", crit: "Critica", mate: "Cerco compagno", chat: "Chiacchiere",
      ph: "Condividi un'idea, lascia una critica o trova qualcuno con cui giocare...", room: "Codice stanza (facoltativo)", post: "Pubblica", rules: "Sii gentile. Niente parolacce, niente link, niente dati personali.",
      reply: "Rispondi", replies: "Risposte", report: "Segnala", reported: "Segnalato. Grazie!", del: "Elimina", delQ: "Eliminare questo post?", more: "Mostra altri", empty: "Ancora nessun post. Sii il primo!",
      join: "Entra nella stanza {c}", rph: "Scrivi una risposta...", send: "Invia", close: "Chiudi", err: "Impossibile caricare. Controlla la connessione.",
      len: "Scrivi da 2 a 400 caratteri.", bad: "Il testo contiene una parola non consentita.", link: "I link non sono consentiti.", wait: "Troppi post in poco tempo. Riprova tra qualche minuto.",
      roomBad: "Codice stanza: da 3 a 8 lettere o numeri.", gone: "Questo post non è più disponibile.", pick: "Scegli un nickname per pubblicare", off: "Impossibile pubblicare. Riprova."}
  };
  var LG = String(document.documentElement.lang || navigator.language || "en").slice(0, 2).toLowerCase();
  function T(k) { var t = TX[LG] || TX.en; return t[k] || TX.en[k] || k; }
  var KCOL = {idea: "#f7b60c", crit: "#ff7a59", mate: "#36c98e", chat: "#6aa8ff"};

  var css = "#bgw-btn{display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;cursor:pointer;color:#fff;background:#ffffff14;border:1.5px solid #ffffff38}" +
    "#bgw-btn:hover,#bgw-btn:focus-visible{background:var(--gold,#f7b60c);border-color:var(--gold,#f7b60c);color:var(--navy,#0d1430);outline:none}" +
    "#bgw{border:0;padding:0;margin:auto;width:min(560px,100vw);height:min(860px,100dvh);max-width:100vw;max-height:100dvh;background:#0b1736;color:#fff;border-radius:18px;font-family:var(--font,system-ui,sans-serif);overflow:hidden}" +
    "@media (max-width:600px){#bgw{width:100vw;height:100dvh;border-radius:0}}" +
    "#bgw::backdrop{background:#000a}" +
    "#bgw .w{display:flex;flex-direction:column;height:100%}" +
    "#bgw header{display:flex;align-items:center;gap:10px;padding:calc(12px + env(safe-area-inset-top,0px)) 16px 10px;border-bottom:1px solid #ffffff1a}" +
    "#bgw h2{flex:1;font:700 22px/1.1 var(--font,system-ui)}#bgw h2 small{display:block;font-size:13px;color:#b9c6e8;font-weight:600}" +
    "#bgw .x{width:38px;height:38px;border-radius:50%;border:1.5px solid #ffffff38;background:#ffffff14;color:#fff;font-size:22px;cursor:pointer}" +
    "#bgw .tabs{display:flex;gap:6px;padding:10px 16px;overflow-x:auto;scrollbar-width:none}#bgw .tabs::-webkit-scrollbar{display:none}" +
    "#bgw .chip{flex:none;padding:7px 12px;border-radius:999px;border:1.5px solid #ffffff38;background:transparent;color:#fff;font:600 14px/1 var(--font,system-ui);cursor:pointer}" +
    "#bgw .chip.on{background:#fff;color:#0d1430;border-color:#fff}" +
    "#bgw .body{flex:1;overflow-y:auto;padding:0 16px 16px;overscroll-behavior:contain}" +
    "#bgw form.new{background:#ffffff0d;border:1px solid #ffffff1a;border-radius:14px;padding:10px;margin-bottom:12px}" +
    "#bgw .kinds{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}#bgw .kinds .chip{font-size:13px;padding:6px 10px}" +
    "#bgw textarea,#bgw input{width:100%;box-sizing:border-box;background:#06102a;color:#fff;border:1.5px solid #ffffff2e;border-radius:10px;padding:9px 10px;font:500 16px/1.35 system-ui,sans-serif;resize:vertical}" +
    "#bgw textarea{min-height:64px}#bgw input{margin-top:6px;text-transform:uppercase}#bgw input::placeholder{text-transform:none}" +
    "#bgw .kinds .chip{border-color:var(--c)}#bgw .kinds .chip.on{background:var(--c);border-color:var(--c);color:#0d1430}" +
    "#bgw textarea:focus,#bgw input:focus{outline:none;border-color:var(--gold,#f7b60c)}" +
    "#bgw .row{display:flex;align-items:center;gap:8px;margin-top:8px}#bgw .row .cnt{flex:1;font-size:12px;color:#b9c6e8}" +
    "#bgw .go{padding:9px 18px;border:0;border-radius:12px;background:linear-gradient(180deg,#ffe27a,#f7b60c);color:#2a1306;font:700 16px/1 var(--font,system-ui);cursor:pointer;box-shadow:0 3px 0 #a86f00}" +
    "#bgw .go:disabled{opacity:.5;cursor:default}" +
    "#bgw .msg{font-size:13px;color:#ffb4a2;margin-top:6px;min-height:0}#bgw .msg:empty{display:none}#bgw .msg.ok{color:#8ff0c4}" +
    "#bgw .rules{font-size:12px;color:#b9c6e8;margin-top:6px}" +
    "#bgw .post{background:#ffffff0a;border:1px solid #ffffff17;border-radius:14px;padding:10px 12px;margin-bottom:10px}" +
    "#bgw .ph{display:flex;align-items:center;gap:8px;font-size:13px;color:#b9c6e8;flex-wrap:wrap}#bgw .ph b{color:#fff;font-size:15px}" +
    "#bgw .bgw-tag{padding:2px 8px;border-radius:999px;font-weight:700;font-size:12px;color:#0d1430}" +
    "#bgw .tx{margin-top:6px;font:400 15px/1.4 system-ui,sans-serif;white-space:pre-wrap;overflow-wrap:anywhere}" +
    "#bgw .joinr{display:inline-block;margin-top:8px;padding:7px 12px;border-radius:10px;background:#36c98e;color:#06261a;font-weight:700;text-decoration:none}" +
    "#bgw .acts{display:flex;gap:4px;margin-top:6px;flex-wrap:wrap}#bgw .acts button{background:none;border:0;color:#b9c6e8;font:600 13px/1 var(--font,system-ui);padding:6px 8px;border-radius:8px;cursor:pointer}" +
    "#bgw .acts button:hover{background:#ffffff14;color:#fff}" +
    "#bgw .reps{margin:6px 0 0 10px;padding-left:10px;border-left:2px solid #ffffff1f}#bgw .reps .post{background:none;border:0;padding:6px 0;margin:0}" +
    "#bgw .reps form{display:flex;gap:6px;margin-top:6px}#bgw .reps textarea{min-height:40px;font-size:15px}" +
    "#bgw .empty,#bgw .load{text-align:center;color:#b9c6e8;padding:24px 0}" +
    "#bgw .moreb{display:block;margin:4px auto 0;padding:8px 16px;border-radius:999px;border:1.5px solid #ffffff38;background:none;color:#fff;font:600 14px/1 var(--font,system-ui);cursor:pointer}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function ago(iso) {
    var s = (Date.now() - new Date(iso).getTime()) / 1000, u = [["year", 31536000], ["month", 2592000], ["day", 86400], ["hour", 3600], ["minute", 60]];
    try { var rf = new Intl.RelativeTimeFormat(LG, {numeric: "auto"}); for (var i = 0; i < u.length; i++) if (s >= u[i][1]) return rf.format(-Math.floor(s / u[i][1]), u[i][0]); return rf.format(0, "minute"); } catch (e) { return ""; }
  }
  function S() { return window.BG_SOCIAL; }
  function call(fn, body) { return S() && S().wall ? S().wall(fn, body) : Promise.reject(new Error("social")); }
  function askName(done) { var r = window.CL_RANK || window.GTF_RANK; if (r && r.askName) r.askName(T("pick"), done); else done(false); }

  var dlg, list, tabsBox, filter = null, last = null, kind = ROOM ? "mate" : "idea", built = false;
  function build() {
    built = true;
    dlg = el("dialog"); dlg.id = "bgw"; dlg.setAttribute("aria-labelledby", "bgw-t");
    var w = el("div", "w"); dlg.appendChild(w);
    var hd = el("header"); var h2 = el("h2", null, T("ttl")); h2.id = "bgw-t";
    var gname = (document.title || "").split(" - ")[0]; if (gname) h2.appendChild(el("small", null, gname));
    var x = el("button", "x", "×"); x.type = "button"; x.setAttribute("aria-label", T("close")); x.onclick = function () { dlg.close(); };
    hd.appendChild(h2); hd.appendChild(x); w.appendChild(hd);
    tabsBox = el("div", "tabs"); w.appendChild(tabsBox);
    [[null, "all"], ["idea", "idea"], ["crit", "crit"], ["mate", "mate"], ["chat", "chat"]].filter(function (t) { return ROOM || t[0] !== "mate"; }).forEach(function (t) {
      var b = el("button", "chip" + (t[0] === filter ? " on" : ""), T(t[1])); b.type = "button";
      b.onclick = function () { filter = t[0]; [].forEach.call(tabsBox.children, function (c) { c.classList.remove("on"); }); b.classList.add("on"); load(true); };
      tabsBox.appendChild(b);
    });
    var body = el("div", "body"); w.appendChild(body);
    body.appendChild(newForm());
    list = el("div"); body.appendChild(list);
    document.body.appendChild(dlg);
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
  }
  function newForm() {
    var f = el("form", "new"), ks = el("div", "kinds"), ta = el("textarea"), room = el("input"), row = el("div", "row"), cnt = el("span", "cnt"), go = el("button", "go", T("post")), msg = el("div", "msg");
    ["idea", "crit", "mate", "chat"].filter(function (k) { return ROOM || k !== "mate"; }).forEach(function (k) { /* sem online (Geo, Burnout, Drift) nao existe "procuro parceiro" (dele, 2026-11-21) */
      var b = el("button", "chip" + (k === kind ? " on" : ""), T(k)); b.type = "button"; b.style.setProperty("--c", KCOL[k]);
      b.onclick = function () { kind = k; [].forEach.call(ks.children, function (c) { c.classList.remove("on"); }); b.classList.add("on"); room.hidden = !(ROOM && k === "mate"); };
      ks.appendChild(b);
    });
    ta.maxLength = 400; ta.placeholder = T("ph"); ta.setAttribute("aria-label", T("ph"));
    room.maxLength = 8; room.placeholder = T("room"); room.autocomplete = "off"; room.hidden = !(ROOM && kind === "mate");
    function upd() { cnt.textContent = ta.value.length + "/400"; } ta.oninput = upd; upd();
    go.type = "submit"; row.appendChild(cnt); row.appendChild(go);
    f.appendChild(ks); f.appendChild(ta); f.appendChild(room); f.appendChild(row); f.appendChild(msg); f.appendChild(el("div", "rules", T("rules")));
    f.onsubmit = function (e) {
      e.preventDefault(); msg.textContent = ""; msg.className = "msg";
      var r = room.hidden ? "" : room.value.replace(/[^a-z0-9]/gi, "");
      if (r && (r.length < 3 || r.length > 8)) { msg.textContent = T("roomBad"); return; }
      go.disabled = true;
      (function send() {
        call("post_add", {p_game: GAME, p_kind: kind, p_body: ta.value, p_room: r || null, p_parent: null}).then(function (res) {
          var c = res && res.code;
          if (c === "name") { go.disabled = false; askName(function (ok) { if (ok) { go.disabled = true; send(); } }); return; }
          go.disabled = false;
          if (c === "ok") { ta.value = ""; room.value = ""; upd(); if (filter && filter !== kind) { filter = null; [].forEach.call(tabsBox.children, function (c2, i) { c2.classList.toggle("on", i === 0); }); } load(true); return; }
          msg.textContent = T({len: "len", bad: "bad", link: "link", wait: "wait", room: "roomBad", gone: "gone"}[c] || "off");
        }, function (err) { console.error("[mural] post_add", err); go.disabled = false; msg.textContent = T("off"); });
      })();
    };
    return f;
  }
  function postEl(p, isReply) {
    var d = el("article", "post"), ph = el("div", "ph");
    if (!isReply) { var tg = el("span", "bgw-tag", T(p.kind)); tg.style.background = KCOL[p.kind] || "#ccc"; ph.appendChild(tg); }
    ph.appendChild(el("b", null, p.name)); ph.appendChild(el("span", null, ago(p.at)));
    d.appendChild(ph); d.appendChild(el("div", "tx", p.body));
    if (p.room && ROOM) { var a = el("a", "joinr", T("join").replace("{c}", p.room)); a.href = ROOM(p.room); a.onclick = function () { dlg.close(); setTimeout(function () { if (location.href.split("#")[0] === a.href.split("#")[0]) location.reload(); }, 0); }; d.appendChild(a); }
    var acts = el("div", "acts");
    if (!isReply) {
      var rb = el("button", null, T("reply") + (p.replies ? " (" + p.replies + ")" : "")); rb.type = "button";
      var reps = null; rb.onclick = function () { if (reps) { reps.remove(); reps = null; return; } reps = repliesEl(p, rb); d.appendChild(reps); };
      acts.appendChild(rb);
    }
    if (p.mine) { var db = el("button", null, T("del")); db.type = "button"; db.onclick = function () { if (!confirm(T("delQ"))) return; call("post_delete", {p_id: p.id}).then(function (r) { if (r === "ok") d.remove(); }); }; acts.appendChild(db); }
    else { var rep = el("button", null, T("report")); rep.type = "button";
      rep.onclick = function () { (function go() { call("post_report", {p_id: p.id}).then(function (r) { if (r === "name") { askName(function (ok) { if (ok) go(); }); return; } rep.textContent = T("reported"); rep.disabled = true; }); })(); };
      acts.appendChild(rep); }
    d.appendChild(acts);
    return d;
  }
  function repliesEl(p, rb) {
    var box = el("div", "reps"), ls = el("div", null), f = el("form"), ta = el("textarea"), go = el("button", "go", T("send")), msg = el("div", "msg");
    ls.appendChild(el("div", "load", "…")); box.appendChild(ls);
    ta.maxLength = 400; ta.placeholder = T("rph"); ta.setAttribute("aria-label", T("rph")); go.type = "submit";
    f.appendChild(ta); f.appendChild(go); box.appendChild(f); box.appendChild(msg);
    function fill() { call("post_list", {p_game: GAME, p_parent: p.id}).then(function (rs) { ls.textContent = ""; (rs || []).forEach(function (r) { ls.appendChild(postEl(r, true)); }); if (rb) rb.textContent = T("reply") + ((rs || []).length ? " (" + rs.length + ")" : ""); }, function () { ls.textContent = T("err"); }); }
    fill();
    f.onsubmit = function (e) {
      e.preventDefault(); msg.textContent = ""; go.disabled = true;
      (function send() {
        call("post_add", {p_game: GAME, p_kind: "chat", p_body: ta.value, p_room: null, p_parent: p.id}).then(function (res) {
          var c = res && res.code; go.disabled = false;
          if (c === "name") { askName(function (ok) { if (ok) send(); }); return; }
          if (c === "ok") { ta.value = ""; fill(); return; }
          msg.textContent = T({len: "len", bad: "bad", link: "link", wait: "wait", gone: "gone"}[c] || "off");
        }, function () { go.disabled = false; msg.textContent = T("off"); });
      })();
    };
    return box;
  }
  function load(reset) {
    if (reset) { last = null; list.textContent = ""; list.appendChild(el("div", "load", "…")); }
    var more = list.querySelector(".moreb"); if (more) more.remove();
    call("post_list", {p_game: GAME, p_kind: filter, p_before: last, p_parent: null, p_limit: 20}).then(function (rs) {
      var ld = list.querySelector(".load"); if (ld) ld.remove();
      rs = rs || [];
      if (reset && !rs.length) { list.appendChild(el("div", "empty", T("empty"))); return; }
      rs.forEach(function (p) { list.appendChild(postEl(p, false)); last = p.id; });
      if (rs.length === 20) { var mb = el("button", "moreb", T("more")); mb.type = "button"; mb.onclick = function () { load(false); }; list.appendChild(mb); }
    }, function (e) { console.error("[mural] post_list", e); list.textContent = ""; list.appendChild(el("div", "empty", T("err"))); });
  }
  function open() { if (!built) build(); dlg.showModal(); load(true); }

  function addButton() {
    var bar = document.querySelector("#topbar .tb-r"); if (!bar || document.getElementById("bgw-btn")) return;
    var b = el("button"); b.id = "bgw-btn"; b.type = "button"; b.title = T("btn"); b.setAttribute("aria-label", T("btn")); b.setAttribute("aria-haspopup", "dialog");
    b.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4h0A2.5 2.5 0 0 1 3 13.5" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round" stroke-linecap="round"/><path d="M8 8.5h8M8 12h5" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/></svg>';
    b.onclick = open;
    bar.insertBefore(b, bar.firstChild.nextSibling); // depois do "como jogar"
    if (/[#?&]mural\b/.test(location.search + location.hash)) setTimeout(open, 300);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", addButton); else addButton();
})();
