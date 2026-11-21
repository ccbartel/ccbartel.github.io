// Cartao de pontuacao para compartilhar (2026-11-21): imagem 1080x1350 com a arte do jogo (og:image da pagina), o numero grande,
// a frase do desafio e o endereco do site. Gerado no proprio aparelho (canvas), sem servidor. Os share.js chamam window.BG_card(grande, texto)
// e, no celular, mandam a imagem junto no compartilhar (WhatsApp, Stories...). Tudo SINCRONO: o navigator.share precisa do toque do usuario.
(function () {
  var img = null, ok = false;
  function ogPath() {
    var m = document.querySelector('meta[property="og:image"]'); if (!m) return "";
    try { var u = new URL(m.getAttribute("content"), location.href); return u.pathname + u.search; } catch (e) { return ""; } // mesmo dominio: o canvas nao fica "sujo"
  }
  function load() { var u = ogPath(); if (!u) return; img = new Image(); img.onload = function () { ok = true; }; img.src = u; }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", load); else load();
  function lines(x, t, maxW, max) {
    var w = String(t).split(/\s+/), out = [], cur = "";
    for (var i = 0; i < w.length; i++) { var tr = cur ? cur + " " + w[i] : w[i]; if (x.measureText(tr).width > maxW && cur) { out.push(cur); cur = w[i]; } else cur = tr; }
    if (cur) out.push(cur);
    if (out.length > max) { out = out.slice(0, max); out[max - 1] = out[max - 1].replace(/\s*\S*$/, "") + "…"; }
    return out;
  }
  function rrect(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
  window.BG_card = function (big, text) {
    try {
      var W = 1080, H = 1350, c = document.createElement("canvas"); c.width = W; c.height = H; var x = c.getContext("2d");
      var g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#13265a"); g.addColorStop(1, "#060d24"); x.fillStyle = g; x.fillRect(0, 0, W, H);
      var y0 = 330;
      if (ok && img.width) {
        var ih = Math.round(W * img.height / img.width); x.drawImage(img, 0, 0, W, ih); y0 = ih;
        var f = x.createLinearGradient(0, ih - 140, 0, ih + 2); f.addColorStop(0, "rgba(11,23,54,0)"); f.addColorStop(1, "#0f1f4a"); x.fillStyle = f; x.fillRect(0, ih - 140, W, 142);
      }
      var FONT = 'Fredoka, "Baloo 2", "Arial Rounded MT Bold", "Arial Black", sans-serif';
      big = String(big); x.textAlign = "center"; x.textBaseline = "middle"; x.lineJoin = "round";
      var fs = big.length > 7 ? 150 : big.length > 5 ? 190 : 230; x.font = "800 " + fs + "px " + FONT;
      var cy = y0 + 175; x.lineWidth = 28; x.strokeStyle = "#0d1430"; x.strokeText(big, W / 2, cy);
      var gg = x.createLinearGradient(0, cy - fs / 2, 0, cy + fs / 2); gg.addColorStop(0, "#ffe680"); gg.addColorStop(0.55, "#ffc93a"); gg.addColorStop(1, "#f08c00"); x.fillStyle = gg; x.fillText(big, W / 2, cy);
      x.font = "700 50px " + FONT; x.fillStyle = "#ffffff"; var L = lines(x, text, W - 150, 3);
      for (var i = 0; i < L.length; i++) x.fillText(L[i], W / 2, y0 + 340 + i * 64);
      var ft = "bartelgames.com.br"; x.font = "800 46px " + FONT; var tw = x.measureText(ft).width + 90, bx = (W - tw) / 2, by = H - 150;
      rrect(x, bx, by, tw, 90, 45); x.fillStyle = "#f7b60c"; x.fill(); x.fillStyle = "#2a1306"; x.fillText(ft, W / 2, by + 47);
      var d = c.toDataURL("image/jpeg", 0.88).split(",")[1], bin = atob(d), arr = new Uint8Array(bin.length);
      for (var k = 0; k < bin.length; k++) arr[k] = bin.charCodeAt(k);
      return new File([arr], "bartelgames.jpg", {type: "image/jpeg"});
    } catch (e) { return null; }
  };
})();
