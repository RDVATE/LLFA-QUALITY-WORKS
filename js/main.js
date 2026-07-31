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
      setNote("Thanks, " + name + "! Your request was received. We'll be in touch within one business day.", "ok");
      form.reset();
    });
  }

  function setNote(msg, kind) {
    if (!note) return;
    note.textContent = msg;
    note.className = "form-note " + kind;
  }
})();
