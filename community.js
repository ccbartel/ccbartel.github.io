// Mural da comunidade (2026-11-21): botao na barra do topo de cada jogo -> janela com posts do jogo
// (ideia, critica, procuro parceiro com codigo de sala, conversa) e respostas. Autor = apelido do site.
// Servidor: RPCs post_list / post_add / post_report / post_delete (src/supabase/2026-11-21_mural.sql), via BG_SOCIAL.wall.
// Texto dos usuarios entra SEMPRE por textContent (nunca innerHTML).
(function () {
  var parts = location.pathname.split("/").filter(Boolean), LP = /^(pt|es)$/.test(parts[0] || "") ? "/" + parts.shift() : ""; // /pt/..., /es/... = versao traduzida
  var seg = (parts[0] || "").toLowerCase();
  var GAME = {"geo-quiz": "guess-the-flag", "bumpets-soccer": "bumpets", "bumpets-race": "bumpets"}[seg] || seg;
  var HOME = !GAME; // home (/): vitrine com os posts mais novos de todos os jogos (#bg-community)
  // como montar o link da sala de cada jogo online (sem entrada = o jogo nao tem sala, a opcao "parceiro" nao pede codigo)
  var ROOM = {"bumpets": function (c) { return location.origin + location.pathname + "#" + c; },
              "candy-line": function (c) { return location.origin + LP + "/candy-line/?sala=" + c; }}[GAME];
  var TX = {
    en: {tmrw: "Tomorrow: {g}", tdT: "Today's challenge", tdSub: "A new daily mission every day in this game", tdGo: "Play", tdDone: "✓ played today", stN: "🔥 {n} days in a row", st1: "🔥 1 day - come back tomorrow to keep it going", stKeep: "Play today to keep your streak!", st0: "Play today and start a streak 🔥", cont: "Continue playing", hT: "Community", hSub: "Ideas, feedback and people to play with. Open the wall in any game.", hEmpty: "No posts yet. Open a game and be the first!", hOpen: "Open wall", btn: "Community", ttl: "Community", all: "All", idea: "Idea", crit: "Feedback", mate: "Looking to play", chat: "Chat",
      ph: "Share an idea, give feedback or find someone to play with...", room: "Room code (optional)", post: "Post", rules: "Be kind. No swearing, no links, no personal info.",
      reply: "Reply", replies: "Replies", report: "Report", reported: "Reported. Thanks!", del: "Delete", delQ: "Delete this post?", more: "Load more", empty: "No posts yet. Be the first!",
      join: "Join room {c}", rph: "Write a reply...", send: "Send", close: "Close", err: "Could not load. Check your connection.",
      len: "Write 2 to 400 characters.", bad: "That text has a word that is not allowed.", link: "Links are not allowed.", wait: "Too many posts in a short time. Try again in a few minutes.",
      roomBad: "Room code: 3 to 8 letters or numbers.", gone: "That post is no longer available.", pick: "Choose a nickname to post", off: "Could not post. Try again."},
    pt: {tmrw: "Amanhã: {g}", tdT: "Desafio de hoje", tdSub: "Missão nova todo dia neste jogo", tdGo: "Jogar", tdDone: "✓ você jogou hoje", stN: "🔥 {n} dias seguidos", st1: "🔥 1 dia - volte amanhã para continuar a sequência", stKeep: "Jogue hoje para manter a sequência!", st0: "Jogue hoje e comece uma sequência 🔥", cont: "Continue jogando", hT: "Comunidade", hSub: "Ideias, críticas e gente para jogar junto. Abra o mural em qualquer jogo.", hEmpty: "Nenhum post ainda. Abra um jogo e seja o primeiro!", hOpen: "Abrir mural", btn: "Comunidade", ttl: "Comunidade", all: "Tudo", idea: "Ideia", crit: "Crítica", mate: "Procuro parceiro", chat: "Conversa",
      ph: "Dê uma ideia, faça uma crítica ou chame alguém para jogar...", room: "Código da sala (opcional)", post: "Publicar", rules: "Seja gentil. Sem palavrão, sem links, sem dados pessoais.",
      reply: "Responder", replies: "Respostas", report: "Denunciar", reported: "Denunciado. Obrigado!", del: "Apagar", delQ: "Apagar este post?", more: "Ver mais", empty: "Nenhum post ainda. Seja o primeiro!",
      join: "Entrar na sala {c}", rph: "Escreva uma resposta...", send: "Enviar", close: "Fechar", err: "Não deu para carregar. Confira sua conexão.",
      len: "Escreva de 2 a 400 caracteres.", bad: "Esse texto tem uma palavra que não é permitida.", link: "Links não são permitidos.", wait: "Muitos posts em pouco tempo. Tente de novo em alguns minutos.",
      roomBad: "Código da sala: 3 a 8 letras ou números.", gone: "Esse post não está mais disponível.", pick: "Escolha um apelido para publicar", off: "Não deu para publicar. Tente de novo."},
    es: {tmrw: "Mañana: {g}", tdT: "Desafío de hoy", tdSub: "Una misión nueva cada día en este juego", tdGo: "Jugar", tdDone: "✓ jugaste hoy", stN: "🔥 {n} días seguidos", st1: "🔥 1 día - vuelve mañana para seguir la racha", stKeep: "¡Juega hoy para mantener la racha!", st0: "Juega hoy y empieza una racha 🔥", cont: "Sigue jugando", hT: "Comunidad", hSub: "Ideas, críticas y gente para jugar. Abre el muro en cualquier juego.", hEmpty: "Aún no hay publicaciones. ¡Abre un juego y sé el primero!", hOpen: "Abrir muro", btn: "Comunidad", ttl: "Comunidad", all: "Todo", idea: "Idea", crit: "Crítica", mate: "Busco compañero", chat: "Charla",
      ph: "Comparte una idea, deja una crítica o busca a alguien para jugar...", room: "Código de sala (opcional)", post: "Publicar", rules: "Sé amable. Sin groserías, sin enlaces, sin datos personales.",
      reply: "Responder", replies: "Respuestas", report: "Denunciar", reported: "Denunciado. ¡Gracias!", del: "Borrar", delQ: "¿Borrar esta publicación?", more: "Ver más", empty: "Aún no hay publicaciones. ¡Sé el primero!",
      join: "Entrar a la sala {c}", rph: "Escribe una respuesta...", send: "Enviar", close: "Cerrar", err: "No se pudo cargar. Revisa tu conexión.",
      len: "Escribe de 2 a 400 caracteres.", bad: "Ese texto tiene una palabra no permitida.", link: "No se permiten enlaces.", wait: "Demasiadas publicaciones en poco tiempo. Inténtalo en unos minutos.",
      roomBad: "Código de sala: 3 a 8 letras o números.", gone: "Esa publicación ya no está disponible.", pick: "Elige un apodo para publicar", off: "No se pudo publicar. Inténtalo de nuevo."},
    fr: {tmrw: "Demain : {g}", tdT: "Défi du jour", tdSub: "Une nouvelle mission chaque jour dans ce jeu", tdGo: "Jouer", tdDone: "✓ joué aujourd'hui", stN: "🔥 {n} jours de suite", st1: "🔥 1 jour - reviens demain pour continuer la série", stKeep: "Joue aujourd'hui pour garder ta série !", st0: "Joue aujourd'hui et lance une série 🔥", cont: "Continuer à jouer", hT: "Communauté", hSub: "Idées, avis et joueurs pour jouer ensemble. Ouvre le mur dans n'importe quel jeu.", hEmpty: "Aucun message pour l'instant. Ouvre un jeu et sois le premier !", hOpen: "Ouvrir le mur", btn: "Communauté", ttl: "Communauté", all: "Tout", idea: "Idée", crit: "Avis", mate: "Cherche partenaire", chat: "Discussion",
      ph: "Partage une idée, donne ton avis ou trouve quelqu'un pour jouer...", room: "Code du salon (facultatif)", post: "Publier", rules: "Sois gentil. Pas de grossièretés, pas de liens, pas d'infos personnelles.",
      reply: "Répondre", replies: "Réponses", report: "Signaler", reported: "Signalé. Merci !", del: "Supprimer", delQ: "Supprimer ce message ?", more: "Voir plus", empty: "Aucun message pour l'instant. Sois le premier !",
      join: "Rejoindre le salon {c}", rph: "Écris une réponse...", send: "Envoyer", close: "Fermer", err: "Chargement impossible. Vérifie ta connexion.",
      len: "Écris de 2 à 400 caractères.", bad: "Ce texte contient un mot interdit.", link: "Les liens ne sont pas autorisés.", wait: "Trop de messages en peu de temps. Réessaie dans quelques minutes.",
      roomBad: "Code du salon : 3 à 8 lettres ou chiffres.", gone: "Ce message n'est plus disponible.", pick: "Choisis un pseudo pour publier", off: "Publication impossible. Réessaie."},
    de: {tmrw: "Morgen: {g}", tdT: "Tagesherausforderung", tdSub: "Jeden Tag eine neue Mission in diesem Spiel", tdGo: "Spielen", tdDone: "✓ heute gespielt", stN: "🔥 {n} Tage in Folge", st1: "🔥 1 Tag - komm morgen wieder, um die Serie fortzusetzen", stKeep: "Spiel heute, um deine Serie zu halten!", st0: "Spiel heute und starte eine Serie 🔥", cont: "Weiterspielen", hT: "Community", hSub: "Ideen, Kritik und Leute zum Mitspielen. Öffne die Pinnwand in jedem Spiel.", hEmpty: "Noch keine Beiträge. Öffne ein Spiel und sei der Erste!", hOpen: "Pinnwand öffnen", btn: "Community", ttl: "Community", all: "Alle", idea: "Idee", crit: "Kritik", mate: "Suche Mitspieler", chat: "Plaudern",
      ph: "Teile eine Idee, gib Feedback oder finde jemanden zum Spielen...", room: "Raumcode (optional)", post: "Posten", rules: "Sei freundlich. Keine Schimpfwörter, keine Links, keine persönlichen Daten.",
      reply: "Antworten", replies: "Antworten", report: "Melden", reported: "Gemeldet. Danke!", del: "Löschen", delQ: "Diesen Beitrag löschen?", more: "Mehr laden", empty: "Noch keine Beiträge. Sei der Erste!",
      join: "Raum {c} beitreten", rph: "Schreib eine Antwort...", send: "Senden", close: "Schließen", err: "Laden fehlgeschlagen. Prüfe deine Verbindung.",
      len: "Schreib 2 bis 400 Zeichen.", bad: "Der Text enthält ein nicht erlaubtes Wort.", link: "Links sind nicht erlaubt.", wait: "Zu viele Beiträge in kurzer Zeit. Versuch es in ein paar Minuten.",
      roomBad: "Raumcode: 3 bis 8 Buchstaben oder Zahlen.", gone: "Dieser Beitrag ist nicht mehr verfügbar.", pick: "Wähle einen Spitznamen zum Posten", off: "Posten fehlgeschlagen. Versuch es erneut."},
    it: {tmrw: "Domani: {g}", tdT: "Sfida di oggi", tdSub: "Una nuova missione ogni giorno in questo gioco", tdGo: "Gioca", tdDone: "✓ giocato oggi", stN: "🔥 {n} giorni di fila", st1: "🔥 1 giorno - torna domani per continuare la serie", stKeep: "Gioca oggi per mantenere la serie!", st0: "Gioca oggi e inizia una serie 🔥", cont: "Continua a giocare", hT: "Community", hSub: "Idee, critiche e persone con cui giocare. Apri la bacheca in qualsiasi gioco.", hEmpty: "Ancora nessun post. Apri un gioco e sii il primo!", hOpen: "Apri bacheca", btn: "Community", ttl: "Community", all: "Tutto", idea: "Idea", crit: "Critica", mate: "Cerco compagno", chat: "Chiacchiere",
      ph: "Condividi un'idea, lascia una critica o trova qualcuno con cui giocare...", room: "Codice stanza (facoltativo)", post: "Pubblica", rules: "Sii gentile. Niente parolacce, niente link, niente dati personali.",
      reply: "Rispondi", replies: "Risposte", report: "Segnala", reported: "Segnalato. Grazie!", del: "Elimina", delQ: "Eliminare questo post?", more: "Mostra altri", empty: "Ancora nessun post. Sii il primo!",
      join: "Entra nella stanza {c}", rph: "Scrivi una risposta...", send: "Invia", close: "Chiudi", err: "Impossibile caricare. Controlla la connessione.",
      len: "Scrivi da 2 a 400 caratteri.", bad: "Il testo contiene una parola non consentita.", link: "I link non sono consentiti.", wait: "Troppi post in poco tempo. Riprova tra qualche minuto.",
      roomBad: "Codice stanza: da 3 a 8 lettere o numeri.", gone: "Questo post non è più disponibile.", pick: "Scegli un nickname per pubblicare", off: "Impossibile pubblicare. Riprova."}
  };
  var LG = String(document.documentElement.lang || navigator.language || "en").slice(0, 2).toLowerCase();
  function T(k) { var t = TX[LG] || TX.en; return t[k] || TX.en[k] || k; }
  var KCOL = {idea: "#f7b60c", crit: "#ff7a59", mate: "#36c98e", chat: "#6aa8ff"};

  var css = "#topbar .back span{white-space:nowrap}@media (max-width:430px){#topbar .tb-r{gap:5px}#topbar .back{padding:0 12px 0 8px}#topbar .topshare{padding:0 10px}}@media (max-width:400px){#topbar:has(.topsnd) .back span{display:none}#topbar:has(.topsnd) .back{padding:0 9px}}" + /* com o botao do mural a barra apertou no celular (2026-11-21) */
    "#bgw-btn{display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;cursor:pointer;color:#fff;background:#ffffff14;border:1.5px solid #ffffff38}" +
    "#bgw-btn{position:relative}#bgw-btn.new::after{content:\"\";position:absolute;top:1px;right:1px;width:11px;height:11px;border-radius:50%;background:#ff3b5c;border:2px solid #0d1430}" +
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
  css += "#bg-today{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:14px;margin:26px 0 2px}#bg-today[hidden]{display:none}#bg-today.td-solo{grid-template-columns:1fr}#bg-today .td-daily{position:relative;overflow:hidden}#bg-today .td-daily>*{position:relative}#bg-today .td-daily::before{content:\"\";position:absolute;top:0;right:0;bottom:0;width:58%;background:var(--bg) center 30%/cover no-repeat;opacity:.55;-webkit-mask-image:linear-gradient(90deg,transparent,#000 70%);mask-image:linear-gradient(90deg,transparent,#000 70%)}#bg-today:not(.td-solo) .td-daily::before{width:45%;opacity:.35}#bg-today .td-next{font-style:normal;font-size:13px;color:#c9b8ff;margin-top:6px}@media (max-width:680px){#bg-today .td-daily::before{width:55%;opacity:.22}}@media (max-width:680px){#bg-today{grid-template-columns:1fr}}" +
    "#bg-today .td-daily{display:flex;gap:14px;align-items:center;padding:12px;border-radius:18px;text-decoration:none;color:#fff;background:linear-gradient(135deg,#3a1f78 0%,#13265a 70%);border:1px solid #f7b60c66;transition:transform .15s,border-color .15s}" +
    "#bg-today .td-daily:hover,#bg-today .td-daily:focus-visible{transform:translateY(-2px);border-color:var(--gold,#f7b60c);outline:none}" +
    "#bg-today .td-daily img{align-self:center;height:112px;width:auto;aspect-ratio:3/4;object-fit:cover;border-radius:12px;flex:none;box-shadow:0 6px 16px #0007}" +
    "#bg-today .td-tx{display:flex;flex-direction:column;justify-content:center;gap:3px;min-width:0}#bg-today .td-tx small{color:var(--gold2,#ffe27a);font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:.04em}" +
    "#bg-today .td-tx b{font:800 24px/1.1 var(--title,system-ui)}#bg-today .td-tx span{color:var(--muted,#b9c6e8);font-size:14px;line-height:1.3}" +
    "#bg-today .td-go,#bg-today .td-done{align-self:flex-start;margin-top:6px;font-style:normal;font-weight:700;padding:6px 14px;border-radius:999px}" +
    "#bg-today .td-go{background:linear-gradient(180deg,#ffe27a,#f7b60c);color:#2a1306}#bg-today .td-done{background:#36c98e33;color:#8ff0c4}" +
    "#bg-today .td-side{padding:12px 14px;border-radius:18px;background:var(--card,#0b1736);border:1px solid var(--line,#ffffff1a)}" +
    "#bg-today .td-streak{margin:0;font:800 19px/1.25 var(--title,system-ui)}#bg-today .td-keep{margin:4px 0 0;color:var(--gold2,#ffe27a);font-size:14px}" +
    "#bg-today .td-ct{margin:10px 0 6px;color:var(--muted,#b9c6e8);font-size:13px;font-weight:700}#bg-today .td-row{display:flex;gap:8px;flex-wrap:wrap}" +
    "#bg-today .td-chip{display:flex;align-items:center;gap:8px;padding:4px 10px 4px 4px;border-radius:12px;background:#ffffff0d;border:1px solid #ffffff1a;color:#fff;text-decoration:none;font-weight:700;font-size:14px}" +
    "#bg-today .td-chip:hover{border-color:var(--gold,#f7b60c)}#bg-today .td-chip img{width:30px;height:40px;object-fit:cover;border-radius:7px}";
  css += "#bg-community{margin-bottom:34px}#bg-community .cm-empty{margin:0}";
  css += "#bg-community .cm-sub{color:var(--muted,#b9c6e8);margin:-6px 0 14px;font-size:15px}" +
    "#bg-community .cm-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}" +
    "#bg-community .cm-post{display:flex;flex-direction:column;gap:6px;padding:12px 14px;border-radius:16px;background:var(--card,#0b1736);border:1px solid var(--line,#ffffff1a);color:#fff;text-decoration:none;transition:transform .15s,border-color .15s}" +
    "#bg-community .cm-post:hover,#bg-community .cm-post:focus-visible{transform:translateY(-2px);border-color:var(--gold,#f7b60c);outline:none}" +
    "#bg-community .cm-h{display:flex;align-items:center;gap:8px;font-size:13px}#bg-community .cm-g{color:var(--muted,#b9c6e8);font-weight:700}" +
    "#bg-community .bgw-tag{padding:2px 8px;border-radius:999px;font-weight:700;font-size:12px;color:#0d1430}" +
    "#bg-community .cm-tx{margin:0;font:400 15px/1.4 system-ui,sans-serif;overflow-wrap:anywhere}#bg-community .cm-f{font-size:13px;color:var(--muted,#b9c6e8)}#bg-community .cm-f b{color:#fff}" +
    "#bg-community .cm-room{align-self:flex-start;padding:6px 10px;border-radius:10px;background:#36c98e;color:#06261a;font-weight:700;font-size:14px}" +
    "#bg-community .cm-empty{color:var(--muted,#b9c6e8)}";
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
      if (reset && !filter && rs[0]) { newest = Math.max(newest, rs[0].id); seen(); }
      rs.forEach(function (p) { list.appendChild(postEl(p, false)); last = p.id; });
      if (rs.length === 20) { var mb = el("button", "moreb", T("more")); mb.type = "button"; mb.onclick = function () { load(false); }; list.appendChild(mb); }
    }, function (e) { console.error("[mural] post_list", e); list.textContent = ""; list.appendChild(el("div", "empty", T("err"))); });
  }
  function open() { if (!built) build(); dlg.showModal(); load(true); seen(); }
  // bolinha de post novo no botao: compara o post mais novo do jogo com o ultimo visto neste aparelho
  var SK = "bgw_seen_" + GAME, newest = 0;
  function seen() { if (newest) try { localStorage.setItem(SK, String(newest)); } catch (e) {} var b = document.getElementById("bgw-btn"); if (b) b.classList.remove("new"); }
  function checkNew() {
    call("post_list", {p_game: GAME, p_kind: null, p_before: null, p_parent: null, p_limit: 1}).then(function (rs) {
      newest = rs && rs[0] ? rs[0].id : 0; var old = 0; try { old = +localStorage.getItem(SK) || 0; } catch (e) {}
      var b = document.getElementById("bgw-btn"); if (b && newest > old && !(dlg && dlg.open)) b.classList.add("new");
    }, function () {});
  }
  var PAGE = {"guess-the-flag": "geo-quiz"}, GNAME = {"guess-the-flag": "Geo Quiz", "candy-line": "Candy Line", "burnout-city": "Burnout City", "drift-trail": "Drift Trail", "bumpets": "Bumpets"};
  var ROOMS = {"bumpets": function (c) { return LP + "/bumpets/#" + c; }, "candy-line": function (c) { return LP + "/candy-line/?sala=" + c; }};
  // caixa "Hoje" da home (2026-11-21): desafio do dia (gira entre os jogos com missao diaria), sequencia de dias e continue jogando
  var DAILY = ["geo-quiz", "candy-line", "burnout-city"];
  function todayBox() {
    var box = document.getElementById("bg-today"); if (!box) return;
    var dd = new Date().toLocaleDateString("sv"), RC = [], DY = [];
    try { RC = JSON.parse(localStorage.getItem("bg_recent") || "[]"); DY = JSON.parse(localStorage.getItem("bg_days") || "[]"); } catch (e) {}
    function card(pg) { var cs = document.querySelectorAll(".grid .card"); for (var i = 0; i < cs.length; i++) { var h = (cs[i].getAttribute("href") || "").replace(/^(pt|es)\//, ""); if (h === pg + "/") return cs[i]; } return null; }
    function title(c) { var t = c && c.querySelector(".cover-t"); return t ? [].map.call(t.children, function (x) { return x.textContent; }).join(" ") : ""; }
    function cover(c) { var i = c.querySelector("img.cover"); return i ? i.getAttribute("src") : ""; }
    var dayN = Math.floor(Date.parse(dd + "T12:00:00Z") / 864e5), pg = DAILY[dayN % DAILY.length], c = card(pg);
    box.textContent = "";
    if (c) {
      var a = el("a", "td-daily"); a.href = LP + "/" + pg + "/";
      var im = el("img"); im.src = cover(c); im.alt = ""; im.width = 84; im.height = 112; a.appendChild(im);
      var tx = el("div", "td-tx"); tx.appendChild(el("small", null, T("tdT"))); tx.appendChild(el("b", null, title(c))); tx.appendChild(el("span", null, T("tdSub")));
      var done = RC.some(function (x) { return x.p === pg && x.d === dd; }); tx.appendChild(el("i", done ? "td-done" : "td-go", done ? T("tdDone") : T("tdGo") + " ›"));
      var nx = card(DAILY[(dayN + 1) % DAILY.length]); if (nx) tx.appendChild(el("em", "td-next", T("tmrw").replace("{g}", title(nx))));
      a.style.setProperty("--bg", "url(\"" + cover(c) + "\")");
      a.appendChild(tx); box.appendChild(a);
      /* capa da altura do texto: do topo do "Desafio de hoje" a base do "Amanha" (pedido dele 2026-11-21) */
      var fit = function () { var f = tx.firstChild.getBoundingClientRect(), l = tx.lastChild.getBoundingClientRect(); if (l.bottom > f.top) im.style.height = Math.max(96, Math.round(l.bottom - f.top)) + "px"; };
      requestAnimationFrame(fit); addEventListener("resize", fit); if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    }
    if (!DY.length && !RC.length) { box.classList.add("td-solo"); box.hidden = false; return; } /* 1a visita: so o desafio (jogos primeiro na home) */
    box.classList.remove("td-solo");
    var side = el("div", "td-side"), n = 0, d0 = new Date(dd + "T12:00:00");
    var played = DY.indexOf(dd) >= 0;
    for (var k = played ? 0 : 1; k < 400; k++) { var dk = new Date(d0.getTime() - k * 864e5).toLocaleDateString("sv"); if (DY.indexOf(dk) >= 0) n++; else break; }
    side.appendChild(el("p", "td-streak", n >= 2 ? T("stN").replace("{n}", n) : (n === 1 && played) ? T("st1") : n >= 1 ? T("stN").replace("{n}", n) : T("st0")));
    if (n >= 1 && !played) side.appendChild(el("p", "td-keep", T("stKeep")));
    var cont = RC.filter(function (x) { return card(x.p); }).slice(0, 3);
    if (cont.length) {
      side.appendChild(el("p", "td-ct", T("cont"))); var row = el("div", "td-row");
      cont.forEach(function (x) { var cc = card(x.p), l = el("a", "td-chip"); l.href = LP + "/" + x.p + "/"; var i2 = el("img"); i2.src = cover(cc); i2.alt = ""; l.appendChild(i2); l.appendChild(el("span", null, title(cc))); row.appendChild(l); });
      side.appendChild(row);
    }
    box.appendChild(side); box.hidden = false;
  }
  function homeFeed() {
    var sec = document.getElementById("bg-community"); if (!sec) return;
    var h = sec.querySelector("h2"), sub = sec.querySelector(".cm-sub"), box = sec.querySelector(".cm-list");
    h.textContent = T("hT"); sub.textContent = T("hSub");
    function draw(rs) {
      box.textContent = "";
      if (!rs || !rs.length) { box.appendChild(el("p", "cm-empty", T("hEmpty"))); return; }
      rs.forEach(function (p) {
        var a = el("a", "cm-post"); a.href = LP + "/" + (PAGE[p.game] || p.game) + "/#mural";
        var hd = el("div", "cm-h"), tg = el("span", "bgw-tag", T(p.kind)); tg.style.background = KCOL[p.kind] || "#ccc";
        hd.appendChild(tg); hd.appendChild(el("span", "cm-g", GNAME[p.game] || p.game));
        a.appendChild(hd); a.appendChild(el("p", "cm-tx", p.body.length > 160 ? p.body.slice(0, 157) + "..." : p.body));
        var ft = el("div", "cm-f"); ft.appendChild(el("b", null, p.name)); ft.appendChild(el("span", null, " · " + ago(p.at) + (p.replies ? " · 💬 " + p.replies : "")));
        a.appendChild(ft);
        if (p.room && ROOMS[p.game]) { var j = el("span", "cm-room", T("join").replace("{c}", p.room)); j.onclick = function (e) { e.preventDefault(); location.href = ROOMS[p.game](p.room); }; a.appendChild(j); }
        box.appendChild(a);
      });
    }
    function go() { if (!S() || !S().wallRecent) return setTimeout(go, 200); S().wallRecent(6).then(draw, function () { draw([]); }); }
    go();
  }

  function addButton() {
    var bar = document.querySelector("#topbar .tb-r"); if (!bar || document.getElementById("bgw-btn")) return;
    var b = el("button"); b.id = "bgw-btn"; b.type = "button"; b.title = T("btn"); b.setAttribute("aria-label", T("btn")); b.setAttribute("aria-haspopup", "dialog");
    b.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4h0A2.5 2.5 0 0 1 3 13.5" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round" stroke-linecap="round"/><path d="M8 8.5h8M8 12h5" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/></svg>';
    b.onclick = open;
    bar.insertBefore(b, bar.firstChild.nextSibling); // depois do "como jogar"
    if (/[#?&]mural\b/.test(location.search + location.hash)) setTimeout(open, 300);
  }
  // atalhos das paginas de categoria na home (2026-11-21; paginas geradas por src/categorias.py)
  var CATL = {en: [["/car-games/", "🏎️ Car games"], ["/multiplayer-games/", "👫 Multiplayer"], ["/puzzle-and-quiz-games/", "🧠 Puzzle & quiz"]],
    pt: [["/pt/jogos-de-carro/", "🏎️ Jogos de carro"], ["/pt/jogos-multijogador/", "👫 Multijogador"], ["/pt/jogos-de-raciocinio/", "🧠 Raciocínio"]],
    es: [["/es/juegos-de-autos/", "🏎️ Juegos de autos"], ["/es/juegos-multijugador/", "👫 Multijugador"], ["/es/juegos-de-ingenio/", "🧠 Ingenio"]]};
  function catChips() { var h = document.getElementById("games-t"); if (!h || document.querySelector(".cat-chips")) return; var nav = el("nav", "cat-chips");
    (CATL[LP.slice(1) || "en"] || CATL.en).forEach(function (c) { var a = el("a", "chip", c[1]); a.href = c[0]; nav.appendChild(a); }); h.parentNode.insertBefore(nav, h.nextSibling); }
  function init() { if (HOME) { todayBox(); catChips(); homeFeed(); } else if (document.querySelector("#topbar .tb-r")) { addButton(); checkNew(); } } /* pagina de categoria: nem mural nem bolinha */
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
