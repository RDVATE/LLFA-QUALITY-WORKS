/* LLFA Quality Works — landing page interactions */
(function () {
  "use strict";

  // Current year in footer
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav toggle
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Animated stat counters (run once when scrolled into view)
  var stats = document.querySelectorAll(".stat strong[data-count]");
  if ("IntersectionObserver" in window && stats.length) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    stats.forEach(function (el) { obs.observe(el); });
  }

  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.textContent.replace(/[0-9]/g, ""); // keep +, %, etc.
    var start = 0, dur = 1200, t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(start + (target - start) * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Photo upload: drag & drop, previews, remove
  var MAX_PHOTOS = 8;
  var input = document.getElementById("photos");
  var dropzone = document.getElementById("dropzone");
  var previews = document.getElementById("previews");
  var selected = []; // File objects

  if (input && dropzone && previews) {
    input.addEventListener("change", function () {
      addFiles(input.files);
    });

    ["dragenter", "dragover"].forEach(function (evt) {
      dropzone.addEventListener(evt, function (e) {
        e.preventDefault();
        dropzone.classList.add("dragover");
      });
    });
    ["dragleave", "drop"].forEach(function (evt) {
      dropzone.addEventListener(evt, function (e) {
        e.preventDefault();
        dropzone.classList.remove("dragover");
      });
    });
    dropzone.addEventListener("drop", function (e) {
      if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files);
    });
  }

  function addFiles(fileList) {
    Array.prototype.forEach.call(fileList, function (file) {
      if (!file.type || file.type.indexOf("image/") !== 0) return;
      if (selected.length >= MAX_PHOTOS) return;
      selected.push(file);
    });
    syncInput();
    renderPreviews();
  }

  function removeFile(index) {
    selected.splice(index, 1);
    syncInput();
    renderPreviews();
  }

  // Keep the real <input> in sync so files submit with the form
  function syncInput() {
    if (!input || typeof DataTransfer === "undefined") return;
    var dt = new DataTransfer();
    selected.forEach(function (f) { dt.items.add(f); });
    input.files = dt.files;
  }

  function renderPreviews() {
    if (!previews) return;
    previews.innerHTML = "";
    selected.forEach(function (file, i) {
      var wrap = document.createElement("div");
      wrap.className = "preview";
      var img = document.createElement("img");
      img.alt = file.name;
      var reader = new FileReader();
      reader.onload = function (e) { img.src = e.target.result; };
      reader.readAsDataURL(file);
      var btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("aria-label", "Remove photo");
      btn.textContent = "✕";
      btn.addEventListener("click", function () { removeFile(i); });
      wrap.appendChild(img);
      wrap.appendChild(btn);
      previews.appendChild(wrap);
    });
  }

  // Quote form (demo handler — no backend yet)
  var form = document.getElementById("quoteForm");
  var note = document.getElementById("formNote");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      if (!name || !email) {
        setNote("Please add your name and email so we can reach you.", "err");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setNote("That email doesn't look right — mind checking it?", "err");
        return;
      }
      var photoMsg = selected.length ? " We received your " + selected.length + " photo" + (selected.length > 1 ? "s" : "") + "." : "";
      setNote("Thanks, " + name + "! Your request was received." + photoMsg + " We'll be in touch within one business day.", "ok");
      form.reset();
      selected = [];
      renderPreviews();
    });
  }

  function setNote(msg, kind) {
    if (!note) return;
    note.textContent = msg;
    note.className = "form-note " + kind;
  }

  // ---- Leave a review ----
  var starWrap = document.getElementById("starRating");
  var ratingInput = document.getElementById("ratingValue");
  var reviewForm = document.getElementById("reviewForm");
  var reviewNote = document.getElementById("reviewNote");
  var reviewsList = document.getElementById("reviewsList");
  var currentRating = 0;

  if (starWrap) {
    var starEls = starWrap.querySelectorAll(".star");
    function paint(n) {
      starEls.forEach(function (s) {
        s.classList.toggle("on", parseInt(s.getAttribute("data-value"), 10) <= n);
      });
    }
    starEls.forEach(function (s) {
      var val = parseInt(s.getAttribute("data-value"), 10);
      s.addEventListener("mouseenter", function () { paint(val); });
      s.addEventListener("click", function () {
        currentRating = val;
        if (ratingInput) ratingInput.value = String(val);
        paint(val);
      });
    });
    starWrap.addEventListener("mouseleave", function () { paint(currentRating); });
  }

  if (reviewForm) {
    reviewForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var rvName = reviewForm.rvName.value.trim();
      var rvArea = reviewForm.rvArea.value.trim();
      var rvText = reviewForm.rvText.value.trim();
      if (!currentRating) { setReviewNote("Please tap a star rating first.", "err"); return; }
      if (!rvName || !rvText) { setReviewNote("Please add your name and a short review.", "err"); return; }

      var stars = "";
      for (var i = 0; i < 5; i++) stars += i < currentRating ? "★" : "☆";

      var block = document.createElement("blockquote");
      block.className = "review review-appear";
      var starDiv = document.createElement("div");
      starDiv.className = "stars";
      starDiv.textContent = stars;
      var p = document.createElement("p");
      p.textContent = '"' + rvText + '"';
      var foot = document.createElement("footer");
      foot.textContent = "— " + rvName + (rvArea ? ", " + rvArea : "");
      block.appendChild(starDiv);
      block.appendChild(p);
      block.appendChild(foot);
      if (reviewsList) reviewsList.insertBefore(block, reviewsList.firstChild);

      reviewForm.reset();
      currentRating = 0;
      if (ratingInput) ratingInput.value = "0";
      if (starWrap) starWrap.querySelectorAll(".star").forEach(function (s) { s.classList.remove("on"); });
      setReviewNote("Thanks for your review, " + rvName + "! It's now showing above.", "ok");
    });
  }

  function setReviewNote(msg, kind) {
    if (!reviewNote) return;
    reviewNote.textContent = msg;
    reviewNote.className = "form-note " + kind;
  }

  // ---- Scroll reveal: sections rise up as they enter view ----
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion && "IntersectionObserver" in window) {
    var revealSel = [
      ".stats-grid", ".section-head", ".cards", ".why-grid",
      ".steps", ".gallery", ".reviews", ".review-form-wrap", ".quote-grid"
    ];
    var revealEls = document.querySelectorAll(revealSel.join(","));
    revealEls.forEach(function (el) { el.classList.add("reveal"); });
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        revObs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { revObs.observe(el); });
  }

  // ---- Deck chrome: live section counter + chapter (Breathtaking-style) ----
  (function initDeckChrome() {
    var sections = Array.prototype.slice.call(
      document.querySelectorAll(".hero, .stats, .section")
    );
    var curEl = document.getElementById("deckCurrent");
    var totEl = document.getElementById("deckTotal");
    var chapEl = document.getElementById("deckChapter");
    if (!sections.length || !curEl) return;

    var labels = {
      services: "Services", memorial: "Grave Care", why: "Why LLFA", process: "Process",
      work: "Our Work", reviews: "Reviews", quote: "Free Quote"
    };
    function pad(n) { return ("0" + n).slice(-2); }
    function labelFor(el) {
      if (el.classList.contains("hero")) return "Welcome";
      if (el.classList.contains("stats")) return "By the Numbers";
      return labels[el.id] || "";
    }
    function setActive(i) {
      curEl.textContent = pad(i + 1);
      if (chapEl) chapEl.textContent = labelFor(sections[i]);
    }

    if (totEl) totEl.textContent = pad(sections.length);
    setActive(0);

    // Sticky-stacked panels all stay full-size in the viewport behind the
    // one on top, so "most visible" can't find the active one. Instead the
    // frontmost panel is the last one (in DOM order) whose top edge has
    // risen past the viewport midpoint.
    var lastActive = 0, ticking = false;
    function computeActive() {
      ticking = false;
      var mid = window.innerHeight * 0.5;
      var active = 0;
      for (var i = 0; i < sections.length; i++) {
        if (sections[i].getBoundingClientRect().top <= mid) active = i;
      }
      if (active !== lastActive) { lastActive = active; setActive(active); }
    }
    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(computeActive); }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    computeActive();
  })();
})();
