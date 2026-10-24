/*!
 * FLCR Patrimoine - Confort des formulaires du site
 * 1. Téléphone : mise en forme 06 12 34 56 78, pas de 11e chiffre, envoi bloqué si numéro invalide
 *    (international accepté : +33 6 12 34 56 78, +41 79 123 45 67, 0044…).
 * 2. E-mail : envoi bloqué si l'adresse est mal formée, suggestion en cas de faute de frappe
 *    (gmial.com -> gmail.com, .con -> .com…), un clic corrige.
 * 3. Message : la zone ne se redimensionne plus à la main, elle s'agrandit toute seule avec le texte.
 * 4. Champs obligatoires sans libellé visible : une étoile est ajoutée au texte d'exemple (Nom *) ;
 *    menu déroulant sans libellé visible : le libellé ("Projet") s'affiche en gris dans le champ.
 * 5. Google Ads : un clic sur un lien téléphone (tel:) ou WhatsApp (wa.me) est compté comme conversion
 *    "Clic téléphone (site)" / "Clic WhatsApp (site)" (objectif Contact). Les formulaires sont comptés
 *    par la page /merci, déjà en place dans la balise Google.
 * Intégration : <script src="https://flcr-patrimoine.github.io/flcr-avis/formulaires.js" defer></script>
 */
(function () {
  "use strict";
  if (window.__flcrFormulaires) return;
  window.__flcrFormulaires = true;

  var css = document.createElement("style");
  css.textContent =
    "form textarea{resize:none!important;overflow-y:hidden;}" +
    ".flcr-msg{color:#E0584D;font-size:13px;line-height:1.4;margin-top:6px;}" +
    ".flcr-msg button{all:unset;cursor:pointer;text-decoration:underline;font-weight:600;color:inherit;}";
  (document.head || document.documentElement).appendChild(css);

  /* ---------- Message d'aide sous un champ ---------- */
  function hint(inp, text, fix) {
    var box = inp.parentNode, el = box && box.querySelector(".flcr-msg");
    if (text && !el && box) {
      el = document.createElement("div");
      el.className = "flcr-msg";
      el.setAttribute("role", "alert");
      box.appendChild(el);
    }
    if (el) {
      el.textContent = text || "";
      if (text && fix) {
        var b = document.createElement("button");
        b.type = "button";
        b.textContent = fix;
        b.addEventListener("click", function () {
          inp.value = fix;
          inp.dataset.flcrOk = "";
          hint(inp, null);
          inp.focus();
        });
        el.textContent = "Vouliez-vous dire ";
        el.appendChild(b);
        el.appendChild(document.createTextNode(" ?"));
      }
      el.style.display = text ? "block" : "none";
    }
    inp.setCustomValidity(text && !fix ? text : "");
    inp.setAttribute("aria-invalid", text ? "true" : "false");
  }

  /* ---------- Message : hauteur automatique ---------- */
  function grow(t) {
    if (!t.dataset.flcrMin) t.dataset.flcrMin = t.offsetHeight || 80;
    var min = +t.dataset.flcrMin, max = Math.round(window.innerHeight * 0.6);
    var extra = t.offsetHeight - t.clientHeight;
    t.style.height = "auto";
    var h = Math.max(min, t.scrollHeight + extra);
    t.style.height = Math.min(h, max) + "px";
    t.style.overflowY = h > max ? "auto" : "hidden";
  }
  function isArea(t) { return t && t.tagName === "TEXTAREA" && t.form; }

  /* ---------- Téléphone ---------- */
  var MSG_TEL = "Numéro invalide : 10 chiffres, par exemple 06 12 34 56 78 (ou format international +33…)";
  function digits(v) { return String(v || "").replace(/[^\d+]/g, ""); }
  function telOk(v) {
    var d = digits(v);
    if (!d) return true; /* champ vide : géré par le caractère obligatoire du formulaire */
    if (/^0[1-9]\d{8}$/.test(d)) return true;
    if (/^(\+|00)33[1-9]\d{8}$/.test(d)) return true;
    if (/^(\+|00)(?!33)[1-9]\d{6,13}$/.test(d)) return true;
    return false;
  }
  function telFormat(v) {
    var d = digits(v);
    if (/^0[1-9]\d{8}$/.test(d)) return d.replace(/(\d{2})(?=\d)/g, "$1 ");
    if (/^\+33[1-9]\d{8}$/.test(d)) return "+33 " + d.slice(3, 4) + " " + d.slice(4).replace(/(\d{2})(?=\d)/g, "$1 ");
    return v;
  }
  function isTel(t) { return t && t.tagName === "INPUT" && t.type === "tel"; }

  /* ---------- E-mail ---------- */
  var MSG_MAIL = "Adresse e-mail invalide, par exemple prenom.nom@gmail.com";
  var TYPOS = {
    "gmial.com": "gmail.com", "gmal.com": "gmail.com", "gmaill.com": "gmail.com", "gamil.com": "gmail.com",
    "gnail.com": "gmail.com", "gmai.com": "gmail.com", "gmail.co": "gmail.com", "gmail.cm": "gmail.com",
    "gmail.om": "gmail.com", "gmail.fr": "gmail.com", "gmail.cmo": "gmail.com", "gmeil.com": "gmail.com",
    "hotmial.com": "hotmail.com", "hotmal.com": "hotmail.com", "hotmil.com": "hotmail.com", "hotmai.com": "hotmail.com",
    "homail.com": "hotmail.com", "hotmial.fr": "hotmail.fr", "hotmal.fr": "hotmail.fr", "hotmil.fr": "hotmail.fr",
    "hotmai.fr": "hotmail.fr", "homail.fr": "hotmail.fr", "hotmail.co": "hotmail.com",
    "outlok.com": "outlook.com", "outloo.com": "outlook.com", "outlook.co": "outlook.com", "outlok.fr": "outlook.fr",
    "yaho.fr": "yahoo.fr", "yahooo.fr": "yahoo.fr", "yaho.com": "yahoo.com", "yahooo.com": "yahoo.com",
    "oragne.fr": "orange.fr", "orage.fr": "orange.fr", "ornage.fr": "orange.fr", "orange.fe": "orange.fr",
    "wanadoo.com": "wanadoo.fr", "wanado.fr": "wanadoo.fr", "laposte.fr": "laposte.net", "lapost.net": "laposte.net",
    "fre.fr": "free.fr", "icloud.fr": "icloud.com", "iclould.com": "icloud.com", "icoud.com": "icloud.com"
  };
  function mailClean(v) { return String(v || "").trim().replace(/\s+/g, "").toLowerCase(); }
  function mailOk(v) { return !v || /^[^@\s]+@[^@\s.]+(\.[^@\s.]+)*\.[a-z]{2,}$/i.test(v); }
  function mailSuggest(v) {
    var at = v.lastIndexOf("@");
    if (at < 1) return null;
    var dom = v.slice(at + 1), fixed = TYPOS[dom];
    if (!fixed) {
      var t = dom.replace(/\.(con|cmo|vom|cpm|coom|comm|cim)$/, ".com").replace(/\.(frr|fe|dr|ft)$/, ".fr");
      if (t !== dom) fixed = TYPOS[t] || t;
    }
    return fixed ? v.slice(0, at + 1) + fixed : null;
  }
  function isMail(t) { return t && t.tagName === "INPUT" && t.type === "email"; }
  function checkMail(inp, strict) {
    var v = mailClean(inp.value);
    if (inp.value !== v) inp.value = v;
    if (!v) { hint(inp, null); return true; }
    if (!mailOk(v)) { hint(inp, MSG_MAIL); return false; }
    var s = mailSuggest(v);
    if (s && inp.dataset.flcrOk !== v) {
      hint(inp, "x", s);
      if (strict) { inp.dataset.flcrOk = v; return false; } /* 1er envoi bloqué ; si la personne confirme, on laisse passer */
      return true;
    }
    hint(inp, null);
    return true;
  }

  /* ---------- Écoutes ---------- */
  document.addEventListener("input", function (e) {
    var t = e.target;
    if (isArea(t)) { grow(t); return; }
    if (isTel(t)) {
      var d = digits(t.value);
      if (/^0/.test(d) && d.length > 10) t.value = telFormat(d.slice(0, 10)); /* pas de 11e chiffre */
      if (t.getAttribute("aria-invalid") === "true") hint(t, telOk(t.value) ? null : MSG_TEL);
    }
    if (isMail(t) && t.getAttribute("aria-invalid") === "true") {
      var v = mailClean(t.value);
      if (mailOk(v) && !mailSuggest(v)) hint(t, null);
    }
  }, true);

  document.addEventListener("focusout", function (e) {
    var t = e.target;
    if (isTel(t) && t.value.trim()) { t.value = telFormat(t.value); hint(t, telOk(t.value) ? null : MSG_TEL); }
    if (isMail(t) && t.value.trim()) checkMail(t, false);
  }, true);

  function guard(form, e) {
    if (!form) return;
    var bad = null;
    Array.prototype.forEach.call(form.querySelectorAll("input[type=tel]"), function (inp) {
      inp.value = telFormat(inp.value);
      var ok = telOk(inp.value);
      hint(inp, ok ? null : MSG_TEL);
      if (!ok && !bad) bad = inp;
    });
    Array.prototype.forEach.call(form.querySelectorAll("input[type=email]"), function (inp) {
      if (!checkMail(inp, true) && !bad) bad = inp;
    });
    if (bad) {
      e.preventDefault();
      e.stopImmediatePropagation();
      bad.focus();
    }
  }
  document.addEventListener("click", function (e) {
    var b = e.target && e.target.closest && e.target.closest("input[type=submit],button[type=submit],button:not([type])");
    if (b && b.form && !b.closest(".flcr-msg")) guard(b.form, e);
  }, true);
  document.addEventListener("submit", function (e) { guard(e.target, e); }, true);

  /* ---------- Google Ads : clics téléphone et WhatsApp ---------- */
  var ADS = {
    tel: "AW-18511725274/UlYWCOLWn6gdENqFivtE",
    wa: "AW-18511725274/6m65COXWn6gdENqFivtE"
  };
  var vu = {};
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    var h = a.getAttribute("href") || "";
    var type = /^tel:/i.test(h) ? "tel" : /(wa\.me\/|api\.whatsapp\.com|^whatsapp:)/i.test(h) ? "wa" : null;
    if (!type || vu[type] || typeof window.gtag !== "function") return;
    vu[type] = true; /* une fois par page suffit (Google Ads compte 1 conversion par clic sur annonce) */
    try { window.gtag("event", "conversion", { send_to: ADS[type], transport_type: "beacon" }); } catch (err) {}
  }, true);

  /* ---------- Préparation des champs ---------- */
  function prep() {
    Array.prototype.forEach.call(document.querySelectorAll("input[type=tel]"), function (inp) {
      inp.setAttribute("inputmode", "tel");
      inp.setAttribute("autocomplete", "tel");
    });
    Array.prototype.forEach.call(document.querySelectorAll("input[type=email]"), function (inp) {
      inp.setAttribute("autocomplete", "email");
      inp.setAttribute("autocapitalize", "off");
      inp.setAttribute("spellcheck", "false");
    });
    Array.prototype.forEach.call(document.querySelectorAll("form textarea"), function (t) {
      t.dataset.flcrMin = t.offsetHeight || 80;
      if (t.value) grow(t);
    });
    /* Menu déroulant dont le libellé est masqué : le libellé s'affiche dans le champ ("Projet"), en gris comme un texte d'exemple */
    Array.prototype.forEach.call(document.querySelectorAll(".dmforminput select"), function (s) {
      var w = s.closest(".dmforminput"), lab = w && w.querySelector("label");
      if (!lab || s.dataset.flcrPh) return;
      var hidden = lab.getAttribute("hide") === "true" || getComputedStyle(lab).display === "none";
      var o = s.options[0];
      if (!hidden || !o || o.value !== "" || o.text.trim()) return;
      s.dataset.flcrPh = "1";
      o.text = lab.textContent.replace(/\s*\*\s*$/, "").trim() + (s.required ? " *" : "");
      var ref = w.parentNode && w.parentNode.querySelector("input[placeholder]");
      var gris = "";
      try { gris = ref ? getComputedStyle(ref, "::placeholder").color : ""; } catch (e) {}
      var maj = function () {
        var vide = !s.value;
        // !important : certains thèmes Duda imposent la couleur du texte des champs (formulaire sur fond marine)
        if (vide && gris) s.style.setProperty("color", gris, "important"); else s.style.removeProperty("color");
        s.style.fontStyle = vide && ref ? getComputedStyle(ref, "::placeholder").fontStyle : "";
        // Liste ouverte : texte foncé sur fond blanc (sinon texte clair illisible sur le formulaire fond marine)
        Array.prototype.forEach.call(s.options, function (x) { x.style.color = "#0A1933"; x.style.backgroundColor = "#FFFFFF"; x.style.fontStyle = "normal"; });
      };
      s.addEventListener("change", maj);
      maj();
    });
    /* Étoile sur les champs obligatoires dont le libellé est masqué (le texte d'exemple sert de libellé) */
    Array.prototype.forEach.call(document.querySelectorAll(".dmforminput.required"), function (w) {
      var lab = w.querySelector("label"), inp = w.querySelector("input:not([type=hidden]),textarea,select");
      if (!inp || !inp.placeholder || /\*\s*$/.test(inp.placeholder)) return;
      var hidden = !lab || lab.getAttribute("hide") === "true" || getComputedStyle(lab).display === "none";
      if (!hidden) return;
      inp.placeholder = inp.placeholder + " *";
      if (inp.hasAttribute("data-placeholder-original")) inp.setAttribute("data-placeholder-original", inp.placeholder);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", prep);
  else prep();
})();
