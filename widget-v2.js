/*!
 * Widget avis Google - FLCR Patrimoine (v2 : défilement plus rapide, arrêt au survol)
 * Lit avis.json (mis à jour chaque nuit par n8n) et affiche un carrousel.
 * Intégration : <div data-flcr-avis></div><script src=".../widget.js" defer></script>
 */
(function () {
  "use strict";

  var SCRIPT = document.currentScript;
  var DEFAULT_SRC = SCRIPT && SCRIPT.src ? SCRIPT.src.replace(/widget[\w.-]*\.js(\?.*)?$/, "avis.json") : "avis.json";
  var STYLE_ID = "flcr-avis-style";

  var G_ICON =
    '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>';
  var STAR_PATH = "M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z";
  var CHEVRON_L = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var CHEVRON_R = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var CSS = [
    ".flcr-avis{--fa-navy:#0A1933;--fa-navy-2:#16284A;--fa-text:#F2F2F2;--fa-muted:#AEB6C6;--fa-gold:#FBBC04;--fa-star-off:#3A4560;--fa-ink:#0A1933;--fa-ink-muted:#5B6475;--fa-gap:24px;",
    "font-family:Montserrat,'Montserrat Fallback',system-ui,-apple-system,'Segoe UI',sans-serif;color:var(--fa-ink);box-sizing:border-box;width:100%;max-width:1200px;margin:0 auto;padding:8px 0 56px;min-height:360px}",
    ".flcr-avis *,.flcr-avis *::before,.flcr-avis *::after{box-sizing:border-box}",
    ".flcr-avis.fa-ready{min-height:0}",
    ".fa-head{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin:0 64px 28px}",
    ".fa-brand{display:flex;align-items:center;gap:14px}",
    ".fa-brand-g{width:40px;height:40px;flex:0 0 40px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(10,25,51,.15);display:flex;align-items:center;justify-content:center}",
    ".fa-brand-g svg{width:24px;height:24px}",
    ".fa-title{margin:0;font-size:20px;font-weight:600;letter-spacing:.2px;color:var(--fa-ink);line-height:1.2}",
    ".fa-summary{display:flex;align-items:center;gap:8px;margin-top:4px;font-size:15px;color:var(--fa-ink-muted)}",
    ".fa-summary strong{font-size:17px;font-weight:600;color:var(--fa-ink)}",
    ".fa-stage{position:relative;padding:0 64px}",
    ".flcr-avis .fa-track{display:flex;gap:var(--fa-gap);overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding:4px 0 26px!important;margin:0 0 -18px!important;list-style:none!important}",
    ".fa-track::-webkit-scrollbar{display:none}","@media (hover:hover) and (pointer:fine){.flcr-avis .fa-track{cursor:grab}}",".flcr-avis .fa-track.fa-dragging{cursor:grabbing;user-select:none;-webkit-user-select:none}",".flcr-avis .fa-track.fa-dragging a{pointer-events:none}",".flcr-avis .fa-card{margin:0!important;list-style:none!important}",
    ".fa-card{flex:0 0 calc((100% - 2 * var(--fa-gap)) / 3);scroll-snap-align:start;background:var(--fa-navy);color:var(--fa-text);border-radius:12px;padding:28px 28px 24px;display:flex;flex-direction:column;box-shadow:0 10px 22px -16px rgba(10,25,51,.6);position:relative;min-width:0}",
    ".flcr-avis[data-cols='2'] .fa-card{flex-basis:calc((100% - var(--fa-gap)) / 2)}",
    ".flcr-avis[data-cols='1'] .fa-card{flex-basis:88%}",
    ".fa-rate{margin:0 0 16px;line-height:0}",
    ".fa-author{display:flex;align-items:center;gap:14px;margin-top:auto;padding-top:22px}",
    ".fa-badge{width:42px;height:42px;flex:0 0 42px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;transition:transform .2s}",
    ".fa-badge svg{width:24px;height:24px;display:block}",
    "a.fa-badge:hover{transform:scale(1.06)}",
    ".fa-who{min-width:0}",
    ".flcr-avis .fa-name{font-size:16px;font-weight:600;color:#fff;margin:0 0 3px!important;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".flcr-avis .fa-date{font-size:13px;color:var(--fa-muted);margin:0!important;line-height:1.3}",
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
    ".fa-nav{position:absolute;top:50%;transform:translateY(-50%);width:40px;height:40px;border-radius:50%;border:1px solid rgba(10,25,51,.22);background:rgba(255,255,255,.55);color:var(--fa-navy);display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;transition:background .25s,color .25s,border-color .25s,opacity .2s;z-index:2}",
    ".fa-nav svg{width:18px;height:18px}",
    ".fa-nav:hover{background:var(--fa-navy);border-color:var(--fa-navy);color:#fff}",
    ".fa-nav[disabled]{opacity:.3;cursor:default;background:transparent;color:var(--fa-navy)}",
    ".fa-prev{left:10px}.fa-next{right:10px}",
    ".fa-dots{display:none;justify-content:center;gap:8px;margin-top:22px}",
    ".fa-dot{width:8px;height:8px;border-radius:50%;background:#C9CDD6;border:0;padding:0;cursor:pointer;transition:width .2s,background .2s}",
    ".fa-dot[aria-current='true']{width:22px;border-radius:4px;background:var(--fa-navy)}",
    ".flcr-avis .fa-foot{margin:26px 64px 0!important;padding:0!important;font-size:11px;line-height:1.5;color:#8A92A3;text-align:center;letter-spacing:.2px}",
    ".fa-foot a{color:#8A92A3;text-decoration:underline;text-underline-offset:2px}",
    ".flcr-avis[data-cols='1'] .fa-head{margin:0 4px 22px}",
    ".flcr-avis[data-cols='1'] .fa-stage{padding:0}",
    ".flcr-avis[data-cols='1'] .fa-nav{display:none}",
    ".flcr-avis[data-cols='1'] .fa-dots{display:flex}",
    ".flcr-avis[data-cols='1'] .fa-foot{margin:22px 4px 0!important}",".flcr-avis[data-cols='1']{padding-bottom:40px}",
    ".flcr-avis[data-cols='1'] .fa-card{padding:24px 22px 22px}",
    ".flcr-avis[data-cols='1'] .fa-title{font-size:18px}",
    "@media (prefers-reduced-motion:reduce){.fa-card{transition:none}}"
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

    var head =
      '<div class="fa-head">' +
      '<div class="fa-brand"><span class="fa-brand-g">' + G_ICON + "</span><div>" +
      '<h2 class="fa-title">Nos avis clients</h2>' +
      '<div class="fa-summary"><strong>' + fmtNum(rating) + "</strong>" + stars(rating, "Note moyenne " + fmtNum(rating) + " sur 5") +
      "<span>" + count + " avis Google</span></div></div></div>" +
      "</div>";

    function card(r, i, clone) {
      var name = r.name || "Client";
      var link = safeUrl(r.link) || reviewsUrl;
      var ti = clone ? ' tabindex="-1"' : "";
      var badge = link
        ? '<a class="fa-badge" href="' + esc(link) + '" target="_blank" rel="noopener"' + ti + ' aria-label="Voir l\'avis de ' + esc(name) + ' sur Google">' + G_ICON + "</a>"
        : '<span class="fa-badge">' + G_ICON + "</span>";
      var date = fmtDate(r.date);
      return (
        '<li class="fa-card" data-i="' + i + '"' + (clone ? ' aria-hidden="true"' : "") + ">" +
        '<div class="fa-rate">' + stars(r.rating) + "</div>" +
        '<p class="fa-text">' + esc(r.text) + "</p>" +
        '<button type="button" class="fa-more"' + ti + ' hidden aria-expanded="false">Lire la suite</button>' +
        '<div class="fa-author">' + badge +
        '<div class="fa-who"><p class="fa-name">' + esc(name) + "</p>" +
        (date ? '<p class="fa-date">Publié le ' + esc(date) + "</p>" : "") +
        "</div></div></li>"
      );
    }
    // Boucle infinie : la liste est rendue 3 fois (copie / originaux / copie) dès qu'il y a plus de 3 avis
    var loop = reviews.length > 3;
    function set(clone) {
      return reviews.map(function (r, i) { return card(r, i, clone); }).join("");
    }
    var cards = loop ? set(true) + set(false) + set(true) : set(false);

    var foot =
      '<p class="fa-foot">Avis Google non modifiés, du plus récent au plus ancien' +
      (reviewsUrl ? ' · <a href="' + esc(reviewsUrl) + '" target="_blank" rel="noopener">Tous les avis</a>' : "") +
      "</p>";

    root.innerHTML =
      head +
      (reviews.length
        ? '<div class="fa-stage">' +
          '<button type="button" class="fa-nav fa-prev" aria-label="Avis précédents">' + CHEVRON_L + "</button>" +
          '<ul class="fa-track" aria-label="Avis clients"' + (loop ? ' data-loop="1"' : "") + ">" + cards + "</ul>" +
          '<button type="button" class="fa-nav fa-next" aria-label="Avis suivants">' + CHEVRON_R + "</button>" +
          '</div><div class="fa-dots" role="tablist" aria-label="Pagination des avis"></div>'
        : "") +
      foot;
    root.classList.add("fa-ready");
    root.setAttribute("role", "region");
    root.setAttribute("aria-label", "Avis clients Google");

    if (reviews.length) wire(root, reviews.length, loop);
  }

  function wire(root, n, loop) {
    var track = root.querySelector(".fa-track");
    var prev = root.querySelector(".fa-prev");
    var next = root.querySelector(".fa-next");
    var dotsBox = root.querySelector(".fa-dots");
    var cards = Array.prototype.slice.call(root.querySelectorAll(".fa-card"));
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var anim = null, target = null, settleT = null, drag = null;

    function cols() {
      var w = root.clientWidth;
      return w >= 900 ? 3 : w >= 600 ? 2 : 1;
    }
    function step() {
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
      return cards[0] ? cards[0].getBoundingClientRect().width + gap : track.clientWidth;
    }
    function maxIdx() {
      return loop ? 3 * n - 1 : Math.max(0, n - cols());
    }
    function posIdx() {
      return Math.round(track.scrollLeft / step());
    }
    function logical(i) {
      return ((i % n) + n) % n;
    }
    function setSnap(on) {
      track.style.scrollSnapType = on ? "" : "none";
    }
    // Saut invisible d'une copie à l'autre (contenu identique) pour donner l'impression d'un défilement continu
    function normalize() {
      if (!loop || anim || drag) return;
      var s = step(), w = n * s, x = track.scrollLeft;
      if (x < w - s / 2 || x >= 2 * w - s / 2) {
        setSnap(false);
        track.scrollLeft = x + (x < w - s / 2 ? w : -w);
        requestAnimationFrame(function () { setSnap(true); });
      }
    }
    function ease(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    function easeOut(t) {
      return 1 - Math.pow(1 - t, 3);
    }
    function goTo(i, dur, fn) {
      fn = fn || ease;
      if (!loop) i = Math.max(0, Math.min(maxIdx(), i));
      target = i;
      var from = track.scrollLeft, to = i * step();
      if (anim) cancelAnimationFrame(anim);
      if (reduce || !dur) {
        setSnap(false);
        track.scrollLeft = to;
        anim = null;
        requestAnimationFrame(function () { setSnap(true); normalize(); update(); });
        return;
      }
      setSnap(false);
      var t0 = null;
      function frame(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur);
        track.scrollLeft = from + (to - from) * fn(p);
        if (p < 1) anim = requestAnimationFrame(frame);
        else {
          anim = null;
          target = null;
          setSnap(true);
          normalize();
          update();
        }
      }
      anim = requestAnimationFrame(frame);
    }
    function move(d, dur) {
      goTo((target !== null ? target : posIdx()) + d, dur);
    }

    function buildDots() {
      var count = cols() === 1 ? n : Math.max(1, loop ? n : n - cols() + 1);
      var html = "";
      for (var i = 0; i < count; i++) html += '<button type="button" class="fa-dot" aria-label="Avis ' + (i + 1) + '"></button>';
      dotsBox.innerHTML = html;
      Array.prototype.forEach.call(dotsBox.children, function (d, i) {
        d.addEventListener("click", function () {
          pause();
          goTo(loop ? n + i : i, 700);
        });
      });
    }

    function update() {
      if (!loop) {
        prev.disabled = track.scrollLeft <= 2;
        next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
      }
      var i = loop ? logical(posIdx()) : posIdx();
      Array.prototype.forEach.call(dotsBox.children, function (d, k) {
        d.setAttribute("aria-current", k === Math.min(i, dotsBox.children.length - 1) ? "true" : "false");
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

    var lastCols = null;
    function layout() {
      var c = cols();
      var keep = lastCols === null ? (loop ? n : 0) : (loop ? n + logical(posIdx()) : posIdx());
      if (lastCols !== c) {
        lastCols = c;
        root.setAttribute("data-cols", String(c));
        buildDots();
      }
      checkClamp();
      if (!anim) goTo(keep, 0);
      update();
    }

    prev.addEventListener("click", function () { pause(); move(-1, 700); });
    next.addEventListener("click", function () { pause(); move(1, 700); });
    track.addEventListener("scroll", function () {
      if (anim) return;
      requestAnimationFrame(update);
      clearTimeout(settleT);
      settleT = setTimeout(function () { normalize(); update(); }, 160);
    }, { passive: true });
    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { pause(); move(1, 700); e.preventDefault(); }
      if (e.key === "ArrowLeft") { pause(); move(-1, 700); e.preventDefault(); }
    });
    track.tabIndex = 0;

    // Glisser à la souris sur ordinateur : suit le curseur puis termine avec l'élan et s'aligne en douceur
    track.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      if (anim) { cancelAnimationFrame(anim); anim = null; target = null; }
      setSnap(false);
      drag = { x: e.clientX, start: track.scrollLeft, moved: false, id: e.pointerId, pts: [[e.timeStamp, e.clientX]] };
    });
    track.addEventListener("pointermove", function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x;
      if (!drag.moved) {
        if (Math.abs(dx) < 5) return;
        drag.moved = true;
        track.classList.add("fa-dragging");
        try { track.setPointerCapture(e.pointerId); } catch (err) {}
        pause(20000);
      }
      var x = drag.start - dx;
      if (loop) {
        var s = step(), w = n * s;
        if (x < w - s / 2) { drag.start += w; x += w; }
        else if (x >= 2 * w - s / 2) { drag.start -= w; x -= w; }
      }
      track.scrollLeft = x;
      drag.pts.push([e.timeStamp, e.clientX]);
      if (drag.pts.length > 6) drag.pts.shift();
      e.preventDefault();
    });
    function endDrag(e) {
      if (!drag || (e && e.pointerId !== drag.id)) return;
      var d = drag;
      drag = null;
      track.classList.remove("fa-dragging");
      if (!d.moved) { setSnap(true); return; }
      d.suppress = true;
      lastDrag = d;
      setTimeout(function () { d.suppress = false; }, 80);
      // Vitesse sur les 100 dernières ms ; nulle si la souris s'est arrêtée avant d'être relâchée
      var b = d.pts[d.pts.length - 1], a = b, v = 0;
      for (var k = d.pts.length - 2; k >= 0 && b[0] - d.pts[k][0] <= 100; k--) a = d.pts[k];
      if (a !== b && (!e || e.timeStamp - b[0] < 80)) v = (b[1] - a[1]) / Math.max(1, b[0] - a[0]);
      var s = step(), from = posIdx();
      var proj = (track.scrollLeft - v * 260) / s;
      var i = Math.round(proj);
      var maxJump = Math.max(1, cols());
      i = Math.max(Math.round(track.scrollLeft / s) - maxJump, Math.min(Math.round(track.scrollLeft / s) + maxJump, i));
      var dist = Math.abs(i * s - track.scrollLeft);
      goTo(i, Math.max(380, Math.min(900, 300 + dist * 0.9)), easeOut);
      pause(15000);
    }
    var lastDrag = null;
    track.addEventListener("pointerup", endDrag);
    track.addEventListener("pointercancel", endDrag);
    track.addEventListener("lostpointercapture", endDrag);
    // Après un glisser, le clic qui suit (sur un lien ou "Lire la suite") est ignoré
    track.addEventListener("click", function (e) {
      if (lastDrag && lastDrag.suppress) { e.preventDefault(); e.stopPropagation(); lastDrag.suppress = false; }
    }, true);
    track.addEventListener("dragstart", function (e) { e.preventDefault(); });

    // "Lire la suite" synchronisé entre un avis et ses copies
    cards.forEach(function (card) {
      card.querySelector(".fa-more").addEventListener("click", function () {
        var open = !card.classList.contains("fa-open");
        cards.forEach(function (c) {
          if (c.getAttribute("data-i") !== card.getAttribute("data-i")) return;
          c.classList.toggle("fa-open", open);
          var b = c.querySelector(".fa-more");
          b.textContent = open ? "Réduire" : "Lire la suite";
          b.setAttribute("aria-expanded", open ? "true" : "false");
        });
      });
    });

    // Défilement automatique (un avis toutes les 4 s, réglable avec data-interval en ms) : arrêt au survol de la souris, pause au toucher, au clavier et quand un avis est déplié
    var AUTO_MS = parseInt(root.getAttribute("data-interval"), 10) || 4000, AUTO_DUR = 850, hold = 0, hover = false, visible = true;
    function pause(ms) { hold = Date.now() + (ms || 15000); }
    function tick() {
      if (reduce || hover || !visible || document.hidden || Date.now() < hold || anim) return;
      if (root.querySelector(".fa-open") || n <= cols()) return;
      if (!loop && track.scrollLeft >= track.scrollWidth - track.clientWidth - 2) goTo(0, AUTO_DUR);
      else move(1, AUTO_DUR);
    }
    root.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") hover = true; });
    root.addEventListener("pointerleave", function (e) { if (e.pointerType !== "mouse") return; hover = false; hold = Math.max(hold, Date.now() + 1500); });
    root.addEventListener("focusin", function () { pause(20000); });
    track.addEventListener("touchstart", function () { pause(20000); if (anim) { cancelAnimationFrame(anim); anim = null; target = null; setSnap(true); } }, { passive: true });
    track.addEventListener("wheel", function () { pause(); }, { passive: true });
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
