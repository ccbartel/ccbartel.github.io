// Compartilhar: celular abre a janela nativa (WhatsApp, TikTok...); computador copia o link.
// Numa sala, o link leva o codigo (#CODIGO) e o texto convida para a sala; depois de vencer, o texto conta a vitoria.
(function () {
  var I = window.CL_I18N || {t: function (k, f) { return k; }, lang: "en"};
  var URL_ = "https://bartelgames.com.br/bumpets/";
  var LPx = (location.pathname.match(/^\/(pt|es)\//) || [""])[0]; if (LPx) URL_ = URL_.replace(".com.br/", ".com.br" + LPx); /* versao /pt/ /es/ compartilha o link no idioma */
  var PGx = location.pathname.match(/^(\/(pt|es))?\/bumpets(-soccer|-race)?\//); if (PGx) URL_ = "https://bartelgames.com.br" + PGx[0]; /* Soccer e Race compartilham o proprio link */
  function toast(msg) {
    var d = document.getElementById("toast");
    if (!d) { d = document.createElement("div"); d.id = "toast"; d.setAttribute("role", "status"); document.body.appendChild(d); }
    d.textContent = msg; d.classList.add("on");
    clearTimeout(d._t); d._t = setTimeout(function () { d.classList.remove("on"); }, 1800);
  }
  function share() {
    var L = window.CL_LAST, m = String(location.hash || "").match(/^#([A-Z2-9]{5})$/);
    var url = URL_ + (m ? "#" + m[1] : "");
    var G = window.BB_GAME === "soccer" ? "S" : window.BB_GAME === "race" ? "R" : ""; /* Soccer/Race: frases proprias */
    var text = L && L.win ? I.t(G ? "shWin" + G : "shWin") : m ? I.t("shRoom", m[1]) : I.t(G ? "shTxt" + G : "shTxt0"); // venceu: conta a vitoria (com o link da sala, se houver)
    var data = {title: I.t("title"), text: text, url: url};
    // so no celular (toque): no PC a janela de compartilhar do Windows manda para o WhatsApp SEM a foto de previa; la copia o link (2026-11-19)
    var SC = window.BG_card && L && (L.score > 0 || L.win || L.done) ? window.BG_card(L.score > 0 ? Number(L.score).toLocaleString(document.documentElement.lang || "en") : (L.win ? "🏆" : "✓"), text) : null; /* cartao com a pontuacao (scorecard.js, 2026-11-21): no celular vai a imagem junto */
    if (SC && navigator.canShare && window.matchMedia && matchMedia("(pointer:coarse)").matches) { var d2 = {title: data.title, text: text + " " + url, files: [SC]}; if (navigator.canShare(d2)) { navigator.share(d2).catch(function () {}); return; } }
    if (navigator.share && window.matchMedia && matchMedia("(pointer:coarse)").matches) { navigator.share(data).catch(function () {}); return; }
    var all = text + " " + url;
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(all).then(function () { toast(I.t("copied")); }, function () { prompt("", all); });
    else prompt("", all);
  }
  window.CL_share = share;
  function bind() {
    var b = document.querySelectorAll("[data-share]");
    for (var i = 0; i < b.length; i++) b[i].addEventListener("click", function (e) { e.preventDefault(); share(); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind); else bind();
})();
