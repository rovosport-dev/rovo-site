# ROVO Landing Page — Setup

This is a static site — no build step. Open `index.html` in a browser to preview it.

## Connect the forms to a Google Sheet (5 minutes)

Both forms on the page ("Join the List" and "Request a Product") submit straight to a
Google Sheet you control, no third-party service in between.

1. Create a new Google Sheet (sheets.new).
2. In the sheet, go to **Extensions → Apps Script**.
3. Delete the placeholder `myFunction() {}` code and paste in the full contents of
   `Code.gs` (included in this folder).
4. Click **Deploy → New deployment**.
   - Click the gear icon next to "Select type" and choose **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy**. Google will ask you to authorize the script — this is expected
   since it's your own script running on your own sheet. Click **Authorize access**,
   choose your account, then **Advanced → Go to (project name) (unsafe) → Allow**.
6. Copy the URL that ends in `/exec`.
7. Open `config.js` in this folder and paste that URL as the value of `sheetEndpoint`.

That's it. Submissions will automatically create two tabs in your sheet —
**Newsletter Signups** (Name, Email, Phone) and **Product Requests**
(Name, Email, Product Request) — and append a new row every time someone submits.

## Publishing the site

Any static host works since there's no server/build step:

- **Netlify / Vercel** — drag-and-drop this folder in their dashboard, or connect a
  git repo. Free tier is plenty for a landing page.
- **GitHub Pages** — push this folder to a repo and enable Pages in settings.

Once it's live, update `sheetEndpoint` in `config.js` and re-deploy/upload — no other
changes needed.

## Files

- `index.html` — page structure and copy
- `styles.css` — all styling (black/white glowing theme)
- `script.js` — form handling, scroll animations
- `config.js` — the one value you need to edit (Google Sheet endpoint)
- `Code.gs` — paste into Google Apps Script, see steps above
- `assets/images/rovo_wordmark.png` — the glowing ROVO logo used in the header/footer
