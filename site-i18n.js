// Idioma automatico das paginas do portal (vitrine, contato, privacidade) - mesmos 6 idiomas dos jogos.
// Escolha: ?lang=xx > idioma do navegador > en. Elementos: data-i18n (texto), data-i18n-html (com links), data-i18n-alt, data-i18n-label.
(function () {
  var S = {
    en: {
      title: "Bartel Games - free quick games in your browser",
      tagline: "Free quick games. Tap and play &mdash; no download.",
      home: "Bartel Games, home", games: "Games", geo_cat: "Quiz · Geography", candy_cat: "Puzzle · Match", burnout_cat: "Driving · Action", drift_cat: "Driving · Skill", bumpets_cat: "Party · Multiplayer", bp_soc_cat: "Sports · Multiplayer", bp_race_cat: "Racing · Multiplayer",
      soon_t: "Coming soon", soon_d: "New games on the way", more: "More from Bartel Games",
      kaze_d: "A 90s-style platformer: run, jump and use the power of the wild masks. Out now on PC and consoles.",
      kaze_alt: "Kaze, a purple rabbit with a red scarf, ready to jump", buy: "Buy Kaze and the Wild Masks",
      tt_t: "Play my game filters on TikTok", tt_n: "{n} followers", tt_b: "Follow",
      yt_t: "Watch my games on YouTube", yt_n: "{n} subscribers", yt_b: "Subscribe",
      privacy: "Privacy", contact: "Contact", ad: "Advertisement", ad_space: "Ad space",
      played: "Played {p} times · ♥ {l}", back: "&larr; Back to games",
      c_title: "Contact - Bartel Games", c_h1: "Contact",
      c_p1: "Found a bug, have an idea for a game, or a business question? Send an e-mail to:",
      c_p2: "We usually reply within a few days."
    },
    pt: {
      title: "Bartel Games - jogos rápidos e grátis no navegador",
      tagline: "Jogos rápidos e grátis. Toque e jogue &mdash; sem baixar nada.",
      home: "Bartel Games, início", games: "Jogos", geo_cat: "Quiz · Geografia", candy_cat: "Puzzle · Combinar", burnout_cat: "Corrida · Ação", drift_cat: "Corrida · Habilidade", bumpets_cat: "Festa · Multijogador", bp_soc_cat: "Esporte · Multijogador", bp_race_cat: "Corrida · Multijogador",
      soon_t: "Em breve", soon_d: "Novos jogos a caminho", more: "Mais da Bartel Games",
      kaze_d: "Um jogo de plataforma no estilo dos anos 90: corra, pule e use o poder das máscaras selvagens. Já disponível para PC e consoles.",
      kaze_alt: "Kaze, personagem coelho roxo de cachecol vermelho, no meio de um salto", buy: "Comprar Kaze and the Wild Masks",
      tt_t: "Jogue meus filtros de jogo no TikTok", tt_n: "{n} seguidores", tt_b: "Seguir",
      yt_t: "Veja meus jogos no YouTube", yt_n: "{n} inscritos", yt_b: "Inscrever-se",
      privacy: "Privacidade", contact: "Contato", ad: "Publicidade", ad_space: "Espaço de anúncio",
      played: "Jogado {p} vezes · ♥ {l}", back: "&larr; Voltar aos jogos",
      c_title: "Contato - Bartel Games", c_h1: "Contato",
      c_p1: "Achou um bug, tem uma ideia de jogo ou um assunto comercial? Mande um e-mail para:",
      c_p2: "Costumamos responder em poucos dias."
    },
    es: {
      title: "Bartel Games - juegos rápidos y gratis en el navegador",
      tagline: "Juegos rápidos y gratis. Toca y juega &mdash; sin descargas.",
      home: "Bartel Games, inicio", games: "Juegos", geo_cat: "Quiz · Geografía", candy_cat: "Puzzle · Combinar", burnout_cat: "Carreras · Acción", drift_cat: "Carreras · Habilidad", bumpets_cat: "Fiesta · Multijugador", bp_soc_cat: "Deportes · Multijugador", bp_race_cat: "Carreras · Multijugador",
      soon_t: "Próximamente", soon_d: "Nuevos juegos en camino", more: "Más de Bartel Games",
      kaze_d: "Un plataformas al estilo de los 90: corre, salta y usa el poder de las máscaras salvajes. Ya disponible en PC y consolas.",
      kaze_alt: "Kaze, personaje conejo morado con bufanda roja, a punto de saltar", buy: "Comprar Kaze and the Wild Masks",
      tt_t: "Juega mis filtros de juegos en TikTok", tt_n: "{n} seguidores", tt_b: "Seguir",
      yt_t: "Mira mis juegos en YouTube", yt_n: "{n} suscriptores", yt_b: "Suscribirse",
      privacy: "Privacidad", contact: "Contacto", ad: "Publicidad", ad_space: "Espacio publicitario",
      played: "Jugado {p} veces · ♥ {l}", back: "&larr; Volver a los juegos",
      c_title: "Contacto - Bartel Games", c_h1: "Contacto",
      c_p1: "¿Encontraste un error, tienes una idea de juego o una consulta comercial? Envía un correo a:",
      c_p2: "Solemos responder en pocos días."
    },
    fr: {
      title: "Bartel Games - jeux rapides et gratuits dans le navigateur",
      tagline: "Jeux rapides et gratuits. Touche et joue &mdash; sans téléchargement.",
      home: "Bartel Games, accueil", games: "Jeux", geo_cat: "Quiz · Géographie", candy_cat: "Puzzle · Association", burnout_cat: "Course · Action", drift_cat: "Course · Adresse", bumpets_cat: "Fête · Multijoueur", bp_soc_cat: "Sport · Multijoueur", bp_race_cat: "Course · Multijoueur",
      soon_t: "Bientôt", soon_d: "De nouveaux jeux arrivent", more: "Plus de Bartel Games",
      kaze_d: "Un jeu de plateforme façon années 90 : cours, saute et utilise le pouvoir des masques sauvages. Disponible sur PC et consoles.",
      kaze_alt: "Kaze, personnage lapin violet à l'écharpe rouge, en plein saut", buy: "Acheter Kaze and the Wild Masks",
      tt_t: "Joue à mes filtres de jeux sur TikTok", tt_n: "{n} abonnés", tt_b: "Suivre",
      yt_t: "Regarde mes jeux sur YouTube", yt_n: "{n} abonnés", yt_b: "S'abonner",
      privacy: "Confidentialité", contact: "Contact", ad: "Publicité", ad_space: "Espace publicitaire",
      played: "Joué {p} fois · ♥ {l}", back: "&larr; Retour aux jeux",
      c_title: "Contact - Bartel Games", c_h1: "Contact",
      c_p1: "Un bug, une idée de jeu ou une question commerciale ? Envoie un e-mail à :",
      c_p2: "Nous répondons en général sous quelques jours."
    },
    de: {
      title: "Bartel Games - schnelle Gratis-Spiele im Browser",
      tagline: "Schnelle Gratis-Spiele. Tippen und spielen &mdash; ohne Download.",
      home: "Bartel Games, Startseite", games: "Spiele", geo_cat: "Quiz · Geografie", candy_cat: "Puzzle · Kombinieren", burnout_cat: "Rennen · Action", drift_cat: "Rennen · Geschick", bumpets_cat: "Party · Mehrspieler", bp_soc_cat: "Sport · Mehrspieler", bp_race_cat: "Rennen · Mehrspieler",
      soon_t: "Demnächst", soon_d: "Neue Spiele unterwegs", more: "Mehr von Bartel Games",
      kaze_d: "Ein Jump'n'Run im Stil der 90er: renne, springe und nutze die Kraft der wilden Masken. Jetzt für PC und Konsolen.",
      kaze_alt: "Kaze, die lila Hasenfigur mit rotem Schal, mitten im Sprung", buy: "Kaze and the Wild Masks kaufen",
      tt_t: "Spiel meine Spielefilter auf TikTok", tt_n: "{n} Follower", tt_b: "Folgen",
      yt_t: "Sieh dir meine Spiele auf YouTube an", yt_n: "{n} Abonnenten", yt_b: "Abonnieren",
      privacy: "Datenschutz", contact: "Kontakt", ad: "Werbung", ad_space: "Werbefläche",
      played: "{p}-mal gespielt · ♥ {l}", back: "&larr; Zurück zu den Spielen",
      c_title: "Kontakt - Bartel Games", c_h1: "Kontakt",
      c_p1: "Einen Fehler gefunden, eine Spielidee oder eine geschäftliche Frage? Schreib eine E-Mail an:",
      c_p2: "Wir antworten meist innerhalb weniger Tage."
    },
    it: {
      title: "Bartel Games - giochi veloci e gratis nel browser",
      tagline: "Giochi veloci e gratis. Tocca e gioca &mdash; senza download.",
      home: "Bartel Games, home", games: "Giochi", geo_cat: "Quiz · Geografia", candy_cat: "Puzzle · Abbinamenti", burnout_cat: "Corse · Azione", drift_cat: "Corse · Abilità", bumpets_cat: "Party · Multigiocatore", bp_soc_cat: "Sport · Multigiocatore", bp_race_cat: "Corse · Multigiocatore",
      soon_t: "In arrivo", soon_d: "Nuovi giochi in arrivo", more: "Altro da Bartel Games",
      kaze_d: "Un platform in stile anni '90: corri, salta e usa il potere delle maschere selvagge. Disponibile su PC e console.",
      kaze_alt: "Kaze, personaggio coniglio viola con la sciarpa rossa, in pieno salto", buy: "Compra Kaze and the Wild Masks",
      tt_t: "Gioca ai miei filtri di gioco su TikTok", tt_n: "{n} follower", tt_b: "Segui",
      yt_t: "Guarda i miei giochi su YouTube", yt_n: "{n} iscritti", yt_b: "Iscriviti",
      privacy: "Privacy", contact: "Contatti", ad: "Pubblicità", ad_space: "Spazio pubblicitario",
      played: "Giocato {p} volte · ♥ {l}", back: "&larr; Torna ai giochi",
      c_title: "Contatti - Bartel Games", c_h1: "Contatti",
      c_p1: "Hai trovato un bug, hai un'idea per un gioco o una domanda commerciale? Scrivi a:",
      c_p2: "Di solito rispondiamo in pochi giorni."
    }
  };
  var tag = "en";
  try {
    var q = window.BG_LANG || new URLSearchParams(location.search).get("lang");
    var list = q ? [q] : (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || "en"]);
    for (var i = 0; i < list.length; i++) { var b = String(list[i]).toLowerCase().split("-")[0]; if (S[b]) { tag = String(list[i]); break; } }
  } catch (e) {}
  var base = tag.toLowerCase().split("-")[0]; if (!S[base]) { base = "en"; tag = "en"; }
  var I = {
    lang: base, tag: tag, dict: S,
    add: function (more) { for (var l in more) for (var k in more[l]) if (S[l]) S[l][k] = more[l][k]; },
    t: function (k, f) { var s = S[base][k] || S.en[k] || k; if (f) for (var x in f) s = s.split("{" + x + "}").join(f[x]); return s; },
    num: function (n) { try { return new Intl.NumberFormat(tag, {notation: "compact", maximumFractionDigits: 1}).format(n); } catch (e) { return String(n); } }
  };
  window.SITE_I18N = I;
  document.documentElement.lang = tag;
  function apply() {
    var t = document.documentElement.getAttribute("data-title-key"); if (t) document.title = I.t(t);
    var j, e;
    e = document.querySelectorAll("[data-i18n]"); for (j = 0; j < e.length; j++) e[j].textContent = I.t(e[j].getAttribute("data-i18n"));
    e = document.querySelectorAll("[data-i18n-html]"); for (j = 0; j < e.length; j++) e[j].innerHTML = I.t(e[j].getAttribute("data-i18n-html"));
    e = document.querySelectorAll("[data-i18n-alt]"); for (j = 0; j < e.length; j++) e[j].alt = I.t(e[j].getAttribute("data-i18n-alt"));
    e = document.querySelectorAll("[data-i18n-label]"); for (j = 0; j < e.length; j++) e[j].setAttribute("aria-label", I.t(e[j].getAttribute("data-i18n-label")));
    e = document.querySelectorAll("[data-i18n-num]"); for (j = 0; j < e.length; j++) { var p = e[j].getAttribute("data-i18n-num").split(":"); e[j].textContent = I.t(p[0], {n: I.num(+p[1])}); }
    // mantem o idioma escolhido por ?lang= ao navegar dentro do site e nos jogos
    var q2 = new URLSearchParams(location.search).get("lang");
    if (q2) { e = document.querySelectorAll("a[href]"); for (j = 0; j < e.length; j++) { var h = e[j].getAttribute("href"); if (h && !/^(https?:|mailto:|#)/.test(h) && h.indexOf("lang=") < 0) e[j].setAttribute("href", h + (h.indexOf("?") < 0 ? "?" : "&") + "lang=" + encodeURIComponent(q2)); } }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply); else apply();
})();
