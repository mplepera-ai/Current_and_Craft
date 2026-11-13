// Offline standalone employee entry check; no network or credentials.
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'..');
const html=readFileSync(resolve(root,'employee/index.html'),'utf8');
assert.match(html,/noindex,nofollow/);
assert.match(html,/id="launch-hub"[^>]+href="https:\/\/jarvis-hub-4ae58\.web\.app\/"/);
assert.doesNotMatch(html,/<script|<iframe|http-equiv="refresh"|[?&](token|jwt|credential)=/i);
assert.doesNotMatch(html,/id="sign-in"|id="sign-out"|src="portal\.js"/);
const csp=html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)">/)?.[1];
assert.ok(csp);
for(const policy of ["default-src 'none'", "script-src 'none'", "connect-src 'none'", "frame-src 'none'"]) assert.ok(csp.includes(policy));
for(const file of ['index.html','games.html','engineering.html']){
 assert.match(readFileSync(resolve(root,file),'utf8'),/href="employee\/"[^>]*>Employee Login/);
}
console.log('PASS: independent Hub link, no duplicated sign-in, token transfer or external page scripts');
