(function () {
  "use strict";

  var CONFIG = window.ROVO_CONFIG || {};

  /* ---------------------------------------------------------------------
     Always start at the top of the page.
     Prevents two real-world causes of landing mid-page: the browser
     restoring a previous scroll position (bfcache / tab restore), and any
     URL hash (e.g. a link shared with #join in it) auto-jumping on load.
     --------------------------------------------------------------------- */
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
  window.scrollTo(0, 0);
  window.addEventListener("pageshow", function () {
    window.scrollTo(0, 0);
  });

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
      if (!name || !email || !phone) return;

      submitToSheet(
        "newsletter",
        { name: name, email: email, phone: phone },
        document.getElementById("joinStatus"),
        document.getElementById("joinSubmit"),
        function () { joinForm.reset(); }
      );
    });
  }
})();
