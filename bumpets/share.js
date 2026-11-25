// Compartilhar: celular abre a janela nativa (WhatsApp, TikTok...); computador copia o link.
// Numa sala, o link leva o codigo (#CODIGO) e o texto convida para a sala; depois de vencer, o texto conta a vitoria.
// 2026-11-23: cada modo (Arena, Soccer, Race, Paint, Flag, Zone, Cards) compartilha o PROPRIO link e frase; o texto e o cartao levam o placar
// da ultima partida (window.CL_LAST: kind/sc/big/n, gravados pelo client.js), tambem na derrota.
(function () {
  var I = window.CL_I18N || {t: function (k, f) { return k; }, lang: "en"};
  var LP = (location.pathname.match(/^\/(pt|es)\//) || ["", ""])[1]; LP = LP ? "/" + LP : ""; /* versao /pt/ /es/ compartilha o link no idioma */
  var SLUG = {battle: "bumpets", soccer: "bumpets-soccer", race: "bumpets-race", paint: "bumpets-paint", flag: "bumpets-flag", zone: "bumpets-zone", cards: "bumpets-cards", pinball: "bumpets-pinball-soccer"};
  var KEY = {battle: "", soccer: "S", race: "R", paint: "P", flag: "F", zone: "Z", cards: "C", pinball: "B"}; /* sufixo das frases de cada modo (Arena = shWin/shTxt0) */
  var PM = location.pathname.match(/\/bumpets(-soccer|-race|-paint|-flag|-zone|-cards|-pinball)?\//), PAGE = PM && PM[1] ? PM[1].slice(1) : "battle";
  function urlFor(md) { return "https://bartelgames.com.br" + LP + "/" + (SLUG[md] || "bumpets") + "/"; }
  function toast(msg) {
    var d = document.getElementById("toast");
    if (!d) { d = document.createElement("div"); d.id = "toast"; d.setAttribute("role", "status"); document.body.appendChild(d); }
    d.textContent = msg; d.classList.add("on");
    clearTimeout(d._t); d._t = setTimeout(function () { d.classList.remove("on"); }, 1800);
  }
  function scoreTxt(L) { // frase do placar: "Placar: 3 x 1", "Derrubei 3 da ilha!", "Meu tempo: 41,27 s", "Fiquei com 2 cartas"
    if (!L || !L.kind) return "";
    if (L.kind === "team" && L.sc) return I.t("shScT", L.sc);
    if (L.kind === "time" && L.sc) return I.t("shTime", L.sc);
    if (L.kind === "ko" && L.n > 0) return I.t(L.n === 1 ? "shKo1" : "shKo", String(L.n));
    if (L.kind === "cards" && !L.win && L.n > 0) return I.t(L.n === 1 ? "shCards1" : "shCards", String(L.n));
    return "";
  }
  function share() {
    var L = window.CL_LAST, m = String(location.hash || "").match(/^#([A-Z2-9]{5})$/);
    var md = (L && L.mode && SLUG[L.mode]) ? L.mode : (window.BB_GAME && SLUG[window.BB_GAME] ? window.BB_GAME : PAGE);
    var url = m ? urlFor(PAGE) + "#" + m[1] : urlFor(md); /* sala: o link da pagina onde a sala esta; senao o do modo jogado */
    var G = KEY[md] || "";
    var base = L && L.win ? I.t(G ? "shWin" + G : "shWin") : m ? I.t("shRoom", m[1]) : I.t(G ? "shTxt" + G : "shTxt0"); // venceu: conta a vitoria (com o link da sala, se houver)
    var sc = scoreTxt(L), text = sc ? base + " " + sc : base;
    var data = {title: I.t("title"), text: text, url: url};
    // so no celular (toque): no PC a janela de compartilhar do Windows manda para o WhatsApp SEM a foto de previa; la copia o link (2026-11-19)
    var big = L ? (L.big || (L.win ? "🏆" : "✓")) : "";
    var SC = window.BG_card && L ? window.BG_card(big, text) : null; /* cartao com o placar (scorecard.js): vitoria E derrota; no celular vai a imagem junto */
    if (SC && navigator.canShare && window.matchMedia && matchMedia("(pointer:coarse)").matches) { var d2 = {title: data.title, text: text + " " + url, files: [SC]}; if (navigator.canShare(d2)) { navigator.share(d2).catch(function () {}); return; } }
    if (navigator.share && window.matchMedia && matchMedia("(pointer:coarse)").matches) { navigator.share(data).catch(function () {}); return; }
    var all = text + " " + url;
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(all).then(function () { toast(I.t("copied")); }, function () { prompt("", all); });
    else prompt("", all);
  }
  window.CL_share = share;
  window.CL_shareText = function () { /* teste: o que o compartilhar mandaria agora */
    var L = window.CL_LAST, md = L && L.mode && SLUG[L.mode] ? L.mode : PAGE, G = KEY[md] || "", base = L && L.win ? I.t(G ? "shWin" + G : "shWin") : I.t(G ? "shTxt" + G : "shTxt0"), sc = scoreTxt(L);
    return {url: urlFor(md), text: sc ? base + " " + sc : base, big: L ? (L.big || (L.win ? "🏆" : "✓")) : ""}; };
  function bind() {
    var b = document.querySelectorAll("[data-share]");
    for (var i = 0; i < b.length; i++) b[i].addEventListener("click", function (e) { e.preventDefault(); share(); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind); else bind();
})();
