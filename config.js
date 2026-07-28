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
  // Both forms on the site (Join the List + Request a Product) submit to
  // this same endpoint and land in separate tabs of your sheet automatically.
  sheetEndpoint: "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE",
};
