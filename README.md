# Current & Craft, LLC — company website

Ready-to-upload static website, prepared October 16, 2026 from the approved Ink & Brass draft.

## Files

- `public/index.html` — company homepage and flagship CommonSlate feature.
- `public/games.html` — CommonSlate first, Curious Cove in development, Incident Lab public pilot.
- `public/engineering.html` — StormRoute, Reamwright, Copestone, Tiedown, in that order.
- `public/assets/` — shared CSS, GA4 tracking code, and the approved images.
- `public/robots.txt`, `public/sitemap.xml` — search discovery.
- `DEPLOYMENT-GUIDE.md` — upload, hosting, domain, analytics, and future updates.

No npm installation, compilation, database, API keys, or server process is required. Render publishes only `public/`. The source is intentionally straightforward HTML/CSS/JavaScript.

The original review banner and noindex setting were removed. The three review views are now real pages. Artwork was extracted without alteration into reusable files. No personal name or photo was added. The contact email remains marked coming soon until its mailbox works.

GA4 measurement ID: `G-64ZL6JMETJ`. Tracking runs only on `currentandcraft.net` and `www.currentandcraft.net`. Local previews and the Render subdomain do not send events.

## Important scope

This is the company marketing site, not an export of the apps themselves. Curious Cove and Incident Lab buttons retain their existing ChatGPT-hosted addresses. CommonSlate stays at commonslate.net. All engineering app URLs, including StormRoute's `?licensed=1`, are preserved. Keep the old site running so its hosted apps remain available.

## Editing

Edit text in the corresponding HTML file. Edit colors and layout in `public/assets/styles.css`. Edit analytics in `public/assets/analytics.js`. Keep the common header/footer consistent across all three HTML files.

Open `public/index.html` locally for a quick visual review. Navigation and images work without a server. To preview with HTTP, run `python -m http.server 8000 --directory public` from the repository folder and open http://localhost:8000.

Copyright © 2026 Current & Craft, LLC. All rights reserved.
