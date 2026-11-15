// Idioma automatico do Guess the Flag: textos da interface + nomes de paises (Intl.DisplayNames).
// Roda cedo (script normal no <head>) para o <html lang> ja sair certo e o Chrome nao oferecer traducao.
(function () {
  var S = {
    en: {share: "Share", copied: "Link copied!", shTxt: "I got {f}/3 on Guess the Flag! Can you beat me? 🌍", shTxt0: "Can you guess the flag? 🌍", title: "Guess the Flag", again: "Play again", more: "More games", opt: "Flag option", ad: "Advertisement",
         loadErr: "Could not load {f}. Please reload the page.", blk1: "This game is not available here", blk2: "Play the official version on our website:"},
    pt: {share: "Compartilhar", copied: "Link copiado!", shTxt: "Acertei {f}/3 no Adivinhe a Bandeira! Consegue me superar? 🌍", shTxt0: "Você consegue adivinhar a bandeira? 🌍", title: "Adivinhe a Bandeira", again: "Jogar de novo", more: "Mais jogos", opt: "Opção de bandeira", ad: "Publicidade",
         loadErr: "Não foi possível carregar {f}. Recarregue a página.", blk1: "Este jogo não está disponível aqui", blk2: "Jogue a versão oficial no nosso site:"},
    es: {share: "Compartir", copied: "¡Enlace copiado!", shTxt: "¡Acerté {f}/3 en Adivina la Bandera! ¿Me superas? 🌍", shTxt0: "¿Puedes adivinar la bandera? 🌍", title: "Adivina la Bandera", again: "Jugar de nuevo", more: "Más juegos", opt: "Opción de bandera", ad: "Publicidad",
         loadErr: "No se pudo cargar {f}. Recarga la página.", blk1: "Este juego no está disponible aquí", blk2: "Juega la versión oficial en nuestro sitio:"},
    fr: {share: "Partager", copied: "Lien copié !", shTxt: "J'ai eu {f}/3 à Devine le Drapeau ! Tu fais mieux ? 🌍", shTxt0: "Sauras-tu deviner le drapeau ? 🌍", title: "Devine le Drapeau", again: "Rejouer", more: "Plus de jeux", opt: "Choix de drapeau", ad: "Publicité",
         loadErr: "Impossible de charger {f}. Rechargez la page.", blk1: "Ce jeu n'est pas disponible ici", blk2: "Jouez à la version officielle sur notre site :"},
    de: {share: "Teilen", copied: "Link kopiert!", shTxt: "Ich habe {f}/3 bei Errate die Flagge! Schaffst du mehr? 🌍", shTxt0: "Errätst du die Flagge? 🌍", title: "Errate die Flagge", again: "Nochmal spielen", more: "Mehr Spiele", opt: "Flaggen-Option", ad: "Werbung",
         loadErr: "{f} konnte nicht geladen werden. Bitte lade die Seite neu.", blk1: "Dieses Spiel ist hier nicht verfügbar", blk2: "Spiele die offizielle Version auf unserer Website:"},
    it: {share: "Condividi", copied: "Link copiato!", shTxt: "Ho fatto {f}/3 a Indovina la Bandiera! Riesci a battermi? 🌍", shTxt0: "Sai indovinare la bandiera? 🌍", title: "Indovina la Bandiera", again: "Gioca ancora", more: "Altri giochi", opt: "Opzione bandiera", ad: "Pubblicità",
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
    t: function (k, f) { var s = (S[base][k] || S.en[k] || k); return f ? s.replace("{f}", f) : s; },
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
