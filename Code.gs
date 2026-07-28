/**
 * ROVO — Google Apps Script Web App
 * Receives form submissions from the site and appends them to tabs in
 * this spreadsheet, creating the tabs (with headers) on first use.
 *
 * SETUP:
 * 1. Create a new Google Sheet.
 * 2. Extensions -> Apps Script.
 * 3. Delete the placeholder code and paste this whole file in.
 * 4. Click Deploy -> New deployment.
 *    - Type: "Web app"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 * 5. Click Deploy, authorize the script (it's your own script acting on
 *    your own sheet — the "unverified app" warning is expected, click
 *    Advanced -> Go to project (unsafe) -> Allow).
 * 6. Copy the URL ending in /exec and paste it into config.js as
 *    sheetEndpoint.
 */

function doPost(e) {
  var params = e.parameter;
  var type = params.formType === "product_request" ? "product_request" : "newsletter";
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var tabName = type === "product_request" ? "Product Requests" : "Newsletter Signups";
  var sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    sheet = ss.insertSheet(tabName);
    if (type === "product_request") {
      sheet.appendRow(["Timestamp", "Name", "Email", "Product Request"]);
    } else {
      sheet.appendRow(["Timestamp", "Name", "Email", "Phone"]);
    }
    sheet.setFrozenRows(1);
  }

  if (type === "product_request") {
    sheet.appendRow([new Date(), params.name || "", params.email || "", params.message || ""]);
  } else {
    sheet.appendRow([new Date(), params.name || "", params.email || "", params.phone || ""]);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ result: "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}
