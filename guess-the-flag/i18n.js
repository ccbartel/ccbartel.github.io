// Idioma automatico do Guess the Flag: textos da interface + nomes de paises (Intl.DisplayNames).
// Roda cedo (script normal no <head>) para o <html lang> ja sair certo e o Chrome nao oferecer traducao.
(function () {
  var S = {
    en: {play: "Play", playSub: "3 rounds", daily: "Daily challenge", dailyN: "Challenge #{f}", dailyDone: "Done: {f} - come back tomorrow", inf: "Endless", infSub: "Play until you miss", best: "Best: {f}", newBest: "New record!", shDaily: "Daily flag #{n}: {s}/3 {sq}", shInf: "I got {f} flags in a row on Guess the Flag! Can you beat me? 🌍", how: "How to play", h1: "The globe spins and drops a pin on a country.", h2: "Tap the flag of that country. There is no timer: take your time.", h3: "3 rounds: a famous country, a medium one and a hard one. Try to get 3/3!", ab: "Guess the Flag is a free geography quiz with a realistic 3D globe. Learn the flags and locations of 46 countries, from the United States to Namibia, right in your browser on phone or computer. No download, no sign-up.", close: "Close", share: "Share", copied: "Link copied!", shTxt: "I got {f}/3 on Guess the Flag! Can you beat me? 🌍", shTxt0: "Can you guess the flag? 🌍", title: "Guess the Flag", again: "Play again", more: "More games", opt: "Flag option", ad: "Advertisement",
         loadErr: "Could not load {f}. Please reload the page.", blk1: "This game is not available here", blk2: "Play the official version on our website:"},
    pt: {play: "Jogar", playSub: "3 rodadas", daily: "Desafio do dia", dailyN: "Desafio #{f}", dailyDone: "Feito: {f} - volte amanhã", inf: "Infinito", infSub: "Jogue até errar", best: "Recorde: {f}", newBest: "Novo recorde!", shDaily: "Bandeira do dia #{n}: {s}/3 {sq}", shInf: "Acertei {f} bandeiras seguidas no Adivinhe a Bandeira! Consegue me superar? 🌍", how: "Como jogar", h1: "O globo gira e espeta um alfinete em um país.", h2: "Toque na bandeira desse país. Não tem tempo: pense com calma.", h3: "3 rodadas: um país famoso, um médio e um difícil. Tente fazer 3/3!", ab: "Adivinhe a Bandeira é um quiz de geografia grátis com um globo 3D realista. Aprenda as bandeiras e a localização de 46 países, dos Estados Unidos à Namíbia, direto no navegador do celular ou do computador. Sem baixar nada e sem cadastro.", close: "Fechar", share: "Compartilhar", copied: "Link copiado!", shTxt: "Acertei {f}/3 no Adivinhe a Bandeira! Consegue me superar? 🌍", shTxt0: "Você consegue adivinhar a bandeira? 🌍", title: "Adivinhe a Bandeira", again: "Jogar de novo", more: "Mais jogos", opt: "Opção de bandeira", ad: "Publicidade",
         loadErr: "Não foi possível carregar {f}. Recarregue a página.", blk1: "Este jogo não está disponível aqui", blk2: "Jogue a versão oficial no nosso site:"},
    es: {play: "Jugar", playSub: "3 rondas", daily: "Reto del día", dailyN: "Reto #{f}", dailyDone: "Hecho: {f} - vuelve mañana", inf: "Infinito", infSub: "Juega hasta fallar", best: "Récord: {f}", newBest: "¡Nuevo récord!", shDaily: "Bandera del día #{n}: {s}/3 {sq}", shInf: "¡Acerté {f} banderas seguidas en Adivina la Bandera! ¿Me superas? 🌍", how: "Cómo jugar", h1: "El globo gira y clava un alfiler en un país.", h2: "Toca la bandera de ese país. No hay tiempo: piénsalo con calma.", h3: "3 rondas: un país famoso, uno medio y uno difícil. ¡Intenta hacer 3/3!", ab: "Adivina la Bandera es un quiz de geografía gratis con un globo 3D realista. Aprende las banderas y la ubicación de 46 países, desde Estados Unidos hasta Namibia, en el navegador del móvil o del ordenador. Sin descargas ni registro.", close: "Cerrar", share: "Compartir", copied: "¡Enlace copiado!", shTxt: "¡Acerté {f}/3 en Adivina la Bandera! ¿Me superas? 🌍", shTxt0: "¿Puedes adivinar la bandera? 🌍", title: "Adivina la Bandera", again: "Jugar de nuevo", more: "Más juegos", opt: "Opción de bandera", ad: "Publicidad",
         loadErr: "No se pudo cargar {f}. Recarga la página.", blk1: "Este juego no está disponible aquí", blk2: "Juega la versión oficial en nuestro sitio:"},
    fr: {play: "Jouer", playSub: "3 manches", daily: "Défi du jour", dailyN: "Défi n°{f}", dailyDone: "Fait : {f} - reviens demain", inf: "Infini", infSub: "Joue jusqu'à l'erreur", best: "Record : {f}", newBest: "Nouveau record !", shDaily: "Drapeau du jour n°{n} : {s}/3 {sq}", shInf: "J'ai trouvé {f} drapeaux d'affilée à Devine le Drapeau ! 🌍", share: "Partager", copied: "Lien copié !", shTxt: "J'ai eu {f}/3 à Devine le Drapeau ! Tu fais mieux ? 🌍", shTxt0: "Sauras-tu deviner le drapeau ? 🌍", title: "Devine le Drapeau", again: "Rejouer", more: "Plus de jeux", opt: "Choix de drapeau", ad: "Publicité",
         loadErr: "Impossible de charger {f}. Rechargez la page.", blk1: "Ce jeu n'est pas disponible ici", blk2: "Jouez à la version officielle sur notre site :"},
    de: {play: "Spielen", playSub: "3 Runden", daily: "Tagesaufgabe", dailyN: "Aufgabe #{f}", dailyDone: "Erledigt: {f} - komm morgen wieder", inf: "Endlos", infSub: "Spiele bis zum Fehler", best: "Rekord: {f}", newBest: "Neuer Rekord!", shDaily: "Flagge des Tages #{n}: {s}/3 {sq}", shInf: "Ich habe {f} Flaggen in Folge bei Errate die Flagge! 🌍", share: "Teilen", copied: "Link kopiert!", shTxt: "Ich habe {f}/3 bei Errate die Flagge! Schaffst du mehr? 🌍", shTxt0: "Errätst du die Flagge? 🌍", title: "Errate die Flagge", again: "Nochmal spielen", more: "Mehr Spiele", opt: "Flaggen-Option", ad: "Werbung",
         loadErr: "{f} konnte nicht geladen werden. Bitte lade die Seite neu.", blk1: "Dieses Spiel ist hier nicht verfügbar", blk2: "Spiele die offizielle Version auf unserer Website:"},
    it: {play: "Gioca", playSub: "3 round", daily: "Sfida del giorno", dailyN: "Sfida n.{f}", dailyDone: "Fatto: {f} - torna domani", inf: "Infinito", infSub: "Gioca finché sbagli", best: "Record: {f}", newBest: "Nuovo record!", shDaily: "Bandiera del giorno n.{n}: {s}/3 {sq}", shInf: "Ho indovinato {f} bandiere di fila a Indovina la Bandiera! 🌍", share: "Condividi", copied: "Link copiato!", shTxt: "Ho fatto {f}/3 a Indovina la Bandiera! Riesci a battermi? 🌍", shTxt0: "Sai indovinare la bandiera? 🌍", title: "Indovina la Bandiera", again: "Gioca ancora", more: "Altri giochi", opt: "Opzione bandiera", ad: "Pubblicità",
         loadErr: "Impossibile caricare {f}. Ricarica la pagina.", blk1: "Questo gioco non è disponibile qui", blk2: "Gioca alla versione ufficiale sul nostro sito:"}
  };
  // modos novos (Capitais, Onde fica?, Qual pais?) + textos que faltavam em fr/de/it
  var X = {
    en: {mFlags: "Flags", mFlagsS: "Pick the flag", mCap: "Capitals", mCapS: "Pick the capital", mFind: "Where is it?", mFindS: "Tap it on the globe", mName: "Which country?", mNameS: "Name the flag",
         findHint: "Spin the globe and tap it", modes: "Game modes",
         hmFlags: "Flags: the pin drops on a country, pick its flag.", hmCap: "Capitals: the pin drops on a country, pick its capital.", hmFind: "Where is it?: drag to spin the globe and tap the country shown at the top.", hmName: "Which country?: see a big flag and pick the country's name.", hmDaily: "Daily challenge: the same 3 flags for everyone, once a day.", hmInf: "Endless: flags until your first miss. Beat your record!",
         shCap: "I got {f}/3 capitals on Guess the Flag! Can you beat me? 🏛️", shFind: "I found {f}/3 countries on the globe in Guess the Flag! Can you beat me? 🌍", shName: "I named {f}/3 flags on Guess the Flag! Can you beat me? 🚩"},
    pt: {mFlags: "Bandeiras", mFlagsS: "Escolha a bandeira", mCap: "Capitais", mCapS: "Escolha a capital", mFind: "Onde fica?", mFindS: "Toque no globo", mName: "Qual é o país?", mNameS: "Veja a bandeira",
         findHint: "Gire o globo e toque no país", modes: "Modos de jogo",
         hmFlags: "Bandeiras: o alfinete cai em um país, escolha a bandeira dele.", hmCap: "Capitais: o alfinete cai em um país, escolha a capital dele.", hmFind: "Onde fica?: arraste para girar o globo e toque no país mostrado em cima.", hmName: "Qual é o país?: veja uma bandeira grande e escolha o nome do país.", hmDaily: "Desafio do dia: as mesmas 3 bandeiras para todo mundo, uma vez por dia.", hmInf: "Infinito: bandeiras até o primeiro erro. Bata o seu recorde!",
         shCap: "Acertei {f}/3 capitais no Adivinhe a Bandeira! Consegue me superar? 🏛️", shFind: "Achei {f}/3 países no globo do Adivinhe a Bandeira! Consegue me superar? 🌍", shName: "Acertei {f}/3 países pela bandeira no Adivinhe a Bandeira! Consegue me superar? 🚩"},
    es: {mFlags: "Banderas", mFlagsS: "Elige la bandera", mCap: "Capitales", mCapS: "Elige la capital", mFind: "¿Dónde está?", mFindS: "Tócalo en el globo", mName: "¿Qué país es?", mNameS: "Mira la bandera",
         findHint: "Gira el globo y toca el país", modes: "Modos de juego",
         hmFlags: "Banderas: el alfiler cae en un país, elige su bandera.", hmCap: "Capitales: el alfiler cae en un país, elige su capital.", hmFind: "¿Dónde está?: arrastra para girar el globo y toca el país que aparece arriba.", hmName: "¿Qué país es?: mira una bandera grande y elige el nombre del país.", hmDaily: "Reto del día: las mismas 3 banderas para todos, una vez al día.", hmInf: "Infinito: banderas hasta el primer fallo. ¡Supera tu récord!",
         shCap: "¡Acerté {f}/3 capitales en Adivina la Bandera! ¿Me superas? 🏛️", shFind: "¡Encontré {f}/3 países en el globo de Adivina la Bandera! ¿Me superas? 🌍", shName: "¡Acerté {f}/3 países por su bandera en Adivina la Bandera! ¿Me superas? 🚩"},
    fr: {mFlags: "Drapeaux", mFlagsS: "Choisis le drapeau", mCap: "Capitales", mCapS: "Choisis la capitale", mFind: "Où est-ce ?", mFindS: "Touche-le sur le globe", mName: "Quel pays ?", mNameS: "Regarde le drapeau",
         findHint: "Tourne le globe et touche le pays", modes: "Modes de jeu",
         hmFlags: "Drapeaux : l'épingle tombe sur un pays, choisis son drapeau.", hmCap: "Capitales : l'épingle tombe sur un pays, choisis sa capitale.", hmFind: "Où est-ce ? : fais tourner le globe et touche le pays affiché en haut.", hmName: "Quel pays ? : regarde un grand drapeau et choisis le nom du pays.", hmDaily: "Défi du jour : les 3 mêmes drapeaux pour tous, une fois par jour.", hmInf: "Infini : des drapeaux jusqu'à la première erreur. Bats ton record !",
         shCap: "J'ai trouvé {f}/3 capitales à Devine le Drapeau ! Tu fais mieux ? 🏛️", shFind: "J'ai trouvé {f}/3 pays sur le globe à Devine le Drapeau ! Tu fais mieux ? 🌍", shName: "J'ai reconnu {f}/3 drapeaux à Devine le Drapeau ! Tu fais mieux ? 🚩",
         how: "Comment jouer", h1: "Le globe tourne et plante une épingle sur un pays.", h2: "Touche le drapeau de ce pays. Pas de chrono : prends ton temps.", h3: "3 manches : un pays connu, un moyen et un difficile. Vise 3/3 !", ab: "Devine le Drapeau est un quiz de géographie gratuit avec un globe 3D réaliste. Apprends les drapeaux et la position de 46 pays, des États-Unis à la Namibie, dans le navigateur du téléphone ou de l'ordinateur. Sans téléchargement ni inscription.", close: "Fermer"},
    de: {mFlags: "Flaggen", mFlagsS: "Wähle die Flagge", mCap: "Hauptstädte", mCapS: "Wähle die Hauptstadt", mFind: "Wo liegt es?", mFindS: "Tippe auf den Globus", mName: "Welches Land?", mNameS: "Sieh dir die Flagge an",
         findHint: "Dreh den Globus und tippe aufs Land", modes: "Spielmodi",
         hmFlags: "Flaggen: Die Nadel fällt auf ein Land, wähle seine Flagge.", hmCap: "Hauptstädte: Die Nadel fällt auf ein Land, wähle seine Hauptstadt.", hmFind: "Wo liegt es?: Dreh den Globus und tippe auf das Land, das oben steht.", hmName: "Welches Land?: Sieh dir eine große Flagge an und wähle den Namen des Landes.", hmDaily: "Tagesaufgabe: dieselben 3 Flaggen für alle, einmal am Tag.", hmInf: "Endlos: Flaggen bis zum ersten Fehler. Schlag deinen Rekord!",
         shCap: "Ich habe {f}/3 Hauptstädte bei Errate die Flagge! Schaffst du mehr? 🏛️", shFind: "Ich habe {f}/3 Länder auf dem Globus gefunden – Errate die Flagge! Schaffst du mehr? 🌍", shName: "Ich habe {f}/3 Flaggen erkannt bei Errate die Flagge! Schaffst du mehr? 🚩",
         how: "So wird gespielt", h1: "Der Globus dreht sich und steckt eine Nadel in ein Land.", h2: "Tippe auf die Flagge dieses Landes. Kein Zeitlimit: lass dir Zeit.", h3: "3 Runden: ein bekanntes Land, ein mittleres und ein schweres. Schaffst du 3/3?", ab: "Errate die Flagge ist ein kostenloses Geografie-Quiz mit einem realistischen 3D-Globus. Lerne die Flaggen und die Lage von 46 Ländern, von den USA bis Namibia, direkt im Browser auf Handy oder Computer. Ohne Download und ohne Anmeldung.", close: "Schließen"},
    it: {mFlags: "Bandiere", mFlagsS: "Scegli la bandiera", mCap: "Capitali", mCapS: "Scegli la capitale", mFind: "Dov'è?", mFindS: "Toccalo sul globo", mName: "Che paese è?", mNameS: "Guarda la bandiera",
         findHint: "Gira il globo e tocca il paese", modes: "Modalità di gioco",
         hmFlags: "Bandiere: lo spillo cade su un paese, scegli la sua bandiera.", hmCap: "Capitali: lo spillo cade su un paese, scegli la sua capitale.", hmFind: "Dov'è?: trascina per girare il globo e tocca il paese indicato in alto.", hmName: "Che paese è?: guarda una grande bandiera e scegli il nome del paese.", hmDaily: "Sfida del giorno: le stesse 3 bandiere per tutti, una volta al giorno.", hmInf: "Infinito: bandiere fino al primo errore. Batti il tuo record!",
         shCap: "Ho indovinato {f}/3 capitali a Indovina la Bandiera! Riesci a battermi? 🏛️", shFind: "Ho trovato {f}/3 paesi sul globo di Indovina la Bandiera! Riesci a battermi? 🌍", shName: "Ho riconosciuto {f}/3 bandiere a Indovina la Bandiera! Riesci a battermi? 🚩",
         how: "Come si gioca", h1: "Il globo gira e pianta uno spillo su un paese.", h2: "Tocca la bandiera di quel paese. Non c'è tempo limite: pensaci con calma.", h3: "3 round: un paese famoso, uno medio e uno difficile. Prova a fare 3/3!", ab: "Indovina la Bandiera è un quiz di geografia gratuito con un globo 3D realistico. Impara le bandiere e la posizione di 46 paesi, dagli Stati Uniti alla Namibia, nel browser del telefono o del computer. Niente download e niente registrazione.", close: "Chiudi"}
  };
  for (var xl in X) for (var xk in X[xl]) S[xl][xk] = X[xl][xk];
  // recursos sociais (curtir + ranking)
  var SO = {
    en: {like: "Like", rank: "Ranking", rankInf: "Endless ranking", rankDaily: "Daily challenge #{f} ranking", rankYou: "Your position: #{f}", rankEmpty: "No scores yet. Be the first!", rankOff: "Ranking offline right now. Try again later.", rankLoad: "Loading...", nick: "Your nickname", nickAsk: "Choose a nickname for the ranking", nickHint: "Up to 14 letters, numbers or spaces", nickOk: "Save", nickChange: "Change nickname", pts: "pts"},
    pt: {like: "Curtir", rank: "Ranking", rankInf: "Ranking do Infinito", rankDaily: "Ranking do Desafio #{f}", rankYou: "Sua posição: #{f}", rankEmpty: "Ninguém pontuou ainda. Seja o primeiro!", rankOff: "Ranking fora do ar agora. Tente mais tarde.", rankLoad: "Carregando...", nick: "Seu apelido", nickAsk: "Escolha um apelido para o ranking", nickHint: "Até 14 letras, números ou espaços", nickOk: "Salvar", nickChange: "Trocar apelido", pts: "pts"},
    es: {like: "Me gusta", rank: "Ranking", rankInf: "Ranking del Infinito", rankDaily: "Ranking del Reto #{f}", rankYou: "Tu posición: #{f}", rankEmpty: "Nadie ha puntuado aún. ¡Sé el primero!", rankOff: "Ranking sin conexión ahora. Inténtalo más tarde.", rankLoad: "Cargando...", nick: "Tu apodo", nickAsk: "Elige un apodo para el ranking", nickHint: "Hasta 14 letras, números o espacios", nickOk: "Guardar", nickChange: "Cambiar apodo", pts: "pts"},
    fr: {like: "J'aime", rank: "Classement", rankInf: "Classement Infini", rankDaily: "Classement du défi n°{f}", rankYou: "Ta place : n°{f}", rankEmpty: "Aucun score pour l'instant. Sois le premier !", rankOff: "Classement hors ligne. Réessaie plus tard.", rankLoad: "Chargement...", nick: "Ton pseudo", nickAsk: "Choisis un pseudo pour le classement", nickHint: "Jusqu'à 14 lettres, chiffres ou espaces", nickOk: "Valider", nickChange: "Changer de pseudo", pts: "pts"},
    de: {like: "Gefällt mir", rank: "Rangliste", rankInf: "Rangliste Endlos", rankDaily: "Rangliste Aufgabe #{f}", rankYou: "Dein Platz: #{f}", rankEmpty: "Noch keine Punkte. Sei der Erste!", rankOff: "Rangliste gerade offline. Versuch es später.", rankLoad: "Lädt...", nick: "Dein Spitzname", nickAsk: "Wähle einen Spitznamen für die Rangliste", nickHint: "Bis zu 14 Buchstaben, Zahlen oder Leerzeichen", nickOk: "Speichern", nickChange: "Spitzname ändern", pts: "Pkt."},
    it: {like: "Mi piace", rank: "Classifica", rankInf: "Classifica Infinito", rankDaily: "Classifica sfida n.{f}", rankYou: "La tua posizione: n.{f}", rankEmpty: "Ancora nessun punteggio. Sii il primo!", rankOff: "Classifica offline ora. Riprova più tardi.", rankLoad: "Caricamento...", nick: "Il tuo soprannome", nickAsk: "Scegli un soprannome per la classifica", nickHint: "Fino a 14 lettere, numeri o spazi", nickOk: "Salva", nickChange: "Cambia soprannome", pts: "pt"}
  };
  for (var sl in SO) for (var sk in SO[sl]) S[sl][sk] = SO[sl][sk];
  // capitais: [en, pt, es, fr, de, it] (exonimos consagrados em cada idioma)
  var CAP = {
    US: ["Washington, D.C.", "Washington", "Washington D. C.", "Washington", "Washington", "Washington"],
    CN: ["Beijing", "Pequim", "Pekín", "Pékin", "Peking", "Pechino"],
    RU: ["Moscow", "Moscou", "Moscú", "Moscou", "Moskau", "Mosca"],
    CA: ["Ottawa", "Ottawa", "Ottawa", "Ottawa", "Ottawa", "Ottawa"],
    BR: ["Brasília", "Brasília", "Brasilia", "Brasilia", "Brasília", "Brasilia"],
    AU: ["Canberra", "Camberra", "Canberra", "Canberra", "Canberra", "Canberra"],
    IN: ["New Delhi", "Nova Délhi", "Nueva Delhi", "New Delhi", "Neu-Delhi", "Nuova Delhi"],
    JP: ["Tokyo", "Tóquio", "Tokio", "Tokyo", "Tokio", "Tokyo"],
    MX: ["Mexico City", "Cidade do México", "Ciudad de México", "Mexico", "Mexiko-Stadt", "Città del Messico"],
    AR: ["Buenos Aires", "Buenos Aires", "Buenos Aires", "Buenos Aires", "Buenos Aires", "Buenos Aires"],
    FR: ["Paris", "Paris", "París", "Paris", "Paris", "Parigi"],
    GB: ["London", "Londres", "Londres", "Londres", "London", "Londra"],
    DE: ["Berlin", "Berlim", "Berlín", "Berlin", "Berlin", "Berlino"],
    ES: ["Madrid", "Madri", "Madrid", "Madrid", "Madrid", "Madrid"],
    IT: ["Rome", "Roma", "Roma", "Rome", "Rom", "Roma"],
    ZA: ["Pretoria", "Pretória", "Pretoria", "Pretoria", "Pretoria", "Pretoria"],
    EG: ["Cairo", "Cairo", "El Cairo", "Le Caire", "Kairo", "Il Cairo"],
    TR: ["Ankara", "Ancara", "Ankara", "Ankara", "Ankara", "Ankara"],
    SA: ["Riyadh", "Riad", "Riad", "Riyad", "Riad", "Riad"],
    ID: ["Jakarta", "Jacarta", "Yakarta", "Jakarta", "Jakarta", "Giacarta"],
    KR: ["Seoul", "Seul", "Seúl", "Séoul", "Seoul", "Seul"],
    NG: ["Abuja", "Abuja", "Abuya", "Abuja", "Abuja", "Abuja"],
    CO: ["Bogotá", "Bogotá", "Bogotá", "Bogota", "Bogotá", "Bogotà"],
    PE: ["Lima", "Lima", "Lima", "Lima", "Lima", "Lima"],
    CL: ["Santiago", "Santiago", "Santiago de Chile", "Santiago", "Santiago de Chile", "Santiago del Cile"],
    SE: ["Stockholm", "Estocolmo", "Estocolmo", "Stockholm", "Stockholm", "Stoccolma"],
    NO: ["Oslo", "Oslo", "Oslo", "Oslo", "Oslo", "Oslo"],
    KZ: ["Astana", "Astana", "Astaná", "Astana", "Astana", "Astana"],
    MN: ["Ulaanbaatar", "Ulan Bator", "Ulán Bator", "Oulan-Bator", "Ulaanbaatar", "Ulan Bator"],
    DZ: ["Algiers", "Argel", "Argel", "Alger", "Algier", "Algeri"],
    KE: ["Nairobi", "Nairóbi", "Nairobi", "Nairobi", "Nairobi", "Nairobi"],
    ET: ["Addis Ababa", "Adis Abeba", "Adís Abeba", "Addis-Abeba", "Addis Abeba", "Addis Abeba"],
    MG: ["Antananarivo", "Antananarivo", "Antananarivo", "Antananarivo", "Antananarivo", "Antananarivo"],
    BO: ["Sucre", "Sucre", "Sucre", "Sucre", "Sucre", "Sucre"],
    VE: ["Caracas", "Caracas", "Caracas", "Caracas", "Caracas", "Caracas"],
    IR: ["Tehran", "Teerã", "Teherán", "Téhéran", "Teheran", "Teheran"],
    PK: ["Islamabad", "Islamabad", "Islamabad", "Islamabad", "Islamabad", "Islamabad"],
    TH: ["Bangkok", "Bangkok", "Bangkok", "Bangkok", "Bangkok", "Bangkok"],
    VN: ["Hanoi", "Hanói", "Hanói", "Hanoï", "Hanoi", "Hanoi"],
    FI: ["Helsinki", "Helsinque", "Helsinki", "Helsinki", "Helsinki", "Helsinki"],
    UA: ["Kyiv", "Kiev", "Kiev", "Kiev", "Kiew", "Kiev"],
    PL: ["Warsaw", "Varsóvia", "Varsovia", "Varsovie", "Warschau", "Varsavia"],
    MA: ["Rabat", "Rabat", "Rabat", "Rabat", "Rabat", "Rabat"],
    AO: ["Luanda", "Luanda", "Luanda", "Luanda", "Luanda", "Luanda"],
    NA: ["Windhoek", "Windhoek", "Windhoek", "Windhoek", "Windhoek", "Windhoek"],
    NZ: ["Wellington", "Wellington", "Wellington", "Wellington", "Wellington", "Wellington"]
  };
  var LANGS = ["en", "pt", "es", "fr", "de", "it"];
  var tag = "en";
  try {
    var q = new URLSearchParams(location.search).get("lang");          // ?lang=pt para testar
    var list = q ? [q] : (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || "en"]);
    for (var i = 0; i < list.length; i++) { var b = String(list[i]).toLowerCase().split("-")[0]; if (S[b]) { tag = String(list[i]); break; } }
  } catch (e) {}
  var base = tag.toLowerCase().split("-")[0]; if (!S[base]) { base = "en"; tag = "en"; }
  var dn = null;
  try { dn = new Intl.DisplayNames([tag, base], {type: "region"}); } catch (e) {}
  var I = {
    lang: base, tag: tag,
    t: function (k, f) { var s = (S[base][k] || S.en[k] || k); if (f && typeof f === "object") { for (var x in f) s = s.split("{" + x + "}").join(f[x]); return s; } return f != null ? s.replace("{f}", f) : s; },
    country: function (iso, fallback) {
      var n = null; try { n = dn && dn.of(iso); } catch (e) {}
      if (!n || n === iso) n = fallback ? fallback.charAt(0) + fallback.slice(1).toLowerCase().replace(/ (\w)/g, function (m, c) { return " " + c.toUpperCase(); }) : iso;
      return n;
    },
    capital: function (iso) { var c = CAP[iso]; if (!c) return iso; var j = LANGS.indexOf(base); return c[j < 0 ? 0 : j]; },
    upper: function (s) { try { return s.toLocaleUpperCase(tag); } catch (e) { return s.toUpperCase(); } }
  };
  window.GTF_I18N = I;
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
