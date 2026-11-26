// Compartilhar (Candy Shot): celular abre a janela nativa (WhatsApp, TikTok...); computador copia o link.
// No fim da partida o jogo grava window.CL_LAST = {mode, score, level, stars, win, day} e o texto leva a pontuacao.
(function () {
  var I = window.CL_I18N || {t: function (k) { return k; }, lang: "en"};
  var URL_ = "https://bartelgames.com.br/candy-shot/";
  var LPx = (location.pathname.match(/^\/(pt|es)\//) || [""])[0]; if (LPx) URL_ = URL_.replace(".com.br/", ".com.br" + LPx); /* versao /pt/ /es/ compartilha o link no idioma */
  function toast(msg) {
    var d = document.getElementById("toast");
    if (!d) { d = document.createElement("div"); d.id = "toast"; d.setAttribute("role", "status"); document.body.appendChild(d); }
    d.textContent = msg; d.classList.add("on");
    clearTimeout(d._t); d._t = setTimeout(function () { d.classList.remove("on"); }, 1800);
  }
  function stars(n) { var s = ""; for (var i = 0; i < 3; i++) s += i < n ? "⭐" : "☆"; return s; }
  function share() {
    var L = window.CL_LAST, text = I.t("shTxt0");
    if (L && L.score > 0) {
      var sc = Number(L.score).toLocaleString(document.documentElement.lang || "en");
      if (L.mode === "endless") text = I.t("shEnd", {s: sc});
      else if (L.mode === "daily" && L.win) text = I.t("shDay", {s: sc});
      else if (L.mode === "campaign" && L.win) text = I.t("shLvl", {n: String(L.level), s: sc, st: stars(L.stars)});
      else text = I.t("shTry", {s: sc});
    }
    var data = {title: I.t("title"), text: text, url: URL_};
    // so no celular (toque): no PC a janela de compartilhar do Windows manda para o WhatsApp SEM a foto de previa; la copia o link (2026-11-19)
    var SC = window.BG_card && L && L.score > 0 ? window.BG_card(Number(L.score).toLocaleString(document.documentElement.lang || "en"), text) : null;
    if (SC && navigator.canShare && window.matchMedia && matchMedia("(pointer:coarse)").matches) { var d2 = {title: data.title, text: text + " " + URL_, files: [SC]}; if (navigator.canShare(d2)) { navigator.share(d2).catch(function () {}); return; } }
    if (navigator.share && window.matchMedia && matchMedia("(pointer:coarse)").matches) { navigator.share(data).catch(function () {}); return; }
    var all = text + " " + URL_;
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
