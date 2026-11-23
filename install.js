// "Instalar na tela inicial" (2026-11-21): faixa discreta embaixo, so para quem ja voltou (2a visita em outro dia) ou terminou partidas.
// Android/Chrome: botao Instalar (janela oficial do navegador). iPhone/Safari: dica "Compartilhar > Adicionar a Tela de Inicio".
// Nunca dentro do app do TikTok/Instagram/Facebook (la nao instala), nunca para quem ja instalou, "Agora nao" = some por 30 dias.
// Nos jogos so aparece na tela de fim (evento bg-end do social.js), nunca durante a partida.
(function () {
  var TX = {
    en: {t: "Install Bartel Games", s: "Play right from your home screen, full screen.", b: "Install", n: "Not now", ios: "Tap {i} Share, then \"Add to Home Screen\"."},
    pt: {t: "Instale o Bartel Games", s: "Jogue direto da tela inicial, em tela cheia.", b: "Instalar", n: "Agora não", ios: "Toque em {i} Compartilhar e depois em \"Adicionar à Tela de Início\"."},
    es: {t: "Instala Bartel Games", s: "Juega desde la pantalla de inicio, a pantalla completa.", b: "Instalar", n: "Ahora no", ios: "Toca {i} Compartir y luego \"Agregar a inicio\"."},
    fr: {t: "Installe Bartel Games", s: "Joue depuis l'écran d'accueil, en plein écran.", b: "Installer", n: "Plus tard", ios: "Touche {i} Partager, puis « Sur l'écran d'accueil »."},
    de: {t: "Installiere Bartel Games", s: "Spiel direkt vom Startbildschirm, im Vollbild.", b: "Installieren", n: "Später", ios: "Tippe auf {i} Teilen und dann auf „Zum Home-Bildschirm“."},
    it: {t: "Installa Bartel Games", s: "Gioca dalla schermata Home, a schermo intero.", b: "Installa", n: "Non ora", ios: "Tocca {i} Condividi e poi \"Aggiungi alla schermata Home\"."}
  };
  var LG = String(document.documentElement.lang || "en").slice(0, 2), T = TX[LG] || TX.en;
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} return null; }
  function ev(kind) { try { window.BG_SOCIAL && window.BG_SOCIAL.event("site", kind); } catch (e) {} }
  var standalone = (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true;
  if (standalone) { if (/[?&]pwa=1/.test(location.search) && !sessionStorage.getItem("bg_pwa")) { try { sessionStorage.setItem("bg_pwa", "1"); } catch (e) {} setTimeout(function () { ev("pwa"); }, 1500); } return; }
  var ua = navigator.userAgent || "";
  if (/TikTok|musical_ly|Bytedance|BytedanceWebview|Instagram|FBAN|FBAV|FB_IAB|Line\/|Snapchat/i.test(ua)) return; // navegador de dentro de app: nao instala
  var iOS = /iPhone|iPad|iPod/.test(ua) && !window.MSStream, safari = iOS && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
  if (/[?&]instalar=ios/.test(location.search)) safari = true; /* teste: forca a dica do iPhone */
  var mobile = window.matchMedia && matchMedia("(pointer:coarse)").matches;
  // visitas em dias diferentes
  var today = new Date().toLocaleDateString("sv"), days = [];
  try { days = JSON.parse(ls("bg_visit_days") || "[]"); } catch (e) {}
  if (days.indexOf(today) < 0) { days.push(today); ls("bg_visit_days", JSON.stringify(days.slice(-30))); }
  var no = +ls("bg_inst_no") || 0; if (Date.now() - no < 30 * 864e5) return;
  var bip = null, shown = false, isGame = !!document.querySelector("#topbar .tb-r");
  addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); bip = e; maybe(); });
  addEventListener("appinstalled", function () { ev("install"); hide(); });
  var css = "#bg-inst{position:fixed;left:50%;bottom:calc(14px + env(safe-area-inset-bottom,0px));transform:translate(-50%,140%);width:min(440px,calc(100vw - 24px));z-index:9000;" +
    "display:flex;gap:12px;align-items:center;padding:12px 12px 12px 14px;border-radius:18px;background:#0f1f4a;border:1px solid #f7b60c88;box-shadow:0 12px 40px #000a;color:#fff;" +
    "font:500 14px/1.35 system-ui,sans-serif;transition:transform .35s cubic-bezier(.2,1.3,.4,1)}#bg-inst.on{transform:translate(-50%,0)}" +
    "#bg-inst img{width:46px;height:46px;border-radius:12px;flex:none}#bg-inst .tx{flex:1;min-width:0}#bg-inst b{display:block;font:800 16px/1.2 var(--title,var(--font,system-ui))}" +
    "#bg-inst .tx span{color:#b9c6e8}#bg-inst .bt{display:flex;flex-direction:column;gap:6px;flex:none}" +
    "#bg-inst button{border:0;border-radius:999px;padding:8px 16px;font:700 14px/1 var(--font,system-ui);cursor:pointer}" +
    "#bg-inst .go{background:linear-gradient(180deg,#ffe27a,#f7b60c);color:#2a1306}#bg-inst .no{background:transparent;color:#b9c6e8;padding:4px 8px}" +
    "#bg-inst .sh{display:inline-block;width:16px;height:16px;vertical-align:-3px}";
  var box = null;
  function build(iosMode) {
    var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    box = document.createElement("div"); box.id = "bg-inst"; box.setAttribute("role", "dialog"); box.setAttribute("aria-label", T.t);
    var im = document.createElement("img"); im.src = "/assets/app-96.webp"; im.alt = ""; box.appendChild(im);
    var tx = document.createElement("div"); tx.className = "tx"; var b = document.createElement("b"); b.textContent = T.t; tx.appendChild(b);
    var sp = document.createElement("span");
    if (iosMode) { var parts = T.ios.split("{i}"); sp.appendChild(document.createTextNode(parts[0]));
      var ic = document.createElementNS("http://www.w3.org/2000/svg", "svg"); ic.setAttribute("viewBox", "0 0 24 24"); ic.setAttribute("class", "sh");
      ic.innerHTML = '<path d="M12 3v12M7 8l5-5 5 5" fill="none" stroke="#6aa8ff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" fill="none" stroke="#6aa8ff" stroke-width="2.4" stroke-linecap="round"/>';
      sp.appendChild(ic); sp.appendChild(document.createTextNode(parts[1] || "")); }
    else sp.textContent = T.s;
    tx.appendChild(sp); box.appendChild(tx);
    var bt = document.createElement("div"); bt.className = "bt";
    if (!iosMode) { var go = document.createElement("button"); go.className = "go"; go.type = "button"; go.textContent = T.b;
      go.onclick = function () { if (!bip) return hide(); bip.prompt(); bip.userChoice.then(function (r) { if (r && r.outcome !== "accepted") { ls("bg_inst_no", String(Date.now())); ev("install_no"); } hide(); }); bip = null; };
      bt.appendChild(go); }
    var nb = document.createElement("button"); nb.className = "no"; nb.type = "button"; nb.textContent = T.n;
    nb.onclick = function () { ls("bg_inst_no", String(Date.now())); ev("install_no"); hide(); }; bt.appendChild(nb);
    box.appendChild(bt); document.body.appendChild(box);
    requestAnimationFrame(function () { requestAnimationFrame(function () { box.classList.add("on"); }); });
  }
  function hide() { if (box) { box.classList.remove("on"); setTimeout(function () { if (box) box.remove(); box = null; }, 400); } }
  var plays = 0;
  function ready() { return days.length >= 2 || plays >= 2 || /[?&]instalar=/.test(location.search); }
  function maybe(force) {
    if (shown || !mobile && !/[?&]instalar=/.test(location.search)) return;
    if (!(bip || safari)) return;
    if (!ready()) return;
    if (isGame && !force) return; // no jogo: so na tela de fim
    shown = true; ev("install_ask"); build(!bip && safari);
  }
  addEventListener("bg-play", function () { plays++; hide(); });
  addEventListener("bg-end", function () { setTimeout(function () { maybe(true); }, 2200); });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(maybe, 1500); }); else setTimeout(maybe, 1500);
})();
