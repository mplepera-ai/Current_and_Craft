// Offline pre-deployment smoke test. Does not use Firebase, GitHub Actions or network.
import {readFileSync, existsSync} from 'node:fs';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'..');
const html=readFileSync(resolve(root,'employee/index.html'),'utf8');
const js=readFileSync(resolve(root,'employee/portal.js'),'utf8');
const files=['index.html','games.html','engineering.html'];
assert.match(html,/noindex,nofollow/);
assert.match(html,/id="sign-in"/);
// Google/Firebase popup uses the Google API script; do not block it by CSP.
const csp = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)">/)?.[1];
assert.ok(csp, 'Employee portal CSP meta is required');
assert.match(csp, /script-src 'self' https:\/\/www\.gstatic\.com https:\/\/apis\.google\.com;/);
assert.match(csp, /connect-src [^;]*https:\/\/apis\.google\.com https:\/\/accounts\.google\.com;/);
assert.match(csp, /frame-src https:\/\/accounts\.google\.com https:\/\/jarvis-hub-4ae58\.firebaseapp\.com;/);
assert.match(csp, /default-src 'none'/);
assert.doesNotMatch(csp, /'unsafe-inline'|'unsafe-eval'|script-src [^;]*\*/);

assert.match(html,/id="launch-hub"/);
assert.match(html,/href="\.\/hub\/"/);
assert.match(js,/APP_NAME = 'jarvis-hub-private'/);
assert.match(js,/projectId:'jarvis-hub-4ae58'/);
assert.match(js,/OWNER_UID = 'mmsVWiF2PLQgWuUmPUSDhXp0f4n1'/);
assert.match(js,/hub\/ready\.json/);
assert.match(js,/authErrorCode\(error\)/);
assert.match(js,/auth\/popup-blocked/);
assert.match(js,/auth\/unauthorized-domain/);
assert.match(js,/Employee Firebase sign-in error code:/);
assert.doesNotMatch(js,/console\.(?:log|warn|error)\([^\n]*\berror\s*\)/);
// Match a complete GA4 measurement ID, not ordinary words like 'sign-in'.
assert.doesNotMatch(html,/analytics\.js|gtag\(|\bG-[A-Z0-9]{8,}\b/i);
assert.doesNotMatch(js,/firebase-admin|private_key|localhost:8765/);
for(const file of files){
  assert.match(readFileSync(resolve(root,file),'utf8'),/href="employee\/"[^>]*>Employee Login/);
}
const hub=resolve(root,'employee/hub');
if(existsSync(hub)){
  const marker=JSON.parse(readFileSync(resolve(hub,'ready.json'),'utf8'));
  assert.deepEqual(marker,{kind:'jarvis-hub-static-frontend',base:'/employee/hub/'});
  const index=readFileSync(resolve(hub,'index.html'),'utf8');
  assert.match(index,/\/employee\/hub\/assets\//);
}
console.log('PASS: same-origin Firebase employee portal and Hub readiness checks');
