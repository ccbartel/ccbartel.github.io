// Codigo comum das paginas: nome do site, e-mail e banners AdSense (le site-config.js).
(function () {
  var C = window.SITE_CONFIG || {};
  var loaded = false;

  function loadAdSense() {
    if (loaded || !C.ADSENSE_CLIENT) return;
    loaded = true;
    var s = document.createElement("script");
    s.async = true;
    s.crossOrigin = "anonymous";
    s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(C.ADSENSE_CLIENT);
    document.head.appendChild(s);
  }

  function fillAd(box) {
    var slot = C[box.getAttribute("data-ad-slot-key")] || "";
    box.innerHTML = "";
    if (C.ADSENSE_CLIENT && slot) {
      loadAdSense();
      var ins = document.createElement("ins");
      ins.className = "adsbygoogle";
      ins.style.cssText = "display:block;width:100%;height:100%";
      ins.setAttribute("data-ad-client", C.ADSENSE_CLIENT);
      ins.setAttribute("data-ad-slot", slot);
      ins.setAttribute("data-full-width-responsive", "false");
      box.appendChild(ins);
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } else {
      var ph = document.createElement("div");
      ph.className = "ad-placeholder";
      ph.textContent = window.SITE_I18N ? window.SITE_I18N.t("ad_space") : "Ad space";
      ph.style.cssText = "width:100%;height:100%;max-height:90px;display:flex;align-items:center;justify-content:center;" +
        "border:1px dashed #ffffff2e;border-radius:8px;color:#ffffff55;font:600 12px/1 system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase";
      box.appendChild(ph);
    }
  }

  function init() {
    var i, els;
    els = document.querySelectorAll("[data-site-name]");
    for (i = 0; i < els.length; i++) if (C.SITE_NAME) els[i].textContent = C.SITE_NAME;
    els = document.querySelectorAll("[data-contact-email]");
    for (i = 0; i < els.length; i++) if (C.CONTACT_EMAIL) {
      els[i].textContent = C.CONTACT_EMAIL;
      if (els[i].tagName === "A") els[i].href = "mailto:" + C.CONTACT_EMAIL;
    }
    els = document.querySelectorAll("[data-year]");
    for (i = 0; i < els.length; i++) els[i].textContent = String(new Date().getFullYear());
    els = document.querySelectorAll("[data-ad-slot-key]");
    for (i = 0; i < els.length; i++) {
      // banner opcional (vitrine): com AdSense ligado mas sem slot, o espaco some em vez de mostrar "Ad space"
      var opt = els[i].closest("[data-ad-optional]");
      if (opt && C.ADSENSE_CLIENT && !C[els[i].getAttribute("data-ad-slot-key")]) { opt.style.display = "none"; continue; }
      fillAd(els[i]);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();

// PWA: permite "Adicionar a tela inicial" (so em https ou localhost)
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
  window.addEventListener("load", function () { navigator.serviceWorker.register("/sw.js").catch(function () {}); });
}
