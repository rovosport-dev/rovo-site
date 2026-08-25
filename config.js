/* =========================================================================
   ROVO — SITE CONFIG
   Edit the value below to go live — see SETUP.md for the full walkthrough.
   ========================================================================= */

window.ROVO_CONFIG = {
  // GOOGLE SHEET ENDPOINT
  // 1) Create a Google Sheet, open Extensions -> Apps Script, paste in the
  //    contents of Code.gs (included alongside this site).
  // 2) Deploy -> New deployment -> type "Web app" -> Execute as "Me",
  //    Who has access "Anyone" -> Deploy -> copy the URL ending in /exec.
  // 3) Paste that URL below, replacing the placeholder.
  // The forms on the site submit to this endpoint and land in your sheet
  // automatically.
  sheetEndpoint: "https://script.google.com/macros/s/AKfycbw_UFHnzFhHSvqw2XhrhmqhqNnTUiJYILCmBikp-0z11eoOPRXCkmur_DzIb9PmjCaR/exec",
};
