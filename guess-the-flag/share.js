// Compartilhar: celular abre a janela nativa (WhatsApp, TikTok...); computador copia o link.
// Na tela final o jogo grava window.GTF_LAST = {score, rounds} e o texto leva a pontuacao.
(function () {
  var I = window.GTF_I18N || {t: function (k, f) { return k; }, lang: "en"};
  var URL_ = "https://bartelgames.com.br/guess-the-flag/";
  function toast(msg) {
    var d = document.getElementById("toast");
    if (!d) { d = document.createElement("div"); d.id = "toast"; d.setAttribute("role", "status"); document.body.appendChild(d); }
    d.textContent = msg; d.classList.add("on");
    clearTimeout(d._t); d._t = setTimeout(function () { d.classList.remove("on"); }, 1800);
  }
  function share() {
    var L = window.GTF_LAST;
    var text = L ? I.t("shTxt", String(L.score)) : I.t("shTxt0");
    var data = {title: I.t("title"), text: text, url: URL_};
    if (navigator.share) { navigator.share(data).catch(function () {}); return; }
    var all = text + " " + URL_;
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(all).then(function () { toast(I.t("copied")); }, function () { prompt("", all); });
    else prompt("", all);
  }
  window.GTF_share = share;
  function bind() {
    var b = document.querySelectorAll("[data-share]");
    for (var i = 0; i < b.length; i++) b[i].addEventListener("click", function (e) { e.preventDefault(); share(); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind); else bind();
})();
