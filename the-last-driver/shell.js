// The Last Driver: moldura do site. O jogo roda no <iframe id="game"> (play.html, layout proprio retrato/paisagem que usa a
// janela inteira); aqui ficam a barra do topo, o Como jogar, o ranking, o compartilhar e o anuncio (igual aos outros jogos).
(function () {
  var I = window.CL_I18N || {lang: "en"};
  var fr = document.getElementById("game");
  // palco padrao do site (igual ao Burnout City): 9:16 escalado e centralizado com cantos arredondados; celular em pe (tela
  // mais estreita que 0,6) = palco ocupa a altura toda (.full). O iframe tem o tamanho real do palco: o jogo roda no layout
  // retrato aprovado e os toques chegam em coordenadas normais (sem transform de escala).
  var stage = document.getElementById("stage"), app = document.getElementById("app");
  function layout() {
    var cs = getComputedStyle(app);
    var aw = app.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    var ah = app.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    var h = Math.min(ah, aw * 16 / 9), w = Math.floor(h * 9 / 16); h = Math.floor(w * 16 / 9);
    var tall = ah > h + 2 && aw / ah < 0.6; if (tall) h = Math.floor(ah);
    stage.classList.toggle("full", tall);
    stage.style.width = w + "px"; stage.style.height = h + "px";
  }
  layout(); addEventListener("resize", layout); addEventListener("orientationchange", layout);
  function win() { try { return fr.contentWindow; } catch (e) { return null; } }
  // endereco do jogo: idioma desta pagina + parametros de teste (?teste=1, etc.)
  var q = new URLSearchParams(location.search); q.set("lang", I.lang || "en");
  // MANUTENCAO (2026-11-22, pedido do Cristiano: jogo pesado no celular). Em manutencao o jogo NAO carrega para o publico;
  // so no localhost/127.0.0.1 (testes). Para reabrir: MANUT = false e publicar (e voltar o card/DAILY).
  var MANUT = false, LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  if (MANUT && !LOCAL && !q.has("preview")) {   // ?preview=1: o Cristiano testa no celular mesmo em manutencao
    var L = (I.lang || "en").slice(0, 2), T = {
      pt: ["Em manutenção", "Estamos deixando o The Last Driver mais leve e rápido no celular. Volte em breve!", "Ver outros jogos"],
      es: ["En mantenimiento", "Estamos haciendo The Last Driver más ligero y rápido en el móvil. ¡Vuelve pronto!", "Ver otros juegos"],
      en: ["Under maintenance", "We are making The Last Driver lighter and faster on phones. Come back soon!", "See other games"] }[L] || null;
    var t = T || ["Under maintenance", "We are making The Last Driver lighter and faster on phones. Come back soon!", "See other games"];
    fr.remove();
    var m = document.createElement("div");
    m.style.cssText = "position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:24px;text-align:center;background:#1d1714 url(assets/cover.jpg) center/cover;color:#fff;font-family:Oswald,system-ui,sans-serif";
    m.innerHTML = '<div style="background:#1d1714e6;border:4px solid #ffffffd0;border-radius:22px;padding:22px 20px;max-width:88%;box-shadow:0 4px 0 #000a"><div style="font:700 30px/1.1 Oswald,system-ui,sans-serif;color:#f7b60c;text-transform:uppercase"></div><p style="margin:12px 0 18px;font:400 17px/1.35 system-ui,sans-serif"></p><a href="../" style="display:inline-block;padding:12px 22px;border-radius:14px;background:linear-gradient(180deg,#ffe27a,#f7b60c);color:#2a1306;font:700 20px/1 Oswald,system-ui,sans-serif;text-decoration:none;border:4px solid #fff;box-shadow:0 4px 0 #000a;text-transform:uppercase"></a></div>';
    m.querySelector("div div").textContent = t[0]; m.querySelector("p").textContent = t[1]; m.querySelector("a").textContent = t[2];
    stage.appendChild(m);
    return;
  }
  fr.src = fr.getAttribute("data-src") + "?" + q.toString();
  fr.addEventListener("load", function () { try { fr.focus(); } catch (e) {} });
  // som: botao da barra do topo (ligado por padrao; a escolha fica salva e o jogo le a mesma chave)
  var sb = document.getElementById("topsnd");
  function sndOn() { try { return localStorage.getItem("tld_snd") !== "0"; } catch (e) { return true; } }
  function draw() { var on = sndOn(); sb.setAttribute("aria-pressed", on ? "true" : "false"); sb.classList.toggle("on", on); }
  if (sb) {
    draw(); sb.hidden = false;
    sb.addEventListener("click", function () {
      var on = !sndOn(); try { localStorage.setItem("tld_snd", on ? "1" : "0"); } catch (e) {}
      var w = win(); try { if (w && w.TLD_SOUND) w.TLD_SOUND(on); } catch (e) {}
      draw();
    });
  }
  // janela do site aberta (Como jogar, ranking, mural...) = pausa a partida; fechou = foco volta ao jogo (teclado)
  function watch(d) {
    new MutationObserver(function () {
      var w = win();
      if (d.open) { try { if (w && w.TLD_PAUSE) w.TLD_PAUSE(); } catch (e) {} }
      else { try { fr.focus(); } catch (e) {} }
    }).observe(d, {attributes: true, attributeFilter: ["open"]});
  }
  // convite "Escolha um apelido" (social-ui.js): la ele so desvia dos botoes desta pagina; os do jogo estao no iframe.
  // Mesma regra (embaixo; se cobrir botao, em cima; se cobrir tambem, some e o convite fica no ranking) com os botoes e painéis do jogo
  // (painel incluido: no PC o painel do fim ocupa a altura toda e o convite em cima cobria o titulo).
  function hitsGame(r) {
    var w = win(); if (!w) return false; var fb = fr.getBoundingClientRect(), bs;
    try { bs = w.document.querySelectorAll("#nui button, #nui .npanel"); } catch (e) { return false; }
    for (var i = 0; i < bs.length; i++) { var b = bs[i].getBoundingClientRect(); if (b.width < 2 || b.height < 2 || !bs[i].offsetParent) continue;
      var L = b.left + fb.left, T = b.top + fb.top; if (L + b.width > r.left && L < r.right && T + b.height > r.top && T < r.bottom) return true; }
    return false;
  }
  function placeCta(c) {
    if (!c.classList.contains("on")) return;
    if (!hitsGame(c.getBoundingClientRect())) return;
    if (!c.classList.contains("top")) { c.classList.add("top"); if (!hitsGame(c.getBoundingClientRect())) return; }
    c.classList.remove("on");
  }
  function ctaWatch(c) { c._tldw = 1; new MutationObserver(function () { placeCta(c); setTimeout(function () { placeCta(c); }, 400); setTimeout(function () { placeCta(c); }, 1200); }).observe(c, {attributes: true, attributeFilter: ["class"]}); placeCta(c); }
  function scan() { var ds = document.querySelectorAll("dialog"); for (var i = 0; i < ds.length; i++) if (!ds[i]._tldw) { ds[i]._tldw = 1; watch(ds[i]); }
    var c = document.getElementById("bg-cta"); if (c && !c._tldw) ctaWatch(c); }
  scan(); new MutationObserver(scan).observe(document.body, {childList: true});
})();
