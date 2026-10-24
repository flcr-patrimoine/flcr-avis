/*!
 * FLCR Patrimoine - Confort des formulaires du site
 * 1. Téléphone : mise en forme 06 12 34 56 78, pas de 11e chiffre, envoi bloqué si numéro invalide
 *    (international accepté : +33 6 12 34 56 78, +41 79 123 45 67, 0044…).
 * 2. Message : la zone ne se redimensionne plus à la main, elle s'agrandit toute seule avec le texte.
 * Intégration : <script src="https://flcr-patrimoine.github.io/flcr-avis/formulaires.js" defer></script>
 */
(function () {
  "use strict";
  if (window.__flcrFormulaires) return;
  window.__flcrFormulaires = true;

  /* ---------- Message : hauteur automatique ---------- */
  var css = document.createElement("style");
  css.textContent = "form textarea{resize:none!important;overflow-y:hidden;}";
  (document.head || document.documentElement).appendChild(css);

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
  var MSG = "Numéro invalide : 10 chiffres, par exemple 06 12 34 56 78 (ou format international +33…)";
  function digits(v) { return String(v || "").replace(/[^\d+]/g, ""); }
  function valid(v) {
    var d = digits(v);
    if (!d) return true; /* champ vide : géré par le caractère obligatoire du formulaire */
    if (/^0[1-9]\d{8}$/.test(d)) return true;
    if (/^(\+|00)33[1-9]\d{8}$/.test(d)) return true;
    if (/^(\+|00)(?!33)[1-9]\d{6,13}$/.test(d)) return true;
    return false;
  }
  function format(v) {
    var d = digits(v);
    if (/^0[1-9]\d{8}$/.test(d)) return d.replace(/(\d{2})(?=\d)/g, "$1 ");
    if (/^\+33[1-9]\d{8}$/.test(d)) return "+33 " + d.slice(3, 4) + " " + d.slice(4).replace(/(\d{2})(?=\d)/g, "$1 ");
    return v;
  }
  function hint(inp, show) {
    var box = inp.parentNode, el = box && box.querySelector(".flcr-tel-msg");
    if (show && !el && box) {
      el = document.createElement("div");
      el.className = "flcr-tel-msg";
      el.setAttribute("role", "alert");
      el.style.cssText = "color:#E0584D;font-size:13px;line-height:1.4;margin-top:6px;";
      el.textContent = MSG;
      box.appendChild(el);
    }
    if (el) el.style.display = show ? "block" : "none";
    inp.setCustomValidity(show ? MSG : "");
    inp.setAttribute("aria-invalid", show ? "true" : "false");
  }
  function isTel(t) { return t && t.tagName === "INPUT" && t.type === "tel"; }

  document.addEventListener("input", function (e) {
    var t = e.target;
    if (isArea(t)) { grow(t); return; }
    if (!isTel(t)) return;
    var d = digits(t.value);
    if (/^0/.test(d) && d.length > 10) t.value = format(d.slice(0, 10)); /* pas de 11e chiffre */
    if (t.getAttribute("aria-invalid") === "true") hint(t, !valid(t.value));
  }, true);

  document.addEventListener("focusout", function (e) {
    var t = e.target;
    if (!isTel(t) || !t.value.trim()) return;
    t.value = format(t.value);
    hint(t, !valid(t.value));
  }, true);

  function guard(form, e) {
    if (!form) return;
    var bad = null;
    Array.prototype.forEach.call(form.querySelectorAll("input[type=tel]"), function (inp) {
      inp.value = format(inp.value);
      var ok = valid(inp.value);
      hint(inp, !ok);
      if (!ok && !bad) bad = inp;
    });
    if (bad) {
      e.preventDefault();
      e.stopImmediatePropagation();
      bad.focus();
    }
  }
  document.addEventListener("click", function (e) {
    var b = e.target && e.target.closest && e.target.closest("input[type=submit],button[type=submit],button:not([type])");
    if (b && b.form) guard(b.form, e);
  }, true);
  document.addEventListener("submit", function (e) { guard(e.target, e); }, true);

  function prep() {
    Array.prototype.forEach.call(document.querySelectorAll("input[type=tel]"), function (inp) {
      inp.setAttribute("inputmode", "tel");
      inp.setAttribute("autocomplete", "tel");
    });
    Array.prototype.forEach.call(document.querySelectorAll("form textarea"), function (t) {
      t.dataset.flcrMin = t.offsetHeight || 80;
      if (t.value) grow(t);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", prep);
  else prep();
})();
