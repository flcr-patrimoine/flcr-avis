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
 * 6. Statistiques anonymes pour le tableau de bord FLCR (flcr-pilotage-seo.lovable.app) : pages vues et clics
 *    Appeler / WhatsApp / e-mail / formulaire envoyé (/merci), avec la source de la visite (annonce, fiche Google,
 *    recherche, direct), temps passé, profondeur de lecture et temps de chargement par page, numéro ou e-mail copié,
 *    formulaire commencé, boutons cliqués, questions de la FAQ ouvertes, simulateur de loyer utilisé. Aucun cookie, aucune donnée saisie : la source
 *    de la visite et un numéro de visite tiré au hasard sont gardés le temps de l'onglet (sessionStorage) pour relier
 *    les pages d'une même visite ; ils disparaissent à la fermeture de l'onglet.
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
    ".flcr-msg button{all:unset;cursor:pointer;text-decoration:underline;font-weight:600;color:inherit;}" +
    /* Remplissage automatique du navigateur (Chrome, Safari) : garder le fond et la couleur du texte du champ,
       sinon le texte blanc des formulaires sur fond marine devient invisible sur le fond bleu clair du navigateur */
    "form input:-webkit-autofill,form input:-webkit-autofill:hover,form input:-webkit-autofill:focus,form textarea:-webkit-autofill,form select:-webkit-autofill{" +
    "-webkit-text-fill-color:var(--flcr-af-fg,currentColor)!important;caret-color:var(--flcr-af-fg,currentColor);" +
    "-webkit-box-shadow:0 0 0 1000px var(--flcr-af-bg,#fff) inset!important;box-shadow:0 0 0 1000px var(--flcr-af-bg,#fff) inset!important;" +
    "transition:background-color 99999s ease-out 0s;}";
  (document.head || document.documentElement).appendChild(css);

  /* Couleur CSS en [r, g, b, a] */
  function couleur(c) { var m = String(c || "").match(/[\d.]+/g) || []; return m.length < 3 ? null : [+m[0], +m[1], +m[2], m[3] === undefined ? 1 : +m[3]]; }

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

  /* ---------- Statistiques anonymes (tableau de bord FLCR) ---------- */
  var STATS_URL = "https://flcr-pilotage-seo.lovable.app/api/public/site-event";
  var statsOn = /(^|\.)flcr-patrimoine\.fr$/i.test(location.hostname) && !/[?&](dm_device|preview|nee)=/i.test(location.search);
  var visite = null;
  /* Exclure ses propres visites : ouvrir une fois le site avec ?flcr_interne=1 sur chaque appareil (?flcr_interne=0 pour annuler). */
  try {
    var interneParam = new URLSearchParams(location.search).get("flcr_interne");
    if (interneParam === "1") localStorage.setItem("flcr_interne", "1");
    if (interneParam === "0") localStorage.removeItem("flcr_interne");
    if (localStorage.getItem("flcr_interne") === "1") statsOn = false;
  } catch (e) {}
  if (statsOn) {
    try {
      var refHost = "";
      try { refHost = document.referrer ? new URL(document.referrer).hostname : ""; } catch (e) {}
      var interne = /(^|\.)flcr-patrimoine\.fr$/i.test(refHost);
      var stocke = null;
      try { stocke = JSON.parse(sessionStorage.getItem("flcr_v") || "null"); } catch (e) {}
      if (!stocke || !interne || !stocke.v) {
        /* Nouvelle visite : on ne garde que la provenance (paramètres de campagne, présence d'un clic d'annonce, site d'origine). */
        var src = new URLSearchParams(location.search), q = new URLSearchParams();
        ["utm_source", "utm_medium", "utm_campaign"].forEach(function (k) { if (src.get(k)) q.set(k, src.get(k).slice(0, 80)); });
        ["gclid", "gbraid", "wbraid"].forEach(function (k) { if (src.has(k)) q.set(k, "1"); });
        var garde = stocke && interne; /* visite déjà en cours, enregistrée avant l'ajout du numéro */
        visite = garde ? { q: stocke.q || "", r: stocke.r || "", l: false } : { q: q.toString(), r: interne ? "" : refHost, l: true };
        visite.v = Math.random().toString(36).slice(2, 12);
        try { sessionStorage.setItem("flcr_v", JSON.stringify({ q: visite.q, r: visite.r, v: visite.v })); } catch (e) {}
      } else {
        visite = { q: stocke.q || "", r: stocke.r || "", l: false, v: stocke.v };
      }
    } catch (e) { statsOn = false; }
  }
  var dernier = {};
  function stat(type, extra) {
    if (!statsOn || !visite) return;
    var now = Date.now();
    var cle = type + (extra && extra.b ? ":" + extra.b : "");
    if (type !== "page" && type !== "temps" && dernier[cle] && now - dernier[cle] < 2000) return; /* double clic */
    dernier[cle] = now;
    var msg = { t: type, p: location.pathname, q: visite.q, r: visite.r, l: type === "page" && visite.l, v: visite.v };
    if (extra) { msg.d = extra.d; msg.s = extra.s; msg.b = extra.b; msg.m = extra.m; }
    var data = JSON.stringify(msg);
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(STATS_URL, new Blob([data], { type: "text/plain" }))) return;
    } catch (e) {}
    try { fetch(STATS_URL, { method: "POST", body: data, keepalive: true, mode: "no-cors", headers: { "Content-Type": "text/plain" } }); } catch (e) {}
  }
  stat("page");
  if (/^\/merci\/?$/i.test(location.pathname)) stat("form");

  /* Temps passé sur la page (seulement quand elle est affichée) et jusqu'où elle a été lue, envoyés quand on la quitte. */
  var vuDepuis = document.visibilityState === "visible" ? Date.now() : 0, cumul = 0, lu = 0;
  function mesureLecture() {
    var h = document.documentElement, haut = h.scrollHeight - window.innerHeight;
    lu = Math.max(lu, haut <= 10 ? 100 : Math.min(100, Math.round(((window.scrollY || h.scrollTop) / haut) * 100)));
  }
  window.addEventListener("scroll", mesureLecture, { passive: true });
  function envoieTemps() {
    if (vuDepuis) { cumul += Date.now() - vuDepuis; vuDepuis = 0; }
    var d = Math.round(cumul / 1000);
    if (d >= 1) { mesureLecture(); stat("temps", { d: d, s: lu, m: chargement() }); cumul = 0; }
  }
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") envoieTemps(); else vuDepuis = Date.now();
  });
  window.addEventListener("pagehide", envoieTemps);
  /* Temps de chargement de la page (envoyé une seule fois, avec le premier temps passé) */
  var chargeEnvoye = false;
  function chargement() {
    if (chargeEnvoye) return undefined;
    try {
      var n = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
      var ms = n ? (n.loadEventEnd || n.domContentLoadedEventEnd) : 0;
      if (ms > 0) { chargeEnvoye = true; return Math.round(ms); }
    } catch (e) {}
    return undefined;
  }

  /* Signes d'intérêt avant un contact. On n'envoie jamais ce que la personne tape : seulement le texte du bouton ou de la question. */
  var texte = function (el) { return (el && (el.innerText || el.textContent || el.value || "") || "").replace(/\s+/g, " ").trim().slice(0, 100); };
  // Numéro ou e-mail de l'agence copié (appui long sur mobile, copier-coller sur ordinateur)
  document.addEventListener("copy", function () {
    var sel = "";
    try { sel = String(window.getSelection ? window.getSelection() : ""); } catch (e) {}
    if (/670797135/.test(sel.replace(/\D/g, ""))) stat("copie", { b: "téléphone" });
    else if (/@flcr-patrimoine\.fr/i.test(sel)) stat("copie", { b: "e-mail" });
  }, true);
  // Formulaire commencé (une fois par formulaire et par page) : le formulaire non envoyé se voit dans le tableau de bord
  var formsCommences = [];
  function nomFormulaire(f) {
    if (f.closest("#hamburger-drawer, .layout-drawer, header, #flex-header")) return "menu";
    var w = f.closest(".dmform"), t = w && w.querySelector(".dmform-title, .dmwidget-title");
    var nom = t && t.offsetParent !== null ? texte(t) : "";
    if (nom && !/^formulaire$/i.test(nom)) return nom.toLowerCase();
    var tous = Array.prototype.filter.call(document.querySelectorAll("form"), function (x) { return !x.closest("#hamburger-drawer, .layout-drawer, header, #flex-header"); });
    return tous.length > 1 ? "page (" + (tous.indexOf(f) + 1) + "/" + tous.length + ")" : "page";
  }
  document.addEventListener("input", function (e) {
    var el = e.target, f = el && el.closest && el.closest("form");
    if (!f || el.type === "hidden" || formsCommences.indexOf(f) >= 0) return;
    formsCommences.push(f);
    stat("form_debut", { b: nomFormulaire(f) });
  }, true);
  // Simulateur de loyer utilisé (une fois par page)
  var simuVu = false;
  function simu(e) {
    var w = e.target && e.target.closest && e.target.closest(".flcr-est");
    if (!w || simuVu || (e.target.closest && e.target.closest("a"))) return;
    simuVu = true;
    stat("simu");
  }
  document.addEventListener("input", simu, true);
  document.addEventListener("click", simu, true);
  // Boutons et questions de la FAQ
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var q = t.closest(".accordion-title, .flcr-faq summary, details > summary");
    if (q) { stat("faq", { b: texte(q.querySelector(".title-text") || q) }); return; }
    var a = t.closest("a.dmWidget, a.flcr-est__btn, a[aria-label='Voir les avis de nos clients'], .dmformsubmit input[type=submit], button[type=submit]");
    if (!a) return;
    var h = a.getAttribute("href") || "";
    if (/^(tel:|mailto:)|wa\.me\/|whatsapp/i.test(h)) return; // déjà comptés comme contacts
    var nom = a.getAttribute("aria-label") === "Voir les avis de nos clients" ? "Pastille avis" : texte(a);
    if (a.closest(".flcr-est")) nom = "Simulateur : " + nom;
    else if (a.matches("input[type=submit], button[type=submit]")) nom = "Envoyer (" + nomFormulaire(a.closest("form") || a) + ")";
    if (nom) stat("cta", { b: nom });
  }, true);
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    var h = a.getAttribute("href") || "";
    var type = /^tel:/i.test(h) ? "tel" : /(wa\.me\/|api\.whatsapp\.com|^whatsapp:)/i.test(h) ? "wa" : /^mailto:/i.test(h) ? "mail" : null;
    if (type) stat(type);
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
      // Liste ouverte aux couleurs du champ : fond du champ (semi-transparent) posé sur le fond de la section, texte des autres champs
      var rgba = function (c) { var m = String(c || "").match(/[\d.]+/g) || []; return m.length < 3 ? null : [+m[0], +m[1], +m[2], m[3] === undefined ? 1 : +m[3]]; };
      var fondListe = "#FFFFFF", texteListe = "#0A1933";
      try {
        var f = rgba(getComputedStyle(s).backgroundColor) || [0, 0, 0, 0], d = [255, 255, 255, 1], p = s.parentElement;
        for (; p && p !== document.documentElement; p = p.parentElement) { var c = rgba(getComputedStyle(p).backgroundColor); if (c && c[3] > 0.99) { d = c; break; } }
        fondListe = "rgb(" + [0, 1, 2].map(function (k) { return Math.round(f[k] * f[3] + d[k] * (1 - f[3])); }).join(",") + ")";
        texteListe = getComputedStyle(ref || s).color;
      } catch (e) {}
      var maj = function () {
        var vide = !s.value;
        // !important : certains thèmes Duda imposent la couleur du texte des champs (formulaire sur fond marine)
        if (vide && gris) s.style.setProperty("color", gris, "important"); else s.style.removeProperty("color");
        s.style.fontStyle = vide && ref ? getComputedStyle(ref, "::placeholder").fontStyle : "";
        Array.prototype.forEach.call(s.options, function (x, i) { x.style.color = i === 0 && gris ? gris : texteListe; x.style.backgroundColor = fondListe; x.style.fontStyle = "normal"; });
      };
      s.addEventListener("change", maj);
      maj();
    });
    /* Couleurs de chaque champ gardées pour le remplissage automatique (voir le style en haut) */
    Array.prototype.forEach.call(document.querySelectorAll("form input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=submit]),form textarea,form select"), function (inp) {
      if (inp.dataset.flcrAf) return;
      inp.dataset.flcrAf = "1";
      try {
        var cs = getComputedStyle(inp);
        var f = couleur(cs.backgroundColor) || [0, 0, 0, 0], d = [255, 255, 255, 1];
        for (var p = inp.parentElement; p && p !== document.documentElement; p = p.parentElement) { var c = couleur(getComputedStyle(p).backgroundColor); if (c && c[3] > 0.9) { d = c; break; } }
        inp.style.setProperty("--flcr-af-bg", "rgb(" + [0, 1, 2].map(function (k) { return Math.round(f[k] * f[3] + d[k] * (1 - f[3])); }).join(",") + ")");
        inp.style.setProperty("--flcr-af-fg", cs.color);
      } catch (e) {}
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
