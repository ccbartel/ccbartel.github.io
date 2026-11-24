// Compartilhar: celular abre a janela nativa (WhatsApp, TikTok...); computador copia o link.
// Na tela final o jogo grava window.CL_LAST = {mode: 'campaign', score, p, l} e o texto leva a pontuação.
(function () {
  var I = window.CL_I18N || {t: function (k, f) { return k; }, lang: "en"};
  var URL_ = "https://bartelgames.com.br/crazy-parking/";
  var LPx = (location.pathname.match(/^\/(pt|es)\//) || [""])[0]; if (LPx) URL_ = URL_.replace(".com.br/", ".com.br" + LPx); /* versão /pt/ /es/ compartilha o link no idioma */
  function toast(msg) {
    var d = document.getElementById("toast");
    if (!d) { d = document.createElement("div"); d.id = "toast"; d.setAttribute("role", "status"); document.body.appendChild(d); }
    d.textContent = msg; d.classList.add("on");
    clearTimeout(d._t); d._t = setTimeout(function () { d.classList.remove("on"); }, 1800);
  }
  function share() {
    var L = window.CL_LAST;
    var text = (L && L.mode === "campaign" && L.score > 0) ? I.t(L.fin ? "shDone" : "shProg", {s: String(L.score), p: String(L.p || 0), l: String(L.l || 0)}) : I.t("shTxt0");
    if (L && L.mode === "daily") text = I.t("shDaily", {d: String(L.daily), t: String(L.tries || 1)});
    else if (L && L.link) text = I.t("shDuel", {s: String(L.score)});
    var url = (L && L.link) || URL_;
    var data = {title: I.t("title"), text: text, url: url};
    // só no celular (toque): no PC a janela de compartilhar do Windows manda para o WhatsApp SEM a foto de prévia; lá copia o link (2026-11-19)
    var SC = window.BG_card && L && L.score > 0 ? window.BG_card(Number(L.score).toLocaleString(document.documentElement.lang || "en"), text) : null; /* cartão com a pontuação (scorecard.js) */
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
