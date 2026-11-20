// Compartilhar: celular abre a janela nativa (WhatsApp, TikTok...); computador copia o link.
// Na tela final o jogo grava window.CL_LAST = {mode, score, daily, goal, done, tries} e o texto leva a pontuacao.
(function () {
  var I = window.CL_I18N || {t: function (k, f) { return k; }, lang: "en"};
  var URL_ = "https://bartelgames.com.br/burnout-city/";
  function toast(msg) {
    var d = document.getElementById("toast");
    if (!d) { d = document.createElement("div"); d.id = "toast"; d.setAttribute("role", "status"); document.body.appendChild(d); }
    d.textContent = msg; d.classList.add("on");
    clearTimeout(d._t); d._t = setTimeout(function () { d.classList.remove("on"); }, 1800);
  }
  function share() {
    var L = window.CL_LAST;
    var text = I.t("shTxt0");
    if (L && L.mode === "daily") text = L.done ? (L.tries === 1 ? I.t("shMis1", {n: String(L.daily)}) : I.t("shMis", {n: String(L.daily), t: String(L.tries)})) : I.t("shMisTry", {n: String(L.daily), s: String(L.score), g: String(L.goal)});
    else if (L && L.mode === "cones") text = I.t("shCones", String(L.score));
    else if (L) text = I.t("shTxt", String(L.score));
    var url = URL_;
    var data = {title: I.t("title"), text: text, url: url};
    // so no celular (toque): no PC a janela de compartilhar do Windows manda para o WhatsApp SEM a foto de previa; la copia o link e a pessoa cola (2026-11-19)
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
