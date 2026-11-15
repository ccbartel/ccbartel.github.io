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
