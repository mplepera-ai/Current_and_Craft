# Current & Craft employee portal → Jarvis Hub

The existing `/employee/` login already uses the Jarvis-only Firebase Google login. It does not need a second employee identity system. The existing `portal.js` checks for a verified static Hub build at `/employee/hub/ready.json` and shows **Open Jarvis Hub** only when that artifact is staged.

**This PR adds a local build and staging script. It does not publish the frontend, install a tunnel, activate a public backend, alter DNS, enable GitHub Actions or copy any private credentials.**

## Intended architecture

- `https://currentandcraft.net/employee/`: employee Google sign-in (public static HTML/JS; no analytics on this page)
- `https://currentandcraft.net/employee/hub/`: compiled Jarvis Hub React frontend on the **same origin** and same pinned Firebase project/owner
- `https://api.currentandcraft.net`: proposed HTTPS API origin **not yet provisioned**, behind owner-controlled secure ingress
- Private Windows or future always-on server: Jarvis Learning Core, Firebase Admin verification, local ledger/agents; the HTTP origin must bind to loopback

The static site and compiled JavaScript can be fetched by anyone. **Only the backend enforces authorization** on every read and any future action. Do not upload Python server, ADC, Firebase Admin JSON, database, raw analytics reports or development repositories as static assets.

## Pre-deployment owner checks

1. Firebase Authentication → Settings → Authorized domains for the existing `jarvis-hub-4ae58` project: authorize `currentandcraft.net`. The Google provider must be enabled and the owner Firebase UID pinned to the existing Jarvis value. Do not use a Stagewick project.
2. Verify which site service actually publishes `mplepera-ai/Current_and_Craft` (the website repository contains static root files and a `CNAME`; historical README references Render). **Do not assume Render or GitHub Pages deployment behavior without checking its configured source.**
3. Bring up the private HTTPS backend at `api.currentandcraft.net` using the separate reviewed Command Center web-gateway build and a secure ingress. Cloudflare Tunnel is an option if you control the domain in Cloudflare; it requires DNS/route setup and should not disturb the public site.
4. Do not expose TCP 8765 on the router, do not run the Vite development server in production, and do not use the stdlib development WSGI server for public traffic.

## Build on the owner's Windows computer (no GitHub Actions)

Clone/update the website and Jarvis_Hub repositories side by side, for example:

```powershell
cd C:\Github\Current_and_Craft
git fetch origin
git switch employee-hub-static-bridge-20261109

node scripts\check_employee_portal.mjs

# Validate the existing Hub code and static output without changing the website
.\scripts\stage_employee_hub.ps1 -HubRepository C:\Github\Jarvis_Hub -ValidateOnly

# Stage the Hub files ONLY after the HTTPS API and authentication are reviewed
.\scripts\stage_employee_hub.ps1 -HubRepository C:\Github\Jarvis_Hub

git status --short employee/hub
```

The script runs `npm ci`, `npm run typecheck`, `npm test`, and `npm run build -- --base /employee/hub/`. It supplies the **public** production API URL `https://api.currentandcraft.net` at build time regardless of the developer's localhost `.env.local`. It refuses unexpected URL origins, local/Tailscale endpoint references, private credential paths, missing assets, and accidental overwrite without `-ReplaceExisting`.

The completed `employee/hub/` contains only Vite's compiled static assets plus `ready.json`. After review and a **separate** site PR containing those artifacts, the existing website publishing process can deploy them. Never directly upload or commit `Jarvis_Hub/.env.local` or server credentials.

## Acceptance before website publication

- Confirm `https://currentandcraft.net/employee/` owner login works and unauthorized user is denied.
- After publication, `.../employee/hub/ready.json` contains the approved readiness marker; static JS/CSS asset URLs use `/employee/hub/assets/`.
- Sign-in session persists when navigating between the employee page and Hub (same origin, matching Firebase app config).
- Request to `https://api.currentandcraft.net/v1/summary` without bearer token must fail closed; with the genuine Firebase owner token must return scoped, no-store data. Verify CORS exactly for `https://currentandcraft.net`, not `*`.
- Test the HAL panel, Aule-vs-Current-&-Craft business selection, logout, mobile width, and refresh. Do not infer working remote API from a successful static login.
- Leave Tailscale in place until full independent remote access works; then retire the old remote route deliberately.

A static sign-in page is not a private hosting environment. For actual remote use the computer/server and approved HTTPS ingress must be running.
