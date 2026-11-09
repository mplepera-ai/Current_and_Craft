# Current & Craft employee portal — no GitHub Actions

Status: **staged frontend sign-in**, not an operational remote Jarvis Hub. The public static entry page at `/employee/` uses the existing Jarvis Hub Firebase Google owner auth. No new domain or Firebase project, and no analytics on this page. This is an entry gate, **not** a server-side security boundary.

## What is implemented
- `employee/index.html`: responsive owner sign-in to the dedicated `jarvis-hub-4ae58` Firebase project.
- `employee/portal.js`: existing owner UID allowlist, Google popup sign-in and sign-out. Uses the exact Firebase app name `jarvis-hub-private` so the later Hub app on the **same origin** can reuse Firebase local login state.
- `employee/portal.css`: Current & Craft private portal styling.
- A small Employee Login footer link on public pages.
- No public GA4 on this route, no personal business data, no client secrets or local API calls.

## Owner setup before deployment
1. Firebase Console → dedicated `jarvis-hub-4ae58` → Authentication → Settings → Authorized domains: authorize `currentandcraft.net` (and `www.currentandcraft.net` only if you use that origin). Confirm Google is an enabled sign-in provider, and the enrolled owner account/UID match. Do not reuse Stagewick Firebase.
2. Merge this site PR after review. Render publishes the existing site root as its static website; verify `https://currentandcraft.net/employee/` returns the new entry page. Confirm Google popup works for owner and rejects an unapproved account. Do **not** assume a successful browser UID check protects a backend.
3. Initially, authenticated users will see `Hub frontend has not yet been deployed`. That is expected: the entry page is usable, but the real Hub bundle is not copied by this PR.

## Deploy the existing Hub SPA under the same domain (later coordinated task)
- Build `mplepera-ai/Jarvis_Hub` **locally** with Node 24.15+, locked dependencies and base `/employee/hub/`: `npm ci`, `npm run typecheck`, `npm test`, `npm run build -- --base /employee/hub/`. No GitHub Actions.
- Configure the production `VITE_JARVIS_API_BASE_URL` to an owner-approved **HTTPS** API origin *at build time* (not localhost and not a secret), with the backend behind a controlled tunnel; allow only `https://currentandcraft.net` in API CORS, enforce valid Firebase ID token and fixed UID independently on server, verify anti-CSRF for future mutations, and set strict ingress/rate controls.
- Locally copy the generated `dist/` contents into `Current_and_Craft/employee/hub/`; add a `ready.json` file there containing `{"kind":"jarvis-hub-static-frontend","base":"/employee/hub/"}` **only after successful build and verification**. Review and commit the exact built bundle via normal GitHub PR, and let existing Render static hosting deploy it. No API secrets, Firebase Admin keys, business data, local repositories or personal information in the browser bundle.
- Verify login persistence at `/employee/hub/`, deep-link fallback, mobile layout, and real-time server authorization. Public JavaScript assets are readable by anyone and must never be treated as private; only backend data and actions are protected.
- Keep website `/employee/` outside the public analytics route, disable indexing, and confirm Render serves the folder index correctly (add an explicit redirect/rewrite if not). Private records must not be cached by a public CDN.
- The Jarvis server must remain reachable via an approved HTTPS authenticated tunnel/API for browser access when away from home. If the server is off or asleep, the website and sign-in still load but live Jarvis operations are unavailable.

## Security and deployment limitations
- A Firebase Web apiKey is a public SDK identifier, **not** a server credential.
- Browser owner UID gating only improves UX; server must validate signature/audience/issuer/expiry/revocation and scope. A bypass of this landing page must never expose private data.
- Do not run privileged Jarvis commands from static site scripts or redirect bearer tokens through URL parameters.
- No auto-deploy from GitHub Actions; deployment uses existing Render site updates and manual/local build + reviewed commit.
