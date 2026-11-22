// Idioma automatico da pagina do The Last Driver (en, pt, es, fr, de, it; ?lang=xx para testar).
// So a moldura do site (barra do topo, Como jogar, ranking, compartilhar). O jogo (play.html, no iframe) tem os textos proprios em pt/es/en
// e segue o idioma desta pagina (sem traducao do jogo = ingles).
// Roda cedo (script normal no <head>) para o <html lang> ja sair certo e o Chrome nao oferecer traducao.
(function () {
  var S = {
    en: {title: "The Last Driver", more: "More games", how: "How to play", close: "Close", share: "Share", copied: "Link copied!", ad: "Advertisement", sound: "Sound", like: "Like", back: "Back",
      h1: "Your car drives on its own down a zombie-filled road. Drag left or right (or use the arrow keys) to change lanes.",
      h2: "Dodge cars, holes and lava. Press the jump button (S key) to leap over obstacles and the shoot button (A key) to blast what is in front of you. Jumps and shots are limited: grab pickups on the road to refill them.",
      h3: "Run over zombies and collect coins. Hits take away life; the run ends when your life runs out or you fall into a hole, the water or the lava.",
      h4: "Spend your coins in the Garage: new cars, upgrades, weapons and specials.",
      hm: "Missions: complete the three missions to level up and earn a coin bonus. Ranking: the score of each run counts for the global ranking.",
      ab: "The Last Driver is a free 3D zombie driving game: survive the road, smash zombies and upgrade your car. Plays in your browser on phone or computer. No download, no sign-up.",
      cred: "Sound effects: Stable Audio 3 — Powered by Stability AI · Music: generated with ACE-Step · Illustration: FLUX.2",
      credBy: "by",
      score: "Score", rank: "Ranking", rankPlay: "Ranking", rankDaily: "Ranking", rankYou: "Your position: #{f}", rankEmpty: "No scores yet. Be the first!", rankOff: "Ranking is offline right now. Try again later.", rankLoad: "Loading...",
      shTxt0: "Can you survive the zombie road in The Last Driver? 🧟🚗", shTxt: "I scored {f} points in The Last Driver! Can you beat me? 🧟🚗", friend: "a friend",
      loadErr: "Could not load the game. Please reload the page.", blk1: "This game is not available here", blk2: "Play the official version on our website:"},
    pt: {title: "The Last Driver", more: "Mais jogos", how: "Como jogar", close: "Fechar", share: "Compartilhar", copied: "Link copiado!", ad: "Publicidade", sound: "Som", like: "Curtir", back: "Voltar",
      h1: "Seu carro anda sozinho por uma estrada cheia de zumbis. Arraste para a esquerda ou a direita (ou use as setas) para trocar de faixa.",
      h2: "Desvie de carros, buracos e lava. Toque no botão de pular (tecla S) para saltar os obstáculos e no de atirar (tecla A) para destruir o que está na frente. Pulos e tiros são limitados: pegue os itens na estrada para recarregar.",
      h3: "Atropele zumbis e junte moedas. As batidas tiram vida; a partida acaba quando a vida termina ou quando você cai num buraco, na água ou na lava.",
      h4: "Gaste as moedas na Garagem: carros novos, melhorias, armas e especiais.",
      hm: "Missões: cumpra as três missões para subir de nível e ganhar um bônus de moedas. Ranking: a pontuação de cada partida vale para o ranking mundial.",
      ab: "The Last Driver é um jogo de carro 3D grátis com zumbis: sobreviva à estrada, atropele zumbis e melhore o seu carro. Roda no navegador do celular ou do computador. Sem download, sem cadastro.",
      cred: "Efeitos sonoros: Stable Audio 3 — Powered by Stability AI · Música: gerada com ACE-Step · Ilustração: FLUX.2",
      credBy: "por",
      score: "Pontos", rank: "Ranking", rankPlay: "Ranking", rankDaily: "Ranking", rankYou: "Sua posição: #{f}", rankEmpty: "Ainda sem pontuações. Seja o primeiro!", rankOff: "O ranking está fora do ar agora. Tente mais tarde.", rankLoad: "Carregando...",
      shTxt0: "Você sobrevive à estrada dos zumbis no The Last Driver? 🧟🚗", shTxt: "Fiz {f} pontos no The Last Driver! Consegue me passar? 🧟🚗", friend: "um amigo",
      loadErr: "Não foi possível carregar o jogo. Recarregue a página.", blk1: "Este jogo não está disponível aqui", blk2: "Jogue a versão oficial no nosso site:"},
    es: {title: "The Last Driver", more: "Más juegos", how: "Cómo jugar", close: "Cerrar", share: "Compartir", copied: "¡Enlace copiado!", ad: "Publicidad", sound: "Sonido", like: "Me gusta", back: "Volver",
      h1: "Tu coche avanza solo por una carretera llena de zombis. Arrastra a la izquierda o a la derecha (o usa las flechas) para cambiar de carril.",
      h2: "Esquiva coches, baches y lava. Toca el botón de saltar (tecla S) para pasar por encima de los obstáculos y el de disparar (tecla A) para destruir lo que tienes delante. Los saltos y los disparos son limitados: recoge los objetos de la carretera para recargarlos.",
      h3: "Atropella zombis y junta monedas. Los choques quitan vida; la partida termina cuando se acaba la vida o cuando caes en un bache, en el agua o en la lava.",
      h4: "Gasta las monedas en el Garaje: coches nuevos, mejoras, armas y especiales.",
      hm: "Misiones: cumple las tres misiones para subir de nivel y ganar un bono de monedas. Ranking: la puntuación de cada partida cuenta para el ranking mundial.",
      ab: "The Last Driver es un juego de conducción 3D gratis con zombis: sobrevive a la carretera, atropella zombis y mejora tu coche. Funciona en el navegador del móvil o de la computadora. Sin descargas, sin registro.",
      cred: "Efectos de sonido: Stable Audio 3 — Powered by Stability AI · Música: generada con ACE-Step · Ilustración: FLUX.2",
      credBy: "por",
      score: "Puntos", rank: "Ranking", rankPlay: "Ranking", rankDaily: "Ranking", rankYou: "Tu posición: #{f}", rankEmpty: "Todavía no hay puntuaciones. ¡Sé el primero!", rankOff: "El ranking no está disponible ahora. Inténtalo más tarde.", rankLoad: "Cargando...",
      shTxt0: "¿Sobrevives a la carretera de los zombis en The Last Driver? 🧟🚗", shTxt: "¡Hice {f} puntos en The Last Driver! ¿Me superas? 🧟🚗", friend: "un amigo",
      loadErr: "No se pudo cargar el juego. Recarga la página.", blk1: "Este juego no está disponible aquí", blk2: "Juega la versión oficial en nuestro sitio:"},
    fr: {title: "The Last Driver", more: "Plus de jeux", how: "Comment jouer", close: "Fermer", share: "Partager", copied: "Lien copié !", ad: "Publicité", sound: "Son", like: "J'aime", back: "Retour",
      h1: "Ta voiture roule toute seule sur une route pleine de zombies. Glisse vers la gauche ou la droite (ou utilise les flèches) pour changer de voie.",
      h2: "Évite les voitures, les trous et la lave. Touche le bouton sauter (touche S) pour passer au-dessus des obstacles et le bouton tirer (touche A) pour détruire ce qui est devant toi. Les sauts et les tirs sont limités : ramasse les bonus sur la route pour les recharger.",
      h3: "Écrase les zombies et ramasse les pièces. Les chocs font perdre de la vie ; la partie se termine quand ta vie est à zéro ou si tu tombes dans un trou, dans l'eau ou dans la lave.",
      h4: "Dépense tes pièces au Garage : nouvelles voitures, améliorations, armes et spéciaux.",
      hm: "Missions : réussis les trois missions pour monter de niveau et gagner un bonus de pièces. Classement : le score de chaque partie compte pour le classement mondial.",
      ab: "The Last Driver est un jeu de conduite 3D gratuit avec des zombies : survis à la route, écrase les zombies et améliore ta voiture. Fonctionne dans le navigateur, sur téléphone ou ordinateur. Sans téléchargement ni inscription. Le jeu est en anglais.",
      cred: "Effets sonores : Stable Audio 3 — Powered by Stability AI · Musique : générée avec ACE-Step · Illustration : FLUX.2",
      credBy: "par",
      score: "Score", rank: "Classement", rankPlay: "Classement", rankDaily: "Classement", rankYou: "Ta position : #{f}", rankEmpty: "Pas encore de scores. Sois le premier !", rankOff: "Le classement est indisponible. Réessaie plus tard.", rankLoad: "Chargement...",
      shTxt0: "Survivras-tu à la route des zombies dans The Last Driver ? 🧟🚗", shTxt: "J'ai fait {f} points dans The Last Driver ! Tu peux me battre ? 🧟🚗", friend: "un ami",
      loadErr: "Impossible de charger le jeu. Recharge la page.", blk1: "Ce jeu n'est pas disponible ici", blk2: "Joue à la version officielle sur notre site :"},
    de: {title: "The Last Driver", more: "Mehr Spiele", how: "So wird gespielt", close: "Schließen", share: "Teilen", copied: "Link kopiert!", ad: "Werbung", sound: "Ton", like: "Gefällt mir", back: "Zurück",
      h1: "Dein Auto fährt von selbst über eine Straße voller Zombies. Wische nach links oder rechts (oder nutze die Pfeiltasten), um die Spur zu wechseln.",
      h2: "Weiche Autos, Löchern und Lava aus. Mit der Sprungtaste (Taste S) springst du über Hindernisse, mit der Schusstaste (Taste A) zerstörst du, was vor dir ist. Sprünge und Schüsse sind begrenzt: sammle die Extras auf der Straße, um sie aufzufüllen.",
      h3: "Überfahre Zombies und sammle Münzen. Zusammenstöße kosten Leben; die Runde endet, wenn dein Leben aufgebraucht ist oder du in ein Loch, ins Wasser oder in die Lava fällst.",
      h4: "Gib deine Münzen in der Garage aus: neue Autos, Upgrades, Waffen und Specials.",
      hm: "Missionen: Schaffe die drei Missionen, um aufzusteigen und einen Münzbonus zu bekommen. Rangliste: Die Punkte jeder Runde zählen für die weltweite Rangliste.",
      ab: "The Last Driver ist ein kostenloses 3D-Fahrspiel mit Zombies: Überlebe die Straße, überfahre Zombies und verbessere dein Auto. Läuft im Browser auf Handy oder Computer. Ohne Download, ohne Anmeldung. Das Spiel ist auf Englisch.",
      cred: "Soundeffekte: Stable Audio 3 — Powered by Stability AI · Musik: erzeugt mit ACE-Step · Illustration: FLUX.2",
      credBy: "von",
      score: "Punkte", rank: "Rangliste", rankPlay: "Rangliste", rankDaily: "Rangliste", rankYou: "Deine Position: #{f}", rankEmpty: "Noch keine Punkte. Sei der Erste!", rankOff: "Die Rangliste ist gerade offline. Versuch es später.", rankLoad: "Lädt...",
      shTxt0: "Überlebst du die Zombie-Straße in The Last Driver? 🧟🚗", shTxt: "Ich habe {f} Punkte in The Last Driver! Schaffst du mehr? 🧟🚗", friend: "ein Freund",
      loadErr: "Das Spiel konnte nicht geladen werden. Lade die Seite neu.", blk1: "Dieses Spiel ist hier nicht verfügbar", blk2: "Spiele die offizielle Version auf unserer Website:"},
    it: {title: "The Last Driver", more: "Altri giochi", how: "Come si gioca", close: "Chiudi", share: "Condividi", copied: "Link copiato!", ad: "Pubblicità", sound: "Suono", like: "Mi piace", back: "Indietro",
      h1: "La tua auto va da sola su una strada piena di zombie. Trascina a sinistra o a destra (o usa le frecce) per cambiare corsia.",
      h2: "Evita auto, buche e lava. Tocca il pulsante salto (tasto S) per superare gli ostacoli e quello di sparo (tasto A) per distruggere ciò che hai davanti. Salti e colpi sono limitati: raccogli gli oggetti sulla strada per ricaricarli.",
      h3: "Investi gli zombie e raccogli le monete. Gli urti tolgono vita; la partita finisce quando la vita si esaurisce o se cadi in una buca, nell'acqua o nella lava.",
      h4: "Spendi le monete nel Garage: nuove auto, potenziamenti, armi e speciali.",
      hm: "Missioni: completa le tre missioni per salire di livello e ottenere un bonus di monete. Classifica: il punteggio di ogni partita vale per la classifica mondiale.",
      ab: "The Last Driver è un gioco di guida 3D gratuito con gli zombie: sopravvivi alla strada, investi gli zombie e potenzia la tua auto. Funziona nel browser su telefono o computer. Niente download, niente registrazione. Il gioco è in inglese.",
      cred: "Effetti sonori: Stable Audio 3 — Powered by Stability AI · Musica: generata con ACE-Step · Illustrazione: FLUX.2",
      credBy: "di",
      score: "Punti", rank: "Classifica", rankPlay: "Classifica", rankDaily: "Classifica", rankYou: "La tua posizione: #{f}", rankEmpty: "Ancora nessun punteggio. Sii il primo!", rankOff: "La classifica non è disponibile ora. Riprova più tardi.", rankLoad: "Caricamento...",
      shTxt0: "Sopravvivi alla strada degli zombie in The Last Driver? 🧟🚗", shTxt: "Ho fatto {f} punti in The Last Driver! Riesci a battermi? 🧟🚗", friend: "un amico",
      loadErr: "Impossibile caricare il gioco. Ricarica la pagina.", blk1: "Questo gioco non è disponibile qui", blk2: "Gioca la versione ufficiale sul nostro sito:"}
  };
  // login Google do ranking (gerado por src/supabase/gera_social_ui.py)
  var LOGIN_TXT = {"en": {"rename": "Change nickname", "save": "Save", "cancel": "Cancel", "nameHint": "3 to 16 letters, numbers, spaces, _ or -. Only your nickname appears in the ranking.", "nameTaken": "That name is already taken.", "nameBad": "That name is not allowed.", "nameLen": "Use 3 to 16 characters (letters, numbers, spaces, _ or -).", "nameWait": "You can only change your name once every 24 hours.", "gLogin": "Sign in with Google", "rankLogin": "Sign in to appear in the ranking", "rankWhy": "Sign in with Google and choose a nickname. Your Google name and photo are never shown.", "logout": "Sign out", "youAre": "You appear as {f}", "pickName": "Choose your nickname", "gKeep": "Optional: sign in with Google to keep your nickname and best score on any device.", "rankJoin": "Choose a nickname to join the ranking", "joinBtn": "Join the ranking", "nameLimit": "Too many new nicknames today. Try again tomorrow.", "player": "Player", "gInvite": "Want to keep your nickname and best score in your Google account to use them on other devices?", "gYes": "Yes", "gNo": "No"}, "pt": {"rename": "Mudar apelido", "save": "Salvar", "cancel": "Cancelar", "nameHint": "De 3 a 16 letras, números, espaço, _ ou -. Só o apelido aparece no ranking.", "nameTaken": "Esse nome já está em uso.", "nameBad": "Esse nome não é permitido.", "nameLen": "Use de 3 a 16 caracteres (letras, números, espaço, _ ou -).", "nameWait": "Você só pode trocar o nome 1 vez a cada 24 horas.", "gLogin": "Entrar com Google", "rankLogin": "Entre para aparecer no ranking", "rankWhy": "Entre com Google e escolha um apelido. Seu nome e sua foto do Google não aparecem.", "logout": "Sair", "youAre": "Você aparece como {f}", "pickName": "Escolha seu apelido", "gKeep": "Opcional: entre com Google para guardar seu apelido e recorde em qualquer aparelho.", "rankJoin": "Escolha um apelido para entrar no ranking", "joinBtn": "Entrar no ranking", "nameLimit": "Muitos apelidos novos hoje. Tente amanhã.", "player": "Jogador", "gInvite": "Quer guardar seu apelido e recorde na sua conta Google para usar em outros aparelhos?", "gYes": "Sim", "gNo": "Não"}, "es": {"rename": "Cambiar apodo", "save": "Guardar", "cancel": "Cancelar", "nameHint": "De 3 a 16 letras, números, espacios, _ o -. Solo tu apodo aparece en el ranking.", "nameTaken": "Ese nombre ya está en uso.", "nameBad": "Ese nombre no está permitido.", "nameLen": "Usa de 3 a 16 caracteres (letras, números, espacios, _ o -).", "nameWait": "Solo puedes cambiar el nombre 1 vez cada 24 horas.", "gLogin": "Acceder con Google", "rankLogin": "Entra para aparecer en el ranking", "rankWhy": "Accede con Google y elige un apodo. Tu nombre y tu foto de Google no se muestran.", "logout": "Salir", "youAre": "Apareces como {f}", "pickName": "Elige tu apodo", "gKeep": "Opcional: accede con Google para guardar tu apodo y tu récord en cualquier dispositivo.", "rankJoin": "Elige un apodo para entrar en el ranking", "joinBtn": "Entrar en el ranking", "nameLimit": "Demasiados apodos nuevos hoy. Inténtalo mañana.", "player": "Jugador", "gInvite": "¿Quieres guardar tu apodo y tu récord en tu cuenta de Google para usarlos en otros dispositivos?", "gYes": "Sí", "gNo": "No"}, "fr": {"rename": "Changer de pseudo", "save": "Enregistrer", "cancel": "Annuler", "nameHint": "De 3 à 16 lettres, chiffres, espaces, _ ou -. Seul ton pseudo apparaît au classement.", "nameTaken": "Ce nom est déjà pris.", "nameBad": "Ce nom n'est pas autorisé.", "nameLen": "Utilise de 3 à 16 caractères (lettres, chiffres, espaces, _ ou -).", "nameWait": "Tu ne peux changer de nom qu’une fois toutes les 24 heures.", "gLogin": "Se connecter avec Google", "rankLogin": "Connecte-toi pour apparaître au classement", "rankWhy": "Connecte-toi avec Google et choisis un pseudo. Ton nom et ta photo Google ne sont pas affichés.", "logout": "Se déconnecter", "youAre": "Tu apparais comme {f}", "pickName": "Choisis ton pseudo", "gKeep": "Facultatif : connecte-toi avec Google pour garder ton pseudo et ton record sur tous tes appareils.", "rankJoin": "Choisis un pseudo pour entrer au classement", "joinBtn": "Entrer au classement", "nameLimit": "Trop de nouveaux pseudos aujourd'hui. Réessaie demain.", "player": "Joueur", "gInvite": "Veux-tu garder ton pseudo et ton record dans ton compte Google pour les utiliser sur d'autres appareils ?", "gYes": "Oui", "gNo": "Non"}, "de": {"rename": "Spitznamen ändern", "save": "Speichern", "cancel": "Abbrechen", "nameHint": "3 bis 16 Buchstaben, Zahlen, Leerzeichen, _ oder -. In der Rangliste erscheint nur dein Spitzname.", "nameTaken": "Dieser Name ist schon vergeben.", "nameBad": "Dieser Name ist nicht erlaubt.", "nameLen": "Nutze 3 bis 16 Zeichen (Buchstaben, Zahlen, Leerzeichen, _ oder -).", "nameWait": "Du kannst deinen Namen nur einmal alle 24 Stunden ändern.", "gLogin": "Mit Google anmelden", "rankLogin": "Melde dich an, um in der Rangliste zu erscheinen", "rankWhy": "Melde dich mit Google an und wähle einen Spitznamen. Dein Google-Name und dein Foto werden nicht gezeigt.", "logout": "Abmelden", "youAre": "Du erscheinst als {f}", "pickName": "Wähle deinen Spitznamen", "gKeep": "Optional: Melde dich mit Google an, um Spitzname und Rekord auf jedem Gerät zu behalten.", "rankJoin": "Wähle einen Spitznamen für die Rangliste", "joinBtn": "Zur Rangliste", "nameLimit": "Heute zu viele neue Spitznamen. Versuch es morgen.", "player": "Spieler", "gInvite": "Möchtest du Spitzname und Rekord in deinem Google-Konto speichern, um sie auf anderen Geräten zu nutzen?", "gYes": "Ja", "gNo": "Nein"}, "it": {"rename": "Cambia nickname", "save": "Salva", "cancel": "Annulla", "nameHint": "Da 3 a 16 lettere, numeri, spazi, _ o -. In classifica compare solo il tuo nickname.", "nameTaken": "Questo nome è già in uso.", "nameBad": "Questo nome non è consentito.", "nameLen": "Usa da 3 a 16 caratteri (lettere, numeri, spazi, _ o -).", "nameWait": "Puoi cambiare nome solo 1 volta ogni 24 ore.", "gLogin": "Accedi con Google", "rankLogin": "Accedi per comparire in classifica", "rankWhy": "Accedi con Google e scegli un nickname. Il tuo nome e la foto di Google non vengono mostrati.", "logout": "Esci", "youAre": "Compari come {f}", "pickName": "Scegli il tuo nickname", "gKeep": "Facoltativo: accedi con Google per tenere nickname e record su qualsiasi dispositivo.", "rankJoin": "Scegli un nickname per entrare in classifica", "joinBtn": "Entra in classifica", "nameLimit": "Troppi nuovi nickname oggi. Riprova domani.", "player": "Giocatore", "gInvite": "Vuoi salvare nickname e record nel tuo account Google per usarli su altri dispositivi?", "gYes": "Sì", "gNo": "No"}};
  for (var lg in LOGIN_TXT) if (S[lg]) for (var lk in LOGIN_TXT[lg]) S[lg][lk] = LOGIN_TXT[lg][lk];
  var tag = "en";
  try {
    var q = window.BG_LANG || new URLSearchParams(location.search).get("lang");
    var list = q ? [q] : (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || "en"]);
    for (var i = 0; i < list.length; i++) { var b = String(list[i]).toLowerCase().split("-")[0]; if (S[b]) { tag = String(list[i]); break; } }
  } catch (e) {}
  var base = tag.toLowerCase().split("-")[0]; if (!S[base]) { base = "en"; tag = "en"; }
  var I = {
    lang: base, tag: tag,
    t: function (k, f) { var s = (S[base][k] || S.en[k] || k); if (f && typeof f === "object") { for (var x in f) s = s.split("{" + x + "}").join(f[x]); return s; } return f != null ? s.replace("{f}", f) : s; }
  };
  window.CL_I18N = I;
  document.documentElement.lang = tag;
  function apply() {
    document.title = I.t("title") + " - Bartel Games";
    var els = document.querySelectorAll("[data-i18n]");
    for (var j = 0; j < els.length; j++) els[j].textContent = I.t(els[j].getAttribute("data-i18n"));
    var al = document.querySelectorAll("[data-i18n-label]");
    for (var k = 0; k < al.length; k++) al[k].setAttribute("aria-label", I.t(al[k].getAttribute("data-i18n-label")));
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply); else apply();
})();
