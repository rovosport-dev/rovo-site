(function () {
  "use strict";
  // Same Google Apps Script endpoint the live rovos.llc site already uses.
  var ENDPOINT = "https://script.google.com/macros/s/AKfycbw_UFHnzFhHSvqw2XhrhmqhqNnTUiJYILCmBikp-0z11eoOPRXCkmur_DzIb9PmjCaR/exec";

  var doc = document;
  var modal = doc.getElementById("join-modal");
  var lastFocus = null;

  /* ---------- centered newsletter popup ---------- */
  function openModal() {
    if (!modal) return;
    lastFocus = doc.activeElement;
    modal.style.display = "block";
    doc.documentElement.style.overflow = "hidden";
    var first = modal.querySelector("input[name=firstName]");
    if (first && modal.querySelector('[data-state="form"]').style.display !== "none") {
      setTimeout(function () { first.focus(); }, 30);
    }
  }
  function closeModal() {
    if (!modal) return;
    modal.style.display = "none";
    doc.documentElement.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  doc.addEventListener("click", function (e) {
    var t = e.target;
    if (!t.closest) return;
    if (t.closest("[data-open-join]")) { e.preventDefault(); openModal(); }
    else if (t.closest("[data-close-join]")) { e.preventDefault(); closeModal(); }
  });
  doc.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal && modal.style.display === "block") closeModal();
  });

  /* ---------- signup forms ---------- */
  function showDone() {
    doc.querySelectorAll('[data-state="form"]').forEach(function (n) { n.style.display = "none"; });
    doc.querySelectorAll('[data-state="done"]').forEach(function (n) { n.style.display = "block"; });
  }
  function clean(s) { return String(s || "").replace(/\s+/g, " ").trim(); }
  function validEmail(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s); }

  function send(fd) {
    function attempt(mode) {
      var ctl = ("AbortController" in window) ? new AbortController() : null;
      var timer = ctl ? setTimeout(function () { ctl.abort(); }, 20000) : null;
      var opts = { method: "POST", body: fd };
      if (mode) opts.mode = mode;
      if (ctl) opts.signal = ctl.signal;
      return fetch(ENDPOINT, opts).then(function (r) { if (timer) clearTimeout(timer); return r; },
                                       function (err) { if (timer) clearTimeout(timer); throw err; });
    }
    // Normal request first; if the browser blocks reading the reply, resend once as no-cors.
    return attempt().catch(function () { return attempt("no-cors"); });
  }

  doc.querySelectorAll("form.js-signup").forEach(function (form) {
    var status = form.querySelector(".js-status");
    var btn = form.querySelector("button[type=submit]");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (status) status.textContent = "";
      var first = clean(form.elements.firstName.value);
      var last = clean(form.elements.lastName.value);
      var email = clean(form.elements.email.value).toLowerCase();
      var trap = form.elements.website ? form.elements.website.value : "";
      var bad = null, msg = "";
      if (!first) { bad = form.elements.firstName; msg = "Please enter your first name."; }
      else if (!last) { bad = form.elements.lastName; msg = "Please enter your last name."; }
      else if (!validEmail(email)) { bad = form.elements.email; msg = "Please enter a valid email address."; }
      if (bad) { if (status) status.textContent = msg; bad.focus(); return; }
      if (trap) { showDone(); return; } // bots fill the hidden field: pretend success, send nothing

      var fd = new FormData();
      fd.append("formType", "newsletter");
      fd.append("name", first + " " + last);
      fd.append("firstName", first);
      fd.append("lastName", last);
      fd.append("email", email);
      fd.append("source", location.hostname + location.pathname + (location.search || ""));

      var label = btn.textContent;
      btn.disabled = true; btn.textContent = "Joining...";
      send(fd).then(function () {
        if (typeof window.gtag === "function") window.gtag("event", "generate_lead", { method: "newsletter" });
        showDone();
      }).catch(function () {
        if (status) status.textContent = "Something went wrong. Please try again, or email rovosport@gmail.com and we'll add you.";
      }).then(function () { btn.disabled = false; btn.textContent = label; });
    });
  });

  /* ---------- scroll reveal fallback (browsers without scroll-driven animations) ---------- */
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var supportsTimeline = window.CSS && CSS.supports && CSS.supports("animation-timeline: view()");
  if (!supportsTimeline && !reduce && "IntersectionObserver" in window) {
    var els = doc.querySelectorAll(".rv,.rvL,.rvR,.rvZ");
    doc.documentElement.classList.add("rv-io");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }
})();
