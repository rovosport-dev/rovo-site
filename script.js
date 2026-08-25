(function () {
  "use strict";

  var CONFIG = window.ROVO_CONFIG || {};

  /* ---------------------------------------------------------------------
     Footer year
     --------------------------------------------------------------------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------------------
     Reveal-on-scroll
     --------------------------------------------------------------------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  var fadeSections = document.querySelectorAll(".join__inner, .request__inner");
  if ("IntersectionObserver" in window) {
    var io2 = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.transition =
              "opacity .8s cubic-bezier(.16,.84,.32,1), transform .8s cubic-bezier(.16,.84,.32,1)";
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
            io2.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    fadeSections.forEach(function (el) {
      el.style.opacity = "0";
      el.style.transform = "translateY(30px)";
      io2.observe(el);
    });
  }

  /* ---------------------------------------------------------------------
     Shared: submit a form to the Google Sheet endpoint
     --------------------------------------------------------------------- */
  function isEndpointConfigured() {
    var ep = CONFIG.sheetEndpoint;
    return !!ep && ep.indexOf("PASTE_YOUR_") === -1;
  }

  function submitToSheet(formType, fields, statusEl, submitBtn, onSuccess) {
    if (!isEndpointConfigured()) {
      statusEl.textContent =
        "This form isn't connected yet — add your Google Sheet endpoint in config.js to start collecting responses.";
      statusEl.className = "signup-form__status is-error";
      return;
    }

    var fd = new FormData();
    fd.append("formType", formType);
    Object.keys(fields).forEach(function (k) { fd.append(k, fields[k]); });

    submitBtn.disabled = true;
    statusEl.textContent = "Submitting...";
    statusEl.className = "signup-form__status";

    fetch(CONFIG.sheetEndpoint, { method: "POST", body: fd })
      .then(function () {
        statusEl.textContent = "You're in. Thanks for reaching out.";
        statusEl.className = "signup-form__status is-success";
        if (onSuccess) onSuccess();
      })
      .catch(function () {
        statusEl.textContent = "Something went wrong — please try again.";
        statusEl.className = "signup-form__status is-error";
      })
      .finally(function () {
        submitBtn.disabled = false;
      });
  }

  /* ---------------------------------------------------------------------
     Join the List form
     --------------------------------------------------------------------- */
  var joinForm = document.getElementById("joinForm");
  if (joinForm) {
    joinForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("joinName").value.trim();
      var email = document.getElementById("joinEmail").value.trim();
      var phone = document.getElementById("joinPhone").value.trim();
      if (!name || !email) return;

      submitToSheet(
        "newsletter",
        { name: name, email: email, phone: phone },
        document.getElementById("joinStatus"),
        document.getElementById("joinSubmit"),
        function () { joinForm.reset(); }
      );
    });
  }

  /* ---------------------------------------------------------------------
     Hero quick-capture form (email only — fastest possible path)
     --------------------------------------------------------------------- */
  var heroForm = document.getElementById("heroQuickForm");
  if (heroForm) {
    heroForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = document.getElementById("heroEmail").value.trim();
      if (!email) return;

      submitToSheet(
        "newsletter",
        { name: "", email: email, phone: "" },
        document.getElementById("heroStatus"),
        document.getElementById("heroSubmit"),
        function () {
          heroForm.reset();
          markLeadCaptured();
        }
      );
    });
  }

  /* ---------------------------------------------------------------------
     Scroll-triggered popup
     --------------------------------------------------------------------- */
  var popupOverlay = document.getElementById("popupOverlay");
  var popupForm = document.getElementById("popupForm");
  var popupClose = document.getElementById("popupClose");
  var popupShownKey = "rovo_popup_shown";
  var leadCapturedKey = "rovo_lead_captured";

  function markLeadCaptured() {
    try { sessionStorage.setItem(leadCapturedKey, "1"); } catch (err) {}
  }
  function hasCapturedLead() {
    try { return sessionStorage.getItem(leadCapturedKey) === "1"; } catch (err) { return false; }
  }
  function hasSeenPopup() {
    try { return sessionStorage.getItem(popupShownKey) === "1"; } catch (err) { return false; }
  }
  function markPopupShown() {
    try { sessionStorage.setItem(popupShownKey, "1"); } catch (err) {}
  }

  function openPopup() {
    if (!popupOverlay || hasSeenPopup() || hasCapturedLead()) return;
    popupOverlay.classList.add("is-open");
    popupOverlay.setAttribute("aria-hidden", "false");
    markPopupShown();
  }
  function closePopup() {
    if (!popupOverlay) return;
    popupOverlay.classList.remove("is-open");
    popupOverlay.setAttribute("aria-hidden", "true");
  }

  if (popupOverlay) {
    if (popupClose) popupClose.addEventListener("click", closePopup);
    popupOverlay.addEventListener("click", function (e) {
      if (e.target === popupOverlay) closePopup();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closePopup();
    });

    if (popupForm) {
      popupForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var name = document.getElementById("popupName").value.trim();
        var email = document.getElementById("popupEmail").value.trim();
        var phone = document.getElementById("popupPhone").value.trim();
        if (!email) return;

        submitToSheet(
          "newsletter",
          { name: name, email: email, phone: phone },
          document.getElementById("popupStatus"),
          document.getElementById("popupSubmit"),
          function () {
            markLeadCaptured();
            popupForm.reset();
            setTimeout(closePopup, 900);
          }
        );
      });
    }

    // Trigger once the visitor has scrolled roughly halfway down the page —
    // the sweet spot for single-page sites without feeling like an ambush.
    var popupTriggered = false;
    window.addEventListener("scroll", function () {
      if (popupTriggered || hasSeenPopup() || hasCapturedLead()) return;
      var scrollDepth = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
      if (scrollDepth > 0.5) {
        popupTriggered = true;
        openPopup();
      }
    }, { passive: true });
  }

  /* ---------------------------------------------------------------------
     Sticky mobile CTA — appears once the visitor scrolls past the hero,
     and hides again once the real "Join the List" form is on screen so it
     never floats on top of that form (or the Request/footer sections below it).
     --------------------------------------------------------------------- */
  var stickyCta = document.getElementById("stickyCta");
  var heroSection = document.querySelector(".hero");
  var joinSection = document.getElementById("join");
  if (stickyCta && heroSection && joinSection) {
    window.addEventListener("scroll", function () {
      var heroBottom = heroSection.getBoundingClientRect().bottom;
      var joinTop = joinSection.getBoundingClientRect().top;
      var pastHero = heroBottom < 0;
      // Only hide once Join's top edge is actually about to be covered by the
      // bar itself (roughly its own height + a little breathing room) — not
      // simply "Join is somewhere within the next viewport," which hid the
      // bar almost immediately on shorter mobile layouts.
      var reachedJoin = joinTop < 140;
      if (pastHero && !reachedJoin) {
        stickyCta.classList.add("is-visible");
      } else {
        stickyCta.classList.remove("is-visible");
      }
    }, { passive: true });
  }

  /* ---------------------------------------------------------------------
     Request a Product form
     --------------------------------------------------------------------- */
  var requestForm = document.getElementById("requestForm");
  if (requestForm) {
    requestForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("reqName").value.trim();
      var email = document.getElementById("reqEmail").value.trim();
      var message = document.getElementById("reqMessage").value.trim();
      if (!name || !email || !message) return;

      submitToSheet(
        "product_request",
        { name: name, email: email, message: message },
        document.getElementById("reqStatus"),
        document.getElementById("reqSubmit"),
        function () { requestForm.reset(); }
      );
    });
  }
})();
