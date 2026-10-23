/*!
 * Widget avis Google - FLCR Patrimoine
 * Lit avis.json (mis à jour chaque nuit par n8n) et affiche un carrousel.
 * Intégration : <div data-flcr-avis></div><script src=".../widget.js" defer></script>
 */
(function () {
  "use strict";

  var SCRIPT = document.currentScript;
  var DEFAULT_SRC = SCRIPT && SCRIPT.src ? SCRIPT.src.replace(/widget(\.min)?\.js(\?.*)?$/, "avis.json") : "avis.json";
  var STYLE_ID = "flcr-avis-style";

  var G_ICON =
    '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>';
  var STAR_PATH = "M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z";
  var CHEVRON_L = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var CHEVRON_R = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var CSS = [
    ".flcr-avis{--fa-navy:#0A1933;--fa-navy-2:#16284A;--fa-text:#F2F2F2;--fa-muted:#AEB6C6;--fa-gold:#FBBC04;--fa-star-off:#3A4560;--fa-ink:#0A1933;--fa-ink-muted:#5B6475;--fa-gap:24px;",
    "font-family:Montserrat,'Montserrat Fallback',system-ui,-apple-system,'Segoe UI',sans-serif;color:var(--fa-ink);box-sizing:border-box;width:100%;max-width:1200px;margin:0 auto;padding:8px 0;min-height:360px}",
    ".flcr-avis *,.flcr-avis *::before,.flcr-avis *::after{box-sizing:border-box}",
    ".flcr-avis.fa-ready{min-height:0}",
    ".fa-head{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin:0 64px 28px}",
    ".fa-brand{display:flex;align-items:center;gap:14px}",
    ".fa-brand-g{width:40px;height:40px;flex:0 0 40px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(10,25,51,.15);display:flex;align-items:center;justify-content:center}",
    ".fa-brand-g svg{width:24px;height:24px}",
    ".fa-title{margin:0;font-size:20px;font-weight:600;letter-spacing:.2px;color:var(--fa-ink);line-height:1.2}",
    ".fa-summary{display:flex;align-items:center;gap:8px;margin-top:4px;font-size:15px;color:var(--fa-ink-muted)}",
    ".fa-summary strong{font-size:17px;font-weight:600;color:var(--fa-ink)}",
    ".fa-cta{display:inline-flex;align-items:center;gap:8px;padding:12px 22px;background:var(--fa-navy);color:#fff!important;text-decoration:none!important;font-size:14px;font-weight:500;letter-spacing:.4px;border:1px solid var(--fa-navy);border-radius:4px;transition:background .2s,color .2s}",
    ".fa-cta:hover{background:transparent;color:var(--fa-navy)!important}",
    ".fa-stage{position:relative;padding:0 64px}",
    ".fa-track{display:flex;gap:var(--fa-gap);overflow-x:auto;scroll-snap-type:x mandatory;scroll-behavior:smooth;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding:4px 2px 26px;margin:0 0 -18px;list-style:none}",
    ".fa-track::-webkit-scrollbar{display:none}",
    ".fa-card{flex:0 0 calc((100% - 2 * var(--fa-gap)) / 3);scroll-snap-align:start;background:var(--fa-navy);color:var(--fa-text);border-radius:12px;padding:26px 24px 22px;display:flex;flex-direction:column;box-shadow:0 10px 22px -16px rgba(10,25,51,.6);position:relative;min-width:0}",
    ".flcr-avis[data-cols='2'] .fa-card{flex-basis:calc((100% - var(--fa-gap)) / 2)}",
    ".flcr-avis[data-cols='1'] .fa-card{flex-basis:88%}",
    ".fa-top{display:flex;align-items:center;gap:14px;margin-bottom:16px;padding-right:30px}",
    ".fa-avatar{width:46px;height:46px;flex:0 0 46px;border-radius:50%;background:var(--fa-navy-2);border:1px solid rgba(251,188,4,.55);color:#fff;display:flex;align-items:center;justify-content:center;font-size:19px;font-weight:500}",
    ".fa-name{font-size:17px;font-weight:500;color:#fff;margin:0 0 5px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".fa-meta{display:flex;flex-direction:column;align-items:flex-start;gap:5px}",
    ".fa-date{font-size:12.5px;color:var(--fa-muted)}",
    ".fa-g{position:absolute;top:22px;right:20px;width:24px;height:24px;display:block;border-radius:50%;background:#fff;padding:3px;opacity:.95;transition:transform .2s}",
    ".fa-g:hover{transform:scale(1.08)}",
    ".fa-g svg{width:100%;height:100%;display:block}",
    ".fa-stars{position:relative;display:inline-flex;line-height:0;vertical-align:middle}",
    ".fa-stars svg{width:18px;height:18px;flex:0 0 18px}",
    ".fa-stars .fa-on{position:absolute;inset:0 auto 0 0;overflow:hidden;display:inline-flex;white-space:nowrap}",
    ".fa-stars .fa-off svg path{fill:var(--fa-star-off)}",
    ".fa-summary .fa-stars .fa-off svg path{fill:#D9DCE3}",
    ".fa-stars .fa-on svg path{fill:var(--fa-gold)}",
    ".fa-text{margin:0;font-size:15px;line-height:1.6;color:var(--fa-text);white-space:pre-line;overflow-wrap:anywhere;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:6;overflow:hidden}",
    ".fa-card.fa-open .fa-text{display:block;-webkit-line-clamp:unset}",
    ".fa-more{align-self:flex-start;margin-top:12px;padding:0;background:none;border:0;color:var(--fa-muted);font:inherit;font-size:13.5px;text-decoration:underline;text-underline-offset:3px;cursor:pointer}",
    ".fa-more:hover{color:#fff}",
    ".fa-more[hidden]{display:none}",
    ".fa-nav{position:absolute;top:50%;transform:translateY(-50%);width:46px;height:46px;border-radius:50%;border:0;background:var(--fa-navy);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 6px 18px -8px rgba(10,25,51,.6);transition:opacity .2s,transform .2s;z-index:2}",
    ".fa-nav svg{width:22px;height:22px}",
    ".fa-nav:hover{transform:translateY(-50%) scale(1.06)}",
    ".fa-nav[disabled]{opacity:.25;cursor:default;transform:translateY(-50%)}",
    ".fa-prev{left:4px}.fa-next{right:4px}",
    ".fa-dots{display:none;justify-content:center;gap:8px;margin-top:22px}",
    ".fa-dot{width:8px;height:8px;border-radius:50%;background:#C9CDD6;border:0;padding:0;cursor:pointer;transition:width .2s,background .2s}",
    ".fa-dot[aria-current='true']{width:22px;border-radius:4px;background:var(--fa-navy)}",
    ".fa-foot{margin:16px 64px 0;font-size:11px;line-height:1.5;color:#8A92A3;text-align:center;letter-spacing:.2px}",
    ".fa-foot a{color:#8A92A3;text-decoration:underline;text-underline-offset:2px}",
    ".flcr-avis[data-cols='1'] .fa-head{margin:0 4px 22px}",
    ".flcr-avis[data-cols='1'] .fa-stage{padding:0}",
    ".flcr-avis[data-cols='1'] .fa-nav{display:none}",
    ".flcr-avis[data-cols='1'] .fa-dots{display:flex}",
    ".flcr-avis[data-cols='1'] .fa-foot{margin:14px 4px 0}",
    ".flcr-avis[data-cols='1'] .fa-card{padding:22px 20px 20px}",
    ".flcr-avis[data-cols='1'] .fa-title{font-size:18px}",
    "@media (prefers-reduced-motion:reduce){.fa-track{scroll-behavior:auto}}"
  ].join("");

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  function esc(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function safeUrl(u) {
    return /^https:\/\//i.test(u || "") ? u : "";
  }

  function stars(rating, label) {
    var r = Math.max(0, Math.min(5, Number(rating) || 0));
    var one = '<svg viewBox="0 0 24 24"><path d="' + STAR_PATH + '"/></svg>';
    var five = one + one + one + one + one;
    return (
      '<span class="fa-stars" role="img" aria-label="' + esc(label || r.toString().replace(".", ",") + " sur 5") + '">' +
      '<span class="fa-off">' + five + "</span>" +
      '<span class="fa-on" style="width:' + (r / 5) * 100 + '%">' + five + "</span></span>"
    );
  }

  var DATE_FMT = (function () {
    try {
      return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    } catch (e) {
      return null;
    }
  })();

  function fmtDate(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return "";
    return DATE_FMT ? DATE_FMT.format(d) : d.toLocaleDateString("fr-FR");
  }

  function fmtNum(n) {
    return (Math.round((Number(n) || 0) * 10) / 10).toFixed(1).replace(".", ",");
  }

  function render(root, data) {
    var reviews = (data.reviews || []).filter(function (r) {
      return r && r.text;
    });
    var count = Number(data.count) || reviews.length;
    var rating = Number(data.rating) || 0;
    var reviewsUrl = safeUrl(data.reviews_url);
    var writeUrl = safeUrl(data.write_url);

    var head =
      '<div class="fa-head">' +
      '<div class="fa-brand"><span class="fa-brand-g">' + G_ICON + "</span><div>" +
      '<h2 class="fa-title">Nos avis clients</h2>' +
      '<div class="fa-summary"><strong>' + fmtNum(rating) + "</strong>" + stars(rating, "Note moyenne " + fmtNum(rating) + " sur 5") +
      "<span>" + count + " avis Google</span></div></div></div>" +
      (writeUrl ? '<a class="fa-cta" href="' + esc(writeUrl) + '" target="_blank" rel="noopener">Laisser un avis</a>' : "") +
      "</div>";

    var cards = reviews
      .map(function (r) {
        var name = r.name || "Client";
        var link = safeUrl(r.link) || reviewsUrl;
        return (
          '<li class="fa-card">' +
          (link ? '<a class="fa-g" href="' + esc(link) + '" target="_blank" rel="noopener" aria-label="Voir l\'avis de ' + esc(name) + ' sur Google">' + G_ICON + "</a>" : '<span class="fa-g">' + G_ICON + "</span>") +
          '<div class="fa-top"><span class="fa-avatar" aria-hidden="true">' + esc(name.charAt(0).toUpperCase()) + "</span><div style=\"min-width:0\">" +
          '<p class="fa-name">' + esc(name) + "</p>" +
          '<div class="fa-meta">' + stars(r.rating) + '<span class="fa-date">' + esc(fmtDate(r.date)) + "</span></div></div></div>" +
          '<p class="fa-text">' + esc(r.text) + "</p>" +
          '<button type="button" class="fa-more" hidden aria-expanded="false">Lire la suite</button>' +
          "</li>"
        );
      })
      .join("");

    var foot =
      '<p class="fa-foot">Avis Google non modifiés, du plus récent au plus ancien' +
      (reviewsUrl ? ' · <a href="' + esc(reviewsUrl) + '" target="_blank" rel="noopener">Tous les avis</a>' : "") +
      "</p>";

    root.innerHTML =
      head +
      (reviews.length
        ? '<div class="fa-stage">' +
          '<button type="button" class="fa-nav fa-prev" aria-label="Avis précédents">' + CHEVRON_L + "</button>" +
          '<ul class="fa-track" aria-label="Avis clients">' + cards + "</ul>" +
          '<button type="button" class="fa-nav fa-next" aria-label="Avis suivants">' + CHEVRON_R + "</button>" +
          '</div><div class="fa-dots" role="tablist" aria-label="Pagination des avis"></div>'
        : "") +
      foot;
    root.classList.add("fa-ready");
    root.setAttribute("role", "region");
    root.setAttribute("aria-label", "Avis clients Google");

    if (reviews.length) wire(root);
  }

  function wire(root) {
    var track = root.querySelector(".fa-track");
    var prev = root.querySelector(".fa-prev");
    var next = root.querySelector(".fa-next");
    var dotsBox = root.querySelector(".fa-dots");
    var cards = Array.prototype.slice.call(root.querySelectorAll(".fa-card"));

    function cols() {
      var w = root.clientWidth;
      return w >= 900 ? 3 : w >= 600 ? 2 : 1;
    }

    function step() {
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
      return cards[0] ? cards[0].getBoundingClientRect().width + gap : track.clientWidth;
    }

    function pages() {
      var c = cols();
      return c === 1 ? cards.length : Math.max(1, cards.length - c + 1);
    }

    function index() {
      return Math.round(track.scrollLeft / step());
    }

    function buildDots() {
      var n = pages();
      var html = "";
      for (var i = 0; i < n; i++) html += '<button type="button" class="fa-dot" aria-label="Avis ' + (i + 1) + '"></button>';
      dotsBox.innerHTML = html;
      Array.prototype.forEach.call(dotsBox.children, function (d, i) {
        d.addEventListener("click", function () {
          track.scrollTo({ left: i * step() });
        });
      });
    }

    function update() {
      var max = track.scrollWidth - track.clientWidth - 2;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max;
      var i = Math.min(index(), pages() - 1);
      Array.prototype.forEach.call(dotsBox.children, function (d, k) {
        d.setAttribute("aria-current", k === i ? "true" : "false");
      });
    }

    function checkClamp() {
      cards.forEach(function (card) {
        var t = card.querySelector(".fa-text");
        var b = card.querySelector(".fa-more");
        if (card.classList.contains("fa-open")) return;
        b.hidden = !(t.scrollHeight > t.clientHeight + 2);
      });
    }

    function layout() {
      var c = String(cols());
      if (root.getAttribute("data-cols") !== c) {
        root.setAttribute("data-cols", c);
        buildDots();
      }
      checkClamp();
      update();
    }

    prev.addEventListener("click", function () {
      track.scrollBy({ left: -step() });
    });
    next.addEventListener("click", function () {
      track.scrollBy({ left: step() });
    });
    track.addEventListener("scroll", function () {
      window.requestAnimationFrame(update);
    }, { passive: true });
    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { track.scrollBy({ left: step() }); e.preventDefault(); }
      if (e.key === "ArrowLeft") { track.scrollBy({ left: -step() }); e.preventDefault(); }
    });
    track.tabIndex = 0;

    cards.forEach(function (card) {
      var b = card.querySelector(".fa-more");
      b.addEventListener("click", function () {
        var open = card.classList.toggle("fa-open");
        b.textContent = open ? "Réduire" : "Lire la suite";
        b.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });

    // Défilement automatique doux : pause au survol, au toucher, au clavier et quand un avis est déplié
    var AUTO_MS = 6000, hold = 0, hover = false, visible = true;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function pause(ms) { hold = Date.now() + (ms || 15000); }
    function tick() {
      if (reduce || hover || !visible || document.hidden || Date.now() < hold) return;
      if (root.querySelector(".fa-open") || cards.length <= cols()) return;
      var max = track.scrollWidth - track.clientWidth - 2;
      if (track.scrollLeft >= max) track.scrollTo({ left: 0 });
      else track.scrollBy({ left: step() });
    }
    root.addEventListener("mouseenter", function () { hover = true; });
    root.addEventListener("mouseleave", function () { hover = false; });
    root.addEventListener("focusin", function () { pause(20000); });
    track.addEventListener("touchstart", function () { pause(20000); }, { passive: true });
    track.addEventListener("wheel", function () { pause(); }, { passive: true });
    [prev, next].forEach(function (b) { b.addEventListener("click", function () { pause(); }); });
    dotsBox.addEventListener("click", function () { pause(); });
    if (window.IntersectionObserver) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(root);
    setInterval(tick, AUTO_MS);

    if (window.ResizeObserver) new ResizeObserver(layout).observe(root);
    else window.addEventListener("resize", layout);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(checkClamp);
    layout();
  }

  function renderError(root) {
    root.classList.add("fa-ready");
    root.innerHTML = "";
  }

  function init(root) {
    if (root.getAttribute("data-fa-init")) return;
    root.setAttribute("data-fa-init", "1");
    root.classList.add("flcr-avis");
    var src = root.getAttribute("data-src") || DEFAULT_SRC;
    if (window.IntersectionObserver && !root.hasAttribute("data-eager")) {
      var io = new IntersectionObserver(function (e) {
        if (!e[0].isIntersecting) return;
        io.disconnect();
        load(root, src);
      }, { rootMargin: "600px 0px" });
      io.observe(root);
    } else load(root, src);
  }

  function load(root, src) {
    fetch(src, { cache: "no-cache" })
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      })
      .then(function (data) {
        render(root, data);
      })
      .catch(function () {
        renderError(root);
      });
  }

  function boot() {
    injectStyle();
    Array.prototype.forEach.call(document.querySelectorAll("[data-flcr-avis]"), init);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
